import { Timestamp } from "firebase/firestore";

/**
 * User Types - Updated for multi-role support
 */

export type UserRole = "adopter" | "shelter_staff";

export type ShelterRole = "admin" | "staff";

export interface StaffProfile {
  position: string;
  shelterRole: ShelterRole;
}

/**
 * UserRoleInfo - Role management interface
 */
export interface UserRoleInfo {
  uid: string;
  primaryRole: UserRole;
  roles: UserRole[];
  activeRole: UserRole;
  shelterId: string | null;
  shelterRole: ShelterRole | null;
}

/**
 * UserDocument - Main user document interface
 *
 * Updated to support multiple roles with active role tracking
 *
 * Migration note: During the transition, both 'role' (legacy) and 'roles'/'activeRole' (new)
 * may exist. The 'role' property is kept for backward compatibility and is equivalent
 * to 'activeRole' in the new system.
 */
export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  roles?: UserRole[];          // New: array of roles (optional during migration)
  activeRole?: UserRole;       // New: current active role (optional during migration)
  photoURL: string | null;
  createdAt: Timestamp;
  onboardingComplete: boolean;
  shelterId: string | null;

  // Profile references (not embedded)
  hasAdopterProfile?: boolean;  // Flag indicating profile exists (optional for backward compat)
  staffProfile?: StaffProfile | null;  // Optional during migration

  // Legacy property - kept for backward compatibility during migration
  // This should be removed after Task 11 (Implement multi-role support) is complete
  role?: UserRole;             // Legacy single role - equivalent to activeRole
  profile?: AdopterProfileLegacy | StaffProfile | null;  // Legacy embedded profile
}

// Legacy types kept for backward compatibility during migration
export interface AdopterProfileLegacy {
  homeType: "apartment" | "house" | "other";
  adultsInHome: number;
  hasChildren: boolean;
  childrenAges: string[];
  hasOtherPets: boolean;
  petExperience: "none" | "beginner" | "intermediate" | "experienced";
  hoursAwayDaily: number;
}

/**
 * AdopterProfile - Legacy alias for backward compatibility
 *
 * NOTE: The new comprehensive AdopterProfile is in src/types/adopterProfile.ts
 * This alias is kept for existing code that hasn't been migrated yet.
 * 
 * @deprecated Use AdopterProfile from '@/types/adopterProfile' instead
 */
export type AdopterProfile = AdopterProfileLegacy;
