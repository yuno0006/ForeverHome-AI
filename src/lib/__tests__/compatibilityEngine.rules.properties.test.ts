/**
 * Property-Based Tests for Compatibility Engine - Rule Application
 *
 * This file contains property tests for specific compatibility rules.
 * Properties tested:
 * - Property 2: Stress-Noise Rule Application
 * - Property 3: Stress-Children Rule Application
 * - Property 4: Indoor-Safety Rule Application
 * - Property 5: FIV-Experience Rule Application
 *
 * Validates: Requirements 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { assessCompatibility } from '../compatibilityEngine'
import { getCatById } from '@/data/demoCats'
import {
  createTestCat,
  createTestAdopterAnswers,
  createTestCatBehavior,
  createTestCatCare,
  arbCat,
  arbAdopterAnswers,
  arbHighStressCat,
  arbNotComfortableWithChildrenCat,
  arbIndoorOnlyCat,
  arbFivPositiveCat,
  arbHighNoiseAdopterAnswers,
  arbAdopterWithYoungChildren,
  arbInsecureIndoorAdopterAnswers,
  arbNoSpecialNeedsExperienceAdopterAnswers,
  isRuleTriggered,
  getConcernByRuleId,
} from '@/__tests__/setup'
import type { Cat, AdopterAnswers, CatBehavior, CatCare } from '@/types'

// =============================================================================
// PROPERTY 2: Stress-Noise Rule Application
// =============================================================================

describe('Property 2: Stress-Noise Rule Application', () => {
  /**
   * Property: For any cat with behavior.stressSensitivity === "high" and any
   * adopter with householdNoise === "high", the compatibility engine shall
   * generate a concern with ruleId === "stress-noise" and severity === "significant".
   *
   * Validates: Requirement 1.2
   */

  it('should generate "stress-noise" concern with severity "significant" when cat has high stress sensitivity and adopter has high household noise', () => {
    // Barnaby has high stress sensitivity
    const barnaby = getCatById('barnaby')!
    expect(barnaby.behavior.stressSensitivity).toBe('high')

    const highNoiseAdopter = createTestAdopterAnswers({
      householdNoise: 'high',
    })

    const result = assessCompatibility(barnaby, highNoiseAdopter)

    expect(isRuleTriggered(result, 'stress-noise')).toBe(true)
    const concern = getConcernByRuleId(result, 'stress-noise')
    expect(concern).toBeDefined()
    expect(concern!.severity).toBe('significant')
  })

  it('should NOT generate "stress-noise" concern when household noise is low', () => {
    const barnaby = getCatById('barnaby')!

    const lowNoiseAdopter = createTestAdopterAnswers({
      householdNoise: 'low',
    })

    const result = assessCompatibility(barnaby, lowNoiseAdopter)

    expect(isRuleTriggered(result, 'stress-noise')).toBe(false)
  })

  it('should NOT generate "stress-noise" concern when household noise is moderate', () => {
    const barnaby = getCatById('barnaby')!

    const moderateNoiseAdopter = createTestAdopterAnswers({
      householdNoise: 'moderate',
    })

    const result = assessCompatibility(barnaby, moderateNoiseAdopter)

    expect(isRuleTriggered(result, 'stress-noise')).toBe(false)
  })

  it('should generate "stress-noise" concern for any cat with high stress sensitivity paired with any high-noise adopter (property-based)', () => {
    fc.assert(
      fc.property(
        // Generate a cat with high stress sensitivity
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 20 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          age: fc.integer({ min: 0, max: 25 }),
          lifeStage: fc.constantFrom('kitten', 'young', 'adult', 'senior'),
          sex: fc.constantFrom('male', 'female'),
          neutered: fc.boolean(),
          photo: fc.constant('https://example.com/cat.jpg'),
          status: fc.constantFrom('available', 'adopted', 'pending'),
          behavior: fc.record({
            energy: fc.constantFrom('low', 'medium', 'high'),
            sociability: fc.constantFrom('reserved', 'moderate', 'outgoing'),
            stressSensitivity: fc.constant('high' as const), // Fixed: high stress
            handlingTolerance: fc.constantFrom('low', 'moderate', 'high'),
            playNeeds: fc.constantFrom('low', 'moderate', 'high'),
            comfortableWithChildren: fc.constantFrom('yes', 'no', 'unknown'),
            comfortableWithCats: fc.constantFrom('yes', 'no', 'unknown'),
            comfortableWithDogs: fc.constantFrom('yes', 'no', 'unknown'),
            noiseTolerance: fc.constantFrom('low', 'moderate', 'high'),
            needsVerticalSpace: fc.constantFrom('low', 'moderate', 'high'),
            indoorOnlyRequired: fc.boolean(),
          }),
          care: fc.record({
            knownMedicalNeeds: fc.string({ minLength: 0, maxLength: 100 }),
            medicationNeeds: fc.string({ minLength: 0, maxLength: 100 }),
            fivStatus: fc.constantFrom('negative', 'positive', 'unknown'),
            specialNotes: fc.string({ minLength: 0, maxLength: 200 }),
          }),
        }),
        // Generate an adopter with high household noise
        fc.record({
          homeType: fc.constantFrom('house', 'apartment', 'condo', 'other'),
          adultsInHome: fc.integer({ min: 1, max: 10 }),
          children: fc.array(fc.record({ ageRange: fc.constantFrom('0-4', '5-9', '10-14', '15+') }), { maxLength: 5 }),
          existingPets: fc.record({ cats: fc.integer({ min: 0, max: 5 }), dogs: fc.integer({ min: 0, max: 5 }) }),
          householdNoise: fc.constant('high' as const), // Fixed: high noise
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
        (cat, adopter) => {
          const result = assessCompatibility(cat as Cat, adopter as AdopterAnswers)

          // Property: stress-noise concern MUST be generated
          expect(isRuleTriggered(result, 'stress-noise')).toBe(true)
          const concern = getConcernByRuleId(result, 'stress-noise')
          expect(concern!.severity).toBe('significant')
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should include mitigation suggestions for stress-noise concern', () => {
    const barnaby = getCatById('barnaby')!
    const highNoiseAdopter = createTestAdopterAnswers({
      householdNoise: 'high',
    })

    const result = assessCompatibility(barnaby, highNoiseAdopter)

    expect(isRuleTriggered(result, 'stress-noise')).toBe(true)
    expect(result.mitigations.length).toBeGreaterThan(0)
    // Mitigation should mention quiet room or white noise
    const mitigationText = result.mitigations.map(m => m.description.toLowerCase()).join(' ')
    expect(
      mitigationText.includes('quiet') ||
      mitigationText.includes('noise')
    ).toBe(true)
  })
})

// =============================================================================
// PROPERTY 3: Stress-Children Rule Application
// =============================================================================

describe('Property 3: Stress-Children Rule Application', () => {
  /**
   * Property: For any cat with behavior.comfortableWithChildren === "no" and
   * any adopter with children in age ranges "0-4" or "5-9", the compatibility
   * engine shall generate a concern with ruleId === "stress-children" and
   * severity === "significant".
   *
   * Validates: Requirement 1.3
   */

  it('should generate "stress-children" concern with severity "significant" when cat is not comfortable with children and adopter has children aged 0-4', () => {
    // Barnaby is not comfortable with children
    const barnaby = getCatById('barnaby')!
    expect(barnaby.behavior.comfortableWithChildren).toBe('no')

    const adopterWithYoungChild = createTestAdopterAnswers({
      children: [{ ageRange: '0-4' }],
      indoorSafety: 'secure', // Avoid indoor-safety trigger
      householdNoise: 'low', // Avoid stress-noise trigger
    })

    const result = assessCompatibility(barnaby, adopterWithYoungChild)

    expect(isRuleTriggered(result, 'stress-children')).toBe(true)
    const concern = getConcernByRuleId(result, 'stress-children')
    expect(concern).toBeDefined()
    expect(concern!.severity).toBe('significant')
  })

  it('should generate "stress-children" concern when adopter has children aged 5-9', () => {
    const barnaby = getCatById('barnaby')!

    const adopterWithChild5to9 = createTestAdopterAnswers({
      children: [{ ageRange: '5-9' }],
      indoorSafety: 'secure',
      householdNoise: 'low',
    })

    const result = assessCompatibility(barnaby, adopterWithChild5to9)

    expect(isRuleTriggered(result, 'stress-children')).toBe(true)
    const concern = getConcernByRuleId(result, 'stress-children')
    expect(concern!.severity).toBe('significant')
  })

  it('should NOT generate "stress-children" concern when children are 10-14 or 15+', () => {
    const barnaby = getCatById('barnaby')!

    const adopterWithOlderChildren = createTestAdopterAnswers({
      children: [
        { ageRange: '10-14' },
        { ageRange: '15+' },
      ],
      indoorSafety: 'secure',
      householdNoise: 'low',
    })

    const result = assessCompatibility(barnaby, adopterWithOlderChildren)

    expect(isRuleTriggered(result, 'stress-children')).toBe(false)
  })

  it('should NOT generate "stress-children" concern when cat is comfortable with children', () => {
    // Luna is comfortable with children
    const luna = getCatById('luna')!
    expect(luna.behavior.comfortableWithChildren).toBe('yes')

    const adopterWithYoungChild = createTestAdopterAnswers({
      children: [{ ageRange: '0-4' }],
    })

    const result = assessCompatibility(luna, adopterWithYoungChild)

    expect(isRuleTriggered(result, 'stress-children')).toBe(false)
  })

  it('should generate "stress-children" concern for any child-averse cat with any adopter having young children (property-based)', () => {
    fc.assert(
      fc.property(
        // Generate a cat NOT comfortable with children
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 20 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          age: fc.integer({ min: 0, max: 25 }),
          lifeStage: fc.constantFrom('kitten', 'young', 'adult', 'senior'),
          sex: fc.constantFrom('male', 'female'),
          neutered: fc.boolean(),
          photo: fc.constant('https://example.com/cat.jpg'),
          status: fc.constantFrom('available', 'adopted', 'pending'),
          behavior: fc.record({
            energy: fc.constantFrom('low', 'medium', 'high'),
            sociability: fc.constantFrom('reserved', 'moderate', 'outgoing'),
            stressSensitivity: fc.constantFrom('low', 'moderate', 'high'),
            handlingTolerance: fc.constantFrom('low', 'moderate', 'high'),
            playNeeds: fc.constantFrom('low', 'moderate', 'high'),
            comfortableWithChildren: fc.constant('no' as const), // Fixed: not comfortable
            comfortableWithCats: fc.constantFrom('yes', 'no', 'unknown'),
            comfortableWithDogs: fc.constantFrom('yes', 'no', 'unknown'),
            noiseTolerance: fc.constantFrom('low', 'moderate', 'high'),
            needsVerticalSpace: fc.constantFrom('low', 'moderate', 'high'),
            indoorOnlyRequired: fc.boolean(),
          }),
          care: fc.record({
            knownMedicalNeeds: fc.string({ minLength: 0, maxLength: 100 }),
            medicationNeeds: fc.string({ minLength: 0, maxLength: 100 }),
            fivStatus: fc.constantFrom('negative', 'positive', 'unknown'),
            specialNotes: fc.string({ minLength: 0, maxLength: 200 }),
          }),
        }),
        // Generate an adopter with young children (0-4 or 5-9)
        fc.constantFrom('0-4', '5-9').chain((ageRange) =>
          fc.record({
            homeType: fc.constantFrom('house', 'apartment', 'condo', 'other'),
            adultsInHome: fc.integer({ min: 1, max: 10 }),
            children: fc.constant([{ ageRange: ageRange as '0-4' | '5-9' }]), // Fixed: has young child
            existingPets: fc.record({ cats: fc.integer({ min: 0, max: 5 }), dogs: fc.integer({ min: 0, max: 5 }) }),
            householdNoise: fc.constantFrom('low', 'moderate', 'high'),
            hoursAway: fc.integer({ min: 0, max: 24 }),
            travelFrequency: fc.constantFrom('rare', 'occasional', 'frequent'),
            previousCatExperience: fc.boolean(),
            specialNeedsExperience: fc.boolean(),
            canProvideVerticalSpace: fc.boolean(),
            indoorSafety: fc.constant('secure' as const), // Avoid other triggers
            veterinaryAccess: fc.constantFrom('yes', 'no', 'unsure'),
            comfortableWithRoutineCare: fc.boolean(),
            scenarioAnswers: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 3 }),
          })
        ),
        (cat, adopter) => {
          const result = assessCompatibility(cat as Cat, adopter as unknown as AdopterAnswers)

          // Property: stress-children concern MUST be generated
          expect(isRuleTriggered(result, 'stress-children')).toBe(true)
          const concern = getConcernByRuleId(result, 'stress-children')
          expect(concern!.severity).toBe('significant')
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should include mitigation suggestions for stress-children concern', () => {
    const barnaby = getCatById('barnaby')!
    const adopterWithYoungChild = createTestAdopterAnswers({
      children: [{ ageRange: '0-4' }],
      indoorSafety: 'secure',
      householdNoise: 'low',
    })

    const result = assessCompatibility(barnaby, adopterWithYoungChild)

    expect(isRuleTriggered(result, 'stress-children')).toBe(true)
    expect(result.mitigations.length).toBeGreaterThan(0)
    // Mitigation should mention supervised interactions or shelter-guided meeting
    const mitigationText = result.mitigations.map(m => m.description.toLowerCase()).join(' ')
    expect(
      mitigationText.includes('supervise') ||
      mitigationText.includes('meeting') ||
      mitigationText.includes('interaction')
    ).toBe(true)
  })
})

// =============================================================================
// PROPERTY 4: Indoor-Safety Rule Application
// =============================================================================

describe('Property 4: Indoor-Safety Rule Application', () => {
  /**
   * Property: For any cat with behavior.indoorOnlyRequired === true and any
   * adopter with indoorSafety !== "secure", the compatibility engine shall
   * generate a concern with ruleId === "indoor-safety" and severity === "significant".
   *
   * Validates: Requirement 1.4
   */

  it('should generate "indoor-safety" concern with severity "significant" when cat requires indoor-only and adopter has "partial" indoor safety', () => {
    // Barnaby requires indoor-only
    const barnaby = getCatById('barnaby')!
    expect(barnaby.behavior.indoorOnlyRequired).toBe(true)

    const partialSafetyAdopter = createTestAdopterAnswers({
      indoorSafety: 'partial',
      householdNoise: 'low', // Avoid stress-noise trigger
      children: [], // Avoid stress-children trigger
    })

    const result = assessCompatibility(barnaby, partialSafetyAdopter)

    expect(isRuleTriggered(result, 'indoor-safety')).toBe(true)
    const concern = getConcernByRuleId(result, 'indoor-safety')
    expect(concern).toBeDefined()
    expect(concern!.severity).toBe('significant')
  })

  it('should generate "indoor-safety" concern when adopter has "unsure" indoor safety', () => {
    const barnaby = getCatById('barnaby')!

    const unsureSafetyAdopter = createTestAdopterAnswers({
      indoorSafety: 'unsure',
      householdNoise: 'low',
      children: [],
    })

    const result = assessCompatibility(barnaby, unsureSafetyAdopter)

    expect(isRuleTriggered(result, 'indoor-safety')).toBe(true)
    const concern = getConcernByRuleId(result, 'indoor-safety')
    expect(concern!.severity).toBe('significant')
  })

  it('should NOT generate "indoor-safety" concern when adopter has "secure" indoor safety', () => {
    const barnaby = getCatById('barnaby')!

    const secureSafetyAdopter = createTestAdopterAnswers({
      indoorSafety: 'secure',
      householdNoise: 'low',
      children: [],
    })

    const result = assessCompatibility(barnaby, secureSafetyAdopter)

    expect(isRuleTriggered(result, 'indoor-safety')).toBe(false)
  })

  it('should NOT generate "indoor-safety" concern when cat does not require indoor-only', () => {
    // Create a synthetic cat that does NOT require indoor-only
    const outdoorCat = createTestCat({
      id: 'outdoor-cat',
      name: 'Outdoor Cat',
      behavior: createTestCatBehavior({
        indoorOnlyRequired: false,
      }),
    })
    expect(outdoorCat.behavior.indoorOnlyRequired).toBe(false)

    const unsureSafetyAdopter = createTestAdopterAnswers({
      indoorSafety: 'unsure',
    })

    const result = assessCompatibility(outdoorCat, unsureSafetyAdopter)

    expect(isRuleTriggered(result, 'indoor-safety')).toBe(false)
  })

  it('should generate "indoor-safety" concern for any indoor-only cat with any non-secure adopter (property-based)', () => {
    fc.assert(
      fc.property(
        // Generate a cat that requires indoor-only
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 20 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          age: fc.integer({ min: 0, max: 25 }),
          lifeStage: fc.constantFrom('kitten', 'young', 'adult', 'senior'),
          sex: fc.constantFrom('male', 'female'),
          neutered: fc.boolean(),
          photo: fc.constant('https://example.com/cat.jpg'),
          status: fc.constantFrom('available', 'adopted', 'pending'),
          behavior: fc.record({
            energy: fc.constantFrom('low', 'medium', 'high'),
            sociability: fc.constantFrom('reserved', 'moderate', 'outgoing'),
            stressSensitivity: fc.constantFrom('low', 'moderate', 'high'),
            handlingTolerance: fc.constantFrom('low', 'moderate', 'high'),
            playNeeds: fc.constantFrom('low', 'moderate', 'high'),
            comfortableWithChildren: fc.constantFrom('yes', 'no', 'unknown'),
            comfortableWithCats: fc.constantFrom('yes', 'no', 'unknown'),
            comfortableWithDogs: fc.constantFrom('yes', 'no', 'unknown'),
            noiseTolerance: fc.constantFrom('low', 'moderate', 'high'),
            needsVerticalSpace: fc.constantFrom('low', 'moderate', 'high'),
            indoorOnlyRequired: fc.constant(true), // Fixed: indoor-only required
          }),
          care: fc.record({
            knownMedicalNeeds: fc.string({ minLength: 0, maxLength: 100 }),
            medicationNeeds: fc.string({ minLength: 0, maxLength: 100 }),
            fivStatus: fc.constantFrom('negative', 'positive', 'unknown'),
            specialNotes: fc.string({ minLength: 0, maxLength: 200 }),
          }),
        }),
        // Generate an adopter with non-secure indoor safety
        fc.constantFrom('partial', 'unsure').chain((safety) =>
          fc.record({
            homeType: fc.constantFrom('house', 'apartment', 'condo', 'other'),
            adultsInHome: fc.integer({ min: 1, max: 10 }),
            children: fc.constant([]), // Avoid other triggers
            existingPets: fc.record({ cats: fc.integer({ min: 0, max: 5 }), dogs: fc.integer({ min: 0, max: 5 }) }),
            householdNoise: fc.constant('low' as const), // Avoid stress-noise
            hoursAway: fc.integer({ min: 0, max: 24 }),
            travelFrequency: fc.constantFrom('rare', 'occasional', 'frequent'),
            previousCatExperience: fc.boolean(),
            specialNeedsExperience: fc.boolean(),
            canProvideVerticalSpace: fc.boolean(),
            indoorSafety: fc.constant(safety as 'partial' | 'unsure'), // Fixed: non-secure
            veterinaryAccess: fc.constantFrom('yes', 'no', 'unsure'),
            comfortableWithRoutineCare: fc.boolean(),
            scenarioAnswers: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 3 }),
          })
        ),
        (cat, adopter) => {
          const result = assessCompatibility(cat as Cat, adopter as unknown as AdopterAnswers)

          // Property: indoor-safety concern MUST be generated
          expect(isRuleTriggered(result, 'indoor-safety')).toBe(true)
          const concern = getConcernByRuleId(result, 'indoor-safety')
          expect(concern!.severity).toBe('significant')
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should include mitigation suggestions for indoor-safety concern', () => {
    const barnaby = getCatById('barnaby')!
    const partialSafetyAdopter = createTestAdopterAnswers({
      indoorSafety: 'partial',
      householdNoise: 'low',
      children: [],
    })

    const result = assessCompatibility(barnaby, partialSafetyAdopter)

    expect(isRuleTriggered(result, 'indoor-safety')).toBe(true)
    expect(result.mitigations.length).toBeGreaterThan(0)
    // Mitigation should mention screens or barriers
    const mitigationText = result.mitigations.map(m => m.description.toLowerCase()).join(' ')
    expect(
      mitigationText.includes('screen') ||
      mitigationText.includes('barrier') ||
      mitigationText.includes('safety')
    ).toBe(true)
  })
})

// =============================================================================
// PROPERTY 5: FIV-Experience Rule Application
// =============================================================================

describe('Property 5: FIV-Experience Rule Application', () => {
  /**
   * Property: For any cat with care.fivStatus === "positive" and any adopter
   * with previousCatExperience === false AND specialNeedsExperience === false,
   * the compatibility engine shall generate a concern with ruleId === "fiv-experience"
   * and severity === "moderate".
   *
   * Validates: Requirement 1.5
   */

  it('should generate "fiv-experience" concern with severity "moderate" when cat is FIV+ and adopter has no experience', () => {
    // Mochi is FIV+
    const mochi = getCatById('mochi')!
    expect(mochi.care.fivStatus).toBe('positive')

    const noExperienceAdopter = createTestAdopterAnswers({
      previousCatExperience: false,
      specialNeedsExperience: false,
    })

    const result = assessCompatibility(mochi, noExperienceAdopter)

    expect(isRuleTriggered(result, 'fiv-experience')).toBe(true)
    const concern = getConcernByRuleId(result, 'fiv-experience')
    expect(concern).toBeDefined()
    expect(concern!.severity).toBe('moderate')
  })

  it('should NOT generate "fiv-experience" concern when adopter has previous cat experience', () => {
    const mochi = getCatById('mochi')!

    const experiencedAdopter = createTestAdopterAnswers({
      previousCatExperience: true,
      specialNeedsExperience: false,
    })

    const result = assessCompatibility(mochi, experiencedAdopter)

    expect(isRuleTriggered(result, 'fiv-experience')).toBe(false)
  })

  it('should NOT generate "fiv-experience" concern when adopter has special needs experience', () => {
    const mochi = getCatById('mochi')!

    const specialNeedsExperiencedAdopter = createTestAdopterAnswers({
      previousCatExperience: false,
      specialNeedsExperience: true,
    })

    const result = assessCompatibility(mochi, specialNeedsExperiencedAdopter)

    expect(isRuleTriggered(result, 'fiv-experience')).toBe(false)
  })

  it('should NOT generate "fiv-experience" concern when cat is not FIV+', () => {
    // Luna is not FIV+
    const luna = getCatById('luna')!
    expect(luna.care.fivStatus).toBe('negative')

    const noExperienceAdopter = createTestAdopterAnswers({
      previousCatExperience: false,
      specialNeedsExperience: false,
    })

    const result = assessCompatibility(luna, noExperienceAdopter)

    expect(isRuleTriggered(result, 'fiv-experience')).toBe(false)
  })

  it('should generate "fiv-experience" concern for any FIV+ cat with any inexperienced adopter (property-based)', () => {
    fc.assert(
      fc.property(
        // Generate a cat that is FIV+
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 20 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          age: fc.integer({ min: 0, max: 25 }),
          lifeStage: fc.constantFrom('kitten', 'young', 'adult', 'senior'),
          sex: fc.constantFrom('male', 'female'),
          neutered: fc.boolean(),
          photo: fc.constant('https://example.com/cat.jpg'),
          status: fc.constantFrom('available', 'adopted', 'pending'),
          behavior: fc.record({
            energy: fc.constantFrom('low', 'medium', 'high'),
            sociability: fc.constantFrom('reserved', 'moderate', 'outgoing'),
            stressSensitivity: fc.constantFrom('low', 'moderate', 'high'),
            handlingTolerance: fc.constantFrom('low', 'moderate', 'high'),
            playNeeds: fc.constantFrom('low', 'moderate', 'high'),
            comfortableWithChildren: fc.constantFrom('yes', 'no', 'unknown'),
            comfortableWithCats: fc.constantFrom('yes', 'no', 'unknown'),
            comfortableWithDogs: fc.constantFrom('yes', 'no', 'unknown'),
            noiseTolerance: fc.constantFrom('low', 'moderate', 'high'),
            needsVerticalSpace: fc.constantFrom('low', 'moderate', 'high'),
            indoorOnlyRequired: fc.boolean(),
          }),
          care: fc.record({
            knownMedicalNeeds: fc.string({ minLength: 0, maxLength: 100 }),
            medicationNeeds: fc.string({ minLength: 0, maxLength: 100 }),
            fivStatus: fc.constant('positive' as const), // Fixed: FIV+
            specialNotes: fc.string({ minLength: 0, maxLength: 200 }),
          }),
        }),
        // Generate an adopter without cat or special needs experience
        fc.record({
          homeType: fc.constantFrom('house', 'apartment', 'condo', 'other'),
          adultsInHome: fc.integer({ min: 1, max: 10 }),
          children: fc.array(fc.record({ ageRange: fc.constantFrom('0-4', '5-9', '10-14', '15+') }), { maxLength: 5 }),
          existingPets: fc.record({ cats: fc.integer({ min: 0, max: 0 }), dogs: fc.integer({ min: 0, max: 5 }) }), // No cats
          householdNoise: fc.constantFrom('low', 'moderate', 'high'),
          hoursAway: fc.integer({ min: 0, max: 24 }),
          travelFrequency: fc.constantFrom('rare', 'occasional', 'frequent'),
          previousCatExperience: fc.constant(false), // Fixed: no experience
          specialNeedsExperience: fc.constant(false), // Fixed: no experience
          canProvideVerticalSpace: fc.boolean(),
          indoorSafety: fc.constantFrom('secure', 'partial', 'unsure'),
          veterinaryAccess: fc.constantFrom('yes', 'no', 'unsure'),
          comfortableWithRoutineCare: fc.boolean(),
          scenarioAnswers: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 3 }),
        }),
        (cat, adopter) => {
          const result = assessCompatibility(cat as Cat, adopter as AdopterAnswers)

          // Property: fiv-experience concern MUST be generated
          expect(isRuleTriggered(result, 'fiv-experience')).toBe(true)
          const concern = getConcernByRuleId(result, 'fiv-experience')
          expect(concern!.severity).toBe('moderate')
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should include mitigation suggestions for fiv-experience concern', () => {
    const mochi = getCatById('mochi')!
    const noExperienceAdopter = createTestAdopterAnswers({
      previousCatExperience: false,
      specialNeedsExperience: false,
    })

    const result = assessCompatibility(mochi, noExperienceAdopter)

    expect(isRuleTriggered(result, 'fiv-experience')).toBe(true)
    expect(result.mitigations.length).toBeGreaterThan(0)
    // Mitigation should mention FIV education or shelter support
    const mitigationText = result.mitigations.map(m => m.description.toLowerCase()).join(' ')
    expect(
      mitigationText.includes('fiv') ||
      mitigationText.includes('education') ||
      mitigationText.includes('experience')
    ).toBe(true)
  })
})

// =============================================================================
// CROSS-RULE INTERACTION TESTS
// =============================================================================

describe('Cross-Rule Interactions', () => {
  it('should correctly handle multiple rules triggered simultaneously (Barnaby example)', () => {
    const barnaby = getCatById('barnaby')!
    const problematicAdopter = createTestAdopterAnswers({
      householdNoise: 'high', // triggers stress-noise
      children: [{ ageRange: '0-4' }], // triggers stress-children
      indoorSafety: 'partial', // triggers indoor-safety
    })

    const result = assessCompatibility(barnaby, problematicAdopter)

    // All three significant concerns should be triggered
    expect(isRuleTriggered(result, 'stress-noise')).toBe(true)
    expect(isRuleTriggered(result, 'stress-children')).toBe(true)
    expect(isRuleTriggered(result, 'indoor-safety')).toBe(true)

    // All should be significant severity
    expect(getConcernByRuleId(result, 'stress-noise')!.severity).toBe('significant')
    expect(getConcernByRuleId(result, 'stress-children')!.severity).toBe('significant')
    expect(getConcernByRuleId(result, 'indoor-safety')!.severity).toBe('significant')

    // 3 significant concerns = high level
    expect(result.level).toBe('high')
  })

  it('should correctly handle Mochi with FIV+ and no experience (moderate concern)', () => {
    const mochi = getCatById('mochi')!
    const noExperienceAdopter = createTestAdopterAnswers({
      previousCatExperience: false,
      specialNeedsExperience: false,
    })

    const result = assessCompatibility(mochi, noExperienceAdopter)

    // fiv-experience should be triggered with moderate severity
    expect(isRuleTriggered(result, 'fiv-experience')).toBe(true)
    expect(getConcernByRuleId(result, 'fiv-experience')!.severity).toBe('moderate')

    // Only moderate concerns should still result in moderate level
    // (unless there are other significant concerns)
    const significantCount = result.concerns.filter(c => c.severity === 'significant').length
    if (significantCount === 0) {
      expect(result.level).toBe('moderate')
    }
  })

  it('should ensure rule descriptions are human-readable', () => {
    const barnaby = getCatById('barnaby')!
    const adopter = createTestAdopterAnswers({
      householdNoise: 'high',
    })

    const result = assessCompatibility(barnaby, adopter)

    const concern = getConcernByRuleId(result, 'stress-noise')
    expect(concern).toBeDefined()
    expect(concern!.description.length).toBeGreaterThan(10)
    expect(concern!.triggeredBy.length).toBeGreaterThan(5)
    // Should mention the cat's name
    expect(concern!.triggeredBy.toLowerCase()).toContain('barnaby')
  })
})
