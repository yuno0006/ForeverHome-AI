// Gemini AI integration for Adoption Counselor and 14-Day Coach
// Cascades through 5 model tiers — if one hits rate limit or server error, tries the next
// Falls back to deterministic responses when API key is not configured or all models exhausted

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const MODEL_TIERS = [
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
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

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  for (const model of MODEL_TIERS) {
    try {
      const res = await fetch(getModelUrl(model), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      });

      if (res.ok) {
        const data: GeminiResponse = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
        if (text) {
          console.log(`[Gemini] Success with model: ${model}`);
          return text;
        }
        // No text in response, try next model
        console.log(`[Gemini] Empty response from ${model}, trying next`);
        continue;
      }

      // 400 or 403 — bad request or forbidden, no point retrying other models
      if (res.status === 400 || res.status === 403) {
        console.log(`[Gemini] ${res.status} from ${model} — not retryable, aborting`);
        return null;
      }

      // 429 (rate limit) or 5xx (server error) — try next model
      if (res.status === 429 || res.status >= 500) {
        console.log(`[Gemini] ${res.status} from ${model}, trying next model`);
        continue;
      }

      // Other error codes — try next model
      console.log(`[Gemini] Unexpected ${res.status} from ${model}, trying next model`);
      continue;
    } catch (error) {
      // Network error — try next model
      console.log(`[Gemini] Network error with ${model}, trying next model`);
      continue;
    }
  }

  // All models exhausted
  console.log("[Gemini] All model tiers exhausted, returning null");
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

Provide a clear, compassionate explanation of:
1. Why this match has ${riskLevel} risk
2. What the main concerns are and why they matter
3. Practical steps to mitigate concerns if they choose to proceed
4. Why alternative cats might be a better fit (if applicable)

Keep it under 200 words. Use simple language. Be supportive, not discouraging.`;

  const result = await callGemini(prompt);
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
  checkInContext: string
): Promise<string> {
  const prompt = `You are the ForeverHome AI 14-Day Coach. You help cat adopters during the critical first 14 days after adoption.

Cat: ${catName}
Cat Profile: ${catProfile}
Current Day: ${adoptionDay}
Recent Check-in Context: ${checkInContext}

Adopter's Message: "${message}"

Provide helpful, specific behavioral guidance. Consider:
- What phase of adjustment the cat is in (day ${adoptionDay} of 14)
- The cat's specific personality and needs
- What's normal vs concerning at this stage
- Practical, actionable advice

Keep response under 150 words. Be warm and reassuring. If the message mentions medical emergency symptoms (bleeding, not eating for 24+ hours, difficulty breathing, seizures), immediately advise contacting an emergency vet.`;

  const result = await callGemini(prompt);
  return result ?? fallbackCoachResponse(catName, adoptionDay, message);
}

function fallbackCoachResponse(catName: string, day: number, message: string): string {
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
