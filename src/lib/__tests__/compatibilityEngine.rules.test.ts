/**
 * Unit Tests for Compatibility Engine - Remaining Rules
 *
 * This file contains unit tests for the remaining compatibility rules:
 * - energy-absence rule (high energy + long hours away)
 * - vertical-space rule (needs vertical space + cannot provide)
 * - dog-incompatibility rule (not comfortable with dogs + has dogs)
 * - special-care rule (medical needs + no special needs experience)
 * - unknown-compatibility rule (unknown compatibility with children)
 * - senior-cat-absence rule (senior cat + long hours away)
 *
 * Validates: Requirements 9.1
 */

import { describe, it, expect } from 'vitest'
import { assessCompatibility } from '../compatibilityEngine'
import { getCatById } from '@/data/demoCats'
import {
  createTestCat,
  createTestAdopterAnswers,
  createTestCatBehavior,
  createTestCatCare,
  isRuleTriggered,
  getConcernByRuleId,
} from '@/__tests__/setup'
import type { Cat, AdopterAnswers } from '@/types'

// =============================================================================
// RULE: ENERGY-ABSENCE
// =============================================================================

describe('Energy-Absence Rule', () => {
  /**
   * Rule: When a cat has high energy AND adopter is away 10+ hours AND
   * cat needs vertical space AND adopter cannot provide vertical space,
   * generate "energy-absence" concern with severity "significant".
   *
   * Triggered by: high energy + hoursAway >= 10 + needsVerticalSpace === "high" + !canProvideVerticalSpace
   */

  it('should trigger energy-absence concern when high energy cat with long hours away and no vertical space', () => {
    // Milo has high energy and needs vertical space
    const milo = getCatById('milo')!
    const longHoursNoVerticalSpaceAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 10,
      canProvideVerticalSpace: false,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      existingPets: { cats: 0, dogs: 0 },
    })

    const result = assessCompatibility(milo, longHoursNoVerticalSpaceAdopter)

    expect(isRuleTriggered(result, 'energy-absence')).toBe(true)
    const concern = getConcernByRuleId(result, 'energy-absence')
    expect(concern?.severity).toBe('significant')
    expect(concern?.description).toContain('High-energy')
    expect(concern?.description).toContain('long daily absence')
  })

  it('should NOT trigger energy-absence when hours away is less than 10', () => {
    const milo = getCatById('milo')!
    const shortHoursAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 8,
      canProvideVerticalSpace: false,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(milo, shortHoursAdopter)

    // Should have vertical-space concern but not energy-absence
    expect(isRuleTriggered(result, 'energy-absence')).toBe(false)
    expect(isRuleTriggered(result, 'vertical-space')).toBe(true)
  })

  it('should NOT trigger energy-absence when adopter can provide vertical space', () => {
    const milo = getCatById('milo')!
    const longHoursWithVerticalSpaceAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 12,
      canProvideVerticalSpace: true,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(milo, longHoursWithVerticalSpaceAdopter)

    expect(isRuleTriggered(result, 'energy-absence')).toBe(false)
  })

  it('should NOT trigger energy-absence for low energy cats', () => {
    // Shadow has low energy
    const shadow = getCatById('shadow')!
    const longHoursNoVerticalSpaceAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 12,
      canProvideVerticalSpace: false,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(shadow, longHoursNoVerticalSpaceAdopter)

    expect(isRuleTriggered(result, 'energy-absence')).toBe(false)
  })

  it('should trigger energy-absence exactly at 10 hours away threshold', () => {
    const milo = getCatById('milo')!
    const exactlyTenHoursAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 10,
      canProvideVerticalSpace: false,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(milo, exactlyTenHoursAdopter)

    expect(isRuleTriggered(result, 'energy-absence')).toBe(true)
  })
})

// =============================================================================
// RULE: VERTICAL-SPACE
// =============================================================================

describe('Vertical-Space Rule', () => {
  /**
   * Rule: When a cat needs vertical space AND adopter cannot provide it,
   * generate "vertical-space" concern with severity "moderate".
   *
   * Triggered by: needsVerticalSpace === "high" + !canProvideVerticalSpace
   */

  it('should trigger vertical-space concern when cat needs vertical space and adopter cannot provide', () => {
    // Milo and Pepper need vertical space
    const milo = getCatById('milo')!
    const noVerticalSpaceAdopter: AdopterAnswers = createTestAdopterAnswers({
      canProvideVerticalSpace: false,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      hoursAway: 4, // Avoid energy-absence trigger
    })

    const result = assessCompatibility(milo, noVerticalSpaceAdopter)

    expect(isRuleTriggered(result, 'vertical-space')).toBe(true)
    const concern = getConcernByRuleId(result, 'vertical-space')
    expect(concern?.severity).toBe('moderate')
    expect(concern?.description).toContain('vertical space')
  })

  it('should NOT trigger vertical-space when adopter can provide vertical space', () => {
    const milo = getCatById('milo')!
    const withVerticalSpaceAdopter: AdopterAnswers = createTestAdopterAnswers({
      canProvideVerticalSpace: true,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      hoursAway: 4,
    })

    const result = assessCompatibility(milo, withVerticalSpaceAdopter)

    expect(isRuleTriggered(result, 'vertical-space')).toBe(false)
  })

  it('should NOT trigger vertical-space for cats with low vertical space needs', () => {
    // Luna has low vertical space needs
    const luna = getCatById('luna')!
    const noVerticalSpaceAdopter: AdopterAnswers = createTestAdopterAnswers({
      canProvideVerticalSpace: false,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(luna, noVerticalSpaceAdopter)

    expect(isRuleTriggered(result, 'vertical-space')).toBe(false)
  })

  it('should trigger vertical-space for Pepper who needs vertical space', () => {
    const pepper = getCatById('pepper')!
    const noVerticalSpaceAdopter: AdopterAnswers = createTestAdopterAnswers({
      canProvideVerticalSpace: false,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      hoursAway: 4, // Avoid energy-absence trigger
    })

    const result = assessCompatibility(pepper, noVerticalSpaceAdopter)

    expect(isRuleTriggered(result, 'vertical-space')).toBe(true)
  })
})

// =============================================================================
// RULE: DOG-INCOMPATIBILITY
// =============================================================================

describe('Dog-Incompatibility Rule', () => {
  /**
   * Rule: When a cat is not comfortable with dogs AND adopter has dogs,
   * generate "dog-incompatibility" concern with severity "significant".
   *
   * Triggered by: comfortableWithDogs === "no" + existingPets.dogs > 0
   */

  it('should trigger dog-incompatibility concern when cat not comfortable with dogs and adopter has dogs', () => {
    // Shadow is not comfortable with dogs
    const shadow = getCatById('shadow')!
    const adopterWithDogs: AdopterAnswers = createTestAdopterAnswers({
      existingPets: { cats: 0, dogs: 1 },
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      hoursAway: 4,
    })

    const result = assessCompatibility(shadow, adopterWithDogs)

    expect(isRuleTriggered(result, 'dog-incompatibility')).toBe(true)
    const concern = getConcernByRuleId(result, 'dog-incompatibility')
    expect(concern?.severity).toBe('significant')
    expect(concern?.description).toContain('dogs')
  })

  it('should trigger dog-incompatibility with multiple dogs', () => {
    const shadow = getCatById('shadow')!
    const adopterWithMultipleDogs: AdopterAnswers = createTestAdopterAnswers({
      existingPets: { cats: 0, dogs: 3 },
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      hoursAway: 4,
    })

    const result = assessCompatibility(shadow, adopterWithMultipleDogs)

    expect(isRuleTriggered(result, 'dog-incompatibility')).toBe(true)
    expect(result.concerns.find(c => c.ruleId === 'dog-incompatibility')?.triggeredBy).toContain('3 dog')
  })

  it('should NOT trigger dog-incompatibility when adopter has no dogs', () => {
    const shadow = getCatById('shadow')!
    const adopterWithoutDogs: AdopterAnswers = createTestAdopterAnswers({
      existingPets: { cats: 0, dogs: 0 },
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      hoursAway: 4,
    })

    const result = assessCompatibility(shadow, adopterWithoutDogs)

    expect(isRuleTriggered(result, 'dog-incompatibility')).toBe(false)
  })

  it('should NOT trigger dog-incompatibility for cats comfortable with dogs', () => {
    // Luna is comfortable with dogs
    const luna = getCatById('luna')!
    const adopterWithDogs: AdopterAnswers = createTestAdopterAnswers({
      existingPets: { cats: 0, dogs: 2 },
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(luna, adopterWithDogs)

    expect(isRuleTriggered(result, 'dog-incompatibility')).toBe(false)
  })

  it('should NOT trigger dog-incompatibility when cat has unknown comfort with dogs', () => {
    // Milo has unknown comfort with dogs
    const milo = getCatById('milo')!
    const adopterWithDogs: AdopterAnswers = createTestAdopterAnswers({
      existingPets: { cats: 0, dogs: 1 },
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      canProvideVerticalSpace: true,
      hoursAway: 4,
    })

    const result = assessCompatibility(milo, adopterWithDogs)

    // Should trigger unknown-compatibility, not dog-incompatibility
    expect(isRuleTriggered(result, 'dog-incompatibility')).toBe(false)
    expect(isRuleTriggered(result, 'unknown-compatibility')).toBe(true)
  })
})

// =============================================================================
// RULE: SPECIAL-CARE
// =============================================================================

describe('Special-Care Rule', () => {
  /**
   * Rule: When a cat has medical needs AND adopter is not comfortable with routine care,
   * generate "special-care" concern with severity "significant".
   *
   * Triggered by: knownMedicalNeeds !== "None" + !comfortableWithRoutineCare
   */

  it('should trigger special-care concern when cat has medical needs and adopter not comfortable with routine care', () => {
    // Shadow has arthritis
    const shadow = getCatById('shadow')!
    const noRoutineCareAdopter: AdopterAnswers = createTestAdopterAnswers({
      comfortableWithRoutineCare: false,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      hoursAway: 4,
    })

    const result = assessCompatibility(shadow, noRoutineCareAdopter)

    expect(isRuleTriggered(result, 'special-care')).toBe(true)
    const concern = getConcernByRuleId(result, 'special-care')
    expect(concern?.severity).toBe('significant')
    expect(concern?.description).toContain('medical')
    expect(concern?.triggeredBy).toContain('Arthritis')
  })

  it('should NOT trigger special-care when adopter is comfortable with routine care', () => {
    const shadow = getCatById('shadow')!
    const comfortableAdopter: AdopterAnswers = createTestAdopterAnswers({
      comfortableWithRoutineCare: true,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      hoursAway: 4,
    })

    const result = assessCompatibility(shadow, comfortableAdopter)

    expect(isRuleTriggered(result, 'special-care')).toBe(false)
  })

  it('should NOT trigger special-care for cats without medical needs', () => {
    // Luna has no medical needs
    const luna = getCatById('luna')!
    const noRoutineCareAdopter: AdopterAnswers = createTestAdopterAnswers({
      comfortableWithRoutineCare: false,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(luna, noRoutineCareAdopter)

    expect(isRuleTriggered(result, 'special-care')).toBe(false)
  })

  it('should trigger special-care for any non-None medical needs', () => {
    const catWithMedication: Cat = createTestCat({
      id: 'test-medical-cat',
      care: createTestCatCare({
        knownMedicalNeeds: 'Daily insulin injections',
      }),
    })

    const noRoutineCareAdopter: AdopterAnswers = createTestAdopterAnswers({
      comfortableWithRoutineCare: false,
    })

    const result = assessCompatibility(catWithMedication, noRoutineCareAdopter)

    expect(isRuleTriggered(result, 'special-care')).toBe(true)
  })
})

// =============================================================================
// RULE: UNKNOWN-COMPATIBILITY
// =============================================================================

describe('Unknown-Compatibility Rule', () => {
  /**
   * Rule: When a cat has unknown compatibility with children/cats/dogs AND
   * adopter has relevant household members (young children, cats, dogs),
   * generate "unknown-compatibility" concern with severity "moderate".
   *
   * Triggered by: comfortableWithChildren === "unknown" + hasYoungChildren OR
   *                comfortableWithCats === "unknown" + existingPets.cats > 0 OR
   *                comfortableWithDogs === "unknown" + existingPets.dogs > 0
   */

  it('should trigger unknown-compatibility when cat has unknown comfort with children and adopter has young children', () => {
    // Milo has unknown compatibility with children
    const milo = getCatById('milo')!
    const familyWithYoungChildren: AdopterAnswers = createTestAdopterAnswers({
      children: [{ ageRange: '0-4' }],
      householdNoise: 'low',
      indoorSafety: 'secure',
      canProvideVerticalSpace: true,
      hoursAway: 4,
    })

    const result = assessCompatibility(milo, familyWithYoungChildren)

    expect(isRuleTriggered(result, 'unknown-compatibility')).toBe(true)
    const concern = getConcernByRuleId(result, 'unknown-compatibility')
    expect(concern?.severity).toBe('moderate')
    expect(concern?.triggeredBy).toContain('compatibility with children')
  })

  it('should trigger unknown-compatibility when cat has unknown comfort with cats and adopter has cats', () => {
    // Mochi has unknown compatibility with cats
    const mochi = getCatById('mochi')!
    const adopterWithCats: AdopterAnswers = createTestAdopterAnswers({
      existingPets: { cats: 2, dogs: 0 },
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(mochi, adopterWithCats)

    expect(isRuleTriggered(result, 'unknown-compatibility')).toBe(true)
    expect(getConcernByRuleId(result, 'unknown-compatibility')?.triggeredBy).toContain('compatibility with other cats')
  })

  it('should trigger unknown-compatibility when cat has unknown comfort with dogs and adopter has dogs', () => {
    // Milo has unknown compatibility with dogs
    const milo = getCatById('milo')!
    const adopterWithDogs: AdopterAnswers = createTestAdopterAnswers({
      existingPets: { cats: 0, dogs: 1 },
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      canProvideVerticalSpace: true,
      hoursAway: 4,
    })

    const result = assessCompatibility(milo, adopterWithDogs)

    expect(isRuleTriggered(result, 'unknown-compatibility')).toBe(true)
    expect(getConcernByRuleId(result, 'unknown-compatibility')?.triggeredBy).toContain('compatibility with dogs')
  })

  it('should include multiple unknown fields in single concern when applicable', () => {
    // Milo has unknown compatibility with children and dogs (but NOT cats - it's "yes")
    const milo = getCatById('milo')!
    const adopterWithAll: AdopterAnswers = createTestAdopterAnswers({
      children: [{ ageRange: '5-9' }],
      existingPets: { cats: 0, dogs: 1 }, // Dogs only (Milo has unknown with dogs)
      householdNoise: 'low',
      indoorSafety: 'secure',
      canProvideVerticalSpace: true,
      hoursAway: 4,
    })

    const result = assessCompatibility(milo, adopterWithAll)

    expect(isRuleTriggered(result, 'unknown-compatibility')).toBe(true)
    const concern = getConcernByRuleId(result, 'unknown-compatibility')
    expect(concern?.triggeredBy).toContain('compatibility with children')
    expect(concern?.triggeredBy).toContain('compatibility with dogs')
  })

  it('should NOT trigger unknown-compatibility when adopter has no relevant household members', () => {
    const milo = getCatById('milo')!
    const adopterNoRelevantMembers: AdopterAnswers = createTestAdopterAnswers({
      children: [{ ageRange: '15+' }], // Older children only
      existingPets: { cats: 0, dogs: 0 },
      householdNoise: 'low',
      indoorSafety: 'secure',
      canProvideVerticalSpace: true,
      hoursAway: 4,
    })

    const result = assessCompatibility(milo, adopterNoRelevantMembers)

    expect(isRuleTriggered(result, 'unknown-compatibility')).toBe(false)
  })

  it('should NOT trigger unknown-compatibility for cats with known compatibility', () => {
    // Luna has known compatibility (yes) with all
    const luna = getCatById('luna')!
    const adopterWithAll: AdopterAnswers = createTestAdopterAnswers({
      children: [{ ageRange: '0-4' }],
      existingPets: { cats: 1, dogs: 1 },
      householdNoise: 'low',
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(luna, adopterWithAll)

    expect(isRuleTriggered(result, 'unknown-compatibility')).toBe(false)
  })

  it('should NOT trigger unknown-compatibility for older children (10+)', () => {
    const milo = getCatById('milo')!
    const adopterWithOlderChildren: AdopterAnswers = createTestAdopterAnswers({
      children: [{ ageRange: '10-14' }, { ageRange: '15+' }],
      householdNoise: 'low',
      indoorSafety: 'secure',
      canProvideVerticalSpace: true,
      hoursAway: 4,
    })

    const result = assessCompatibility(milo, adopterWithOlderChildren)

    // Unknown compatibility with children should only trigger for 0-4 and 5-9
    expect(isRuleTriggered(result, 'unknown-compatibility')).toBe(false)
  })
})

// =============================================================================
// RULE: SENIOR-CAT-ABSENCE
// =============================================================================

describe('Senior-Cat-Absence Rule', () => {
  /**
   * Rule: When a cat is a senior with medical needs AND adopter is away 10+ hours,
   * generate "senior-cat-absence" concern with severity "significant".
   *
   * Triggered by: lifeStage === "senior" + knownMedicalNeeds !== "None" + hoursAway >= 10
   */

  it('should trigger senior-cat-absence when senior cat with medical needs and long hours away', () => {
    // Shadow is senior with arthritis
    const shadow = getCatById('shadow')!
    const longHoursAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 10,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      existingPets: { cats: 0, dogs: 0 }, // Avoid dog-incompatibility
    })

    const result = assessCompatibility(shadow, longHoursAdopter)

    expect(isRuleTriggered(result, 'senior-cat-absence')).toBe(true)
    const concern = getConcernByRuleId(result, 'senior-cat-absence')
    expect(concern?.severity).toBe('significant')
    expect(concern?.description).toContain('Senior cat')
    expect(concern?.description).toContain('medical needs')
    expect(concern?.triggeredBy).toContain('Arthritis')
  })

  it('should NOT trigger senior-cat-absence when hours away is less than 10', () => {
    const shadow = getCatById('shadow')!
    const shortHoursAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 8,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      existingPets: { cats: 0, dogs: 0 },
    })

    const result = assessCompatibility(shadow, shortHoursAdopter)

    expect(isRuleTriggered(result, 'senior-cat-absence')).toBe(false)
  })

  it('should NOT trigger senior-cat-absence for non-senior cats', () => {
    // Luna is an adult (not senior)
    const luna = getCatById('luna')!
    const longHoursAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 12,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(luna, longHoursAdopter)

    expect(isRuleTriggered(result, 'senior-cat-absence')).toBe(false)
  })

  it('should NOT trigger senior-cat-absence for senior cats without medical needs', () => {
    const healthySeniorCat: Cat = createTestCat({
      id: 'healthy-senior',
      lifeStage: 'senior',
      age: 12,
      care: createTestCatCare({
        knownMedicalNeeds: 'None',
      }),
    })

    const longHoursAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 12,
    })

    const result = assessCompatibility(healthySeniorCat, longHoursAdopter)

    expect(isRuleTriggered(result, 'senior-cat-absence')).toBe(false)
  })

  it('should trigger senior-cat-absence exactly at 10 hours threshold', () => {
    const shadow = getCatById('shadow')!
    const exactlyTenHoursAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 10,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      existingPets: { cats: 0, dogs: 0 },
    })

    const result = assessCompatibility(shadow, exactlyTenHoursAdopter)

    expect(isRuleTriggered(result, 'senior-cat-absence')).toBe(true)
  })

  it('should combine with other concerns for high-level match', () => {
    // Shadow with long hours + dogs = multiple significant concerns
    const shadow = getCatById('shadow')!
    const problematicAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 12,
      existingPets: { cats: 0, dogs: 1 },
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(shadow, problematicAdopter)

    // Should have both senior-cat-absence and dog-incompatibility
    expect(isRuleTriggered(result, 'senior-cat-absence')).toBe(true)
    expect(isRuleTriggered(result, 'dog-incompatibility')).toBe(true)
    // With 2+ significant concerns, level should be high
    expect(result.level).toBe('high')
  })
})

// =============================================================================
// COMBINED RULE TESTS
// =============================================================================

describe('Multiple Rule Interactions', () => {
  it('should correctly apply multiple rules simultaneously', () => {
    const milo = getCatById('milo')!
    const complexAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 12,
      canProvideVerticalSpace: false,
      children: [{ ageRange: '0-4' }],
      existingPets: { cats: 0, dogs: 1 }, // Milo has unknown compatibility with dogs
      householdNoise: 'low',
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(milo, complexAdopter)

    // Should trigger energy-absence (high energy + 10+ hours + high vertical space need + no vertical space)
    expect(isRuleTriggered(result, 'energy-absence')).toBe(true)
    // Should trigger vertical-space
    expect(isRuleTriggered(result, 'vertical-space')).toBe(true)
    // Should trigger unknown-compatibility (children and dogs)
    expect(isRuleTriggered(result, 'unknown-compatibility')).toBe(true)

    // energy-absence is significant, vertical-space is moderate, unknown-compatibility is moderate
    // With 1 significant concern, level should be moderate
    expect(result.level).toBe('moderate')
  })

  it('should correctly handle adopter that triggers no concerns for ideal cat', () => {
    const luna = getCatById('luna')!
    const idealAdopter: AdopterAnswers = createTestAdopterAnswers({
      hoursAway: 4,
      canProvideVerticalSpace: true,
      children: [],
      existingPets: { cats: 0, dogs: 0 },
      householdNoise: 'low',
      indoorSafety: 'secure',
      previousCatExperience: true,
      specialNeedsExperience: true,
      comfortableWithRoutineCare: true,
    })

    const result = assessCompatibility(luna, idealAdopter)

    expect(result.concerns.length).toBe(0)
    expect(result.level).toBe('low')
  })
})
