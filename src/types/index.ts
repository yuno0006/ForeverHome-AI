// Re-export all types from individual files
// Note: adopterProfile.ts contains the new comprehensive AdopterProfile
// user.ts contains a legacy AdopterProfile type alias for backward compatibility

// Export from adopter.ts first (legacy types)
export * from './adopter';

// Export new types from adopterProfile.ts
export type {
  HomeType,
  WorkHours,
  TravelFrequency,
  HouseholdNoise,
  CatExperience,
  PersonalityPreference,
  AgePreference,
  AdopterExistingPets,
  AdopterProfile,
} from './adopterProfile';
export { REQUIRED_PROFILE_FIELDS } from './adopterProfile';

export * from './aiLog';
export * from './assessment';
export * from './cat';
export * from './checkIn';
export * from './coach';
export * from './insights';
export * from './match';
export * from './shelter';

// Export user types, excluding the conflicting AdopterProfile
export type {
  UserRole,
  ShelterRole,
  StaffProfile,
  UserRoleInfo,
  UserDocument,
  AdopterProfileLegacy,
} from './user';
