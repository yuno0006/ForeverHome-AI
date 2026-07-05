/**
 * Seeded pseudo-random number generator (mulberry32).
 *
 * No React, no DOM, no `window` — importable and testable in plain
 * Node/Vitest, exactly like `compatibilityEngine.ts`. Used exclusively by
 * obstacle spawning so that, given a fixed seed and fixed sequence of
 * `deltaMs` values, an entire run is perfectly reproducible — required for
 * deterministic property-based tests of spawn timing/collision without
 * flakiness.
 */

/** A deterministic PRNG function. Returns a float in [0, 1) on each call. */
export type Rng = () => number;

/**
 * Creates a deterministic PRNG using the mulberry32 algorithm.
 *
 * The same seed always produces the same output sequence. Each call to the
 * returned function advances the internal state and returns the next float
 * in [0, 1).
 */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  return function rng(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
