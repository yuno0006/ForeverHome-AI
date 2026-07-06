import { NextRequest, NextResponse } from "next/server";
import { generateCounselorExplanation } from "@/lib/gemini";
import { getFallbackExplanation } from "@/lib/fallbackExplanations";
import { logAIInteractionAsync } from "@/lib/aiLoggingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { compatibilityResult, cat, adopter, scenarioQA } = body;

    // Build rich cat profile string for the AI
    const catProfileParts: string[] = [];
    if (cat) {
      if (cat.breed) catProfileParts.push(`Breed: ${cat.breed}`);
      if (cat.age !== undefined) catProfileParts.push(`Age: ${cat.age} years`);
      if (cat.lifeStage) catProfileParts.push(`Life stage: ${cat.lifeStage}`);
      if (cat.color) catProfileParts.push(`Color: ${cat.color}`);
      if (cat.sex) catProfileParts.push(`Sex: ${cat.sex}`);
      if (cat.behavior) {
        catProfileParts.push(`Energy: ${cat.behavior.energy}, Sociability: ${cat.behavior.sociability}, Stress sensitivity: ${cat.behavior.stressSensitivity}`);
        catProfileParts.push(`Comfortable with children: ${cat.behavior.comfortableWithChildren}, Cats: ${cat.behavior.comfortableWithCats}, Dogs: ${cat.behavior.comfortableWithDogs}`);
        catProfileParts.push(`Play needs: ${cat.behavior.playNeeds}, Noise tolerance: ${cat.behavior.noiseTolerance}, Needs vertical space: ${cat.behavior.needsVerticalSpace}`);
        if (cat.behavior.indoorOnlyRequired) catProfileParts.push("Must be indoor-only");
      }
      if (cat.care) {
        if (cat.care.knownMedicalNeeds && cat.care.knownMedicalNeeds !== "None") {
          catProfileParts.push(`Medical needs: ${cat.care.knownMedicalNeeds}`);
        }
        if (cat.care.fivStatus && cat.care.fivStatus !== "negative") {
          catProfileParts.push(`FIV: ${cat.care.fivStatus}`);
        }
        if (cat.care.specialNotes) catProfileParts.push(`Special notes: ${cat.care.specialNotes}`);
      }
      if (cat.personality && cat.personality.length > 0) {
        catProfileParts.push(`Personality: ${cat.personality.map((p: { trait: string; description: string }) => `${p.trait} (${p.description})`).join(", ")}`);
      }
      if (cat.backstory) catProfileParts.push(`Backstory: ${cat.backstory}`);
      if (cat.idealHome) catProfileParts.push(`Ideal home: ${cat.idealHome}`);
    }

    // Build rich adopter profile string
    const adopterProfileParts: string[] = [];
    if (adopter) {
      if (adopter.name) adopterProfileParts.push(`Name: ${adopter.name}`);
      if (adopter.homeType) adopterProfileParts.push(`Home type: ${adopter.homeType}`);
      if (adopter.householdNoise) adopterProfileParts.push(`Household noise: ${adopter.householdNoise}`);
      if (adopter.hoursAway !== undefined) adopterProfileParts.push(`Hours away daily: ${adopter.hoursAway}`);
      if (adopter.workHours) adopterProfileParts.push(`Work schedule: ${adopter.workHours}`);
      if (adopter.travelFrequency) adopterProfileParts.push(`Travel frequency: ${adopter.travelFrequency}`);
      if (adopter.catExperience) adopterProfileParts.push(`Cat experience: ${adopter.catExperience}`);
      if (adopter.hasChildren !== undefined) {
        if (adopter.hasChildren && adopter.childrenAges?.length) {
          adopterProfileParts.push(`Has children (ages: ${adopter.childrenAges.join(", ")})`);
        } else if (!adopter.hasChildren) {
          adopterProfileParts.push("No children in household");
        }
      }
      if (adopter.hasExistingPets && adopter.existingPets) {
        const pets = adopter.existingPets;
        const petParts: string[] = [];
        if (pets.cats > 0) petParts.push(`${pets.cats} cat(s)`);
        if (pets.dogs > 0) petParts.push(`${pets.dogs} dog(s)`);
        if (pets.other?.length > 0) petParts.push(pets.other.join(", "));
        if (petParts.length > 0) adopterProfileParts.push(`Existing pets: ${petParts.join(", ")}`);
        else adopterProfileParts.push("No existing pets");
      }
      if (adopter.hasGarden !== undefined) adopterProfileParts.push(`Has garden: ${adopter.hasGarden ? "yes" : "no"}`);
      if (adopter.indoorOnlyPreference !== undefined) adopterProfileParts.push(`Prefers indoor-only: ${adopter.indoorOnlyPreference ? "yes" : "no"}`);
      if (adopter.specialNeedsOpenness !== undefined) adopterProfileParts.push(`Open to special needs cats: ${adopter.specialNeedsOpenness ? "yes" : "no"}`);
      if (adopter.previousCatExperience !== undefined) adopterProfileParts.push(`Previous cat experience: ${adopter.previousCatExperience ? "yes" : "no"}`);
      if (adopter.personalityPreference?.length) {
        adopterProfileParts.push(`Preferred cat personality: ${adopter.personalityPreference.join(", ")}`);
      }
      if (adopter.agePreference?.length) {
        adopterProfileParts.push(`Preferred cat age: ${adopter.agePreference.join(", ")}`);
      }
    }

    const catName = cat?.name || "This cat";
    const catProfileStr = catProfileParts.join("\n") || `${catName}'s profile`;
    const adopterProfileStr = adopterProfileParts.join("\n") || "No adopter profile available";

    // Try Gemini AI first, fall back to deterministic
    const explanation = await generateCounselorExplanation(
      catName,
      catProfileStr,
      adopterProfileStr,
      compatibilityResult?.level || "unknown",
      compatibilityResult?.concerns?.map((c: { description: string }) => c.description) || [],
      compatibilityResult?.strengths?.map((s: { description: string }) => s.description) || [],
      cat?.backstory || "",
      cat?.idealHome || "",
      cat?.care?.specialNotes || "",
      cat?.personality || [],
      cat?.care?.knownMedicalNeeds || "None",
      adopter?.name || "",
      adopter?.catExperience || "unknown",
      scenarioQA
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
