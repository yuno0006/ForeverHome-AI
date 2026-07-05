// Gemini AI integration for Adoption Counselor, General Assistant, and 14-Day Coach
// Uses direct Gemini API calls with fast failover between models.
//
// Model strategy: try each main tier in order. If a tier is rate-limited
// (HTTP 429 — quota exhausted), try that tier's "lite" counterpart before
// moving on. Any other failure (network, 5xx, etc.) skips straight to the
// next main tier without wasting a call on the lite variant.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface ModelTier {
  model: string;
  lite?: string;
}

const MODEL_TIERS: ModelTier[] = [
  { model: "gemini-3.5-flash", lite: "gemini-3.5-flash-lite" },
  { model: "gemini-3-flash-preview", lite: "gemini-3-flash-lite-preview" },
  { model: "gemini-2.5-flash", lite: "gemini-2.5-flash-lite" },
];

function getModelUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
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

async function callModel(model: string, prompt: string, image?: ImageInput): Promise<{ text: string | null; status: number | null }> {
  const TIMEOUT_MS = 8000;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(getModelUrl(model), {
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

    return { text: null, status: res.status };
  } catch {
    return { text: null, status: null };
  }
}

async function callAI(prompt: string, image?: ImageInput): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  for (const tier of MODEL_TIERS) {
    const { text, status } = await callModel(tier.model, prompt, image);
    if (text) return text;

    // 400/403 means bad request or bad key — retrying other models won't help.
    if (status === 400 || status === 403) return null;

    // 429 = quota exhausted for this tier specifically. Try the lite
    // counterpart before giving up on this tier entirely.
    if (status === 429 && tier.lite) {
      const liteResult = await callModel(tier.lite, prompt, image);
      if (liteResult.text) return liteResult.text;
    }

    // Any other outcome (5xx, timeout, network error, no lite available) —
    // move on to the next main tier.
  }

  return null;
}

// ─── Adoption Counselor ────────────────────────────────
export async function generateCounselorExplanation(
  catName: string,
  catProfile: string,
  adopterProfile: string,
  riskLevel: string,
  concerns: string[],
  strengths: string[]
): Promise<string> {
  const prompt = `You are the ForeverHome AI Adoption Counselor. Explain this cat adoption match to the potential adopter in warm, empathetic, non-judgmental language.

Cat: ${catName}
Cat Profile: ${catProfile}
Adopter Profile: ${adopterProfile}
Risk Level: ${riskLevel}

Concerns identified:
${concerns.map((c) => `- ${c}`).join("\n")}

Strengths identified:
${strengths.map((s) => `- ${s}`).join("\n")}

IMPORTANT: Provide a COMPLETE, thorough response. NEVER cut off mid-sentence. Write 3-4 full paragraphs covering ALL of the following:
1. Why this match has ${riskLevel} risk — explain in detail
2. What the main concerns are and why they matter for the cat's wellbeing
3. Practical, specific steps to mitigate each concern if they choose to proceed
4. Why alternative cats might be a better fit (if applicable) — be specific about which traits matter most

Use simple, warm language. Be supportive, not discouraging. End with a friendly closing.`;

  const result = await callAI(prompt);
  return result ?? fallbackCounselorExplanation(catName, riskLevel, concerns, strengths);
}

function fallbackCounselorExplanation(
  catName: string,
  riskLevel: string,
  concerns: string[],
  strengths: string[]
): string {
  if (riskLevel === "high") {
    return `${catName} may face challenges in this home environment. The concerns identified — ${concerns.slice(0, 2).join(" and ")} — could lead to stress and behavioral issues. We recommend considering alternative cats that may be a better fit for your lifestyle. Our shelter team is happy to help you find the perfect match.`;
  }
  if (riskLevel === "moderate") {
    return `This match with ${catName} has some areas that need attention. ${concerns[0] || "Some concerns"} should be addressed before adoption. With proper preparation and support from our team, this match could work. We recommend discussing mitigation steps with shelter staff.`;
  }
  return `Great news! This match with ${catName} looks promising. ${strengths[0] || "Your lifestyle"} aligns well with ${catName}'s needs. We recommend proceeding with the adoption and scheduling a meet-and-greet at the shelter.`;
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

  const result = await callAI(prompt, image);
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
