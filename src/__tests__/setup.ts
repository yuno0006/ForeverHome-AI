/**
 * Test Utilities and Helpers for ForeverHome AI
 * 
 * This file provides test utilities, fixtures, and generators for:
 * - Unit testing with Vitest
 * - Property-based testing with fast-check
 * 
 * Validates: Requirements 9.1, 9.5
 */

import * as fc from 'fast-check'
import type { Cat, CatBehavior, CatCare } from '../types/cat'
import type { Adopter, AdopterAnswers, Child, ExistingPets } from '../types/adopter'
import type { CompatibilityResult, Concern, Strength, Mitigation } from '../types/match'

// =============================================================================
// LITERAL TYPE UNIONS (for generators)
// =============================================================================

export const LIFE_STAGES = ['kitten', 'young', 'adult', 'senior'] as const
export const ENERGY_LEVELS = ['low', 'medium', 'high'] as const
export const SOCIABILITY_LEVELS = ['reserved', 'moderate', 'outgoing'] as const
export const STRESS_SENSITIVITY_LEVELS = ['low', 'moderate', 'high'] as const
export const HANDLING_TOLERANCE_LEVELS = ['low', 'moderate', 'high'] as const
export const PLAY_NEEDS_LEVELS = ['low', 'moderate', 'high'] as const
export const TRINARY_OPTIONS = ['yes', 'no', 'unknown'] as const
export const NOISE_TOLERANCE_LEVELS = ['low', 'moderate', 'high'] as const
export const VERTICAL_SPACE_LEVELS = ['low', 'moderate', 'high'] as const
export const FIV_STATUSES = ['negative', 'positive', 'unknown'] as const
export const CAT_STATUSES = ['available', 'adopted', 'pending'] as const
export const SEXES = ['male', 'female'] as const

export const HOME_TYPES = ['house', 'apartment', 'condo', 'other'] as const
export const CHILD_AGE_RANGES = ['0-4', '5-9', '10-14', '15+'] as const
export const HOUSEHOLD_NOISE_LEVELS = ['low', 'moderate', 'high'] as const
export const TRAVEL_FREQUENCIES = ['rare', 'occasional', 'frequent'] as const
export const INDOOR_SAFETY_LEVELS = ['secure', 'partial', 'unsure'] as const
export const VETERINARY_ACCESS_LEVELS = ['yes', 'no', 'unsure'] as const
export const COMPATIBILITY_LEVELS = ['low', 'moderate', 'high'] as const
export const CONCERN_SEVERITIES = ['significant', 'moderate'] as const

// =============================================================================
// FAST-CHECK ARBITRARIES (Property-Based Testing Generators)
// =============================================================================

/** Generator for CatBehavior objects */
export const arbCatBehavior: fc.Arbitrary<CatBehavior> = fc.record({
  energy: fc.constantFrom(...ENERGY_LEVELS),
  sociability: fc.constantFrom(...SOCIABILITY_LEVELS),
  stressSensitivity: fc.constantFrom(...STRESS_SENSITIVITY_LEVELS),
  handlingTolerance: fc.constantFrom(...HANDLING_TOLERANCE_LEVELS),
  playNeeds: fc.constantFrom(...PLAY_NEEDS_LEVELS),
  comfortableWithChildren: fc.constantFrom(...TRINARY_OPTIONS),
  comfortableWithCats: fc.constantFrom(...TRINARY_OPTIONS),
  comfortableWithDogs: fc.constantFrom(...TRINARY_OPTIONS),
  noiseTolerance: fc.constantFrom(...NOISE_TOLERANCE_LEVELS),
  needsVerticalSpace: fc.constantFrom(...VERTICAL_SPACE_LEVELS),
  indoorOnlyRequired: fc.boolean(),
})

/** Generator for CatCare objects */
export const arbCatCare: fc.Arbitrary<CatCare> = fc.record({
  knownMedicalNeeds: fc.string({ minLength: 0, maxLength: 200 }),
  medicationNeeds: fc.string({ minLength: 0, maxLength: 200 }),
  fivStatus: fc.constantFrom(...FIV_STATUSES),
  specialNotes: fc.string({ minLength: 0, maxLength: 500 }),
})

/** Generator for complete Cat objects */
export const arbCat: fc.Arbitrary<Cat> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  age: fc.integer({ min: 0, max: 25 }),
  lifeStage: fc.constantFrom(...LIFE_STAGES),
  sex: fc.constantFrom(...SEXES),
  neutered: fc.boolean(),
  breed: fc.string({ minLength: 1, maxLength: 30 }),
  color: fc.string({ minLength: 1, maxLength: 20 }),
  photo: fc.webUrl(),
  status: fc.constantFrom(...CAT_STATUSES),
  arrivalDate: fc.string({ minLength: 1, maxLength: 10 }),
  shelterId: fc.string({ minLength: 1, maxLength: 30 }),
  behavior: arbCatBehavior,
  care: arbCatCare,
})

/** Generator for Child objects */
export const arbChild: fc.Arbitrary<Child> = fc.record({
  ageRange: fc.constantFrom(...CHILD_AGE_RANGES),
})

/** Generator for ExistingPets objects */
export const arbExistingPets: fc.Arbitrary<ExistingPets> = fc.record({
  cats: fc.integer({ min: 0, max: 10 }),
  dogs: fc.integer({ min: 0, max: 10 }),
})

/** Generator for AdopterAnswers objects */
export const arbAdopterAnswers: fc.Arbitrary<AdopterAnswers> = fc.record({
  homeType: fc.constantFrom(...HOME_TYPES),
  adultsInHome: fc.integer({ min: 1, max: 10 }),
  children: fc.array(arbChild, { maxLength: 5 }),
  existingPets: arbExistingPets,
  householdNoise: fc.constantFrom(...HOUSEHOLD_NOISE_LEVELS),
  hoursAway: fc.integer({ min: 0, max: 24 }),
  travelFrequency: fc.constantFrom(...TRAVEL_FREQUENCIES),
  previousCatExperience: fc.boolean(),
  specialNeedsExperience: fc.boolean(),
  canProvideVerticalSpace: fc.boolean(),
  indoorSafety: fc.constantFrom(...INDOOR_SAFETY_LEVELS),
  veterinaryAccess: fc.constantFrom(...VETERINARY_ACCESS_LEVELS),
  comfortableWithRoutineCare: fc.boolean(),
  scenarioAnswers: fc.array(fc.string({ minLength: 10, maxLength: 500 }), { maxLength: 5 }),
})

/** Generator for Adopter objects (full adopter profile) */
export const arbAdopter: fc.Arbitrary<Adopter> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  homeType: fc.constantFrom(...HOME_TYPES),
  adultsInHome: fc.integer({ min: 1, max: 10 }),
  children: fc.array(arbChild, { maxLength: 5 }),
  existingPets: arbExistingPets,
  householdNoise: fc.constantFrom(...HOUSEHOLD_NOISE_LEVELS),
  hoursAway: fc.integer({ min: 0, max: 24 }),
  travelFrequency: fc.constantFrom(...TRAVEL_FREQUENCIES),
  previousCatExperience: fc.boolean(),
  specialNeedsExperience: fc.boolean(),
  canProvideVerticalSpace: fc.boolean(),
  indoorSafety: fc.constantFrom(...INDOOR_SAFETY_LEVELS),
  veterinaryAccess: fc.constantFrom(...VETERINARY_ACCESS_LEVELS),
  comfortableWithRoutineCare: fc.boolean(),
})

/** Generator for Concern objects */
export const arbConcern: fc.Arbitrary<Concern> = fc.record({
  ruleId: fc.string({ minLength: 1, maxLength: 30 }),
  severity: fc.constantFrom(...CONCERN_SEVERITIES),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  triggeredBy: fc.string({ minLength: 5, maxLength: 100 }),
})

/** Generator for Strength objects */
export const arbStrength: fc.Arbitrary<Strength> = fc.record({
  description: fc.string({ minLength: 10, maxLength: 200 }),
})

/** Generator for Mitigation objects */
export const arbMitigation: fc.Arbitrary<Mitigation> = fc.record({
  description: fc.string({ minLength: 10, maxLength: 200 }),
})

/** Generator for CompatibilityResult objects */
export const arbCompatibilityResult: fc.Arbitrary<CompatibilityResult> = fc.record({
  level: fc.constantFrom(...COMPATIBILITY_LEVELS),
  concerns: fc.array(arbConcern, { maxLength: 10 }),
  strengths: fc.array(arbStrength, { maxLength: 10 }),
  mitigations: fc.array(arbMitigation, { maxLength: 10 }),
  requiresShelterReview: fc.boolean(),
  alternativeCatIds: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
})

// =============================================================================
// SMART GENERATORS (Constrained for specific test scenarios)
// =============================================================================

/**
 * Generator for cats with high stress sensitivity
 * Used for testing stress-noise and stress-children rules
 */
export const arbHighStressCat: fc.Arbitrary<Cat> = arbCat.chain((cat) =>
  fc.constant({
    ...cat,
    behavior: {
      ...cat.behavior,
      stressSensitivity: 'high' as const,
    },
  })
)

/**
 * Generator for cats that are not comfortable with children
 * Used for testing stress-children rule
 */
export const arbNotComfortableWithChildrenCat: fc.Arbitrary<Cat> = arbCat.chain((cat) =>
  fc.constant({
    ...cat,
    behavior: {
      ...cat.behavior,
      comfortableWithChildren: 'no' as const,
    },
  })
)

/**
 * Generator for cats with indoor-only requirement
 * Used for testing indoor-safety rule
 */
export const arbIndoorOnlyCat: fc.Arbitrary<Cat> = arbCat.chain((cat) =>
  fc.constant({
    ...cat,
    behavior: {
      ...cat.behavior,
      indoorOnlyRequired: true,
    },
  })
)

/**
 * Generator for FIV+ cats
 * Used for testing fiv-experience rule
 */
export const arbFivPositiveCat: fc.Arbitrary<Cat> = arbCat.chain((cat) =>
  fc.constant({
    ...cat,
    care: {
      ...cat.care,
      fivStatus: 'positive' as const,
    },
  })
)

/**
 * Generator for cats with high energy
 * Used for testing energy-absence rule
 */
export const arbHighEnergyCat: fc.Arbitrary<Cat> = arbCat.chain((cat) =>
  fc.constant({
    ...cat,
    behavior: {
      ...cat.behavior,
      energy: 'high' as const,
    },
  })
)

/**
 * Generator for cats that need vertical space
 * Used for testing vertical-space rule
 */
export const arbNeedsVerticalSpaceCat: fc.Arbitrary<Cat> = arbCat.chain((cat) =>
  fc.constant({
    ...cat,
    behavior: {
      ...cat.behavior,
      needsVerticalSpace: 'high' as const,
    },
  })
)

/**
 * Generator for cats not comfortable with dogs
 * Used for testing dog-incompatibility rule
 */
export const arbNotComfortableWithDogsCat: fc.Arbitrary<Cat> = arbCat.chain((cat) =>
  fc.constant({
    ...cat,
    behavior: {
      ...cat.behavior,
      comfortableWithDogs: 'no' as const,
    },
  })
)

/**
 * Generator for cats with medical needs
 * Used for testing special-care rule
 */
export const arbCatWithMedicalNeeds: fc.Arbitrary<Cat> = arbCat.chain((cat) =>
  fc.constant({
    ...cat,
    care: {
      ...cat.care,
      knownMedicalNeeds: 'Requires daily medication',
    },
  })
)

/**
 * Generator for senior cats
 * Used for testing senior-cat-absence rule
 */
export const arbSeniorCat: fc.Arbitrary<Cat> = arbCat.chain((cat) =>
  fc.constant({
    ...cat,
    lifeStage: 'senior' as const,
    age: 11,
  })
)

/**
 * Generator for adopters with high household noise
 * Used for testing stress-noise rule
 */
export const arbHighNoiseAdopterAnswers: fc.Arbitrary<AdopterAnswers> = arbAdopterAnswers.chain(
  (adopter) =>
    fc.constant({
      ...adopter,
      householdNoise: 'high' as const,
    })
)

/**
 * Generator for adopters with young children (0-9)
 * Used for testing stress-children rule
 */
export const arbAdopterWithYoungChildren: fc.Arbitrary<AdopterAnswers> = arbAdopterAnswers.chain(
  (adopter) =>
    fc.constant({
      ...adopter,
      children: [
        { ageRange: '0-4' as const },
        { ageRange: '5-9' as const },
      ],
    })
)

/**
 * Generator for adopters with insecure indoor setup
 * Used for testing indoor-safety rule
 */
export const arbInsecureIndoorAdopterAnswers: fc.Arbitrary<AdopterAnswers> = arbAdopterAnswers.chain(
  (adopter) =>
    fc.constant({
      ...adopter,
      indoorSafety: 'unsure' as const,
    })
)

/**
 * Generator for adopters without special needs experience
 * Used for testing special-care and fiv-experience rules
 */
export const arbNoSpecialNeedsExperienceAdopterAnswers: fc.Arbitrary<AdopterAnswers> =
  arbAdopterAnswers.chain((adopter) =>
    fc.constant({
      ...adopter,
      specialNeedsExperience: false,
    })
  )

/**
 * Generator for adopters with dogs
 * Used for testing dog-incompatibility rule
 */
export const arbAdopterWithDogs: fc.Arbitrary<AdopterAnswers> = fc
  .integer({ min: 1, max: 3 })
  .chain((dogCount) =>
    arbAdopterAnswers.chain((adopter) =>
      fc.constant({
        ...adopter,
        existingPets: {
          ...adopter.existingPets,
          dogs: dogCount,
        },
      })
    )
  )

/**
 * Generator for adopters who are away for long hours
 * Used for testing energy-absence and senior-cat-absence rules
 */
export const arbLongHoursAwayAdopterAnswers: fc.Arbitrary<AdopterAnswers> = fc
  .integer({ min: 10, max: 24 })
  .chain((hours) =>
    arbAdopterAnswers.chain((adopter) =>
      fc.constant({
        ...adopter,
        hoursAway: hours,
      })
    )
  )

/**
 * Generator for adopters who cannot provide vertical space
 * Used for testing vertical-space rule
 */
export const arbNoVerticalSpaceAdopterAnswers: fc.Arbitrary<AdopterAnswers> = arbAdopterAnswers.chain(
  (adopter) =>
    fc.constant({
      ...adopter,
      canProvideVerticalSpace: false,
    })
)

// =============================================================================
// TEST FIXTURES (Deterministic test data)
// =============================================================================

/**
 * Creates a minimal valid cat for testing
 */
export function createTestCat(overrides: Partial<Cat> = {}): Cat {
  return {
    id: 'test-cat-1',
    name: 'Test Cat',
    age: 3,
    lifeStage: 'adult',
    sex: 'male',
    neutered: true,
    breed: 'Unknown',
    color: 'Unknown',
    photo: 'https://example.com/cat.jpg',
    status: 'available',
    arrivalDate: '2024-01-01',
    shelterId: 'test-shelter',
    behavior: createTestCatBehavior(),
    care: createTestCatCare(),
    ...overrides,
  } as Cat
}

/**
 * Creates a minimal valid CatBehavior for testing
 */
export function createTestCatBehavior(overrides: Partial<CatBehavior> = {}): CatBehavior {
  return {
    energy: 'medium',
    sociability: 'moderate',
    stressSensitivity: 'low',
    handlingTolerance: 'moderate',
    playNeeds: 'moderate',
    comfortableWithChildren: 'yes',
    comfortableWithCats: 'yes',
    comfortableWithDogs: 'yes',
    noiseTolerance: 'moderate',
    needsVerticalSpace: 'low',
    indoorOnlyRequired: false,
    ...overrides,
  }
}

/**
 * Creates a minimal valid CatCare for testing
 */
export function createTestCatCare(overrides: Partial<CatCare> = {}): CatCare {
  return {
    knownMedicalNeeds: '',
    medicationNeeds: '',
    fivStatus: 'negative',
    specialNotes: '',
    ...overrides,
  }
}

/**
 * Creates a minimal valid AdopterAnswers for testing
 */
export function createTestAdopterAnswers(overrides: Partial<AdopterAnswers> = {}): AdopterAnswers {
  return {
    homeType: 'house',
    adultsInHome: 2,
    children: [],
    existingPets: { cats: 0, dogs: 0 },
    householdNoise: 'moderate',
    hoursAway: 8,
    travelFrequency: 'rare',
    previousCatExperience: true,
    specialNeedsExperience: false,
    canProvideVerticalSpace: true,
    indoorSafety: 'secure',
    veterinaryAccess: 'yes',
    comfortableWithRoutineCare: true,
    scenarioAnswers: [],
    ...overrides,
  }
}

/**
 * Creates a minimal valid Adopter for testing
 */
export function createTestAdopter(overrides: Partial<Adopter> = {}): Adopter {
  return {
    id: 'test-adopter-1',
    name: 'Test Adopter',
    homeType: 'house',
    adultsInHome: 2,
    children: [],
    existingPets: { cats: 0, dogs: 0 },
    householdNoise: 'moderate',
    hoursAway: 8,
    travelFrequency: 'rare',
    previousCatExperience: true,
    specialNeedsExperience: false,
    canProvideVerticalSpace: true,
    indoorSafety: 'secure',
    veterinaryAccess: 'yes',
    comfortableWithRoutineCare: true,
    ...overrides,
  }
}

// =============================================================================
// FIXTURE CATS (Based on demo cats for consistent testing)
// =============================================================================

/**
 * Barnaby: High stress sensitivity, not comfortable with children, indoor-only
 * Used for testing: stress-noise, stress-children rules
 */
export const fixtureBarnaby: Cat = createTestCat({
  id: 'barnaby',
  name: 'Barnaby',
  age: 6,
  lifeStage: 'adult',
  behavior: createTestCatBehavior({
    stressSensitivity: 'high',
    comfortableWithChildren: 'no',
    indoorOnlyRequired: true,
    noiseTolerance: 'low',
  }),
})

/**
 * Luna: Low stress, outgoing, comfortable with all
 * Ideal first-time cat - should have low concerns with most adopters
 */
export const fixtureLuna: Cat = createTestCat({
  id: 'luna',
  name: 'Luna',
  age: 3,
  lifeStage: 'adult',
  behavior: createTestCatBehavior({
    stressSensitivity: 'low',
    sociability: 'outgoing',
    comfortableWithChildren: 'yes',
    comfortableWithCats: 'yes',
    comfortableWithDogs: 'yes',
    noiseTolerance: 'high',
  }),
})

/**
 * Milo: High energy, needs vertical space, unknown compatibility
 * Used for testing: energy-absence, vertical-space rules
 */
export const fixtureMilo: Cat = createTestCat({
  id: 'milo',
  name: 'Milo',
  age: 1,
  lifeStage: 'young',
  behavior: createTestCatBehavior({
    energy: 'high',
    playNeeds: 'high',
    needsVerticalSpace: 'high',
    comfortableWithChildren: 'unknown',
    comfortableWithCats: 'unknown',
    comfortableWithDogs: 'unknown',
  }),
})

/**
 * Shadow: Senior with arthritis, not comfortable with dogs
 * Used for testing: senior-cat-absence, special-care rules
 */
export const fixtureShadow: Cat = createTestCat({
  id: 'shadow',
  name: 'Shadow',
  age: 11,
  lifeStage: 'senior',
  behavior: createTestCatBehavior({
    energy: 'low',
    comfortableWithDogs: 'no',
  }),
  care: createTestCatCare({
    knownMedicalNeeds: 'Arthritis',
    medicationNeeds: 'Joint supplement daily',
  }),
})

/**
 * Pepper: High energy, outgoing, needs enrichment
 * Used for testing: energy-absence rule
 */
export const fixturePepper: Cat = createTestCat({
  id: 'pepper',
  name: 'Pepper',
  age: 1,
  lifeStage: 'young',
  behavior: createTestCatBehavior({
    energy: 'high',
    sociability: 'outgoing',
    playNeeds: 'high',
  }),
})

/**
 * Mochi: FIV+, selective with cats
 * Used for testing: fiv-experience rule
 */
export const fixtureMochi: Cat = createTestCat({
  id: 'mochi',
  name: 'Mochi',
  age: 5,
  lifeStage: 'adult',
  behavior: createTestCatBehavior({
    comfortableWithCats: 'no',
  }),
  care: createTestCatCare({
    fivStatus: 'positive',
    specialNotes: 'FIV+ - requires indoor-only lifestyle',
  }),
})

/**
 * All fixture cats as an array
 */
export const allFixtureCats: Cat[] = [
  fixtureBarnaby,
  fixtureLuna,
  fixtureMilo,
  fixtureShadow,
  fixturePepper,
  fixtureMochi,
]

// =============================================================================
// FIXTURE ADOPTERS (Various adopter profiles for testing)
// =============================================================================

/**
 * Ideal adopter: Experienced, home often, secure environment
 * Should match well with most cats
 */
export const fixtureIdealAdopterAnswers: AdopterAnswers = createTestAdopterAnswers({
  homeType: 'house',
  adultsInHome: 2,
  children: [],
  existingPets: { cats: 0, dogs: 0 },
  householdNoise: 'low',
  hoursAway: 4,
  travelFrequency: 'rare',
  previousCatExperience: true,
  specialNeedsExperience: true,
  canProvideVerticalSpace: true,
  indoorSafety: 'secure',
  veterinaryAccess: 'yes',
  comfortableWithRoutineCare: true,
})

/**
 * Busy adopter: Long hours away, frequent travel
 * Used for testing: energy-absence, senior-cat-absence rules
 */
export const fixtureBusyAdopterAnswers: AdopterAnswers = createTestAdopterAnswers({
  hoursAway: 12,
  travelFrequency: 'frequent',
  previousCatExperience: false,
})

/**
 * Family with young children
 * Used for testing: stress-children rule
 */
export const fixtureFamilyWithYoungChildrenAnswers: AdopterAnswers = createTestAdopterAnswers({
  children: [
    { ageRange: '0-4' },
    { ageRange: '5-9' },
  ],
  householdNoise: 'high',
})

/**
 * Apartment dweller with dogs
 * Used for testing: dog-incompatibility, vertical-space rules
 */
export const fixtureApartmentWithDogsAnswers: AdopterAnswers = createTestAdopterAnswers({
  homeType: 'apartment',
  existingPets: { cats: 0, dogs: 2 },
  canProvideVerticalSpace: false,
})

/**
 * First-time adopter without experience
 * Used for testing: special-care, fiv-experience rules
 */
export const fixtureFirstTimeAdopterAnswers: AdopterAnswers = createTestAdopterAnswers({
  previousCatExperience: false,
  specialNeedsExperience: false,
})

// =============================================================================
// UTILITY FUNCTIONS FOR TESTS
// =============================================================================

/**
 * Type guard to check if a value is a valid compatibility level
 */
export function isValidCompatibilityLevel(level: unknown): level is 'low' | 'moderate' | 'high' {
  return typeof level === 'string' && ['low', 'moderate', 'high'].includes(level)
}

/**
 * Type guard to check if a value is a valid concern severity
 */
export function isValidConcernSeverity(severity: unknown): severity is 'significant' | 'moderate' {
  return typeof severity === 'string' && ['significant', 'moderate'].includes(severity)
}

/**
 * Counts the number of significant concerns in a result
 */
export function countSignificantConcerns(result: CompatibilityResult): number {
  return result.concerns.filter((c) => c.severity === 'significant').length
}

/**
 * Counts the number of moderate concerns in a result
 */
export function countModerateConcerns(result: CompatibilityResult): number {
  return result.concerns.filter((c) => c.severity === 'moderate').length
}

/**
 * Checks if a specific rule was triggered in the result
 */
export function isRuleTriggered(result: CompatibilityResult, ruleId: string): boolean {
  return result.concerns.some((c) => c.ruleId === ruleId)
}

/**
 * Gets a specific concern by rule ID
 */
export function getConcernByRuleId(result: CompatibilityResult, ruleId: string): Concern | undefined {
  return result.concerns.find((c) => c.ruleId === ruleId)
}
