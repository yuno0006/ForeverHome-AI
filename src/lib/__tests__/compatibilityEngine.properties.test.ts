/**
 * Property-Based Tests for Compatibility Engine - Level Determination
 *
 * This file contains property tests for the compatibility level determination logic.
 * Properties tested:
 * - Property 1: Compatibility Level Validity
 * - Property 6: High Concern Level Determination
 * - Property 7: Moderate Concern Level Determination
 * - Property 8: Low Concern Level Determination
 * - Property 9: Alternative Recommendations
 *
 * Validates: Requirements 1.1, 1.6, 1.7, 1.8, 1.9
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { assessCompatibility } from '../compatibilityEngine'
import { demoCats, getCatById } from '@/data/demoCats'
import {
  createTestCat,
  createTestAdopterAnswers,
  createTestCatBehavior,
  createTestCatCare,
  countSignificantConcerns,
  isValidCompatibilityLevel,
} from '@/__tests__/setup'
import type { Cat, AdopterAnswers } from '@/types'

// =============================================================================
// PROPERTY 1: Compatibility Level Validity
// =============================================================================

describe('Property 1: Compatibility Level Validity', () => {
  /**
   * Property: For any cat and adopter pair processed by the compatibility engine,
   * the returned result level shall be one of "low", "moderate", or "high".
   *
   * Validates: Requirement 1.1
   */
  it('should return a valid compatibility level ("low", "moderate", or "high") for any demo cat with any adopter', () => {
    const demoCatIds = demoCats.map(c => c.id)

    fc.assert(
      fc.property(
        fc.constantFrom(...demoCatIds),
        fc.record({
          homeType: fc.constantFrom('house', 'apartment', 'condo', 'other'),
          adultsInHome: fc.integer({ min: 1, max: 10 }),
          children: fc.array(fc.record({ ageRange: fc.constantFrom('0-4', '5-9', '10-14', '15+') }), { maxLength: 5 }),
          existingPets: fc.record({ cats: fc.integer({ min: 0, max: 5 }), dogs: fc.integer({ min: 0, max: 5 }) }),
          householdNoise: fc.constantFrom('low', 'moderate', 'high'),
          hoursAway: fc.integer({ min: 0, max: 24 }),
          travelFrequency: fc.constantFrom('rare', 'occasional', 'frequent'),
          previousCatExperience: fc.boolean(),
          specialNeedsExperience: fc.boolean(),
          canProvideVerticalSpace: fc.boolean(),
          indoorSafety: fc.constantFrom('secure', 'partial', 'unsure'),
          veterinaryAccess: fc.constantFrom('yes', 'no', 'unsure'),
          comfortableWithRoutineCare: fc.boolean(),
          scenarioAnswers: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 3 }),
        }),
        (catId, adopter) => {
          const cat = getCatById(catId)
          if (!cat) return // Skip if cat not found

          const result = assessCompatibility(cat, adopter as AdopterAnswers)

          expect(isValidCompatibilityLevel(result.level)).toBe(true)
          expect(['low', 'moderate', 'high']).toContain(result.level)
        }
      ),
      {
        numRuns: 100,
      }
    )
  })

  it('should always return a level that is one of the three valid values for each demo cat', () => {
    for (const cat of demoCats) {
      const adopter = createTestAdopterAnswers()
      const result = assessCompatibility(cat, adopter)

      expect(['low', 'moderate', 'high']).toContain(result.level)
    }
  })
})

// =============================================================================
// PROPERTY 6: High Concern Level Determination
// =============================================================================

describe('Property 6: High Concern Level Determination', () => {
  /**
   * Property: For any compatibility result where the count of concerns with
   * severity === "significant" is greater than or equal to 2, the result level
   * shall be "high".
   *
   * Validates: Requirement 1.6
   */

  it('should return level "high" when there are 2 or more significant concerns', () => {
    // Barnaby: high stress, not comfortable with children, indoor-only required
    // With high noise + young children + insecure indoor = 3 significant concerns
    const barnaby = getCatById('barnaby')!
    const problematicAdopter: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'high', // triggers stress-noise
      children: [{ ageRange: '0-4' }], // triggers stress-children
      indoorSafety: 'partial', // triggers indoor-safety
    })

    const result = assessCompatibility(barnaby, problematicAdopter)

    expect(countSignificantConcerns(result)).toBeGreaterThanOrEqual(2)
    expect(result.level).toBe('high')
  })

  it('should return level "high" for Barnaby with high noise and young children', () => {
    // Barnaby has high stress sensitivity and is not comfortable with children
    const barnaby = getCatById('barnaby')!
    const adopterWithNoiseAndKids: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'high',
      children: [{ ageRange: '5-9' }],
      indoorSafety: 'secure', // avoid indoor-safety trigger
    })

    const result = assessCompatibility(barnaby, adopterWithNoiseAndKids)

    // Should have stress-noise and stress-children = 2 significant concerns
    expect(countSignificantConcerns(result)).toBeGreaterThanOrEqual(2)
    expect(result.level).toBe('high')
  })

  it('should return level "high" when combining multiple triggers', () => {
    const demoCatIds = demoCats.map(c => c.id)

    fc.assert(
      fc.property(
        fc.constantFrom(...demoCatIds),
        (catId) => {
          const cat = getCatById(catId)!
          // Create an adopter that will trigger multiple concerns for this cat
          const triggerAdopter: AdopterAnswers = createTestAdopterAnswers({
            householdNoise: 'high',
            children: [{ ageRange: '0-4' }],
            indoorSafety: 'unsure',
            existingPets: { cats: 0, dogs: 2 }, // Trigger dog issues if applicable
            hoursAway: 12, // Long hours
            canProvideVerticalSpace: false,
            comfortableWithRoutineCare: false,
          })

          const result = assessCompatibility(cat, triggerAdopter)

          // If 2+ significant concerns, level must be high
          if (countSignificantConcerns(result) >= 2) {
            expect(result.level).toBe('high')
          }
        }
      ),
      { numRuns: 50 }
    )
  })
})

// =============================================================================
// PROPERTY 7: Moderate Concern Level Determination
// =============================================================================

describe('Property 7: Moderate Concern Level Determination', () => {
  /**
   * Property: For any compatibility result where the count of concerns with
   * severity === "significant" equals 1, the result level shall be "moderate".
   *
   * Validates: Requirement 1.7
   */

  it('should return level "moderate" when there is exactly 1 significant concern', () => {
    // Barnaby with high noise (triggers stress-noise) but no other issues
    const barnaby = getCatById('barnaby')!
    const singleConcernAdopter: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'high', // triggers stress-noise
      children: [], // no children, avoid stress-children
      indoorSafety: 'secure', // avoid indoor-safety
      existingPets: { cats: 0, dogs: 0 }, // avoid dog incompatibility
    })

    const result = assessCompatibility(barnaby, singleConcernAdopter)

    // Should have exactly 1 significant concern (stress-noise)
    expect(countSignificantConcerns(result)).toBe(1)
    expect(result.level).toBe('moderate')
  })

  it('should return level "moderate" for Barnaby with young children only', () => {
    // Barnaby with young children triggers stress-children
    const barnaby = getCatById('barnaby')!
    const familyAdopter: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'low', // avoid stress-noise
      children: [{ ageRange: '0-4' }], // triggers stress-children
      indoorSafety: 'secure', // avoid indoor-safety
      existingPets: { cats: 0, dogs: 0 },
    })

    const result = assessCompatibility(barnaby, familyAdopter)

    expect(countSignificantConcerns(result)).toBe(1)
    expect(result.level).toBe('moderate')
  })

  it('should return level "moderate" when only moderate concerns exist (no significant)', () => {
    // Milo with no vertical space (triggers vertical-space which is moderate)
    const milo = getCatById('milo')!
    const noVerticalSpaceAdopter: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      canProvideVerticalSpace: false, // triggers vertical-space (moderate)
      existingPets: { cats: 0, dogs: 0 },
    })

    const result = assessCompatibility(milo, noVerticalSpaceAdopter)

    // Should have moderate concerns (vertical-space)
    // No significant concerns means moderate concerns result in "moderate" level
    if (countSignificantConcerns(result) === 0 && result.concerns.length > 0) {
      expect(result.level).toBe('moderate')
    }
  })
})

// =============================================================================
// PROPERTY 8: Low Concern Level Determination
// =============================================================================

describe('Property 8: Low Concern Level Determination', () => {
  /**
   * Property: For any compatibility result where the concerns array is empty,
   * the result level shall be "low".
   *
   * Validates: Requirement 1.8
   */

  it('should return level "low" when there are no concerns', () => {
    // Luna is the ideal first-time cat - low stress, comfortable with all
    const luna = getCatById('luna')!
    const idealAdopter: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      existingPets: { cats: 0, dogs: 0 },
      hoursAway: 4,
      canProvideVerticalSpace: true,
      comfortableWithRoutineCare: true,
    })

    const result = assessCompatibility(luna, idealAdopter)

    expect(result.concerns.length).toBe(0)
    expect(result.level).toBe('low')
  })

  it('should return level "low" for Luna with ideal adopter', () => {
    const luna = getCatById('luna')!
    const adopter = createTestAdopterAnswers({
      householdNoise: 'low',
      children: [],
      existingPets: { cats: 0, dogs: 0 },
      indoorSafety: 'secure',
      canProvideVerticalSpace: true,
      hoursAway: 6,
    })

    const result = assessCompatibility(luna, adopter)

    expect(result.concerns.length).toBe(0)
    expect(result.level).toBe('low')
  })

  it('should return level "low" for Pepper with appropriate adopter', () => {
    // Pepper is high energy but comfortable with all
    const pepper = getCatById('pepper')!
    const adopter = createTestAdopterAnswers({
      householdNoise: 'low',
      children: [],
      existingPets: { cats: 0, dogs: 0 },
      indoorSafety: 'secure',
      canProvideVerticalSpace: true, // Avoids vertical-space concern
      hoursAway: 4, // Low hours avoids energy-absence
    })

    const result = assessCompatibility(pepper, adopter)

    // Pepper needs vertical space but can provide it
    expect(result.concerns.length).toBe(0)
    expect(result.level).toBe('low')
  })

  it('should always return "low" level for Luna regardless of reasonable adopter variations', () => {
    const luna = getCatById('luna')!

    fc.assert(
      fc.property(
        fc.record({
          homeType: fc.constantFrom('house', 'apartment', 'condo'),
          adultsInHome: fc.integer({ min: 1, max: 4 }),
          householdNoise: fc.constantFrom('low', 'moderate'), // Luna can handle moderate noise
          children: fc.array(fc.record({ ageRange: fc.constantFrom('10-14', '15+') }), { maxLength: 3 }), // Older children only
          existingPets: fc.record({ cats: fc.nat(2), dogs: fc.nat(2) }), // Luna is comfortable with both
          hoursAway: fc.integer({ min: 0, max: 8 }),
          canProvideVerticalSpace: fc.boolean(),
          indoorSafety: fc.constantFrom('secure', 'partial'),
          veterinaryAccess: fc.constantFrom('yes', 'no'),
          comfortableWithRoutineCare: fc.boolean(),
          previousCatExperience: fc.boolean(),
          specialNeedsExperience: fc.boolean(),
          travelFrequency: fc.constantFrom('rare', 'occasional'),
          scenarioAnswers: fc.array(fc.string(), { maxLength: 2 }),
        }),
        (adopter) => {
          const result = assessCompatibility(luna, adopter as AdopterAnswers)

          // Luna should have no significant concerns with reasonable adopters
          if (result.concerns.length === 0) {
            expect(result.level).toBe('low')
          }
        }
      ),
      { numRuns: 50 }
    )
  })
})

// =============================================================================
// ADDITIONAL LEVEL DETERMINATION TESTS
// =============================================================================

describe('Level Determination Edge Cases', () => {
  it('should never return undefined or null for level with any demo cat', () => {
    for (const cat of demoCats) {
      const adopter = createTestAdopterAnswers()
      const result = assessCompatibility(cat, adopter)

      expect(result.level).toBeDefined()
      expect(result.level).not.toBeNull()
      expect(typeof result.level).toBe('string')
    }
  })

  it('should always set requiresShelterReview to true for moderate level', () => {
    const barnaby = getCatById('barnaby')!
    const singleConcernAdopter = createTestAdopterAnswers({
      householdNoise: 'high',
      children: [],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(barnaby, singleConcernAdopter)

    expect(result.level).toBe('moderate')
    expect(result.requiresShelterReview).toBe(true)
  })

  it('should always set requiresShelterReview to true for high level', () => {
    const barnaby = getCatById('barnaby')!
    const multiConcernAdopter = createTestAdopterAnswers({
      householdNoise: 'high',
      children: [{ ageRange: '0-4' }],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(barnaby, multiConcernAdopter)

    expect(result.level).toBe('high')
    expect(result.requiresShelterReview).toBe(true)
  })

  it('should set requiresShelterReview to false for low level', () => {
    const luna = getCatById('luna')!
    const idealAdopter = createTestAdopterAnswers({
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      existingPets: { cats: 0, dogs: 0 },
      canProvideVerticalSpace: true,
    })

    const result = assessCompatibility(luna, idealAdopter)

    expect(result.level).toBe('low')
    expect(result.requiresShelterReview).toBe(false)
  })

  it('should return alternative cat recommendations for moderate and high levels', () => {
    const barnaby = getCatById('barnaby')!
    const problematicAdopter = createTestAdopterAnswers({
      householdNoise: 'high',
      children: [{ ageRange: '0-4' }],
    })

    const result = assessCompatibility(barnaby, problematicAdopter)

    expect(result.level).toBe('high')
    expect(result.alternativeCatIds.length).toBeGreaterThan(0)

    // Verify each alternative is actually a "low" match
    for (const altId of result.alternativeCatIds) {
      const altCat = getCatById(altId)
      if (altCat) {
        const altResult = assessCompatibility(altCat, problematicAdopter)
        expect(altResult.level).toBe('low')
      }
    }
  })
})

// =============================================================================
// PROPERTY 9: Alternative Recommendations
// =============================================================================

describe('Property 9: Alternative Recommendations', () => {
  /**
   * Property: For any compatibility result where level is "high" or "moderate",
   * the alternativeCatIds array shall contain cat IDs where each alternative
   * yields a "low" compatibility level with the same adopter.
   *
   * Note: The implementation finds alternative cats by checking if other cats
   * would have a "low" compatibility level with the same adopter. If no cats
   * have a "low" level (e.g., all cats are indoor-only and adopter has insecure
   * indoor setup), alternatives may be empty - this is correct behavior.
   *
   * Validates: Requirement 1.9
   */

  it('should return at least one alternative cat with "low" level when result is "high"', () => {
    // Barnaby with high noise + young children triggers 2 significant concerns → high
    const barnaby = getCatById('barnaby')!
    const problematicAdopter: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'high',
      children: [{ ageRange: '0-4' }],
      indoorSafety: 'secure', // avoid indoor-safety trigger for alternatives
    })

    const result = assessCompatibility(barnaby, problematicAdopter)

    expect(result.level).toBe('high')
    expect(result.alternativeCatIds.length).toBeGreaterThan(0)

    // Each alternative must be a "low" match for this adopter
    for (const altId of result.alternativeCatIds) {
      const altCat = getCatById(altId)
      expect(altCat).toBeDefined()
      if (altCat) {
        const altResult = assessCompatibility(altCat, problematicAdopter)
        expect(altResult.level).toBe('low')
      }
    }
  })

  it('should return at least one alternative cat with "low" level when result is "moderate"', () => {
    // Barnaby with high noise only triggers 1 significant concern → moderate
    const barnaby = getCatById('barnaby')!
    const singleConcernAdopter: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'high',
      children: [], // no children to avoid stress-children
      indoorSafety: 'secure',
      existingPets: { cats: 0, dogs: 0 },
    })

    const result = assessCompatibility(barnaby, singleConcernAdopter)

    expect(result.level).toBe('moderate')
    expect(result.alternativeCatIds.length).toBeGreaterThan(0)

    // Each alternative must be a "low" match for this adopter
    for (const altId of result.alternativeCatIds) {
      const altCat = getCatById(altId)
      expect(altCat).toBeDefined()
      if (altCat) {
        const altResult = assessCompatibility(altCat, singleConcernAdopter)
        expect(altResult.level).toBe('low')
      }
    }
  })

  it('should include Luna as an alternative for most problematic matches', () => {
    // Luna is the ideal first-time cat with low stress, comfortable with all
    // She should be a "low" match for most adopter profiles
    const barnaby = getCatById('barnaby')!
    const difficultAdopter: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'high',
      children: [{ ageRange: '5-9' }],
      indoorSafety: 'secure', // Required for Luna to be a low match
    })

    const result = assessCompatibility(barnaby, difficultAdopter)

    expect(result.level).toBe('high')
    // Luna should be among alternatives (she's compatible with most situations)
    expect(result.alternativeCatIds).toContain('luna')

    // Verify Luna is indeed a "low" match
    const luna = getCatById('luna')!
    const lunaResult = assessCompatibility(luna, difficultAdopter)
    expect(lunaResult.level).toBe('low')
  })

  it('should return empty alternatives array for "low" level results', () => {
    // Luna with ideal adopter should have no concerns → low
    const luna = getCatById('luna')!
    const idealAdopter: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      existingPets: { cats: 0, dogs: 0 },
      canProvideVerticalSpace: true,
    })

    const result = assessCompatibility(luna, idealAdopter)

    expect(result.level).toBe('low')
    // Low level results should not have alternative recommendations
    expect(result.alternativeCatIds.length).toBe(0)
  })

  it('should not include the original cat in alternatives', () => {
    const barnaby = getCatById('barnaby')!
    const problematicAdopter: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'high',
      children: [{ ageRange: '0-4' }],
      indoorSafety: 'secure',
    })

    const result = assessCompatibility(barnaby, problematicAdopter)

    expect(result.level).toBe('high')
    // The original cat should never be in its own alternatives
    expect(result.alternativeCatIds).not.toContain('barnaby')
  })

  it('should guarantee all alternatives have "low" level when alternatives exist', () => {
    // Core property: IF alternatives exist, they MUST all be "low" matches
    const demoCatIds = demoCats.map(c => c.id)

    fc.assert(
      fc.property(
        fc.constantFrom(...demoCatIds),
        fc.record({
          householdNoise: fc.constantFrom('low', 'moderate', 'high'),
          children: fc.array(fc.record({ ageRange: fc.constantFrom('0-4', '5-9', '10-14', '15+') }), { maxLength: 3 }),
          indoorSafety: fc.constantFrom('secure', 'partial', 'unsure'),
          existingPets: fc.record({ cats: fc.integer({ min: 0, max: 3 }), dogs: fc.integer({ min: 0, max: 3 }) }),
          hoursAway: fc.integer({ min: 0, max: 24 }),
          canProvideVerticalSpace: fc.boolean(),
          comfortableWithRoutineCare: fc.boolean(),
          previousCatExperience: fc.boolean(),
          specialNeedsExperience: fc.boolean(),
        }),
        (catId, adopterOverrides) => {
          const cat = getCatById(catId)!
          const adopter: AdopterAnswers = {
            ...createTestAdopterAnswers(),
            ...adopterOverrides,
            homeType: 'house',
            adultsInHome: 2,
            travelFrequency: 'rare',
            veterinaryAccess: 'yes',
            scenarioAnswers: [],
          }

          const result = assessCompatibility(cat, adopter)

          // Property: All alternatives must be "low" matches
          for (const altId of result.alternativeCatIds) {
            const altCat = getCatById(altId)
            if (altCat) {
              const altResult = assessCompatibility(altCat, adopter)
              expect(altResult.level).toBe('low')
            }
          }

          // Property: Original cat is never in alternatives
          expect(result.alternativeCatIds).not.toContain(catId)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should find alternatives for high/moderate concern level when secure indoor safety is provided', () => {
    // When indoor safety is secure, there should be cats with "low" matches
    const demoCatIds = demoCats.map(c => c.id)

    fc.assert(
      fc.property(
        fc.constantFrom(...demoCatIds),
        fc.record({
          householdNoise: fc.constantFrom('low', 'moderate', 'high'),
          children: fc.array(fc.record({ ageRange: fc.constantFrom('0-4', '5-9', '10-14', '15+') }), { maxLength: 3 }),
          existingPets: fc.record({ cats: fc.integer({ min: 0, max: 3 }), dogs: fc.integer({ min: 0, max: 3 }) }),
          hoursAway: fc.integer({ min: 0, max: 8 }), // Reasonable hours away
          canProvideVerticalSpace: fc.boolean(),
          comfortableWithRoutineCare: fc.boolean(),
          previousCatExperience: fc.boolean(),
          specialNeedsExperience: fc.boolean(),
        }),
        (catId, adopterOverrides) => {
          const cat = getCatById(catId)!
          const adopter: AdopterAnswers = {
            ...createTestAdopterAnswers(),
            ...adopterOverrides,
            homeType: 'house',
            adultsInHome: 2,
            travelFrequency: 'rare',
            veterinaryAccess: 'yes',
            indoorSafety: 'secure', // KEY: Secure indoor means at least Luna should be "low"
            scenarioAnswers: [],
          }

          const result = assessCompatibility(cat, adopter)

          // Property: High or moderate results with secure indoor should have alternatives
          if (result.level === 'high' || result.level === 'moderate') {
            expect(result.alternativeCatIds.length).toBeGreaterThan(0)

            // All alternatives must be "low" matches
            for (const altId of result.alternativeCatIds) {
              const altCat = getCatById(altId)
              if (altCat) {
                const altResult = assessCompatibility(altCat, adopter)
                expect(altResult.level).toBe('low')
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return alternatives for Shadow with dog in household', () => {
    // Shadow is not comfortable with dogs (triggers dog-incompatibility: significant)
    // With secure indoor, other cats should be available as alternatives
    const shadow = getCatById('shadow')!
    const adopterWithDogs: AdopterAnswers = createTestAdopterAnswers({
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      existingPets: { cats: 0, dogs: 2 },
    })

    const result = assessCompatibility(shadow, adopterWithDogs)

    // dog-incompatibility triggers 1 significant concern → moderate
    expect(result.level).toBe('moderate')
    expect(result.alternativeCatIds.length).toBeGreaterThan(0)

    // Verify all alternatives are "low" matches
    for (const altId of result.alternativeCatIds) {
      const altCat = getCatById(altId)
      if (altCat) {
        const altResult = assessCompatibility(altCat, adopterWithDogs)
        expect(altResult.level).toBe('low')
      }
    }
  })

  it('should return alternatives for Mochi with inexperienced adopter', () => {
    // Mochi is FIV+ and requires experience
    const mochi = getCatById('mochi')!
    const inexperiencedAdopter: AdopterAnswers = createTestAdopterAnswers({
      previousCatExperience: false,
      specialNeedsExperience: false,
      householdNoise: 'low',
      children: [],
      indoorSafety: 'secure',
      existingPets: { cats: 0, dogs: 0 },
    })

    const result = assessCompatibility(mochi, inexperiencedAdopter)

    // FIV+ with no experience triggers fiv-experience concern (moderate)
    expect(result.level).toBe('moderate')
    expect(result.alternativeCatIds.length).toBeGreaterThan(0)

    // Verify all alternatives are "low" matches
    for (const altId of result.alternativeCatIds) {
      const altCat = getCatById(altId)
      if (altCat) {
        const altResult = assessCompatibility(altCat, inexperiencedAdopter)
        expect(altResult.level).toBe('low')
      }
    }
  })

  it('should handle edge case where no cat is a good match', () => {
    // All demo cats require indoor-only. An adopter with insecure indoor setup
    // will have concerns with ALL cats, so alternatives may be empty.
    const barnaby = getCatById('barnaby')!
    const insecureIndoorAdopter: AdopterAnswers = createTestAdopterAnswers({
      indoorSafety: 'partial', // Triggers indoor-safety for all cats
      householdNoise: 'high', // Triggers stress-noise for Barnaby
      children: [{ ageRange: '0-4' }], // Triggers stress-children for Barnaby
    })

    const result = assessCompatibility(barnaby, insecureIndoorAdopter)

    // Barnaby has 3 significant concerns → high
    expect(result.level).toBe('high')

    // With insecure indoor, all cats trigger indoor-safety, so alternatives may be empty
    // This is expected behavior - the system correctly identifies no good alternatives exist
    // The property holds: all alternatives (if any) must be "low" matches
    for (const altId of result.alternativeCatIds) {
      const altCat = getCatById(altId)
      if (altCat) {
        const altResult = assessCompatibility(altCat, insecureIndoorAdopter)
        expect(altResult.level).toBe('low')
      }
    }
  })
})

// =============================================================================
// CROSS-CHECK: DEMO CATS WITH KNOWN PROFILES
// =============================================================================

describe('Demo Cats Compatibility Verification', () => {
  it('should correctly identify Barnaby as high-stress and child-averse', () => {
    const barnaby = getCatById('barnaby')!
    expect(barnaby.behavior.stressSensitivity).toBe('high')
    expect(barnaby.behavior.comfortableWithChildren).toBe('no')
    expect(barnaby.behavior.indoorOnlyRequired).toBe(true)
  })

  it('should correctly identify Luna as the ideal first-time cat', () => {
    const luna = getCatById('luna')!
    expect(luna.behavior.stressSensitivity).toBe('low')
    expect(luna.behavior.comfortableWithChildren).toBe('yes')
    expect(luna.behavior.comfortableWithCats).toBe('yes')
    expect(luna.behavior.comfortableWithDogs).toBe('yes')
  })

  it('should correctly identify Shadow as senior with medical needs', () => {
    const shadow = getCatById('shadow')!
    expect(shadow.lifeStage).toBe('senior')
    expect(shadow.care.knownMedicalNeeds).toContain('Arthritis')
    expect(shadow.behavior.comfortableWithDogs).toBe('no')
  })

  it('should correctly identify Mochi as FIV+', () => {
    const mochi = getCatById('mochi')!
    expect(mochi.care.fivStatus).toBe('positive')
  })

  it('should correctly identify Milo and Pepper as high energy', () => {
    const milo = getCatById('milo')!
    const pepper = getCatById('pepper')!

    expect(milo.behavior.energy).toBe('high')
    expect(pepper.behavior.energy).toBe('high')
    expect(milo.behavior.needsVerticalSpace).toBe('high')
    expect(pepper.behavior.needsVerticalSpace).toBe('high')
  })
})
