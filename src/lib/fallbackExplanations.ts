import { CompatibilityResult } from "@/types/match";

export function getFallbackExplanation(result: CompatibilityResult): string {
  const levelDescriptions: Record<string, string> = {
    low: "Based on the information provided, there are no major compatibility concerns between this adopter and the cat. This is a positive sign, though all adoptions require ongoing support and patience during the transition period.",
    moderate: "There is one compatibility consideration worth discussing with shelter staff. This doesn't mean the adoption won't work — it means there's something to plan for. With the right preparation and support, many moderate concerns can be addressed successfully.",
    high: "There are significant compatibility considerations that require shelter review before proceeding. This is not a rejection of the adopter — it's about finding the best possible match for both the cat and the family. The shelter team can discuss alternatives and next steps.",
  };

  return (
    levelDescriptions[result.level] ||
    "This assessment is based on shelter-defined compatibility rules. Please discuss the results with shelter staff for personalized guidance."
  );
}

export function getCoachFallbackResponse(
  question: string,
  catName: string,
  currentDay: number
): string {
  return `Thank you for reaching out about ${catName}. While our AI counselor is currently unavailable, here is some general guidance:\n\n` +
    `You are on Day ${currentDay} of the transition period. It's completely normal for cats to take time to adjust to a new home. ` +
    `Continue to provide a quiet, predictable routine and let ${catName} set the pace.\n\n` +
    `If you have concerns about ${catName}'s health or behavior, please contact your shelter or veterinarian directly. ` +
    `They know ${catName}'s history and can provide personalized guidance.\n\n` +
    `Remember: the fact that you're paying close attention and asking questions shows you're a caring adopter. ` +
    `Many cats take 1-2 weeks to feel comfortable in a new home, and some take longer.`;
}
