export interface CatBehavior {
  energy: "low" | "medium" | "high";
  sociability: "reserved" | "moderate" | "outgoing";
  stressSensitivity: "low" | "moderate" | "high";
  handlingTolerance: "low" | "moderate" | "high";
  playNeeds: "low" | "moderate" | "high";
  comfortableWithChildren: "yes" | "no" | "unknown";
  comfortableWithCats: "yes" | "no" | "unknown";
  comfortableWithDogs: "yes" | "no" | "unknown";
  noiseTolerance: "low" | "moderate" | "high";
  needsVerticalSpace: "low" | "moderate" | "high";
  indoorOnlyRequired: boolean;
}

export interface CatCare {
  knownMedicalNeeds: string;
  medicationNeeds: string;
  fivStatus: "negative" | "positive" | "unknown";
  specialNotes: string;
}

export interface Cat {
  id: string;
  name: string;
  age: number;
  lifeStage: "kitten" | "young" | "adult" | "senior";
  sex: "male" | "female";
  neutered: boolean;
  photo: string;
  status: "available" | "adopted" | "pending";
  behavior: CatBehavior;
  care: CatCare;
}
