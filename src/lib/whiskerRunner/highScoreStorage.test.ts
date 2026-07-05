/**
 * Tests for `highScoreStorage.ts`.
 *
 * Property 11: Best score never decreases (validates 3.2, 3.4)
 * Property 12: New-high-score flag correctness (validates 3.3, 4.3, 4.6)
 * Unit tests (task 9.4): localStorage round-trip and graceful degradation.
 *
 * `highScoreStorage.ts` keeps a module-level `inMemoryBestScore` variable
 * that persists for the lifetime of the module import. To keep each test
 * case isolated we clear `localStorage` AND call `vi.resetModules()` +
 * dynamically re-import the module before every test, so both the
 * persisted value and the in-memory fallback start fresh.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import type { getBestScore as GetBestScoreFn, setBestScoreIfHigher as SetBestScoreIfHigherFn } from "./highScoreStorage";

const STORAGE_KEY = "whiskerRunner:bestScore";

/** Re-imports a fresh copy of the module (resets its module-level state). */
async function freshModule(): Promise<{
  getBestScore: typeof GetBestScoreFn;
  setBestScoreIfHigher: typeof SetBestScoreIfHigherFn;
}> {
  vi.resetModules();
  return await import("./highScoreStorage");
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Property 11: Best score never decreases", () => {
  /**
   * **Validates: Requirements 3.2, 3.4**
   *
   * For any sequence of calls to `setBestScoreIfHigher` with arbitrary
   * non-negative finite scores, `getBestScore()` after each call is >= its
   * value before the call, and equals the max score ever passed.
   */
  it("never decreases across any sequence of scores, and equals the max score ever passed", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.double({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }), {
          minLength: 1,
          maxLength: 30,
        }),
        async (scores) => {
          window.localStorage.clear();
          const { getBestScore, setBestScoreIfHigher } = await freshModule();

          let maxSoFar = 0;
          for (const score of scores) {
            const before = getBestScore();
            setBestScoreIfHigher(score);
            const after = getBestScore();

            expect(after).toBeGreaterThanOrEqual(before);

            maxSoFar = Math.max(maxSoFar, score);
            expect(after).toBe(maxSoFar);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 12: New-high-score flag correctness", () => {
  /**
   * **Validates: Requirements 3.3, 4.3, 4.6**
   *
   * For any call to `setBestScoreIfHigher(score)`, `isNewHighScore` is
   * `true` if and only if `score` is strictly greater than the best score
   * persisted immediately before the call.
   */
  it("isNewHighScore is true iff score is strictly greater than the pre-call best", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.double({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }), {
          minLength: 1,
          maxLength: 30,
        }),
        async (scores) => {
          window.localStorage.clear();
          const { getBestScore, setBestScoreIfHigher } = await freshModule();

          for (const score of scores) {
            const bestBefore = getBestScore();
            const { isNewHighScore } = setBestScoreIfHigher(score);

            expect(isNewHighScore).toBe(score > bestBefore);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns isNewHighScore=false and does not change the best when score equals the current best", async () => {
    const { getBestScore, setBestScoreIfHigher } = await freshModule();

    setBestScoreIfHigher(50);
    const { best, isNewHighScore } = setBestScoreIfHigher(50);

    expect(isNewHighScore).toBe(false);
    expect(best).toBe(50);
    expect(getBestScore()).toBe(50);
  });
});

describe("localStorage round-trip and graceful degradation (unit tests)", () => {
  it("round-trips a value through localStorage across simulated sessions (module reset)", async () => {
    const session1 = await freshModule();
    const { best, isNewHighScore } = session1.setBestScoreIfHigher(77);
    expect(best).toBe(77);
    expect(isNewHighScore).toBe(true);

    // The value should now be persisted in localStorage itself.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("77");

    // Simulate a new "session" by resetting the module (clears the
    // in-memory fallback) but leaving localStorage intact.
    const session2 = await freshModule();
    expect(session2.getBestScore()).toBe(77);
  });

  it("never throws and keeps working via the in-memory fallback when localStorage.getItem throws", async () => {
    const { getBestScore, setBestScoreIfHigher } = await freshModule();

    const getItemSpy = vi.spyOn(window.localStorage.__proto__, "getItem").mockImplementation(() => {
      throw new Error("simulated localStorage failure");
    });

    try {
      expect(() => getBestScore()).not.toThrow();
      expect(getBestScore()).toBe(0);

      let result: { best: number; isNewHighScore: boolean } | undefined;
      expect(() => {
        result = setBestScoreIfHigher(30);
      }).not.toThrow();
      expect(result!.best).toBe(30);
      expect(result!.isNewHighScore).toBe(true);

      // In-memory fallback continues to track the best score even though
      // localStorage reads are broken.
      expect(getBestScore()).toBe(30);
    } finally {
      getItemSpy.mockRestore();
    }
  });

  it("never throws and keeps working via the in-memory fallback when localStorage.setItem throws", async () => {
    const { getBestScore, setBestScoreIfHigher } = await freshModule();

    const setItemSpy = vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new Error("simulated localStorage failure");
    });

    try {
      let result: { best: number; isNewHighScore: boolean } | undefined;
      expect(() => {
        result = setBestScoreIfHigher(45);
      }).not.toThrow();
      expect(result!.best).toBe(45);
      expect(result!.isNewHighScore).toBe(true);

      // Nothing was actually persisted to localStorage...
      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

      // ...but the in-memory fallback still reports the correct best score
      // for the remainder of this session.
      expect(getBestScore()).toBe(45);

      // Subsequent calls keep working without throwing.
      expect(() => setBestScoreIfHigher(60)).not.toThrow();
      expect(getBestScore()).toBe(60);
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it("treats a corrupted/non-numeric stored value as 0", async () => {
    window.localStorage.setItem(STORAGE_KEY, "not-a-number");
    const { getBestScore } = await freshModule();

    expect(getBestScore()).toBe(0);
  });
});
