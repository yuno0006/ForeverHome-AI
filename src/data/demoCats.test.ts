/**
 * Property Tests for Demo Cat Data Completeness
 *
 * Validates: Requirements 5.2, 5.3, 5.4
 *
 * Properties tested:
 * - Property 19: Demo Cat Data Completeness - All cats have required fields
 * - Property 20: Demo Cat Behavior Completeness - Behavior objects have all fields with valid enum values
 * - Property 21: Demo Cat Care Completeness - Care objects have all required fields
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { demoCats, getCatById } from './demoCats'
import type { Cat, CatBehavior, CatCare } from '@/types/cat'

// =============================================================================
// TYPE DEFINITIONS FOR VALIDATION
// =============================================================================

const VALID_LIFE_STAGES = ['kitten', 'young', 'adult', 'senior'] as const
const VALID_ENERGY_LEVELS = ['low', 'medium', 'high'] as const
const VALID_SOCIABILITY_LEVELS = ['reserved', 'moderate', 'outgoing'] as const
const VALID_STRESS_SENSITIVITY_LEVELS = ['low', 'moderate', 'high'] as const
const VALID_HANDLING_TOLERANCE_LEVELS = ['low', 'moderate', 'high'] as const
const VALID_PLAY_NEEDS_LEVELS = ['low', 'moderate', 'high'] as const
const VALID_TRINARY_OPTIONS = ['yes', 'no', 'unknown'] as const
const VALID_NOISE_TOLERANCE_LEVELS = ['low', 'moderate', 'high'] as const
const VALID_VERTICAL_SPACE_LEVELS = ['low', 'moderate', 'high'] as const
const VALID_FIV_STATUSES = ['negative', 'positive', 'unknown'] as const
const VALID_CAT_STATUSES = ['available', 'adopted', 'pending'] as const
const VALID_SEXES = ['male', 'female'] as const

const EXPECTED_CAT_IDS = ['barnaby', 'luna', 'milo', 'shadow', 'pepper', 'mochi', 'cleo', 'oliver', 'bella'] as const

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Type guard to check if a value is a valid enum value
 */
function isValidEnumValue<T extends string>(value: unknown, validValues: readonly T[]): value is T {
  return typeof value === 'string' && validValues.includes(value as T)
}

/**
 * Checks if a behavior object has all required fields with valid values
 */
function hasValidBehaviorFields(behavior: unknown): boolean {
  if (typeof behavior !== 'object' || behavior === null) return false

  const b = behavior as Record<string, unknown>

  // Check all required fields exist and have valid values
  const checks: boolean[] = [
    isValidEnumValue(b.energy, VALID_ENERGY_LEVELS),
    isValidEnumValue(b.sociability, VALID_SOCIABILITY_LEVELS),
    isValidEnumValue(b.stressSensitivity, VALID_STRESS_SENSITIVITY_LEVELS),
    isValidEnumValue(b.handlingTolerance, VALID_HANDLING_TOLERANCE_LEVELS),
    isValidEnumValue(b.playNeeds, VALID_PLAY_NEEDS_LEVELS),
    isValidEnumValue(b.comfortableWithChildren, VALID_TRINARY_OPTIONS),
    isValidEnumValue(b.comfortableWithCats, VALID_TRINARY_OPTIONS),
    isValidEnumValue(b.comfortableWithDogs, VALID_TRINARY_OPTIONS),
    isValidEnumValue(b.noiseTolerance, VALID_NOISE_TOLERANCE_LEVELS),
    isValidEnumValue(b.needsVerticalSpace, VALID_VERTICAL_SPACE_LEVELS),
    typeof b.indoorOnlyRequired === 'boolean',
  ]

  return checks.every(Boolean)
}

/**
 * Checks if a care object has all required fields
 */
function hasValidCareFields(care: unknown): boolean {
  if (typeof care !== 'object' || care === null) return false

  const c = care as Record<string, unknown>

  const checks: boolean[] = [
    typeof c.knownMedicalNeeds === 'string',
    typeof c.medicationNeeds === 'string',
    isValidEnumValue(c.fivStatus, VALID_FIV_STATUSES),
    typeof c.specialNotes === 'string',
  ]

  return checks.every(Boolean)
}

// =============================================================================
// PROPERTY 19: DEMO CAT DATA COMPLETENESS
// =============================================================================

describe('Property 19: Demo Cat Data Completeness', () => {
  it('should contain exactly 9 demo cats with unique IDs', () => {
    expect(demoCats).toHaveLength(9)

    const ids = demoCats.map((cat) => cat.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(9)
  })

  it('should have all expected cat IDs', () => {
    const ids = demoCats.map((cat) => cat.id)
    EXPECTED_CAT_IDS.forEach((expectedId) => {
      expect(ids).toContain(expectedId)
    })
  })

  it('should have all required fields for each cat (Property 19)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: demoCats.length - 1 }),
        (index) => {
          const cat = demoCats[index]

          // Check all required top-level fields
          const hasId = typeof cat.id === 'string' && cat.id.length > 0
          const hasName = typeof cat.name === 'string' && cat.name.length > 0
          const hasAge = typeof cat.age === 'number' && cat.age >= 0
          const hasLifeStage = isValidEnumValue(cat.lifeStage, VALID_LIFE_STAGES)
          const hasSex = isValidEnumValue(cat.sex, VALID_SEXES)
          const hasNeutered = typeof cat.neutered === 'boolean'
          const hasPhoto = typeof cat.photo === 'string' && cat.photo.length > 0
          const hasStatus = isValidEnumValue(cat.status, VALID_CAT_STATUSES)
          const hasBehavior = typeof cat.behavior === 'object' && cat.behavior !== null
          const hasCare = typeof cat.care === 'object' && cat.care !== null

          return (
            hasId &&
            hasName &&
            hasAge &&
            hasLifeStage &&
            hasSex &&
            hasNeutered &&
            hasPhoto &&
            hasStatus &&
            hasBehavior &&
            hasCare
          )
        }
      ),
      { verbose: true }
    )
  })

  it('should have valid photo URLs for each cat', () => {
    demoCats.forEach((cat) => {
      expect(cat.photo).toMatch(/^https?:\/\/.+/)
    })
  })

  it('should have consistent age and lifeStage values', () => {
    demoCats.forEach((cat) => {
      // Validate lifeStage matches age range
      if (cat.age < 1) {
        expect(cat.lifeStage).toBe('kitten')
      } else if (cat.age < 2) {
        expect(['kitten', 'young']).toContain(cat.lifeStage)
      } else if (cat.age < 7) {
        expect(['young', 'adult']).toContain(cat.lifeStage)
      } else if (cat.age >= 10) {
        expect(['adult', 'senior']).toContain(cat.lifeStage)
      }
    })
  })
})

// =============================================================================
// PROPERTY 20: DEMO CAT BEHAVIOR COMPLETENESS
// =============================================================================

describe('Property 20: Demo Cat Behavior Completeness', () => {
  it('should have all behavior fields with valid enum values for each cat (Property 20)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: demoCats.length - 1 }),
        (index) => {
          const cat = demoCats[index]
          return hasValidBehaviorFields(cat.behavior)
        }
      ),
      { verbose: true }
    )
  })

  it('should have valid energy levels for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_ENERGY_LEVELS).toContain(cat.behavior.energy)
    })
  })

  it('should have valid sociability levels for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_SOCIABILITY_LEVELS).toContain(cat.behavior.sociability)
    })
  })

  it('should have valid stress sensitivity levels for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_STRESS_SENSITIVITY_LEVELS).toContain(cat.behavior.stressSensitivity)
    })
  })

  it('should have valid handling tolerance levels for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_HANDLING_TOLERANCE_LEVELS).toContain(cat.behavior.handlingTolerance)
    })
  })

  it('should have valid play needs levels for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_PLAY_NEEDS_LEVELS).toContain(cat.behavior.playNeeds)
    })
  })

  it('should have valid comfortableWithChildren values for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_TRINARY_OPTIONS).toContain(cat.behavior.comfortableWithChildren)
    })
  })

  it('should have valid comfortableWithCats values for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_TRINARY_OPTIONS).toContain(cat.behavior.comfortableWithCats)
    })
  })

  it('should have valid comfortableWithDogs values for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_TRINARY_OPTIONS).toContain(cat.behavior.comfortableWithDogs)
    })
  })

  it('should have valid noise tolerance levels for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_NOISE_TOLERANCE_LEVELS).toContain(cat.behavior.noiseTolerance)
    })
  })

  it('should have valid needsVerticalSpace levels for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_VERTICAL_SPACE_LEVELS).toContain(cat.behavior.needsVerticalSpace)
    })
  })

  it('should have boolean indoorOnlyRequired for all cats', () => {
    demoCats.forEach((cat) => {
      expect(typeof cat.behavior.indoorOnlyRequired).toBe('boolean')
    })
  })
})

// =============================================================================
// PROPERTY 21: DEMO CAT CARE COMPLETENESS
// =============================================================================

describe('Property 21: Demo Cat Care Completeness', () => {
  it('should have all care fields for each cat (Property 21)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: demoCats.length - 1 }),
        (index) => {
          const cat = demoCats[index]
          return hasValidCareFields(cat.care)
        }
      ),
      { verbose: true }
    )
  })

  it('should have string knownMedicalNeeds for all cats', () => {
    demoCats.forEach((cat) => {
      expect(typeof cat.care.knownMedicalNeeds).toBe('string')
    })
  })

  it('should have string medicationNeeds for all cats', () => {
    demoCats.forEach((cat) => {
      expect(typeof cat.care.medicationNeeds).toBe('string')
    })
  })

  it('should have valid fivStatus for all cats', () => {
    demoCats.forEach((cat) => {
      expect(VALID_FIV_STATUSES).toContain(cat.care.fivStatus)
    })
  })

  it('should have string specialNotes for all cats', () => {
    demoCats.forEach((cat) => {
      expect(typeof cat.care.specialNotes).toBe('string')
    })
  })
})

// =============================================================================
// UNIT TESTS FOR getCatById - Requirements 5.1, 5.5, 5.6
// =============================================================================

describe('getCatById - Valid Cat Retrieval', () => {
  it('should return correct cat for each valid ID (Requirement 5.5)', () => {
    EXPECTED_CAT_IDS.forEach((id) => {
      const cat = getCatById(id)
      expect(cat).toBeDefined()
      expect(cat?.id).toBe(id)
    })
  })

  it('should return Barnaby with correct data', () => {
    const cat = getCatById('barnaby')
    expect(cat).toBeDefined()
    expect(cat?.name).toBe('Barnaby')
    expect(cat?.age).toBe(6)
    expect(cat?.lifeStage).toBe('adult')
    expect(cat?.sex).toBe('male')
    expect(cat?.behavior.stressSensitivity).toBe('high')
    expect(cat?.behavior.comfortableWithChildren).toBe('no')
  })

  it('should return Luna with correct data', () => {
    const cat = getCatById('luna')
    expect(cat).toBeDefined()
    expect(cat?.name).toBe('Luna')
    expect(cat?.age).toBe(3)
    expect(cat?.lifeStage).toBe('adult')
    expect(cat?.sex).toBe('female')
    expect(cat?.behavior.stressSensitivity).toBe('low')
    expect(cat?.behavior.sociability).toBe('outgoing')
  })

  it('should return Milo with correct data', () => {
    const cat = getCatById('milo')
    expect(cat).toBeDefined()
    expect(cat?.name).toBe('Milo')
    expect(cat?.age).toBe(1)
    expect(cat?.lifeStage).toBe('young')
    expect(cat?.sex).toBe('male')
    expect(cat?.behavior.energy).toBe('high')
    expect(cat?.behavior.needsVerticalSpace).toBe('high')
  })

  it('should return Shadow with correct data', () => {
    const cat = getCatById('shadow')
    expect(cat).toBeDefined()
    expect(cat?.name).toBe('Shadow')
    expect(cat?.age).toBe(11)
    expect(cat?.lifeStage).toBe('senior')
    expect(cat?.sex).toBe('male')
    expect(cat?.behavior.energy).toBe('low')
    expect(cat?.care.knownMedicalNeeds).toContain('Arthritis')
  })

  it('should return Pepper with correct data', () => {
    const cat = getCatById('pepper')
    expect(cat).toBeDefined()
    expect(cat?.name).toBe('Pepper')
    expect(cat?.age).toBe(1)
    expect(cat?.lifeStage).toBe('young')
    expect(cat?.sex).toBe('female')
    expect(cat?.behavior.energy).toBe('high')
    expect(cat?.behavior.sociability).toBe('outgoing')
  })

  it('should return Mochi with correct data', () => {
    const cat = getCatById('mochi')
    expect(cat).toBeDefined()
    expect(cat?.name).toBe('Mochi')
    expect(cat?.age).toBe(5)
    expect(cat?.lifeStage).toBe('adult')
    expect(cat?.sex).toBe('female')
    expect(cat?.care.fivStatus).toBe('positive')
  })
})

// =============================================================================
// PROPERTY 22: INVALID CAT ID HANDLING - Requirement 5.6
// =============================================================================

describe('Property 22: Invalid Cat ID Handling', () => {
  it('should return undefined for invalid cat IDs (Property 22)', () => {
    // Use fast-check to generate arbitrary invalid IDs
    fc.assert(
      fc.property(
        fc.string().filter((s) => !EXPECTED_CAT_IDS.includes(s as typeof EXPECTED_CAT_IDS[number])),
        (invalidId) => {
          const result = getCatById(invalidId)
          return result === undefined
        }
      ),
      { verbose: true }
    )
  })

  it('should return undefined for empty string', () => {
    expect(getCatById('')).toBeUndefined()
  })

  it('should return undefined for non-existent cat ID', () => {
    expect(getCatById('nonexistent-cat')).toBeUndefined()
  })

  it('should return undefined for random string', () => {
    expect(getCatById('random-id-12345')).toBeUndefined()
  })

  it('should return undefined for cat ID with special characters', () => {
    expect(getCatById('cat-!@#$%')).toBeUndefined()
  })

  it('should return undefined for numeric string', () => {
    expect(getCatById('123')).toBeUndefined()
  })

  it('should return undefined for whitespace-only string', () => {
    expect(getCatById('   ')).toBeUndefined()
  })

  it('should return undefined for uppercase version of valid ID', () => {
    expect(getCatById('BARNABy')).toBeUndefined()
    expect(getCatById('LUNA')).toBeUndefined()
    expect(getCatById('MILO')).toBeUndefined()
  })

  it('should return undefined for valid ID with extra whitespace', () => {
    expect(getCatById(' barnaby')).toBeUndefined()
    expect(getCatById('barnaby ')).toBeUndefined()
    expect(getCatById('  luna  ')).toBeUndefined()
  })
})

// =============================================================================
// DEMO CAT COUNT AND UNIQUENESS - Requirement 5.1
// =============================================================================

describe('Demo Cat Count and Uniqueness', () => {
  it('should have exactly 9 demo cats (Requirement 5.1)', () => {
    expect(demoCats).toHaveLength(9)
  })

  it('should have unique IDs for all cats (Requirement 5.1)', () => {
    const ids = demoCats.map((cat) => cat.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(9)
  })

  it('should have the exact expected IDs: barnaby, luna, milo, shadow, pepper, mochi, cleo, oliver, bella (Requirement 5.1)', () => {
    const ids = demoCats.map((cat) => cat.id).sort()
    const expectedIds = [...EXPECTED_CAT_IDS].sort()
    expect(ids).toEqual(expectedIds)
  })
})

// =============================================================================
// ADDITIONAL VALIDATION TESTS
// =============================================================================

describe('Demo Cat Data Validation Summary', () => {
  it('should have at least one cat representing each test scenario', () => {
    // High stress sensitivity for stress-noise rule
    const highStressCats = demoCats.filter((c) => c.behavior.stressSensitivity === 'high')
    expect(highStressCats.length).toBeGreaterThan(0)

    // Not comfortable with children for stress-children rule
    const noChildrenCats = demoCats.filter((c) => c.behavior.comfortableWithChildren === 'no')
    expect(noChildrenCats.length).toBeGreaterThan(0)

    // High energy for energy-absence rule
    const highEnergyCats = demoCats.filter((c) => c.behavior.energy === 'high')
    expect(highEnergyCats.length).toBeGreaterThan(0)

    // FIV+ for fiv-experience rule
    const fivPositiveCats = demoCats.filter((c) => c.care.fivStatus === 'positive')
    expect(fivPositiveCats.length).toBeGreaterThan(0)

    // Senior for senior-cat-absence rule
    const seniorCats = demoCats.filter((c) => c.lifeStage === 'senior')
    expect(seniorCats.length).toBeGreaterThan(0)
  })

  it('should have all cats with status "available"', () => {
    demoCats.forEach((cat) => {
      expect(cat.status).toBe('available')
    })
  })

  it('should have all cats with indoorOnlyRequired = true', () => {
    demoCats.forEach((cat) => {
      expect(cat.behavior.indoorOnlyRequired).toBe(true)
    })
  })
})
