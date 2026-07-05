import { NextRequest, NextResponse } from "next/server";
import { generateCounselorExplanation } from "@/lib/gemini";
import { getFallbackExplanation } from "@/lib/fallbackExplanations";
import { logAIInteractionAsync } from "@/lib/aiLoggingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { compatibilityResult, cat, adopter } = body;

    // Try Gemini AI first, fall back to deterministic
    const explanation = await generateCounselorExplanation(
      cat?.name || "This cat",
      cat ? `${cat.behavior.energy} energy, ${cat.behavior.stressSensitivity} stress sensitivity, ${cat.behavior.sociability} sociability` : "",
      adopter ? `${adopter.homeType}, ${adopter.hoursAway}h away, noise: ${adopter.householdNoise}` : "",
      compatibilityResult?.level || "unknown",
      compatibilityResult?.concerns?.map((c: { description: string }) => c.description) || [],
      compatibilityResult?.strengths?.map((s: { description: string }) => s.description) || []
    );

    const source = explanation ? "gemini" : "fallback";
    const finalExplanation = explanation || getFallbackExplanation(compatibilityResult);

    // Log AI interaction (fire-and-forget, never blocks response)
    logAIInteractionAsync({
      uid: adopter?.id || "guest",
      catId: cat?.id || "unknown",
      question: JSON.stringify({ compatibilityLevel: compatibilityResult?.level, cat: cat?.name }),
      response: finalExplanation,
      source,
    });

    return NextResponse.json({
      explanation: finalExplanation,
      source,
      disclaimer:
        source === "fallback"
          ? "This explanation was generated without AI. Connect a Gemini API key for personalized explanations."
          : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
