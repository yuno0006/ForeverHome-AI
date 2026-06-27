import { Timestamp } from "firebase/firestore";

export type UserRole = "adopter" | "shelter_staff";

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL: string | null;
  createdAt: Timestamp;
  onboardingComplete: boolean;
  shelterId: string | null;
  profile: AdopterProfile | StaffProfile | null;
}

export interface AdopterProfile {
  homeType: "apartment" | "house" | "other";
  adultsInHome: number;
  hasChildren: boolean;
  childrenAges: string[];
  hasOtherPets: boolean;
  petExperience: "none" | "beginner" | "intermediate" | "experienced";
  hoursAwayDaily: number;
}

export interface StaffProfile {
  position: string;
  shelterRole: "admin" | "staff";
}
