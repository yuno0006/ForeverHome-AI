import { Timestamp } from "firebase/firestore";

/**
 * AdopterProfile - A permanent, editable document in Firestore containing
 * an adopter's home profile, lifestyle, and preferences.
 *
 * Firestore Path: users/{uid}/adopterProfile
 */

export type HomeType = "apartment" | "house" | "condo" | "other";

export type WorkHours = "home-most-day" | "out-part-day" | "out-most-day" | "varies";

export type TravelFrequency = "rarely" | "occasional" | "frequent";

export type HouseholdNoise = "quiet" | "moderate" | "active";

export type CatExperience = "none" | "beginner" | "intermediate" | "experienced";

export type PersonalityPreference = "calm" | "playful" | "independent" | "affectionate";

export type AgePreference = "kitten" | "adult" | "senior";

/**
 * Extended pet information for the new profile structure.
 * Includes support for other pets beyond cats and dogs.
 */
export interface AdopterExistingPets {
  cats: number;
  dogs: number;
  other: string[];  // Descriptions of other pets
}

export interface AdopterProfile {
  // Basic Information
  id: string;                   // Auto-generated or user UID
  uid: string;                  // Reference to user document
  name: string;                 // Display name
  profilePhoto: string | null;  // Optional profile photo URL
  email: string;                // Contact email
  phone: string | null;         // Optional phone number

  // Home Profile
  homeType: HomeType;
  hasChildren: boolean;
  childrenAges: string[];       // Array of age ranges: ["0-4", "5-9", "10-14", "15+"]
  hasExistingPets: boolean;
  existingPets: AdopterExistingPets;
  hasGarden: boolean;
  indoorOnlyPreference: boolean;  // Preference for indoor-only cats

  // Lifestyle
  workHours: WorkHours;
  travelFrequency: TravelFrequency;
  householdNoise: HouseholdNoise;
  catExperience: CatExperience;

  // Preferences
  personalityPreference: PersonalityPreference[];
  agePreference: AgePreference[];
  specialNeedsOpenness: boolean;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isComplete: boolean;  // Whether all required fields are filled
}

/**
 * Required fields for profile validation
 */
export const REQUIRED_PROFILE_FIELDS: (keyof AdopterProfile)[] = [
  "name",
  "email",
  "homeType",
  "catExperience",
];
