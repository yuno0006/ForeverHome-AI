export interface Child {
  ageRange: "0-4" | "5-9" | "10-14" | "15+";
}

export interface ExistingPets {
  cats: number;
  dogs: number;
}

export interface Adopter {
  id: string;
  name: string;
  homeType: "house" | "apartment" | "condo" | "other";
  adultsInHome: number;
  children: Child[];
  existingPets: ExistingPets;
  householdNoise: "low" | "moderate" | "high";
  hoursAway: number;
  travelFrequency: "rare" | "occasional" | "frequent";
  previousCatExperience: boolean;
  specialNeedsExperience: boolean;
  canProvideVerticalSpace: boolean;
  indoorSafety: "secure" | "partial" | "unsure";
  veterinaryAccess: "yes" | "no" | "unsure";
  comfortableWithRoutineCare: boolean;
}

export interface AdopterAnswers {
  homeType: "house" | "apartment" | "condo" | "other";
  adultsInHome: number;
  children: Child[];
  existingPets: ExistingPets;
  householdNoise: "low" | "moderate" | "high";
  hoursAway: number;
  travelFrequency: "rare" | "occasional" | "frequent";
  previousCatExperience: boolean;
  specialNeedsExperience: boolean;
  canProvideVerticalSpace: boolean;
  indoorSafety: "secure" | "partial" | "unsure";
  veterinaryAccess: "yes" | "no" | "unsure";
  comfortableWithRoutineCare: boolean;
  scenarioAnswers: string[];
}
