/**
 * Unit tests for the seeded PRNG (`rng.ts`).
 *
 * Verifies:
 * - `createRng(seed)` always returns numbers in `[0, 1)` across many calls.
 * - The same seed always produces the same output sequence (determinism).
 *
 * _Requirements: 7.3_
 */

import { describe, it, expect } from "vitest";
import { createRng } from "./rng";

describe("createRng", () => {
  it("returns numbers in [0, 1) across many calls, for many seeds", () => {
    const seeds = [0, 1, 2, 42, 1000, 123456, 2 ** 31, 2 ** 32 - 1, -1, -42];

    for (const seed of seeds) {
      const rng = createRng(seed);
      for (let i = 0; i < 1000; i++) {
        const value = rng();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
        expect(Number.isFinite(value)).toBe(true);
        expect(Number.isNaN(value)).toBe(false);
      }
    }
  });

  it("produces the same output sequence for the same seed", () => {
    const seeds = [0, 1, 42, 987654321, -5];

    for (const seed of seeds) {
      const rngA = createRng(seed);
      const rngB = createRng(seed);

      const sequenceA = Array.from({ length: 50 }, () => rngA());
      const sequenceB = Array.from({ length: 50 }, () => rngB());

      expect(sequenceA).toEqual(sequenceB);
    }
  });

  it("produces different output sequences for different seeds", () => {
    const rngA = createRng(1);
    const rngB = createRng(2);

    const sequenceA = Array.from({ length: 10 }, () => rngA());
    const sequenceB = Array.from({ length: 10 }, () => rngB());

    expect(sequenceA).not.toEqual(sequenceB);
  });

  it("advances internal state on each call (consecutive calls differ)", () => {
    const rng = createRng(7);
    const first = rng();
    const second = rng();

    expect(first).not.toBe(second);
  });
});
