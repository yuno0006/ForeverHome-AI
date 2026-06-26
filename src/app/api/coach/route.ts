import { NextRequest, NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/gemini";
import { getCoachFallbackResponse } from "@/lib/fallbackExplanations";
import { isMedicalEmergency } from "@/lib/medicalEscalation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, catName, catProfile, currentDay, checkIns } = body;

    // Check for medical emergency first — always deterministic
    if (isMedicalEmergency(message)) {
      return NextResponse.json({
        response:
          "THIS MAY BE A MEDICAL EMERGENCY\n\nForeverHome cannot provide veterinary advice.\n\nContact an emergency veterinarian immediately.",
        isEmergency: true,
        source: "deterministic",
      });
    }

    // Build check-in context for Gemini
    const checkInContext = checkIns
      ? `Recent check-ins: ${JSON.stringify(checkIns.slice(-3))}`
      : "No recent check-ins.";

    // Try Gemini AI first, fall back to deterministic
    const aiResponse = await generateCoachResponse(
      catName || "your cat",
      catProfile || "",
      currentDay || 1,
      message,
      checkInContext
    );

    const source = aiResponse ? "gemini" : "fallback";
    const finalResponse = aiResponse || getCoachFallbackResponse(message, catName, currentDay);

    return NextResponse.json({
      response: finalResponse,
      source,
      disclaimer:
        source === "fallback"
          ? "This response was generated without AI. Connect a Gemini API key for personalized coaching."
          : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate coach response" },
      { status: 500 }
    );
  }
}
