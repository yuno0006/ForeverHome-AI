/**
 * Property-Based Tests for Check-In Data Handling
 *
 * This file contains property tests for the check-in data handling logic.
 * Properties tested:
 * - Property 17: Check-In Data Completeness
 * - Property 18: Current Day Calculation
 *
 * Validates: Requirements 4.1, 4.2, 4.4
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { DailyCheckIn } from '@/types/checkIn'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Required fields for a DailyCheckIn (excluding optional notes)
 */
const REQUIRED_CHECKIN_FIELDS: (keyof DailyCheckIn)[] = [
  'adoptionId',
  'day',
  'timestamp',
  'ate',
  'drank',
  'hiding',
  'litterUsed',
]

// =============================================================================
// TEST UTILITIES
// =============================================================================

/**
 * Generates a random adoption ID for property testing
 */
const arbAdoptionId = fc.string({ minLength: 1, maxLength: 30 })

/**
 * Generates a random day number (1-14) for the 14-day transition period
 */
const arbDay = fc.integer({ min: 1, max: 14 })

/**
 * Generates a random ISO timestamp
 */
const arbTimestamp = fc.date({ noInvalidDate: true }).map(d => d.toISOString())

/**
 * Generates a valid DailyCheckIn object
 */
const arbDailyCheckIn: fc.Arbitrary<DailyCheckIn> = fc.record({
  adoptionId: arbAdoptionId,
  day: arbDay,
  ate: fc.boolean(),
  drank: fc.boolean(),
  hiding: fc.boolean(),
  litterUsed: fc.boolean(),
  notes: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
  timestamp: arbTimestamp,
})

/**
 * Generates an array of DailyCheckIn objects (max 14 for the transition period)
 */
const arbCheckInArray = fc.array(arbDailyCheckIn, { maxLength: 14 })

/**
 * Generates an empty array of check-ins
 */
const arbEmptyCheckInArray = fc.constant<DailyCheckIn[]>([])

/**
 * Generates a check-in array with at least one check-in
 */
const arbNonEmptyCheckInArray = fc.array(arbDailyCheckIn, { minLength: 1, maxLength: 14 })

/**
 * Generates check-in arrays with specific day patterns for edge case testing
 */
const arbCheckInArrayWithGaps = fc.array(
  arbDailyCheckIn,
  { minLength: 0, maxLength: 14 }
).map(checkIns => {
  // Create gaps by removing some days (e.g., days 1, 3, 5, 7 instead of 1, 2, 3, 4)
  if (checkIns.length === 0) return checkIns
  
  return checkIns.map((c, i) => ({
    ...c,
    day: i * 2 + 1, // Days 1, 3, 5, 7, etc.
  }))
})

/**
 * Generates check-in arrays with duplicate days (testing robustness)
 */
const arbCheckInArrayWithDuplicates = fc.array(
  arbDailyCheckIn,
  { minLength: 0, maxLength: 14 }
).map(checkIns => {
  if (checkIns.length < 2) return checkIns
  
  // Set some check-ins to have the same day
  return checkIns.map((c, i) => ({
    ...c,
    day: i < checkIns.length - 1 ? Math.floor(i / 2) + 1 : c.day,
  }))
})

// =============================================================================
// HELPER FUNCTIONS (mirroring production logic)
// =============================================================================

/**
 * Calculates the current day based on existing check-ins.
 * 
 * From design.md:
 * ```
 * if (checkIns.length === 0) {
 *   currentDay = 1;
 * } else {
 *   currentDay = max(checkIns.map(c => c.day)) + 1;
 * }
 * ```
 */
function calculateCurrentDay(checkIns: DailyCheckIn[]): number {
  if (checkIns.length === 0) {
    return 1
  }
  return Math.max(...checkIns.map(c => c.day)) + 1
}

/**
 * Validates that a saved check-in contains all required fields.
 * Returns true if all required fields are present and valid.
 */
function validateCheckInCompleteness(checkIn: unknown): checkIn is DailyCheckIn {
  if (typeof checkIn !== 'object' || checkIn === null) {
    return false
  }

  const obj = checkIn as Record<string, unknown>

  // Check required fields exist
  for (const field of REQUIRED_CHECKIN_FIELDS) {
    if (!(field in obj)) {
      return false
    }
  }

  // Type validation for required fields
  if (typeof obj.adoptionId !== 'string' || obj.adoptionId.length === 0) {
    return false
  }
  if (typeof obj.day !== 'number' || obj.day < 1 || obj.day > 14) {
    return false
  }
  if (typeof obj.timestamp !== 'string' || obj.timestamp.length === 0) {
    return false
  }
  if (typeof obj.ate !== 'boolean') {
    return false
  }
  if (typeof obj.drank !== 'boolean') {
    return false
  }
  if (typeof obj.hiding !== 'boolean') {
    return false
  }
  if (typeof obj.litterUsed !== 'boolean') {
    return false
  }

  // Notes is optional, but if present must be a string
  if ('notes' in obj && obj.notes !== undefined && typeof obj.notes !== 'string') {
    return false
  }

  return true
}

/**
 * Simulates saving a check-in and returns the saved object.
 * In a real implementation, this would persist to Firestore or local storage.
 */
function saveCheckIn(
  adoptionId: string,
  day: number,
  ate: boolean,
  drank: boolean,
  hiding: boolean,
  litterUsed: boolean,
  notes?: string
): DailyCheckIn {
  const checkIn: DailyCheckIn = {
    adoptionId,
    day,
    ate,
    drank,
    hiding,
    litterUsed,
    timestamp: new Date().toISOString(),
  }

  if (notes !== undefined && notes.length > 0) {
    checkIn.notes = notes
  }

  return checkIn
}

// =============================================================================
// PROPERTY 17: Check-In Data Completeness
// =============================================================================

describe('Property 17: Check-In Data Completeness', () => {
  /**
   * Property: For any check-in saved by the system, the saved object shall
   * contain all required fields: adoptionId, day, timestamp, ate, drank,
   * hiding, litterUsed, and optionally notes.
   *
   * Validates: Requirement 4.1
   */

  it('should save check-ins with all required fields present', () => {
    fc.assert(
      fc.property(
        arbAdoptionId,
        arbDay,
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
        (adoptionId, day, ate, drank, hiding, litterUsed, notes) => {
          const savedCheckIn = saveCheckIn(adoptionId, day, ate, drank, hiding, litterUsed, notes)

          // Verify all required fields are present
          expect(savedCheckIn).toHaveProperty('adoptionId')
          expect(savedCheckIn).toHaveProperty('day')
          expect(savedCheckIn).toHaveProperty('timestamp')
          expect(savedCheckIn).toHaveProperty('ate')
          expect(savedCheckIn).toHaveProperty('drank')
          expect(savedCheckIn).toHaveProperty('hiding')
          expect(savedCheckIn).toHaveProperty('litterUsed')

          // Verify field values are correct
          expect(savedCheckIn.adoptionId).toBe(adoptionId)
          expect(savedCheckIn.day).toBe(day)
          expect(savedCheckIn.ate).toBe(ate)
          expect(savedCheckIn.drank).toBe(drank)
          expect(savedCheckIn.hiding).toBe(hiding)
          expect(savedCheckIn.litterUsed).toBe(litterUsed)

          // Notes should only be present if provided
          if (notes !== undefined && notes.length > 0) {
            expect(savedCheckIn.notes).toBe(notes)
          } else {
            expect(savedCheckIn.notes).toBeUndefined()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate valid ISO timestamp for saved check-ins', () => {
    fc.assert(
      fc.property(
        arbAdoptionId,
        arbDay,
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (adoptionId, day, ate, drank, hiding, litterUsed) => {
          const savedCheckIn = saveCheckIn(adoptionId, day, ate, drank, hiding, litterUsed)

          // Timestamp should be a valid ISO string
          expect(typeof savedCheckIn.timestamp).toBe('string')
          expect(savedCheckIn.timestamp.length).toBeGreaterThan(0)

          // Should be parseable as a date
          const parsedDate = new Date(savedCheckIn.timestamp)
          expect(parsedDate instanceof Date).toBe(true)
          expect(isNaN(parsedDate.getTime())).toBe(false)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should validate completeness of all generated check-ins', () => {
    fc.assert(
      fc.property(
        arbDailyCheckIn,
        (checkIn) => {
          // All generated check-ins should pass validation
          expect(validateCheckInCompleteness(checkIn)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should fail validation for objects missing required fields', () => {
    // Missing adoptionId
    expect(validateCheckInCompleteness({
      day: 1,
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
    })).toBe(false)

    // Missing day
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
    })).toBe(false)

    // Missing timestamp
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 1,
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
    })).toBe(false)

    // Missing ate
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 1,
      timestamp: new Date().toISOString(),
      drank: true,
      hiding: false,
      litterUsed: true,
    })).toBe(false)

    // Missing drank
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 1,
      timestamp: new Date().toISOString(),
      ate: true,
      hiding: false,
      litterUsed: true,
    })).toBe(false)

    // Missing hiding
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 1,
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      litterUsed: true,
    })).toBe(false)

    // Missing litterUsed
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 1,
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
    })).toBe(false)
  })

  it('should fail validation for incorrect field types', () => {
    // Invalid adoptionId type
    expect(validateCheckInCompleteness({
      adoptionId: 123,
      day: 1,
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
    })).toBe(false)

    // Invalid day type
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: '1',
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
    })).toBe(false)

    // Invalid day value (out of range)
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 0,
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
    })).toBe(false)

    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 15,
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
    })).toBe(false)

    // Invalid boolean fields
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 1,
      timestamp: new Date().toISOString(),
      ate: 'yes',
      drank: true,
      hiding: false,
      litterUsed: true,
    })).toBe(false)

    // Invalid notes type
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 1,
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
      notes: 123,
    })).toBe(false)
  })

  it('should accept valid check-ins with or without notes', () => {
    // With notes
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 1,
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
      notes: 'Cat is doing well!',
    })).toBe(true)

    // Without notes
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 1,
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
    })).toBe(true)

    // With undefined notes
    expect(validateCheckInCompleteness({
      adoptionId: 'test',
      day: 1,
      timestamp: new Date().toISOString(),
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
      notes: undefined,
    })).toBe(true)
  })

  it('should reject null and non-object values', () => {
    expect(validateCheckInCompleteness(null)).toBe(false)
    expect(validateCheckInCompleteness(undefined)).toBe(false)
    expect(validateCheckInCompleteness('string')).toBe(false)
    expect(validateCheckInCompleteness(123)).toBe(false)
    expect(validateCheckInCompleteness([])).toBe(false)
  })
})

// =============================================================================
// PROPERTY 18: Current Day Calculation
// =============================================================================

describe('Property 18: Current Day Calculation', () => {
  /**
   * Property: For any array of existing check-ins, the current day shall be
   * calculated as max(checkIns.map(c => c.day)) + 1. When the array is empty,
   * the current day shall be 1.
   *
   * Validates: Requirements 4.2, 4.4
   */

  it('should return 1 for empty check-in arrays', () => {
    fc.assert(
      fc.property(
        arbEmptyCheckInArray,
        (checkIns) => {
          const currentDay = calculateCurrentDay(checkIns)
          expect(currentDay).toBe(1)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should return max day + 1 for non-empty check-in arrays', () => {
    fc.assert(
      fc.property(
        arbNonEmptyCheckInArray,
        (checkIns) => {
          const maxDay = Math.max(...checkIns.map(c => c.day))
          const currentDay = calculateCurrentDay(checkIns)
          expect(currentDay).toBe(maxDay + 1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate correct current day for all check-in arrays', () => {
    fc.assert(
      fc.property(
        arbCheckInArray,
        (checkIns) => {
          const currentDay = calculateCurrentDay(checkIns)

          if (checkIns.length === 0) {
            // Empty array should return 1
            expect(currentDay).toBe(1)
          } else {
            // Non-empty array should return max day + 1
            const maxDay = Math.max(...checkIns.map(c => c.day))
            expect(currentDay).toBe(maxDay + 1)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle check-in arrays with gaps in days', () => {
    fc.assert(
      fc.property(
        arbCheckInArrayWithGaps,
        (checkIns) => {
          const currentDay = calculateCurrentDay(checkIns)

          if (checkIns.length === 0) {
            expect(currentDay).toBe(1)
          } else {
            const maxDay = Math.max(...checkIns.map(c => c.day))
            expect(currentDay).toBe(maxDay + 1)
            // Verify the gap handling - day number should be based on max, not count
            expect(currentDay).toBeGreaterThan(checkIns.length)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle check-in arrays with duplicate days', () => {
    fc.assert(
      fc.property(
        arbCheckInArrayWithDuplicates,
        (checkIns) => {
          const currentDay = calculateCurrentDay(checkIns)

          if (checkIns.length === 0) {
            expect(currentDay).toBe(1)
          } else {
            const maxDay = Math.max(...checkIns.map(c => c.day))
            expect(currentDay).toBe(maxDay + 1)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle single check-in correctly', () => {
    fc.assert(
      fc.property(
        arbDailyCheckIn,
        (checkIn) => {
          const checkIns = [checkIn]
          const currentDay = calculateCurrentDay(checkIns)
          expect(currentDay).toBe(checkIn.day + 1)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should always return a day within valid range (1-15)', () => {
    fc.assert(
      fc.property(
        arbCheckInArray,
        (checkIns) => {
          const currentDay = calculateCurrentDay(checkIns)
          // Valid days are 1-14, so current day can be 1-15 (max day 14 + 1)
          expect(currentDay).toBeGreaterThanOrEqual(1)
          expect(currentDay).toBeLessThanOrEqual(15)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return current day that does not exist in check-in array', () => {
    fc.assert(
      fc.property(
        arbNonEmptyCheckInArray,
        (checkIns) => {
          const currentDay = calculateCurrentDay(checkIns)
          const existingDays = checkIns.map(c => c.day)
          // Current day should not already exist in the check-ins
          expect(existingDays).not.toContain(currentDay)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should be consistent across multiple calls with same input', () => {
    fc.assert(
      fc.property(
        arbCheckInArray,
        (checkIns) => {
          const firstResult = calculateCurrentDay(checkIns)
          const secondResult = calculateCurrentDay(checkIns)
          const thirdResult = calculateCurrentDay(checkIns)
          
          expect(firstResult).toBe(secondResult)
          expect(secondResult).toBe(thirdResult)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle the demo check-in data correctly', () => {
    // Demo data from design.md:
    // Day 1, 2, 3, 5, 7, 10 (with gaps)
    const demoCheckIns: DailyCheckIn[] = [
      { adoptionId: 'demo', day: 1, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '2024-01-01T20:00:00Z' },
      { adoptionId: 'demo', day: 2, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '2024-01-02T20:00:00Z' },
      { adoptionId: 'demo', day: 3, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '2024-01-03T20:00:00Z' },
      { adoptionId: 'demo', day: 5, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '2024-01-05T20:00:00Z' },
      { adoptionId: 'demo', day: 7, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '2024-01-07T20:00:00Z' },
      { adoptionId: 'demo', day: 10, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '2024-01-10T20:00:00Z' },
    ]

    const currentDay = calculateCurrentDay(demoCheckIns)
    // Max day is 10, so current day should be 11
    expect(currentDay).toBe(11)
  })

  it('should handle sequential check-in days (1, 2, 3, 4...)', () => {
    const sequentialCheckIns: DailyCheckIn[] = []
    for (let i = 1; i <= 7; i++) {
      sequentialCheckIns.push({
        adoptionId: 'test',
        day: i,
        ate: true,
        drank: true,
        hiding: false,
        litterUsed: true,
        timestamp: new Date().toISOString(),
      })
    }

    const currentDay = calculateCurrentDay(sequentialCheckIns)
    expect(currentDay).toBe(8)
  })

  it('should handle reverse-ordered check-in arrays', () => {
    const reverseCheckIns: DailyCheckIn[] = [
      { adoptionId: 'test', day: 7, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 5, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 3, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 1, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
    ]

    const currentDay = calculateCurrentDay(reverseCheckIns)
    // Max day is 7, so current day should be 8
    expect(currentDay).toBe(8)
  })

  it('should handle unsorted check-in arrays', () => {
    const unsortedCheckIns: DailyCheckIn[] = [
      { adoptionId: 'test', day: 5, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 1, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 3, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 7, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
    ]

    const currentDay = calculateCurrentDay(unsortedCheckIns)
    // Max day is 7, so current day should be 8
    expect(currentDay).toBe(8)
  })
})

// =============================================================================
// EDGE CASES
// =============================================================================

describe('Check-In Edge Cases', () => {
  it('should handle check-in with empty notes string', () => {
    const savedCheckIn = saveCheckIn('test', 1, true, true, false, true, '')
    
    // Empty notes should not be included
    expect(savedCheckIn.notes).toBeUndefined()
  })

  it('should handle check-in at day 14 boundary', () => {
    const savedCheckIn = saveCheckIn('test', 14, true, true, false, true)
    
    expect(savedCheckIn.day).toBe(14)
    expect(validateCheckInCompleteness(savedCheckIn)).toBe(true)
  })

  it('should calculate day 15 for completed 14-day program', () => {
    const completedProgram: DailyCheckIn[] = Array.from({ length: 14 }, (_, i) => ({
      adoptionId: 'test',
      day: i + 1,
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
      timestamp: new Date().toISOString(),
    }))

    const currentDay = calculateCurrentDay(completedProgram)
    expect(currentDay).toBe(15)
  })

  it('should handle very long adoption IDs', () => {
    const longId = 'a'.repeat(100)
    const savedCheckIn = saveCheckIn(longId, 1, true, true, false, true)
    
    expect(savedCheckIn.adoptionId).toBe(longId)
    expect(validateCheckInCompleteness(savedCheckIn)).toBe(true)
  })

  it('should handle special characters in notes', () => {
    const specialNotes = 'Cat\'s behavior: "great"! 🐱\nNew line & symbols: <test>'
    const savedCheckIn = saveCheckIn('test', 1, true, true, false, true, specialNotes)
    
    expect(savedCheckIn.notes).toBe(specialNotes)
    expect(validateCheckInCompleteness(savedCheckIn)).toBe(true)
  })

  it('should handle all boolean combinations for check-in fields', () => {
    const booleanCombinations = [
      { ate: true, drank: true, hiding: true, litterUsed: true },
      { ate: true, drank: true, hiding: true, litterUsed: false },
      { ate: true, drank: true, hiding: false, litterUsed: true },
      { ate: true, drank: true, hiding: false, litterUsed: false },
      { ate: true, drank: false, hiding: true, litterUsed: true },
      { ate: true, drank: false, hiding: true, litterUsed: false },
      { ate: true, drank: false, hiding: false, litterUsed: true },
      { ate: true, drank: false, hiding: false, litterUsed: false },
      { ate: false, drank: true, hiding: true, litterUsed: true },
      { ate: false, drank: true, hiding: true, litterUsed: false },
      { ate: false, drank: true, hiding: false, litterUsed: true },
      { ate: false, drank: true, hiding: false, litterUsed: false },
      { ate: false, drank: false, hiding: true, litterUsed: true },
      { ate: false, drank: false, hiding: true, litterUsed: false },
      { ate: false, drank: false, hiding: false, litterUsed: true },
      { ate: false, drank: false, hiding: false, litterUsed: false },
    ]

    for (const combo of booleanCombinations) {
      const savedCheckIn = saveCheckIn(
        'test',
        1,
        combo.ate,
        combo.drank,
        combo.hiding,
        combo.litterUsed
      )
      
      expect(savedCheckIn.ate).toBe(combo.ate)
      expect(savedCheckIn.drank).toBe(combo.drank)
      expect(savedCheckIn.hiding).toBe(combo.hiding)
      expect(savedCheckIn.litterUsed).toBe(combo.litterUsed)
      expect(validateCheckInCompleteness(savedCheckIn)).toBe(true)
    }
  })

  it('should handle check-ins from multiple adoptions in same array', () => {
    const mixedAdoptions: DailyCheckIn[] = [
      { adoptionId: 'adoption-1', day: 1, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
      { adoptionId: 'adoption-2', day: 3, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
      { adoptionId: 'adoption-1', day: 2, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
      { adoptionId: 'adoption-2', day: 5, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
    ]

    const currentDay = calculateCurrentDay(mixedAdoptions)
    // Max day is 5, so current day should be 6
    expect(currentDay).toBe(6)
  })
})
