import { Cat } from "@/types/cat";
import { AdopterAnswers } from "@/types/adopter";
import {
  CompatibilityResult,
  Concern,
  Strength,
  Mitigation,
} from "@/types/match";
import { demoCats } from "@/data/demoCats";

function hasYoungChildren(adopter: AdopterAnswers): boolean {
  return adopter.children.some(
    (c) => c.ageRange === "0-4" || c.ageRange === "5-9"
  );
}

function assessCompatibility(
  cat: Cat,
  adopter: AdopterAnswers
): CompatibilityResult {
  const concerns: Concern[] = [];
  const strengths: Strength[] = [];
  const mitigations: Mitigation[] = [];
  const alternativeCatIds: string[] = [];

  // Rule: stress-noise
  if (
    cat.behavior.stressSensitivity === "high" &&
    adopter.householdNoise === "high"
  ) {
    concerns.push({
      ruleId: "stress-noise",
      severity: "significant",
      description:
        "High stress sensitivity plus high-noise household",
      triggeredBy: `${cat.name} has high stress sensitivity, and the household noise level is high.`,
    });
    mitigations.push({
      description:
        "Create a dedicated quiet room where the cat can retreat from household noise. Use white noise machines to buffer sudden sounds.",
    });
  }

  // Rule: stress-children
  if (
    cat.behavior.comfortableWithChildren === "no" &&
    hasYoungChildren(adopter)
  ) {
    concerns.push({
      ruleId: "stress-children",
      severity: "significant",
      description:
        "Not observed comfortable with young children plus young children in home",
      triggeredBy: `${cat.name} has not been observed as comfortable with young children, and the home includes children under 10.`,
    });
    mitigations.push({
      description:
        "Arrange a shelter-guided meeting to observe the cat's reaction to children. Establish clear rules for child-cat interactions. Always supervise interactions.",
    });
  }

  // Rule: energy-absence
  if (
    cat.behavior.energy === "high" &&
    adopter.hoursAway >= 10 &&
    cat.behavior.needsVerticalSpace === "high" &&
    !adopter.canProvideVerticalSpace
  ) {
    concerns.push({
      ruleId: "energy-absence",
      severity: "significant",
      description:
        "High-energy cat plus long daily absence and limited enrichment",
      triggeredBy: `${cat.name} is high-energy and needs vertical space, but the adopter is away 10+ hours and cannot provide vertical space.`,
    });
    mitigations.push({
      description:
        "Consider automated toys and puzzle feeders for enrichment during absence. Install wall shelves or a cat tree. Consider a cat walker or daycare option.",
    });
  }

  // Rule: vertical-space
  if (
    cat.behavior.needsVerticalSpace === "high" &&
    !adopter.canProvideVerticalSpace
  ) {
    concerns.push({
      ruleId: "vertical-space",
      severity: "moderate",
      description:
        "Requires vertical space plus no climbing/enrichment plan",
      triggeredBy: `${cat.name} needs vertical space, but the adopter cannot currently provide climbing structures.`,
    });
    mitigations.push({
      description:
        "Plan to install a cat tree, wall shelves, or window perches before adoption. Even a sturdy bookshelf can serve as vertical space.",
    });
  }

  // Rule: dog-incompatibility
  if (
    cat.behavior.comfortableWithDogs === "no" &&
    adopter.existingPets.dogs > 0
  ) {
    concerns.push({
      ruleId: "dog-incompatibility",
      severity: "significant",
      description:
        "Known incompatibility with dogs plus resident dog",
      triggeredBy: `${cat.name} is known to be uncomfortable with dogs, and the home has ${adopter.existingPets.dogs} dog(s).`,
    });
    mitigations.push({
      description:
        "A very gradual introduction protocol would be essential. Consider whether a cat comfortable with dogs might be a better fit.",
    });
  }

  // Rule: special-care
  if (
    cat.care.knownMedicalNeeds !== "None" &&
    !adopter.comfortableWithRoutineCare
  ) {
    concerns.push({
      ruleId: "special-care",
      severity: "significant",
      description:
        "Special medical care plus adopter not comfortable administering care",
      triggeredBy: `${cat.name} has medical needs (${cat.care.knownMedicalNeeds}), and the adopter is not comfortable with routine care.`,
    });
    mitigations.push({
      description:
        "The shelter should provide thorough training on care requirements. Consider whether the adopter would benefit from additional support.",
    });
  }

  // Rule: indoor-safety
  if (
    cat.behavior.indoorOnlyRequired &&
    adopter.indoorSafety !== "secure"
  ) {
    concerns.push({
      ruleId: "indoor-safety",
      severity: "significant",
      description:
        "Indoor-only requirement plus inability to provide secure indoor home",
      triggeredBy: `${cat.name} requires an indoor-only home, but indoor safety is ${adopter.indoorSafety}.`,
    });
    mitigations.push({
      description:
        "Ensure windows have secure screens, and entryways have safe barriers. Discuss indoor safety with shelter staff.",
    });
  }

  // Rule: unknown-compatibility
  const unknownFields: string[] = [];
  if (cat.behavior.comfortableWithChildren === "unknown" && hasYoungChildren(adopter)) {
    unknownFields.push("compatibility with children");
  }
  if (cat.behavior.comfortableWithCats === "unknown" && adopter.existingPets.cats > 0) {
    unknownFields.push("compatibility with other cats");
  }
  if (cat.behavior.comfortableWithDogs === "unknown" && adopter.existingPets.dogs > 0) {
    unknownFields.push("compatibility with dogs");
  }

  if (unknownFields.length > 0) {
    concerns.push({
      ruleId: "unknown-compatibility",
      severity: "moderate",
      description: `Compatibility value is unknown — request shelter review`,
      triggeredBy: `${cat.name}'s ${unknownFields.join(", ")} is unknown.`,
    });
    mitigations.push({
      description:
        "Request a shelter behavioral assessment for the unknown compatibility areas.",
    });
  }

  // Rule: senior-cat-budget (Shadow has arthritis + Emma has limited budget)
  if (
    cat.lifeStage === "senior" &&
    cat.care.knownMedicalNeeds !== "None" &&
    adopter.hoursAway >= 10
  ) {
    concerns.push({
      ruleId: "senior-cat-absence",
      severity: "significant",
      description:
        "Senior cat with medical needs plus long daily absence",
      triggeredBy: `${cat.name} is a senior cat with medical needs (${cat.care.knownMedicalNeeds}), but the adopter is away ${adopter.hoursAway}+ hours daily.`,
    });
    mitigations.push({
      description:
        "Senior cats need stable routines and may require mid-day check-ins. Consider whether your schedule allows for the attention a senior cat needs.",
    });
  }

  // Rule: fiv-knowledge
  if (
    cat.care.fivStatus === "positive" &&
    !adopter.specialNeedsExperience &&
    !adopter.previousCatExperience
  ) {
    concerns.push({
      ruleId: "fiv-experience",
      severity: "moderate",
      description:
        "FIV+ cat plus no special needs or cat experience",
      triggeredBy: `${cat.name} is FIV+ and requires monitoring, but the adopter has no prior cat or special needs experience.`,
    });
    mitigations.push({
      description:
        "FIV+ cats can live normal healthy lives with proper care. The shelter should provide education on FIV management. Consider gaining experience with a non-FIV cat first.",
    });
  }

  // Detect strengths
  if (adopter.previousCatExperience) {
    strengths.push({
      description: "Previous cat experience provides a foundation for understanding cat behavior.",
    });
  }
  if (adopter.householdNoise === "low") {
    strengths.push({
      description: "A quiet household supports cats that are sensitive to noise.",
    });
  }
  if (adopter.hoursAway <= 4) {
    strengths.push({
      description: "Significant time at home helps cats adjust more quickly.",
    });
  }
  if (adopter.canProvideVerticalSpace) {
    strengths.push({
      description: "Ability to provide vertical space gives the cat more territory and confidence.",
    });
  }
  if (adopter.indoorSafety === "secure") {
    strengths.push({
      description: "A secure indoor environment supports safe transition.",
    });
  }
  if (adopter.veterinaryAccess === "yes") {
    strengths.push({
      description: "Access to veterinary care ensures health needs can be met.",
    });
  }
  if (adopter.comfortableWithRoutineCare) {
    strengths.push({
      description: "Comfort with routine care means the adopter can handle basic health needs.",
    });
  }
  if (adopter.specialNeedsExperience) {
    strengths.push({
      description: "Experience with special needs animals is a valuable asset.",
    });
  }

  // Determine overall level
  const significantConcerns = concerns.filter((c) => c.severity === "significant");
  let level: "low" | "moderate" | "high";
  if (significantConcerns.length >= 2) {
    level = "high";
  } else if (significantConcerns.length === 1) {
    level = "moderate";
  } else if (concerns.length > 0) {
    level = "moderate";
  } else {
    level = "low";
  }

  // Recommend alternatives for high risk
  if (level === "high" || level === "moderate") {
    const otherCats = demoCats.filter((c) => c.id !== cat.id);
    for (const otherCat of otherCats) {
      const otherResult = assessCompatibility(otherCat, adopter);
      if (otherResult.level === "low") {
        alternativeCatIds.push(otherCat.id);
      }
    }
  }

  return {
    level,
    concerns,
    strengths,
    mitigations,
    requiresShelterReview: level === "high" || level === "moderate",
    alternativeCatIds,
  };
}

export { assessCompatibility };
