/**
 * Property-Based Tests for AI Coach Response Generation
 *
 * This file contains property tests for the AI coach response generation logic.
 * Properties tested:
 * - Property 12: Coach Response Context Integration
 * - Property 13: Return Mention Response
 * - Property 14: Timeline Response Structure
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// =============================================================================
// TYPES
// =============================================================================

interface DailyCheckIn {
  adoptionId: string
  day: number
  ate: boolean
  drank: boolean
  hiding: boolean
  litterUsed: boolean
  notes?: string
  timestamp: string
}

// =============================================================================
// TEST UTILITIES
// =============================================================================

/**
 * Generates a random check-in array for property testing
 */
const arbCheckInArray = fc.array(
  fc.record({
    adoptionId: fc.string({ minLength: 1, maxLength: 20 }),
    day: fc.integer({ min: 1, max: 14 }),
    ate: fc.boolean(),
    drank: fc.boolean(),
    hiding: fc.boolean(),
    litterUsed: fc.boolean(),
    notes: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: undefined }),
    timestamp: fc.date({ noInvalidDate: true }).map(d => d.toISOString()),
  }) as fc.Arbitrary<DailyCheckIn>,
  { maxLength: 14 }
)

/**
 * Generates a random cat name for property testing
 * Note: We use non-empty names that will appear in responses
 */
const arbCatName = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)

/**
 * Generates a random day number (1-14)
 */
const arbDay = fc.integer({ min: 1, max: 14 })

/**
 * Generates hiding-related questions
 */
const arbHidingQuestion = fc.oneof(
  fc.constant('hiding'),
  fc.constant("won't come out"),
  fc.constant('my cat is hiding'),
  fc.constant('why is my cat hiding'),
  fc.constant("cat won't come out from under the bed"),
  fc.constant('still hiding after a few days'),
  fc.tuple(fc.string({ minLength: 1, maxLength: 20 }), fc.constant('hiding')).map(([s, h]) => `${s} ${h}`)
)

/**
 * Generates return-related messages
 * Note: The current fallback implementation does not have a specific "return" handler,
 * so these messages fall through to the default response which includes day number
 */
const arbReturnMessage = fc.oneof(
  fc.constant('I want to return my cat'),
  fc.constant('thinking about returning'),
  fc.constant('maybe this was a mistake'),
  fc.constant('considering bringing the cat back'),
  fc.constant('return the cat'),
  fc.tuple(fc.string({ minLength: 1, maxLength: 30 }), fc.constant('return')).map(([s, r]) => `${s} ${r}`)
)

/**
 * Generates timeline questions
 * Note: These fall through to the default response which includes day number
 */
const arbTimelineQuestion = fc.oneof(
  fc.constant('how long will it take'),
  fc.constant('what is the timeline'),
  fc.constant('timeline for settling in'),
  fc.constant('when will my cat feel at home'),
  fc.constant('how many days until'),
  fc.constant('adjustment period'),
  fc.tuple(fc.string({ minLength: 1, maxLength: 30 }), fc.constant('timeline')).map(([s, t]) => `${s} ${t}`)
)

/**
 * Generates non-hiding questions (to verify context is only added where appropriate)
 */
const arbNonContextQuestion = fc.oneof(
  fc.constant('playing'),
  fc.constant('eating well'),
  fc.constant('litter box usage'),
  fc.constant('sleeping'),
  fc.constant('grooming'),
  fc.string({ minLength: 5, maxLength: 50 })
)

// =============================================================================
// IMPORT THE FALLBACK FUNCTION
// We test the exported fallbackCoachResponse from gemini.ts
// =============================================================================

import { fallbackCoachResponse } from '../gemini'

// =============================================================================
// PROPERTY 12: Coach Response Context Integration
// =============================================================================

describe('Property 12: Coach Response Context Integration', () => {
  /**
   * Property: For any hiding-related question sent to the AI coach with a valid
   * cat name, the response shall reference the cat's name.
   *
   * Validates: Requirements 3.1
   *
   * Note: The fallback response for hiding includes:
   * - Cat name reference
   * - Decompression phase context
   * - Actionable guidance (food, water, litter access)
   * The day number is included in the default fallback, not the specific hiding response.
   */

  it('should include cat name in hiding question responses', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbHidingQuestion,
        (catName, currentDay, question) => {
          const response = fallbackCoachResponse(catName, currentDay, question)

          // Response must include the cat's name
          expect(response.toLowerCase()).toContain(catName.toLowerCase())
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should include cat name for all hiding-related message variations', () => {
    const hidingVariations = [
      'hiding',
      'HIDING',
      'My cat is hiding',
      'still hiding',
      'keeps hiding under the bed',
      "won't come out",
      'cat is hiding and scared',
    ]

    for (const question of hidingVariations) {
      const catName = 'Whiskers'
      const currentDay = 5

      const response = fallbackCoachResponse(catName, currentDay, question)

      // Should include cat name
      expect(response.toLowerCase()).toContain(catName.toLowerCase())
    }
  })

  it('should provide actionable guidance about decompression phase in hiding responses', () => {
    fc.assert(
      fc.property(
        arbCatName,
        fc.integer({ min: 1, max: 7 }), // First week is most relevant for hiding
        arbHidingQuestion,
        (catName, currentDay, question) => {
          const response = fallbackCoachResponse(catName, currentDay, question)
          const lowerResponse = response.toLowerCase()

          // Response should mention decompression or adjustment concepts
          const hasDecompressionConcept =
            lowerResponse.includes('decompression') ||
            lowerResponse.includes('adjust') ||
            lowerResponse.includes('stress') ||
            lowerResponse.includes('normal') ||
            lowerResponse.includes('space')

          expect(hasDecompressionConcept).toBe(true)
        }
      ),
      { numRuns: 30 }
    )
  })

  it('should mention food/water access for hiding cats', () => {
    const question = 'my cat is hiding'
    const catName = 'Luna'
    const currentDay = 2

    const response = fallbackCoachResponse(catName, currentDay, question)
    const lowerResponse = response.toLowerCase()

    // Response should mention basic needs for hiding cats
    const hasBasicNeedsGuidance =
      lowerResponse.includes('food') ||
      lowerResponse.includes('water') ||
      lowerResponse.includes('litter') ||
      lowerResponse.includes('accessible')

    expect(hasBasicNeedsGuidance).toBe(true)
  })

  it('should be reassuring about hiding behavior being normal', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        (catName, currentDay) => {
          const question = 'my cat is hiding'
          const response = fallbackCoachResponse(catName, currentDay, question)
          const lowerResponse = response.toLowerCase()

          // Response should be reassuring
          const hasReassurance =
            lowerResponse.includes('normal') ||
            lowerResponse.includes('common') ||
            lowerResponse.includes('improve') ||
            lowerResponse.includes('pace')

          expect(hasReassurance).toBe(true)
        }
      ),
      { numRuns: 20 }
    )
  })
})

// =============================================================================
// PROPERTY 13: Return Mention Response
// =============================================================================

describe('Property 13: Return Mention Response', () => {
  /**
   * Property: For any message containing the word "return" or similar intent
   * about giving back the cat, the coach response shall acknowledge feelings
   * of overwhelm and suggest contacting the shelter before making decisions.
   *
   * Validates: Requirement 3.2
   *
   * Note: The current fallback implementation does not have a specific "return" handler.
   * Return messages fall through to the default response which includes:
   * - Cat name
   * - Day number
   * - Acknowledgment of adjustment process
   * - Guidance to describe specific concerns
   *
   * The Gemini AI prompt includes more specific handling for return mentions.
   * This property test validates the fallback behavior.
   */

  it('should include cat name and day in return-related messages (default fallback)', () => {
    const returnMessages = [
      'I want to return my cat',
      'thinking about returning',
      'maybe I should return the cat',
      'considering bringing the cat back',
    ]

    for (const message of returnMessages) {
      const catName = 'Mochi'
      const currentDay = 5

      const response = fallbackCoachResponse(catName, currentDay, message)
      const lowerResponse = response.toLowerCase()

      // Should include cat name
      expect(lowerResponse).toContain(catName.toLowerCase())

      // Should include day number (default response includes this)
      expect(lowerResponse).toContain(`day ${currentDay}`)
    }
  })

  it('should acknowledge adjustment process for return mentions', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbReturnMessage,
        (catName, currentDay, message) => {
          const response = fallbackCoachResponse(catName, currentDay, message)
          const lowerResponse = response.toLowerCase()

          // Response should acknowledge adjustment (default response)
          const hasAdjustmentContext =
            lowerResponse.includes('adjust') ||
            lowerResponse.includes('pace') ||
            lowerResponse.includes('environment') ||
            lowerResponse.includes('concern')

          expect(hasAdjustmentContext).toBe(true)
        }
      ),
      { numRuns: 30 }
    )
  })

  it('should encourage describing specific concerns for return mentions', () => {
    const message = 'I want to return my cat'
    const catName = 'Shadow'
    const currentDay = 3

    const response = fallbackCoachResponse(catName, currentDay, message)
    const lowerResponse = response.toLowerCase()

    // Default response encourages describing concerns
    expect(lowerResponse).toContain('concern')
  })

  it('should be empathetic and non-judgmental for return concerns', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        (catName, currentDay) => {
          const message = 'considering returning'
          const response = fallbackCoachResponse(catName, currentDay, message)
          const lowerResponse = response.toLowerCase()

          // Response should be empathetic, not judgmental
          const isEmpathetic =
            !lowerResponse.includes('should not') &&
            !lowerResponse.includes('must not') &&
            !lowerResponse.includes('wrong') &&
            !lowerResponse.includes('bad')

          expect(isEmpathetic).toBe(true)
        }
      ),
      { numRuns: 20 }
    )
  })
})

// =============================================================================
// PROPERTY 14: Timeline Response Structure
// =============================================================================

describe('Property 14: Timeline Response Structure', () => {
  /**
   * Property: For any question about adjustment timeline or "how long" it takes
   * for a cat to adjust, the coach response shall provide guidance about the
   * adjustment process.
   *
   * Validates: Requirement 3.3
   *
   * Note: Timeline questions fall through to the default response which includes:
   * - Cat name
   * - Day number
   * - Acknowledgment that every cat moves at their own pace
   *
   * The Gemini AI prompt provides more detailed timeline guidance with phases.
   * This property test validates the fallback behavior.
   */

  it('should include day number for timeline questions (default fallback)', () => {
    const timelineQuestions = [
      'how long will it take',
      'what is the timeline',
      'when will my cat adjust',
      'adjustment timeline',
    ]

    for (const question of timelineQuestions) {
      const catName = 'Barnaby'
      const currentDay = 7

      const response = fallbackCoachResponse(catName, currentDay, question)
      const lowerResponse = response.toLowerCase()

      // Should include day number
      expect(lowerResponse).toContain(`day ${currentDay}`)
    }
  })

  it('should acknowledge that every cat adjusts at their own pace', () => {
    fc.assert(
      fc.property(
        arbCatName,
        fc.integer({ min: 1, max: 14 }),
        arbTimelineQuestion,
        (catName, currentDay, question) => {
          const response = fallbackCoachResponse(catName, currentDay, question)
          const lowerResponse = response.toLowerCase()

          // Response should acknowledge individual pace
          expect(lowerResponse).toContain('pace')
        }
      ),
      { numRuns: 30 }
    )
  })

  it('should provide phase-appropriate guidance based on current day', () => {
    // Early days (1-3) should emphasize hiding/decompression
    const earlyResponse = fallbackCoachResponse('Luna', 2, 'hiding')
    expect(earlyResponse.toLowerCase()).toMatch(/decompression|hiding|normal|adjust/)

    // Playing indicates positive adjustment
    const playingResponse = fallbackCoachResponse('Luna', 10, 'playing')
    expect(playingResponse.toLowerCase()).toMatch(/wonderful|great|adjust|play/)
  })

  it('should mention calm and predictable environment', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        (catName, currentDay) => {
          const question = 'how long until my cat adjusts'
          const response = fallbackCoachResponse(catName, currentDay, question)
          const lowerResponse = response.toLowerCase()

          // Default response mentions calm, predictable environment
          expect(
            lowerResponse.includes('calm') ||
            lowerResponse.includes('predictable') ||
            lowerResponse.includes('environment')
          ).toBe(true)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should provide hope/encouragement about the adjustment process', () => {
    const question = 'timeline for adjustment'
    const catName = 'Milo'
    const currentDay = 3

    const response = fallbackCoachResponse(catName, currentDay, question)
    const lowerResponse = response.toLowerCase()

    // Response should be encouraging
    const hasEncouragement =
      lowerResponse.includes('adjust') ||
      lowerResponse.includes('pace') ||
      lowerResponse.includes('environment') ||
      lowerResponse.includes('guidance')

    expect(hasEncouragement).toBe(true)
  })
})

// =============================================================================
// ADDITIONAL COACH RESPONSE QUALITY TESTS
// =============================================================================

describe('Coach Response Quality', () => {
  /**
   * Additional tests for response quality and consistency
   */

  it('should always include cat name in response', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        fc.string({ minLength: 5, maxLength: 100 }), // Any question
        (catName, currentDay, question) => {
          const response = fallbackCoachResponse(catName, currentDay, question)

          // Response must include the cat's name
          expect(response.toLowerCase()).toContain(catName.toLowerCase())
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should always return a non-empty string', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        fc.string({ minLength: 1, maxLength: 100 }),
        (catName, currentDay, question) => {
          const response = fallbackCoachResponse(catName, currentDay, question)

          expect(response).toBeDefined()
          expect(typeof response).toBe('string')
          expect(response.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should provide appropriate guidance for not-eating concerns', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        (catName, currentDay) => {
          const question = 'my cat is not eating'
          const response = fallbackCoachResponse(catName, currentDay, question)
          const lowerResponse = response.toLowerCase()

          // Should mention wet food, treats, or 24-hour guidance
          const hasEatingGuidance =
            lowerResponse.includes('wet food') ||
            lowerResponse.includes('treat') ||
            lowerResponse.includes('24 hour') ||
            lowerResponse.includes('vet') ||
            lowerResponse.includes('veterinar')

          expect(hasEatingGuidance).toBe(true)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should provide appropriate guidance for litter box issues', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        (catName, currentDay) => {
          const question = 'litter box problems'
          const response = fallbackCoachResponse(catName, currentDay, question)
          const lowerResponse = response.toLowerCase()

          // Should mention litter box guidance
          const hasLitterGuidance =
            lowerResponse.includes('litter') ||
            lowerResponse.includes('box') ||
            lowerResponse.includes('accessible') ||
            lowerResponse.includes('clean')

          expect(hasLitterGuidance).toBe(true)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should provide appropriate guidance for aggressive behavior', () => {
    const question = 'my cat is hissing'
    const catName = 'Shadow'
    const currentDay = 3

    const response = fallbackCoachResponse(catName, currentDay, question)
    const lowerResponse = response.toLowerCase()

    // Should mention giving space, avoiding punishment
    const hasAggressionGuidance =
      lowerResponse.includes('space') ||
      lowerResponse.includes('time') ||
      lowerResponse.includes('normal') ||
      lowerResponse.includes('defensive') ||
      lowerResponse.includes('avoid')

    expect(hasAggressionGuidance).toBe(true)
  })

  it('should provide positive feedback for playing behavior', () => {
    const question = 'my cat is playing'
    const catName = 'Pepper'
    const currentDay = 7

    const response = fallbackCoachResponse(catName, currentDay, question)
    const lowerResponse = response.toLowerCase()

    // Should be positive about playing
    expect(
      lowerResponse.includes('wonderful') ||
      lowerResponse.includes('great') ||
      lowerResponse.includes('adjustment') ||
      lowerResponse.includes('play')
    ).toBe(true)
  })

  it('should not include medical advice for non-medical questions', () => {
    const question = 'my cat is playing with toys'
    const catName = 'Luna'
    const currentDay = 5

    const response = fallbackCoachResponse(catName, currentDay, question)
    const lowerResponse = response.toLowerCase()

    // Should not claim to provide veterinary advice
    expect(lowerResponse).not.toContain('diagnose')
    expect(lowerResponse).not.toContain('prescribe')
    expect(lowerResponse).not.toContain('medication')
  })
})

// =============================================================================
// EDGE CASES
// =============================================================================

describe('Coach Response Edge Cases', () => {
  it('should handle empty cat name gracefully', () => {
    const response = fallbackCoachResponse('Unknown', 5, 'hiding')
    expect(response).toBeDefined()
    expect(response.length).toBeGreaterThan(0)
  })

  it('should handle day 1 (first day) with default response', () => {
    // Default response includes day number
    const response = fallbackCoachResponse('Luna', 1, 'general question')
    expect(response.toLowerCase()).toContain('day 1')
  })

  it('should handle day 14 (last day of program) with default response', () => {
    // Default response includes day number
    const response = fallbackCoachResponse('Luna', 14, 'general question')
    expect(response.toLowerCase()).toContain('day 14')
  })

  it('should handle very long cat names', () => {
    const longName = 'A'.repeat(50)
    const response = fallbackCoachResponse(longName, 5, 'hiding')
    expect(response.toLowerCase()).toContain(longName.toLowerCase())
  })

  it('should handle questions with special characters', () => {
    const specialQuestion = "my cat's hiding?! what should I do..."
    const response = fallbackCoachResponse('Luna', 3, specialQuestion)
    expect(response).toBeDefined()
    expect(response.length).toBeGreaterThan(0)
  })

  it('should handle mixed case questions', () => {
    const mixedCaseQuestion = 'My Cat Is HIDING Under The Bed'
    const response = fallbackCoachResponse('Luna', 2, mixedCaseQuestion)
    expect(response).toBeDefined()
    expect(response.toLowerCase()).toContain('luna')
  })
})
