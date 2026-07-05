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

export interface CatPersonality {
  trait: string;
  description: string;
}

export interface CatPhoto {
  url: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface Cat {
  id: string;
  name: string;
  age: number;
  lifeStage: "kitten" | "young" | "adult" | "senior";
  sex: "male" | "female";
  neutered: boolean;
  breed: string;
  color: string;
  weight?: string;
  photo: string;
  photos?: CatPhoto[];
  status: "available" | "adopted" | "pending";
  arrivalDate: string;
  daysInShelter?: number;
  shelterId: string;
  behavior: CatBehavior;
  care: CatCare;
  personality?: CatPersonality[];
  backstory?: string;
  idealHome?: string;
  adoptionFee?: number;
  microchipped?: boolean;
  vaccinated?: boolean;
}
