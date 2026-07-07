// Gemini AI integration for Adoption Counselor, General Assistant, and 14-Day Coach.
// Uses TWO API keys with PARALLEL RACE strategy + rate-limit caching (90s TTL).
//
// Strategy: ALL models × ALL keys fire simultaneously. First to respond with valid
// data wins. This means the fastest model (regardless of name) always serves the user.
// Two separate pools:
//   Listing AI  (questions, general assistant):  4 models × 2 keys = 8 parallel RACE
//   Chat AI     (14-day coach):                   2 models × 2 keys = 4 parallel RACE
//
// EXCEPTION: The Adoption Counselor (compatibility report) uses SEQUENTIAL fallback.
// Models are tried one-by-one in order — the first to return valid JSON wins.
// This avoids burning free-tier credits unnecessarily on parallel calls.

function getGeminiKeys(): string[] {
  const keys: string[] = [];
  const key1 = process.env.GEMINI_API_KEY;
  const key2 = process.env.GEMINI_API_KEY_2;
  if (key1) keys.push(key1);
  if (key2) keys.push(key2);
  return keys;
}

// ─── Rate-limit cache ───────────────────────────────────

interface RateLimitEntry { exhaustedAt: number }
const _RATE_LIMIT_CACHE = new Map<string, RateLimitEntry>();
const RATE_LIMIT_TTL_MS = 90_000;

function pruneRateLimitCache() {
  const now = Date.now();
  for (const [k, v] of _RATE_LIMIT_CACHE) {
    if (now - v.exhaustedAt > RATE_LIMIT_TTL_MS) _RATE_LIMIT_CACHE.delete(k);
  }
}

function isRateLimited(model: string, key: string): boolean {
  const entry = _RATE_LIMIT_CACHE.get(`${model}::${key}`);
  if (!entry) return false;
  if (Date.now() - entry.exhaustedAt > RATE_LIMIT_TTL_MS) {
    _RATE_LIMIT_CACHE.delete(`${model}::${key}`);
    return false;
  }
  return true;
}

function markRateLimited(model: string, key: string) {
  _RATE_LIMIT_CACHE.set(`${model}::${key}`, { exhaustedAt: Date.now() });
}

// ─── Model chains ───────────────────────────────────────

// Listing AI: counselor, quiz questions, general assistant
// gemini-3.1-flash-lite is first because it has 500 free daily credits.
// PARALLEL RACE: all models + all keys fire simultaneously, first to respond wins.
const LISTING_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
];

// Chat AI: lighter tasks (14-day coach)
// PARALLEL RACE: all models + all keys fire simultaneously, first to respond wins.
const CHAT_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
];

// ─── Core fetch ─────────────────────────────────────────

function getModelUrl(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export interface ImageInput {
  /** Base64-encoded image data (no data URL prefix) */
  data: string;
  /** e.g. "image/jpeg", "image/png" */
  mimeType: string;
}

function buildParts(prompt: string, image?: ImageInput) {
  const parts: Record<string, unknown>[] = [{ text: prompt }];
  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  }
  return parts;
}

async function callModel(
  model: string,
  apiKey: string,
  prompt: string,
  image?: ImageInput
): Promise<{ text: string | null; status: number | null }> {
  const TIMEOUT_MS = 20000; // 20s — keep well under Vercel's 60s function limit
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(getModelUrl(model, apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: buildParts(prompt, image) }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: GeminiResponse = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      return { text, status: res.status };
    }

    if (res.status === 429) {
      markRateLimited(model, apiKey);
    }
    return { text: null, status: res.status };
  } catch {
    return { text: null, status: null };
  }
}

// ─── callAI (parallel race: all models × all keys fire simultaneously) ──

function getActiveKeys(): string[] {
  return getGeminiKeys();
}

type AIPurpose = "listing" | "chat";

async function callAI(
  prompt: string,
  image?: ImageInput,
  purpose: AIPurpose = "listing",
): Promise<string | null> {
  const FUNC_START = Date.now();
  // Safety cap: abort entirely after 55s to leave 5s for response serialization
  const SAFETY_TIMEOUT_MS = 55000;

  pruneRateLimitCache();
  const keys = getActiveKeys();
  if (keys.length === 0) {
    console.warn("[gemini] No API keys configured");
    return null;
  }

  const models = purpose === "chat" ? CHAT_MODELS : LISTING_MODELS;
  const result = await raceModels(models, keys, prompt, image);
  if (result !== null) return result;

  // Fallback: if listing models all failed, try chat models — but only if enough time remains
  if (purpose === "listing" && (Date.now() - FUNC_START) < SAFETY_TIMEOUT_MS - 25000) {
    console.warn("[gemini] All listing models exhausted, falling back to chat models...");
    const fallback = await raceModels(CHAT_MODELS, keys, prompt, image);
    if (fallback !== null) return fallback;
  }

  // Rate-limit retry only if we have time
  if ((Date.now() - FUNC_START) < SAFETY_TIMEOUT_MS - 15000) {
    let minExpiry = Infinity;
    for (const [, v] of _RATE_LIMIT_CACHE) {
      const remaining = v.exhaustedAt + RATE_LIMIT_TTL_MS - Date.now();
      if (remaining < minExpiry) minExpiry = remaining;
    }
    if (minExpiry > 0 && minExpiry < RATE_LIMIT_TTL_MS && minExpiry < SAFETY_TIMEOUT_MS - (Date.now() - FUNC_START)) {
      console.warn(`[gemini] All key/model combos rate-limited, waiting ${Math.ceil(minExpiry / 1000)}s...`);
      await new Promise(r => setTimeout(r, minExpiry + 500));
      if ((Date.now() - FUNC_START) >= SAFETY_TIMEOUT_MS - 5000) return null;
      pruneRateLimitCache();
      return callAI(prompt, image, purpose);
    }
  }

  console.error(`[gemini] All models exhausted (purpose=${purpose}), no response available`);
  return null;
}

async function raceModels(
  models: string[],
  keys: string[],
  prompt: string,
  image?: ImageInput,
): Promise<string | null> {
  // Build a list of all non-rate-limited (model, key) combos
  const combos: { model: string; key: string }[] = [];
  for (const model of models) {
    for (const key of keys) {
      if (isRateLimited(model, key)) {
        console.warn(`[gemini] Skipping ${model} (rate-limited)`);
        continue;
      }
      combos.push({ model, key });
    }
  }

  if (combos.length === 0) return null;

  console.log(`[gemini] Racing ${combos.length} model×key combo(s)...`);
  const startTime = Date.now();

  // Fire all combos simultaneously — first to respond with data wins
  const race = Promise.race(
    combos.map(async ({ model, key }) => {
      const { text, status } = await callModel(model, key, prompt, image);
      if (text) {
        const elapsed = Date.now() - startTime;
        console.log(`[gemini] 🏆 Winner: ${model} (${elapsed}ms)`);
        return { text, winner: true };
      }
      if (status === 429) {
        // Already marked by callModel
      }
      // 400/403/5xx/timeout: just ignore, other combos may still win
      return { text: null, winner: false };
    })
  );

  const result = await race;
  return result.text;
}

/**
 * Sequential fallback: try each model one-at-a-time (still racing both keys per model).
 * Used by the counselor to avoid burning credits on unnecessary parallel calls.
 * First model to return valid text wins — no further models are tried.
 */
async function sequentialModels(
  models: string[],
  keys: string[],
  prompt: string,
  image?: ImageInput,
): Promise<string | null> {
  for (const model of models) {
    if (isRateLimited(model, keys[0]) && isRateLimited(model, keys[1] || "")) continue;

    // For this one model, race both keys
    const validCombos = keys.filter(k => !isRateLimited(model, k));
    if (validCombos.length === 0) continue;

    console.log(`[gemini] Trying ${model} (sequential, ${validCombos.length} key(s))...`);
    const startTime = Date.now();
    const race = Promise.race(
      validCombos.map(async (key) => {
        const { text, status } = await callModel(model, key, prompt, image);
        if (text) return { text, winner: true };
        if (status === 429) { /* already marked */ }
        return { text: null, winner: false };
      })
    );
    const result = await race;
    if (result.text) {
      console.log(`[gemini] 🏆 Winner (sequential): ${model} (${Date.now() - startTime}ms)`);
      return result.text;
    }
    console.warn(`[gemini] ${model} failed, trying next model...`);
  }
  return null;
}






export async function generateDynamicQuestions(
  catName: string,
  catProfile: string,
  adopterProfile: string
): Promise<any[] | null> {
  const prompt = `You are a behavioral expert creating a personalized adoption assessment.
Based on the cat's profile and the adopter's lifestyle, generate exactly 4 multiple-choice scenario questions.
These scenarios should test how the adopter would handle specific challenges related to THIS cat's unique traits.

Cat Name: ${catName}
Cat Profile: ${catProfile}
Adopter Profile: ${adopterProfile}

Return the output EXACTLY as a JSON array of 4 objects. No markdown formatting, no backticks, just the raw JSON array.
Each object must have this structure:
{
  "id": "scenario_1",
  "scenario": "Scenario text here",
  "traits": ["patience", "understanding"],
  "options": [
    { "value": "a", "label": "Worst response", "score": 0 },
    { "value": "b", "label": "Okay response", "score": 1 },
    { "value": "c", "label": "Best response", "score": 3 }
  ]
}

DO NOT include any text before or after the JSON array.`;

  const result = await callAI(prompt);
  if (!result) return null;

  try {
    const jsonMatch = result.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const cleaned = jsonMatch ? jsonMatch[0] : result.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length === 4) {
      return parsed;
    }
    return null;
  } catch (e) {
    console.error("Failed to parse dynamic questions:", e);
    return null;
  }
}

// ─── Adoption Counselor ────────────────────────────────
export interface CounselorAIResponse {
  riskLevel: "low" | "moderate" | "high";
  concerns: string[];
  strengths: string[];
  protectiveFactors: string[];
  explanation: string;
}

export async function generateCounselorExplanation(
  catName: string,
  catProfile: string,
  adopterProfile: string,
  scenarioQA?: string
): Promise<CounselorAIResponse> {
  const prompt = `You are the ForeverHome AI Adoption Counselor and the ultimate judge of compatibility.
Your job is to read the cat's profile and the adopter's lifestyle/answers, and decide if they are a good match.

─── THE CAT ───
Name: ${catName}
${catProfile}

─── THE ADOPTER ───
${adopterProfile}
${scenarioQA ? `\nAdopter's answers to cat-specific scenarios:\n${scenarioQA}\n` : ""}

You MUST return your decision EXACTLY as a JSON object with this structure:
{
  "riskLevel": "low" | "moderate" | "high",
  "concerns": ["concern 1", "concern 2"],
  "strengths": ["strength 1", "strength 2"],
  "protectiveFactors": ["protective factor 1", "protective factor 2"],
  "explanation": "A warm, 4-5 paragraph explanation covering: why they match (or don't), how to care for this specific cat, addressing concerns and solutions, and final thoughts."
}

INSTRUCTIONS:
1. "riskLevel": Be honest. If the adopter's lifestyle or scenario answers clash dangerously with the cat's needs, score it "high" (Red). If it's mostly good but has some challenges, score it "moderate" (Yellow). If it's a great fit, "low" (Green).
2. "protectiveFactors": Identify positive things about the adopter that mitigate their risks (e.g., "willing to learn", "has financial readiness", "flexible schedule").
3. "explanation": Must be plain text paragraphs separated by \n\n. Do not use markdown. Speak directly to the adopter warmly.

DO NOT output any text before or after the JSON.`;

  // Counselor uses SEQUENTIAL fallback: try one model at a time.
  // This avoids burning free credits on parallel calls for a one-time report.
  const keys = getActiveKeys();
  if (keys.length === 0) return fallbackCounselorResponse(catName);
  const result = await sequentialModels(LISTING_MODELS, keys, prompt);
  if (!result) return fallbackCounselorResponse(catName);

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? jsonMatch[0] : result.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as CounselorAIResponse;
    
    // Ensure we always have valid arrays and a valid risk level
    return {
      riskLevel: ["low", "moderate", "high"].includes(parsed.riskLevel) ? parsed.riskLevel : "moderate",
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      protectiveFactors: Array.isArray(parsed.protectiveFactors) ? parsed.protectiveFactors : [],
      explanation: parsed.explanation || fallbackCounselorResponse(catName).explanation
    };
  } catch (e) {
    console.error("Failed to parse counselor JSON:", e);
    return fallbackCounselorResponse(catName);
  }
}

function fallbackCounselorResponse(catName: string): CounselorAIResponse {
  return {
    riskLevel: "moderate",
    concerns: ["System was unable to complete the detailed AI compatibility check."],
    strengths: ["Adopter completed the assessment process."],
    protectiveFactors: [],
    explanation: `Hi there! We couldn't run our full AI compatibility engine for ${catName} right now. However, based on our standard evaluation, this match has some promising aspects but might need some discussion. We recommend proceeding with the adoption request so you can speak directly with shelter staff who know ${catName} best!`
  };
}

// ─── 14-Day Coach ──────────────────────────────────────
export async function generateCoachResponse(
  catName: string,
  catProfile: string,
  adoptionDay: number,
  message: string,
  checkInContext: string,
  image?: ImageInput
): Promise<string> {
  const imageNote = image
    ? `\n\nThe adopter has also shared a photo. Look at it carefully — describe what you see about the cat (breed, coat, body language, environment) and incorporate those observations into your guidance. If the photo shows a behavior or situation they're asking about, address it specifically.`
    : "";

  const isGreeting = /^(hi|hello|hey|yo|sup|good (morning|afternoon|evening)|howdy)[\s!.]*$/i.test(message.trim());
  const isChitchat = /^(how are you|what('s| is) up|how('s| is) it going|wyd)[\s?]*$/i.test(message.trim());
  const isShort = message.trim().split(/\s+/).length <= 4 && !message.includes("?");
  const shouldBeBrief = isGreeting || isChitchat || isShort;

  const lengthInstruction = shouldBeBrief
    ? `KEEP IT SHORT: The adopter just said a simple "${message.trim()}". Respond with ONE friendly sentence welcoming them, introduce yourself as Mr. Cat, and ask how you can help with ${catName} today. Be warm but minimal — no paragraphs.`
    : `Provide a COMPLETE, thorough response. Write 2-3 full paragraphs covering:
- FIRST: Answer their specific question directly and clearly
- What phase of adjustment the cat is in (day ${adoptionDay} of 14) — explain in context
- The cat's specific personality and needs — reference the profile details
- What's normal vs concerning at this stage — give clear benchmarks
- Practical, actionable advice with specific steps they can try today`;  

  const prompt = `You are Mr. Cat, the ForeverHome AI 14-Day Coach. You help cat adopters during the critical first 14 days after adoption. You are warm, knowledgeable, and genuinely love helping cats and their humans.

Cat: ${catName}
Cat Profile: ${catProfile}
Current Day: ${adoptionDay}
Recent Check-in Context: ${checkInContext}

Adopter's Message: "${message}"${imageNote}

${lengthInstruction}

Be warm and reassuring — the adopter may be anxious. If the message mentions medical emergency symptoms (bleeding, not eating for 24+ hours, difficulty breathing, seizures), immediately advise contacting an emergency vet as your first and most prominent point. NEVER cut off mid-sentence.`;

  const result = await callAI(prompt, image, "chat");
  return result ?? fallbackCoachResponse(catName, adoptionDay, message);
}

export function fallbackCoachResponse(catName: string, day: number, message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("hiding") || lower.includes("won't come out")) {
    return `${catName} is currently in the decompression phase. Hiding is a common stress response during the first few days after adoption. Ensure food, water, and litter are easily accessible, avoid forcing interaction, and allow ${catName} to approach at their own pace. This is completely normal and should improve within the first week.`;
  }
  if (lower.includes("not eating") || lower.includes("won't eat")) {
    return `It's not uncommon for cats to skip a meal or two during the first few days in a new environment. Try offering ${catName} a small amount of wet food or a treat near their hiding spot. If ${catName} hasn't eaten for more than 24 hours, please contact your veterinarian as this can become a health concern.`;
  }
  if (lower.includes("litter") || lower.includes("box") || lower.includes("peeing") || lower.includes("pooping")) {
    return `Litter box issues are common during the adjustment period. Make sure the box is easily accessible, clean, and in a quiet location. ${catName} may need time to find and feel comfortable with the new box. Avoid punishing — this increases stress. If issues persist beyond a few days, consult your vet.`;
  }
  if (lower.includes("playful") || lower.includes("playing")) {
    return `Wonderful to hear ${catName} is showing playful behavior! This is a great sign of adjustment. Use interactive toys (wand toys, laser pointers) to build trust. Keep play sessions short (5-10 min) and frequent. This helps build confidence and strengthens your bond.`;
  }
  if (lower.includes("aggressive") || lower.includes("hissing") || lower.includes("scratching")) {
    return `Some defensive behavior like hissing is normal in the first week. ${catName} is still adjusting to a new environment. Give them space, avoid direct eye contact, and let them initiate contact. Use treats to build positive associations. If aggression escalates or doesn't improve after a week, reach out to our behavioral support team.`;
  }

  return `Thank you for checking in on day ${day}. ${catName} is still adjusting to their new home — every cat moves at their own pace. Keep providing a calm, predictable environment. If you have specific concerns, feel free to describe what you're seeing and I'll provide more targeted guidance.`;
}

// ─── General Site Assistant ────────────────────────────
const SITE_KNOWLEDGE = `
You are Mr. Cat, the ForeverHome AI Assistant — a friendly, knowledgeable guide for the ForeverHome AI cat adoption platform. Here's how the site works:

1. BROWSE: Users browse available cats on the /cats page. Each cat has a detailed profile: behavior traits (energy, sociability, stress sensitivity), medical needs, personality, and backstory.

2. COMPATIBILITY QUIZ: Users take a short quiz — first a few lifestyle questions (living space, work schedule, activity level, cat personality preference), then 5 scenario-based questions about handling real cat situations. This produces a Compatibility Report.

3. COMPATIBILITY REPORT: Shows a Low/Moderate/High concern level, specific concerns and strengths, mitigation tips, and AI-recommended alternative cats ranked by fit — even if the current match is already great.

4. ADOPTION REQUEST: From the report, users can click "Start Adoption Process" to send their contact info to the shelter. They get the shelter's phone, email, address, and hours immediately, plus a confirmation the shelter will follow up.

5. POST-ADOPTION — THE 9 LIVES PROTOCOL: Once adopted, users get access to a dedicated 14-Day Coach for that specific cat (found on their Dashboard). It's a gamified system: 9 "Lives" (common challenges like hiding, not eating, litter box issues, night zoomies, scratching, etc.) unlock one per day across the first 9 days, with Days 10-14 as a maintenance phase. That coach knows the specific adopted cat's profile and daily check-ins.

6. SHELTERS: Shelters can create accounts to manage their cat listings, view adoption requests, and track active adoptions.

Your job right now is to help with GENERAL questions: how the site works, what to expect from cat ownership, general cat behavior/care advice, and pointing users toward the right page. You do NOT have access to any specific user's adopted cat or their check-in history — if someone asks about their specific adopted cat's day-to-day progress, tell them to open their dedicated coach from their Dashboard, since that's where the specialized, cat-specific coach lives.

RESPONSE STYLE: Match your response length to the question. If someone says "hi" or "hello", respond with ONE friendly sentence introducing yourself as Mr. Cat and asking how you can help. If they ask a detailed question, give a detailed answer. Structure detailed responses in a clear, organized way — use line breaks, emoji bullets, or numbered steps to make it easy to read. Never cut off mid-sentence. Be warm, encouraging, and genuinely helpful — like a knowledgeable friend who loves cats.

If shown a photo of a cat, comment on its apparent breed, coat, body language, and general health appearance, with a light disclaimer that you're not a substitute for a vet.
`.trim();

export async function generateGeneralAssistantResponse(
  message: string,
  conversationContext: string,
  image?: ImageInput
): Promise<string | null> {
  const isGreeting = /^(hi|hello|hey|yo|sup|good (morning|afternoon|evening)|howdy)[\s!.]*$/i.test(message.trim());
  const isChitchat = /^(how are you|what('s| is) up|how('s| is) it going|wyd)[\s?]*$/i.test(message.trim());

  const lengthNote = (isGreeting || isChitchat)
    ? `\n\nSTYLE: The user just said a simple greeting. Keep your response to ONE friendly sentence. Introduce yourself as Mr. Cat and ask how you can help them find their perfect cat companion. Do NOT give a long explanation.`
    : `\n\nRespond directly, thoroughly, and helpfully. Make sure your response is COMPLETE — do NOT cut off mid-thought. Cover every aspect of the user's question.`;

  const prompt = `${SITE_KNOWLEDGE}

${conversationContext ? `Recent conversation:\n${conversationContext}\n` : ""}
User's message: "${message}"${lengthNote}`;

  return callAI(prompt, image);
}

export function fallbackGeneralAssistantResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("how") && (lower.includes("work") || lower.includes("website") || lower.includes("site"))) {
    return "ForeverHome AI helps you find your perfect cat companion! Browse available cats, take a quick compatibility quiz about your lifestyle, and get a personalized AI report showing your best matches. When you're ready, start the adoption process right from the report — we'll connect you with the shelter directly. Once you adopt, you get access to a 14-Day Coach to help you and your new cat settle in together.";
  }
  if (lower.includes("quiz") || lower.includes("assessment") || lower.includes("compatib")) {
    return "The compatibility quiz starts with a few questions about your lifestyle (home, schedule, activity level), then 5 scenario questions about handling real situations with a cat. Based on your answers, we score your compatibility with cats and recommend the best matches — you can find it under the Quiz tab or on any cat's profile page.";
  }
  if (lower.includes("adopt") && !lower.includes("adopted")) {
    return "To adopt: browse cats, run a compatibility assessment on the one you like, then click \"Start Adoption Process\" on your report. You'll fill in your contact details and we send your request straight to the shelter — you'll also get their phone, email, and address so you can follow up directly.";
  }
  if (lower.includes("9 lives") || lower.includes("14 day") || lower.includes("coach")) {
    return "The 9 Lives Protocol is our post-adoption support system! Once you've adopted, open your dedicated Coach from your Dashboard. It walks you through 9 common early challenges (like hiding, appetite loss, or litter box issues) — one unlocks each day for the first 9 days, with days 10-14 as a settling-in phase.";
  }

  return "I'm the ForeverHome AI Assistant! I can help explain how the site works, what to expect when adopting a cat, or general cat care questions. If you've already adopted a cat and want day-to-day guidance for your specific companion, head to your Dashboard and open your dedicated Coach — that's where the cat-specific support lives.";
}
