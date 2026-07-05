import { NextRequest, NextResponse } from "next/server";
import { generateCoachResponse, ImageInput } from "@/lib/gemini";
import { getCoachFallbackResponse } from "@/lib/fallbackExplanations";
import { isMedicalEmergency } from "@/lib/medicalEscalation";
import { fetchAdopterProfile } from "@/lib/firestoreService";
import { getAuthenticatedUid } from "@/lib/verifyAuthToken";
import { logAIInteractionAsync } from "@/lib/aiLoggingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      catName, 
      catProfile, 
      currentDay, 
      checkIns,
      adopterProfileId,
      image,
    } = body;

    // Validate required adopterProfileId parameter
    if (!adopterProfileId || typeof adopterProfileId !== "string" || adopterProfileId.trim() === "") {
      return NextResponse.json(
        { error: "Invalid profile reference", message: "adopterProfileId is required" },
        { status: 400 }
      );
    }

    // Adopter profiles are keyed by uid, so require the caller to be
    // authenticated as that same uid before we hand back profile-derived
    // context to the AI. Without this check, anyone could pass another
    // adopter's uid and exfiltrate their profile (name, home type,
    // lifestyle) via the AI response. The "guest" demo profile has no
    // Firebase account, so it's exempt from this check by design.
    if (adopterProfileId !== "guest") {
      const authedUid = await getAuthenticatedUid(req);
      if (!authedUid || authedUid !== adopterProfileId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    // Attempt to fetch the adopter profile from Firestore for extra
    // personalization context. This is best-effort: server-side Firestore
    // reads have no authenticated user session (this app doesn't use the
    // Admin SDK), so security rules will typically deny this read and it
    // resolves to null. That's fine — the coach still works with a
    // generic context rather than failing the whole request.
    const profile = await fetchAdopterProfile(adopterProfileId);

    // Check for medical emergency first — always deterministic
    if (isMedicalEmergency(message)) {
      return NextResponse.json({
        response:
          "THIS MAY BE A MEDICAL EMERGENCY\n\nForeverHome cannot provide veterinary advice.\n\nContact an emergency veterinarian immediately.",
        isEmergency: true,
        source: "deterministic",
      });
    }

    // Build profile context for AI — fall back to a generic context when
    // no profile is available so the coach still responds.
    const profileContext = profile
      ? `
Adopter Profile:
- Name: ${profile.name}
- Home: ${profile.homeType}${profile.hasGarden ? " with garden" : ""}
- Experience: ${profile.catExperience}
- Lifestyle: ${profile.workHours} schedule, ${profile.householdNoise} household
- Preferences: ${profile.personalityPreference.join(", ") || "none specified"} personality, ${profile.agePreference.join(", ") || "any"} age
${profile.specialNeedsOpenness ? "- Open to special needs cats" : ""}
      `.trim()
      : "Adopter Profile: Not available — respond with general best-practice guidance.";

    // Build check-in context for Gemini
    const checkInContext = checkIns
      ? `Recent check-ins: ${JSON.stringify(checkIns.slice(-3))}`
      : "No recent check-ins.";

    // Combine profile context with any additional cat profile info
    const fullProfileContext = catProfile 
      ? `${profileContext}\n\nCat Context: ${catProfile}`
      : profileContext;

    // Validate image payload if present
    const validatedImage: ImageInput | undefined =
      image &&
      typeof image.data === "string" &&
      image.data.length > 0 &&
      typeof image.mimeType === "string" &&
      image.mimeType.startsWith("image/")
        ? { data: image.data, mimeType: image.mimeType }
        : undefined;

    // Try Gemini AI first, fall back to deterministic
    const aiResponse = await generateCoachResponse(
      catName || "your cat",
      fullProfileContext,
      currentDay || 1,
      message,
      checkInContext,
      validatedImage
    );

    const source = aiResponse ? "gemini" : "fallback";
    const finalResponse = aiResponse || getCoachFallbackResponse(message, catName, currentDay);

    // Log AI interaction (fire-and-forget, never blocks response)
    logAIInteractionAsync({
      uid: adopterProfileId,
      catId: catProfile || "unknown",
      question: message,
      response: finalResponse,
      source,
    });

    return NextResponse.json({
      response: finalResponse,
      source,
      disclaimer:
        source === "fallback"
          ? "This response was generated without AI. Connect a Gemini API key for personalized coaching."
          : undefined,
    });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { error: "Failed to generate coach response" },
      { status: 500 }
    );
  }
}
