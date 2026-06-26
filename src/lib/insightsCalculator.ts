import { ShelterInsights } from "@/types/insights";
import { demoCheckIns } from "@/data/demoCheckIns";
import { demoCats } from "@/data/demoCats";

export function calculateInsights(): ShelterInsights {
  // Demo data for insights
  const activeAdoptions = 12;
  const averageTimeToAdoption = 18;
  const highConcernsReviewed = 14;
  const adopterSatisfaction = 4.6;

  // Cats needing attention based on check-in data
  const catsNeedingAttention = [
    {
      catId: "barnaby",
      catName: "Barnaby",
      day: 3,
      reason: "Still hiding (stress-sensitive cat)",
    },
    {
      catId: "milo",
      catName: "Milo",
      day: 7,
      reason: "No play reported (high energy, concern)",
    },
  ];

  // Common compatibility concerns
  const commonConcerns = [
    {
      description: "High stress sensitivity + household noise",
      count: 8,
    },
    {
      description: "High energy + long work hours",
      count: 6,
    },
    {
      description: "Not comfortable with children + young kids",
      count: 4,
    },
  ];

  return {
    activeAdoptions,
    averageTimeToAdoption,
    highConcernsReviewed,
    adopterSatisfaction,
    catsNeedingAttention,
    commonConcerns,
  };
}
