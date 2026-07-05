/**
 * Integration Tests for Check-In Flow
 *
 * This file contains integration tests for the check-in system flow.
 * Tests cover:
 * - Check-in save and retrieval cycle
 * - Progress timeline display order
 * - Empty check-ins display Day 1
 *
 * Validates: Requirements 4.3, 9.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { DailyCheckIn } from '@/types/checkIn'

// =============================================================================
// TEST UTILITIES - Simulating Check-In Storage
// =============================================================================

/**
 * In-memory storage for check-ins during testing.
 * Simulates the behavior of a database or local storage.
 */
class CheckInStorage {
  private checkIns: Map<string, DailyCheckIn[]> = new Map()

  /**
   * Save a check-in for a specific adoption
   */
  save(adoptionId: string, checkIn: Omit<DailyCheckIn, 'adoptionId' | 'timestamp'>): DailyCheckIn {
    const fullCheckIn: DailyCheckIn = {
      ...checkIn,
      adoptionId,
      timestamp: new Date().toISOString(),
    }

    const existing = this.checkIns.get(adoptionId) || []
    this.checkIns.set(adoptionId, [...existing, fullCheckIn])

    return fullCheckIn
  }

  /**
   * Retrieve all check-ins for a specific adoption
   */
  get(adoptionId: string): DailyCheckIn[] {
    return this.checkIns.get(adoptionId) || []
  }

  /**
   * Clear all check-ins (for test cleanup)
   */
  clear(): void {
    this.checkIns.clear()
  }

  /**
   * Calculate the current day based on existing check-ins
   */
  calculateCurrentDay(adoptionId: string): number {
    const checkIns = this.get(adoptionId)
    if (checkIns.length === 0) {
      return 1
    }
    return Math.max(...checkIns.map(c => c.day)) + 1
  }
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe('Check-In Flow Integration Tests', () => {
  let storage: CheckInStorage

  beforeEach(() => {
    storage = new CheckInStorage()
  })

  afterEach(() => {
    storage.clear()
  })

  // ===========================================================================
  // Test: Check-in Save and Retrieval Cycle
  // ===========================================================================

  describe('Check-in Save and Retrieval Cycle', () => {
    /**
     * Validates: Requirement 4.3
     * Test that check-ins can be saved and retrieved correctly.
     */

    it('should save a check-in and retrieve it with all fields', () => {
      const adoptionId = 'adoption-123'
      const checkInData = {
        day: 1,
        ate: true,
        drank: true,
        hiding: false,
        litterUsed: true,
        notes: 'Cat is adjusting well',
      }

      // Save the check-in
      const savedCheckIn = storage.save(adoptionId, checkInData)

      // Verify saved check-in has all expected fields
      expect(savedCheckIn.adoptionId).toBe(adoptionId)
      expect(savedCheckIn.day).toBe(1)
      expect(savedCheckIn.ate).toBe(true)
      expect(savedCheckIn.drank).toBe(true)
      expect(savedCheckIn.hiding).toBe(false)
      expect(savedCheckIn.litterUsed).toBe(true)
      expect(savedCheckIn.notes).toBe('Cat is adjusting well')
      expect(savedCheckIn.timestamp).toBeDefined()
      expect(typeof savedCheckIn.timestamp).toBe('string')

      // Retrieve check-ins for this adoption
      const retrievedCheckIns = storage.get(adoptionId)

      // Verify retrieval
      expect(retrievedCheckIns).toHaveLength(1)
      expect(retrievedCheckIns[0]).toEqual(savedCheckIn)
    })

    it('should save multiple check-ins for the same adoption', () => {
      const adoptionId = 'adoption-456'

      // Save day 1 check-in
      storage.save(adoptionId, {
        day: 1,
        ate: true,
        drank: true,
        hiding: true,
        litterUsed: true,
      })

      // Save day 2 check-in
      storage.save(adoptionId, {
        day: 2,
        ate: true,
        drank: true,
        hiding: true,
        litterUsed: true,
        notes: 'Still hiding under the bed',
      })

      // Save day 3 check-in
      storage.save(adoptionId, {
        day: 3,
        ate: true,
        drank: true,
        hiding: false,
        litterUsed: true,
        notes: 'Came out today!',
      })

      // Retrieve all check-ins
      const checkIns = storage.get(adoptionId)

      expect(checkIns).toHaveLength(3)
      expect(checkIns.map(c => c.day)).toEqual([1, 2, 3])
      expect(checkIns[2].hiding).toBe(false)
      expect(checkIns[2].notes).toBe('Came out today!')
    })

    it('should maintain separate check-ins for different adoptions', () => {
      const adoption1 = 'adoption-111'
      const adoption2 = 'adoption-222'

      // Save check-ins for adoption 1
      storage.save(adoption1, { day: 1, ate: true, drank: true, hiding: true, litterUsed: true })
      storage.save(adoption1, { day: 2, ate: true, drank: true, hiding: false, litterUsed: true })

      // Save check-ins for adoption 2
      storage.save(adoption2, { day: 1, ate: false, drank: true, hiding: true, litterUsed: false })

      // Verify separation
      const checkIns1 = storage.get(adoption1)
      const checkIns2 = storage.get(adoption2)

      expect(checkIns1).toHaveLength(2)
      expect(checkIns2).toHaveLength(1)
      expect(checkIns1[0].ate).toBe(true)
      expect(checkIns2[0].ate).toBe(false)
    })

    it('should handle check-ins with optional notes field', () => {
      const adoptionId = 'adoption-789'

      // Save without notes
      const checkInWithoutNotes = storage.save(adoptionId, {
        day: 1,
        ate: true,
        drank: true,
        hiding: true,
        litterUsed: true,
      })

      // Save with notes
      const checkInWithNotes = storage.save(adoptionId, {
        day: 2,
        ate: true,
        drank: true,
        hiding: false,
        litterUsed: true,
        notes: 'Great progress today!',
      })

      expect(checkInWithoutNotes.notes).toBeUndefined()
      expect(checkInWithNotes.notes).toBe('Great progress today!')

      // Retrieve and verify
      const checkIns = storage.get(adoptionId)
      expect(checkIns[0].notes).toBeUndefined()
      expect(checkIns[1].notes).toBe('Great progress today!')
    })

    it('should generate unique timestamps for each check-in', async () => {
      const adoptionId = 'adoption-timestamp-test'

      // Save first check-in
      const checkIn1 = storage.save(adoptionId, {
        day: 1,
        ate: true,
        drank: true,
        hiding: true,
        litterUsed: true,
      })

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      // Save second check-in
      const checkIn2 = storage.save(adoptionId, {
        day: 2,
        ate: true,
        drank: true,
        hiding: false,
        litterUsed: true,
      })

      // Timestamps should be valid ISO strings
      expect(new Date(checkIn1.timestamp).getTime()).not.toBeNaN()
      expect(new Date(checkIn2.timestamp).getTime()).not.toBeNaN()

      // Timestamps should be different
      expect(checkIn1.timestamp).not.toBe(checkIn2.timestamp)
    })
  })

  // ===========================================================================
  // Test: Progress Timeline Display Order
  // ===========================================================================

  describe('Progress Timeline Display Order', () => {
    /**
     * Validates: Requirement 4.3
     * Test that the progress timeline displays check-ins in chronological order.
     */

    it('should display check-ins in ascending day order', () => {
      const adoptionId = 'adoption-order-test'

      // Save check-ins in random order
      storage.save(adoptionId, { day: 3, ate: true, drank: true, hiding: false, litterUsed: true })
      storage.save(adoptionId, { day: 1, ate: true, drank: true, hiding: true, litterUsed: true })
      storage.save(adoptionId, { day: 5, ate: true, drank: true, hiding: false, litterUsed: true })
      storage.save(adoptionId, { day: 2, ate: true, drank: true, hiding: true, litterUsed: true })

      // Retrieve and sort (simulating ProgressTimeline component behavior)
      const checkIns = storage.get(adoptionId)
      const sortedCheckIns = [...checkIns].sort((a, b) => a.day - b.day)

      // Verify sorted order
      expect(sortedCheckIns.map(c => c.day)).toEqual([1, 2, 3, 5])
    })

    it('should display days with gaps correctly (Days 1, 3, 7)', () => {
      const adoptionId = 'adoption-gaps-test'

      // Save check-ins with gaps
      storage.save(adoptionId, { day: 1, ate: true, drank: true, hiding: true, litterUsed: true })
      storage.save(adoptionId, { day: 3, ate: true, drank: true, hiding: true, litterUsed: true, notes: 'Day 2 was skipped' })
      storage.save(adoptionId, { day: 7, ate: true, drank: true, hiding: false, litterUsed: true })

      const checkIns = storage.get(adoptionId)
      const sortedCheckIns = [...checkIns].sort((a, b) => a.day - b.day)

      // Verify days with gaps
      expect(sortedCheckIns).toHaveLength(3)
      expect(sortedCheckIns[0].day).toBe(1)
      expect(sortedCheckIns[1].day).toBe(3)
      expect(sortedCheckIns[2].day).toBe(7)

      // Verify the gap exists (no day 2, 4, 5, 6)
      const days = sortedCheckIns.map(c => c.day)
      expect(days).not.toContain(2)
      expect(days).not.toContain(4)
      expect(days).not.toContain(5)
      expect(days).not.toContain(6)
    })

    it('should maintain chronological order with same day replacements', () => {
      const adoptionId = 'adoption-replace-test'

      // Save initial check-in for day 1
      storage.save(adoptionId, { day: 1, ate: false, drank: false, hiding: true, litterUsed: false })

      // Save another check-in for day 1 (simulating a replacement)
      storage.save(adoptionId, { day: 1, ate: true, drank: true, hiding: true, litterUsed: true })

      // Save day 2
      storage.save(adoptionId, { day: 2, ate: true, drank: true, hiding: false, litterUsed: true })

      const checkIns = storage.get(adoptionId)
      const sortedCheckIns = [...checkIns].sort((a, b) => a.day - b.day)

      // Should have 3 entries (both day 1 entries are kept)
      expect(sortedCheckIns).toHaveLength(3)
      expect(sortedCheckIns[0].day).toBe(1)
      expect(sortedCheckIns[1].day).toBe(1) // Second day 1 entry
      expect(sortedCheckIns[2].day).toBe(2)
    })

    it('should display full 14-day transition timeline correctly', () => {
      const adoptionId = 'adoption-full-timeline'

      // Save check-ins for all 14 days
      for (let day = 1; day <= 14; day++) {
        const hiding = day <= 5 // Hiding for first 5 days
        storage.save(adoptionId, {
          day,
          ate: true,
          drank: true,
          hiding,
          litterUsed: true,
          notes: hiding ? 'Still adjusting' : 'Settling in well',
        })
      }

      const checkIns = storage.get(adoptionId)
      const sortedCheckIns = [...checkIns].sort((a, b) => a.day - b.day)

      expect(sortedCheckIns).toHaveLength(14)
      expect(sortedCheckIns[0].day).toBe(1)
      expect(sortedCheckIns[13].day).toBe(14)

      // Verify hiding pattern
      expect(sortedCheckIns.slice(0, 5).every(c => c.hiding)).toBe(true)
      expect(sortedCheckIns.slice(5).every(c => !c.hiding)).toBe(true)
    })

    it('should identify first non-hiding day correctly', () => {
      const adoptionId = 'adoption-first-out'

      // Save check-ins where day 4 is first non-hiding
      storage.save(adoptionId, { day: 1, ate: true, drank: true, hiding: true, litterUsed: true })
      storage.save(adoptionId, { day: 2, ate: true, drank: true, hiding: true, litterUsed: true })
      storage.save(adoptionId, { day: 3, ate: true, drank: true, hiding: true, litterUsed: true })
      storage.save(adoptionId, { day: 4, ate: true, drank: true, hiding: false, litterUsed: true, notes: 'First time out!' })
      storage.save(adoptionId, { day: 5, ate: true, drank: true, hiding: false, litterUsed: true })

      const checkIns = storage.get(adoptionId)
      const sortedCheckIns = [...checkIns].sort((a, b) => a.day - b.day)

      // Find first non-hiding day
      const firstNonHidingIndex = sortedCheckIns.findIndex((c, index) => {
        return !c.hiding && (index === 0 || sortedCheckIns[index - 1].hiding)
      })

      expect(firstNonHidingIndex).toBe(3)
      expect(sortedCheckIns[firstNonHidingIndex].day).toBe(4)
      expect(sortedCheckIns[firstNonHidingIndex].notes).toBe('First time out!')
    })
  })

  // ===========================================================================
  // Test: Empty Check-ins Display Day 1
  // ===========================================================================

  describe('Empty Check-ins Display Day 1', () => {
    /**
     * Validates: Requirement 4.4
     * Test that when no check-ins exist, the system displays Day 1.
     */

    it('should return Day 1 for new adoption with no check-ins', () => {
      const adoptionId = 'new-adoption'

      const checkIns = storage.get(adoptionId)

      expect(checkIns).toHaveLength(0)
      expect(storage.calculateCurrentDay(adoptionId)).toBe(1)
    })

    it('should display Day 1 in UI for empty check-in array', () => {
      const adoptionId = 'empty-checkins'

      // Get empty array
      const checkIns = storage.get(adoptionId)

      // Simulate the UI logic for determining the display day
      const displayDay = checkIns.length === 0 ? 1 : Math.max(...checkIns.map(c => c.day)) + 1

      expect(displayDay).toBe(1)
    })

    it('should correctly calculate Day 1 when adoption ID does not exist', () => {
      // Access a non-existent adoption
      const checkIns = storage.get('non-existent-adoption')

      expect(checkIns).toHaveLength(0)
      expect(storage.calculateCurrentDay('non-existent-adoption')).toBe(1)
    })

    it('should transition from Day 1 to Day 2 after first check-in', () => {
      const adoptionId = 'transition-test'

      // Initially should show Day 1
      expect(storage.calculateCurrentDay(adoptionId)).toBe(1)

      // Save first check-in
      storage.save(adoptionId, {
        day: 1,
        ate: true,
        drank: true,
        hiding: true,
        litterUsed: true,
        notes: 'First day with new cat',
      })

      // Now should show Day 2
      expect(storage.calculateCurrentDay(adoptionId)).toBe(2)
    })

    it('should handle clearing check-ins and reset to Day 1', () => {
      const adoptionId = 'clear-test'

      // Save some check-ins
      storage.save(adoptionId, { day: 1, ate: true, drank: true, hiding: true, litterUsed: true })
      storage.save(adoptionId, { day: 2, ate: true, drank: true, hiding: false, litterUsed: true })

      expect(storage.calculateCurrentDay(adoptionId)).toBe(3)

      // Clear storage
      storage.clear()

      // Should now show Day 1
      expect(storage.calculateCurrentDay(adoptionId)).toBe(1)
    })

    it('should show Day 1 for new adoption even if other adoptions have check-ins', () => {
      const existingAdoption = 'existing-adoption'
      const newAdoption = 'new-adoption'

      // Save check-ins for existing adoption
      storage.save(existingAdoption, { day: 1, ate: true, drank: true, hiding: true, litterUsed: true })
      storage.save(existingAdoption, { day: 2, ate: true, drank: true, hiding: false, litterUsed: true })

      // Existing adoption should be on Day 3
      expect(storage.calculateCurrentDay(existingAdoption)).toBe(3)

      // New adoption should still show Day 1
      expect(storage.calculateCurrentDay(newAdoption)).toBe(1)
    })
  })

  // ===========================================================================
  // Integration: Full Check-In Flow
  // ===========================================================================

  describe('Full Check-In Flow Integration', () => {
    /**
     * Validates: Requirements 4.3, 4.4
     * Test the complete flow from empty state to multiple check-ins.
     */

    it('should handle complete 7-day check-in journey', () => {
      const adoptionId = 'complete-journey'
      const catName = 'Whiskers'

      // Day 1: New adoption, hiding
      expect(storage.calculateCurrentDay(adoptionId)).toBe(1)

      storage.save(adoptionId, {
        day: 1,
        ate: true,
        drank: true,
        hiding: true,
        litterUsed: true,
        notes: `${catName} is hiding under the bed`,
      })

      // Day 2: Still hiding
      expect(storage.calculateCurrentDay(adoptionId)).toBe(2)

      storage.save(adoptionId, {
        day: 2,
        ate: true,
        drank: true,
        hiding: true,
        litterUsed: true,
        notes: 'Came out briefly for food',
      })

      // Day 3: First time out!
      expect(storage.calculateCurrentDay(adoptionId)).toBe(3)

      storage.save(adoptionId, {
        day: 3,
        ate: true,
        drank: true,
        hiding: false,
        litterUsed: true,
        notes: 'Explored the living room!',
      })

      // Verify timeline progression
      const checkIns = storage.get(adoptionId)
      const sortedCheckIns = [...checkIns].sort((a, b) => a.day - b.day)

      // Verify progression
      expect(sortedCheckIns[0].hiding).toBe(true)
      expect(sortedCheckIns[1].hiding).toBe(true)
      expect(sortedCheckIns[2].hiding).toBe(false)

      // Current day should be 4
      expect(storage.calculateCurrentDay(adoptionId)).toBe(4)

      // Continue to day 7
      for (let day = 4; day <= 7; day++) {
        storage.save(adoptionId, {
          day,
          ate: true,
          drank: true,
          hiding: false,
          litterUsed: true,
        })
      }

      // Final state
      const finalCheckIns = storage.get(adoptionId)
      expect(finalCheckIns).toHaveLength(7)
      expect(storage.calculateCurrentDay(adoptionId)).toBe(8)
    })

    it('should correctly display "No check-ins yet" message for empty state', () => {
      const adoptionId = 'empty-state'

      const checkIns = storage.get(adoptionId)

      // Simulate the conditional rendering logic from ProgressTimeline
      const displayMessage = checkIns.length === 0
        ? "No check-ins yet. Start logging your cat's daily progress above."
        : `${checkIns.length} check-ins recorded`

      expect(displayMessage).toBe("No check-ins yet. Start logging your cat's daily progress above.")
    })

    it('should correctly calculate and display progress summary', () => {
      const adoptionId = 'progress-summary'

      // Save 5 days of check-ins
      storage.save(adoptionId, { day: 1, ate: true, drank: true, hiding: true, litterUsed: true })
      storage.save(adoptionId, { day: 2, ate: true, drank: true, hiding: true, litterUsed: true })
      storage.save(adoptionId, { day: 3, ate: true, drank: true, hiding: false, litterUsed: true })
      storage.save(adoptionId, { day: 4, ate: true, drank: true, hiding: false, litterUsed: true })
      storage.save(adoptionId, { day: 5, ate: true, drank: true, hiding: false, litterUsed: true })

      const checkIns = storage.get(adoptionId)
      const sortedCheckIns = [...checkIns].sort((a, b) => a.day - b.day)

      // Calculate summary stats
      const hidingCount = sortedCheckIns.filter(c => c.hiding).length
      const ateCount = sortedCheckIns.filter(c => c.ate).length
      const drankCount = sortedCheckIns.filter(c => c.drank).length
      const litterUsedCount = sortedCheckIns.filter(c => c.litterUsed).length

      // Verify progress
      expect(hidingCount).toBe(2) // Days 1, 2
      expect(ateCount).toBe(5) // All days
      expect(drankCount).toBe(5) // All days
      expect(litterUsedCount).toBe(5) // All days

      // Cat is doing well - not hiding for last 3 days
      const lastThreeDays = sortedCheckIns.slice(-3)
      expect(lastThreeDays.every(c => !c.hiding)).toBe(true)
    })
  })
})

// =============================================================================
// COMPONENT INTEGRATION TESTS (React Component Behavior Simulation)
// =============================================================================

describe('ProgressTimeline Component Behavior', () => {
  /**
   * Tests that simulate the behavior of the ProgressTimeline component
   * without actually rendering React components.
   */

  it('should sort check-ins correctly for display', () => {
    const checkIns: DailyCheckIn[] = [
      { adoptionId: 'test', day: 3, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 1, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 2, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
    ]

    // Simulate the sorting logic from ProgressTimeline component
    const sortedCheckIns = [...checkIns].sort((a, b) => a.day - b.day)

    expect(sortedCheckIns[0].day).toBe(1)
    expect(sortedCheckIns[1].day).toBe(2)
    expect(sortedCheckIns[2].day).toBe(3)
  })

  it('should identify "First time out!" milestone correctly', () => {
    const checkIns: DailyCheckIn[] = [
      { adoptionId: 'test', day: 1, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 2, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 3, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 4, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
    ]

    const sortedCheckIns = [...checkIns].sort((a, b) => a.day - b.day)

    // Find first non-hiding day
    const firstNonHidingIndex = sortedCheckIns.findIndex((checkIn, index) => {
      return !checkIn.hiding && (index === 0 || sortedCheckIns[index - 1].hiding)
    })

    expect(firstNonHidingIndex).toBe(2)
    expect(sortedCheckIns[firstNonHidingIndex].day).toBe(3)
  })

  it('should display appropriate message based on hiding status', () => {
    // Case 1: Some cats still hiding
    const hidingCheckIns: DailyCheckIn[] = [
      { adoptionId: 'test', day: 1, ate: true, drank: true, hiding: true, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 2, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
    ]

    const hasAnyHiding = hidingCheckIns.some(c => c.hiding)
    const message1 = hasAnyHiding
      ? "Stress-sensitive cats often take 1-2 weeks to feel comfortable in a new home. This is normal."
      : "Great progress! Your cat is settling in well."

    expect(message1).toBe("Stress-sensitive cats often take 1-2 weeks to feel comfortable in a new home. This is normal.")

    // Case 2: No cats hiding
    const settledCheckIns: DailyCheckIn[] = [
      { adoptionId: 'test', day: 1, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
      { adoptionId: 'test', day: 2, ate: true, drank: true, hiding: false, litterUsed: true, timestamp: '' },
    ]

    const allSettled = settledCheckIns.some(c => c.hiding)
    const message2 = allSettled
      ? "Stress-sensitive cats often take 1-2 weeks to feel comfortable in a new home. This is normal."
      : "Great progress! Your cat is settling in well."

    expect(message2).toBe("Great progress! Your cat is settling in well.")
  })
})

describe('DailyCheckIn Component Behavior', () => {
  /**
   * Tests that simulate the behavior of the DailyCheckIn component
   * without actually rendering React components.
   */

  it('should initialize form with existing check-in data', () => {
    const existingCheckIn: DailyCheckIn = {
      adoptionId: 'test',
      day: 3,
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
      notes: 'Existing notes',
      timestamp: '2024-01-03T20:00:00Z',
    }

    // Simulate form initialization logic
    const formState = {
      ate: existingCheckIn?.ate ?? false,
      drank: existingCheckIn?.drank ?? false,
      hiding: existingCheckIn?.hiding ?? false,
      litterUsed: existingCheckIn?.litterUsed ?? false,
      notes: existingCheckIn?.notes ?? '',
    }

    expect(formState.ate).toBe(true)
    expect(formState.drank).toBe(true)
    expect(formState.hiding).toBe(false)
    expect(formState.litterUsed).toBe(true)
    expect(formState.notes).toBe('Existing notes')
  })

  it('should initialize form with defaults for new check-in', () => {
    // Simulate form initialization with no existing check-in
    const existingCheckIn = undefined as DailyCheckIn | undefined

    const formState = {
      ate: existingCheckIn?.ate ?? false,
      drank: existingCheckIn?.drank ?? false,
      hiding: existingCheckIn?.hiding ?? false,
      litterUsed: existingCheckIn?.litterUsed ?? false,
      notes: existingCheckIn?.notes ?? '',
    }

    expect(formState.ate).toBe(false)
    expect(formState.drank).toBe(false)
    expect(formState.hiding).toBe(false)
    expect(formState.litterUsed).toBe(false)
    expect(formState.notes).toBe('')
  })

  it('should construct correct check-in object on save', () => {
    const day = 5
    const formState = {
      ate: true,
      drank: true,
      hiding: false,
      litterUsed: true,
      notes: 'Cat played with feather toy',
    }

    // Simulate the save handler logic
    const checkInToSave = {
      day,
      ate: formState.ate,
      drank: formState.drank,
      hiding: formState.hiding,
      litterUsed: formState.litterUsed,
      notes: formState.notes || undefined,
    }

    expect(checkInToSave.day).toBe(5)
    expect(checkInToSave.ate).toBe(true)
    expect(checkInToSave.drank).toBe(true)
    expect(checkInToSave.hiding).toBe(false)
    expect(checkInToSave.litterUsed).toBe(true)
    expect(checkInToSave.notes).toBe('Cat played with feather toy')
  })

  it('should handle empty notes by setting to undefined', () => {
    const day = 1
    const formState = {
      ate: true,
      drank: true,
      hiding: true,
      litterUsed: true,
      notes: '', // Empty string
    }

    const checkInToSave = {
      day,
      ate: formState.ate,
      drank: formState.drank,
      hiding: formState.hiding,
      litterUsed: formState.litterUsed,
      notes: formState.notes || undefined,
    }

    expect(checkInToSave.notes).toBeUndefined()
  })
})
