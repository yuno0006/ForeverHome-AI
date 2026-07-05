/**
 * Property-Based Tests for AI Coach Fallback Mechanism
 *
 * This file contains property tests for the fallback mechanism in the AI coach.
 * Properties tested:
 * - Property 15: Fallback Response Mechanism
 * - Property 16: Fallback Disclaimer
 *
 * Validates: Requirements 3.5, 3.6, 11.1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

interface CoachResponse {
  response: string
  source: 'gemini' | 'fallback' | 'deterministic'
  isEmergency?: boolean
  disclaimer?: string
}

// =============================================================================
// TEST UTILITIES - GENERATORS
// =============================================================================

/**
 * Generates a random cat name for property testing
 */
const arbCatName = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)

/**
 * Generates a random cat profile string
 */
const arbCatProfile = fc.string({ minLength: 10, maxLength: 500 })

/**
 * Generates a random day number (1-14)
 */
const arbDay = fc.integer({ min: 1, max: 14 })

/**
 * Generates a random user message
 */
const arbMessage = fc.string({ minLength: 5, maxLength: 200 })

/**
 * Generates a random check-in context string
 */
const arbCheckInContext = fc.string({ minLength: 0, maxLength: 500 })

/**
 * Generates a random check-in array
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

// =============================================================================
// IMPORT THE FALLBACK FUNCTION
// =============================================================================

import { fallbackCoachResponse } from '../gemini'
import { getCoachFallbackResponse } from '../fallbackExplanations'

// =============================================================================
// PROPERTY 15: Fallback Response Mechanism
// =============================================================================

describe('Property 15: Fallback Response Mechanism', () => {
  /**
   * Property: For any coach request where the Gemini API returns null or throws an error,
   * the system shall return a response from the fallback explanations module.
   *
   * Validates: Requirements 3.5, 11.1
   *
   * Note: The fallbackCoachResponse function in gemini.ts is called when the Gemini API
   * returns null. This function provides deterministic responses for various scenarios.
   */

  it('should return a non-empty response when fallback is triggered', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbMessage,
        (catName, currentDay, message) => {
          // fallbackCoachResponse is called when Gemini returns null
          const response = fallbackCoachResponse(catName, currentDay, message)

          // Response must be defined and non-empty
          expect(response).toBeDefined()
          expect(typeof response).toBe('string')
          expect(response.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should always return a response (never throw) for any input', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbMessage,
        (catName, currentDay, message) => {
          // Should never throw an exception
          expect(() => fallbackCoachResponse(catName, currentDay, message)).not.toThrow()
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should include cat name in all fallback responses', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbMessage,
        (catName, currentDay, message) => {
          const response = fallbackCoachResponse(catName, currentDay, message)

          // All fallback responses should include the cat's name
          expect(response.toLowerCase()).toContain(catName.toLowerCase())
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should provide contextual responses for common cat behavior questions', () => {
    const contextTests = [
      { message: 'my cat is hiding', expectedKeywords: ['decompression', 'stress', 'normal', 'space'] },
      { message: 'not eating', expectedKeywords: ['wet food', 'treat', '24', 'vet'] },
      { message: 'litter box issues', expectedKeywords: ['litter', 'box', 'accessible', 'clean'] },
      { message: 'cat is playing', expectedKeywords: ['wonderful', 'great', 'play', 'adjust'] },
      { message: 'my cat is hissing', expectedKeywords: ['space', 'time', 'normal', 'defensive'] },
    ]

    for (const { message, expectedKeywords } of contextTests) {
      const response = fallbackCoachResponse('Luna', 5, message)
      const lowerResponse = response.toLowerCase()

      // Response should contain at least one relevant keyword
      const hasRelevantKeyword = expectedKeywords.some(keyword => lowerResponse.includes(keyword))
      expect(hasRelevantKeyword).toBe(true)
    }
  })

  it('should handle all message types without crashing', () => {
    const messageTypes = [
      'hiding',
      'not eating',
      'litter box',
      'playing',
      'aggressive',
      'hissing',
      'return the cat',
      'timeline',
      'general question',
      '',  // Empty message (edge case)
      '   ',  // Whitespace only
      'A',  // Single character
      '!@#$%^&*()',  // Special characters
      'a'.repeat(1000),  // Very long message
    ]

    for (const message of messageTypes) {
      expect(() => fallbackCoachResponse('Luna', 5, message)).not.toThrow()
    }
  })

  it('should provide a default response for unrecognized patterns', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        (catName, currentDay) => {
          // Message that doesn't match any specific pattern
          const message = 'xyzabc random unrecognized message 12345'
          const response = fallbackCoachResponse(catName, currentDay, message)

          // Default response should still include cat name and day
          expect(response.toLowerCase()).toContain(catName.toLowerCase())
          expect(response.toLowerCase()).toContain(`day ${currentDay}`)
        }
      ),
      { numRuns: 30 }
    )
  })

  it('should provide helpful guidance for medical-sounding but non-emergency questions', () => {
    const medicalButNotEmergency = [
      'my cat is sleeping a lot',
      'cat is grooming',
      'eating less than usual',
      'drinking water',
    ]

    for (const message of medicalButNotEmergency) {
      const response = fallbackCoachResponse('Luna', 5, message)
      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(0)
      // Should not crash or return empty response
    }
  })

  it('should handle the check-in context gracefully (fallbackCoachResponse ignores context but should not crash)', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbMessage,
        arbCheckInContext,
        (catName, currentDay, message, checkInContext) => {
          // fallbackCoachResponse doesn't use check-in context, but it shouldn't crash
          const response = fallbackCoachResponse(catName, currentDay, message)
          expect(response).toBeDefined()
        }
      ),
      { numRuns: 30 }
    )
  })
})

// =============================================================================
// PROPERTY 16: Fallback Disclaimer
// =============================================================================

describe('Property 16: Fallback Disclaimer', () => {
  /**
   * Property: For any coach response from fallback, the response shall include
   * a disclaimer indicating the response was generated without AI.
   *
   * Validates: Requirement 3.6
   *
   * Note: The fallbackCoachResponse function provides deterministic responses.
   * The getCoachFallbackResponse in fallbackExplanations.ts includes an explicit
   * disclaimer about AI unavailability.
   */

  it('should include disclaimer in getCoachFallbackResponse', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbMessage,
        (catName, currentDay, message) => {
          const response = getCoachFallbackResponse(message, catName, currentDay)
          const lowerResponse = response.toLowerCase()

          // Response should include a disclaimer about AI unavailability
          const hasDisclaimer =
            lowerResponse.includes('ai') ||
            lowerResponse.includes('unavailable') ||
            lowerResponse.includes('general guidance') ||
            lowerResponse.includes('counselor')

          expect(hasDisclaimer).toBe(true)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should encourage contacting shelter or vet in fallback disclaimer', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbMessage,
        (catName, currentDay, message) => {
          const response = getCoachFallbackResponse(message, catName, currentDay)
          const lowerResponse = response.toLowerCase()

          // Disclaimer should encourage contacting shelter or vet for specific concerns
          const hasContactGuidance =
            lowerResponse.includes('shelter') ||
            lowerResponse.includes('veterinar') ||
            lowerResponse.includes('contact')

          expect(hasContactGuidance).toBe(true)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should be reassuring in fallback disclaimer', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        (catName, currentDay) => {
          const message = 'general question'
          const response = getCoachFallbackResponse(message, catName, currentDay)
          const lowerResponse = response.toLowerCase()

          // Disclaimer should be reassuring and supportive
          const hasReassurance =
            lowerResponse.includes('normal') ||
            lowerResponse.includes('time') ||
            lowerResponse.includes('caring') ||
            lowerResponse.includes('support')

          expect(hasReassurance).toBe(true)
        }
      ),
      { numRuns: 30 }
    )
  })

  it('should include day number in fallback response', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbMessage,
        (catName, currentDay, message) => {
          const response = getCoachFallbackResponse(message, catName, currentDay)
          const lowerResponse = response.toLowerCase()

          // Response should include the current day
          expect(lowerResponse).toContain(`day ${currentDay}`)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should include cat name in fallback disclaimer', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbMessage,
        (catName, currentDay, message) => {
          const response = getCoachFallbackResponse(message, catName, currentDay)

          // Response should reference the cat by name
          expect(response.toLowerCase()).toContain(catName.toLowerCase())
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should provide timeline context in fallback disclaimer', () => {
    const response = getCoachFallbackResponse('general question', 'Luna', 7)
    const lowerResponse = response.toLowerCase()

    // Should mention adjustment timeline
    const hasTimelineContext =
      lowerResponse.includes('week') ||
      lowerResponse.includes('adjust') ||
      lowerResponse.includes('transition')

    expect(hasTimelineContext).toBe(true)
  })

  it('should differentiate from AI-powered responses in disclaimer', () => {
    fc.assert(
      fc.property(
        arbCatName,
        arbDay,
        arbMessage,
        (catName, currentDay, message) => {
          const response = getCoachFallbackResponse(message, catName, currentDay)
          const lowerResponse = response.toLowerCase()

          // Should indicate this is general guidance, not personalized AI advice
          const indicatesGeneralGuidance =
            lowerResponse.includes('general guidance') ||
            lowerResponse.includes('ai counselor') ||
            lowerResponse.includes('unavailable')

          expect(indicatesGeneralGuidance).toBe(true)
        }
      ),
      { numRuns: 50 }
    )
  })
})

// =============================================================================
// ADDITIONAL FALLBACK MECHANISM TESTS
// =============================================================================

describe('Fallback Mechanism Integration', () => {
  /**
   * Tests that verify the fallback mechanism works correctly as a whole
   */

  it('should provide consistent responses for the same input (deterministic)', () => {
    const catName = 'Luna'
    const currentDay = 5
    const message = 'my cat is hiding'

    const response1 = fallbackCoachResponse(catName, currentDay, message)
    const response2 = fallbackCoachResponse(catName, currentDay, message)

    // Fallback responses should be deterministic
    expect(response1).toBe(response2)
  })

  it('should handle boundary day values', () => {
    const boundaryDays = [1, 7, 14]

    for (const day of boundaryDays) {
      const response = fallbackCoachResponse('Luna', day, 'hiding')
      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(0)
    }
  })

  it('should handle boundary day values in getCoachFallbackResponse', () => {
    const boundaryDays = [1, 7, 14]

    for (const day of boundaryDays) {
      const response = getCoachFallbackResponse('question', 'Luna', day)
      expect(response.toLowerCase()).toContain(`day ${day}`)
    }
  })

  it('should handle special characters in cat name', () => {
    const specialNames = ["O'Malley", 'Jean-Claude', 'Mr. Whiskers', 'Luna (the cat)']

    for (const name of specialNames) {
      const response = fallbackCoachResponse(name, 5, 'hiding')
      expect(response).toBeDefined()
      // Response should still be valid even with special characters
      expect(response.length).toBeGreaterThan(0)
    }
  })

  it('should provide helpful responses for each fallback scenario type', () => {
    const scenarios = [
      { message: 'hiding', expectedInResponse: ['decompression', 'normal', 'stress'] },
      { message: 'not eating', expectedInResponse: ['wet food', 'treat', 'vet', '24'] },
      { message: 'litter box', expectedInResponse: ['litter', 'box', 'accessible'] },
      { message: 'playing', expectedInResponse: ['wonderful', 'great', 'play'] },
      { message: 'hissing', expectedInResponse: ['space', 'normal', 'time'] },
    ]

    for (const { message, expectedInResponse } of scenarios) {
      const response = fallbackCoachResponse('Luna', 5, message)
      const lowerResponse = response.toLowerCase()

      const hasExpected = expectedInResponse.some(keyword => lowerResponse.includes(keyword))
      expect(hasExpected).toBe(true)
    }
  })
})

// =============================================================================
// EDGE CASES FOR FALLBACK MECHANISM
// =============================================================================

describe('Fallback Mechanism Edge Cases', () => {
  it('should handle very long cat names', () => {
    const longName = 'A'.repeat(50)
    const response = fallbackCoachResponse(longName, 5, 'hiding')
    expect(response.toLowerCase()).toContain(longName.toLowerCase())
  })

  it('should handle very long messages', () => {
    const longMessage = 'a'.repeat(1000)
    const response = fallbackCoachResponse('Luna', 5, longMessage)
    expect(response).toBeDefined()
  })

  it('should handle unicode characters', () => {
    const unicodeMessage = '我的猫躲起来了 🐱 hiding'
    const response = fallbackCoachResponse('Luna', 5, unicodeMessage)
    expect(response).toBeDefined()
  })

  it('should handle messages that are only whitespace', () => {
    const response = fallbackCoachResponse('Luna', 5, '   ')
    expect(response).toBeDefined()
  })

  it('should handle empty cat name gracefully', () => {
    // Even with unusual input, fallback should not crash
    const response = fallbackCoachResponse('', 5, 'hiding')
    expect(response).toBeDefined()
  })

  it('should handle numeric cat names', () => {
    const response = fallbackCoachResponse('123', 5, 'hiding')
    expect(response).toBeDefined()
  })

  it('should provide appropriate day 1 guidance', () => {
    const response = fallbackCoachResponse('Luna', 1, 'hiding')
    // Day 1 is the first day - hiding is most expected
    expect(response.toLowerCase()).toMatch(/decompression|hiding|normal|stress/)
  })

  it('should provide appropriate day 14 guidance', () => {
    const response = fallbackCoachResponse('Luna', 14, 'general question')
    expect(response.toLowerCase()).toContain('day 14')
  })
})
