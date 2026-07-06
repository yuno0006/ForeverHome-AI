/**
 * Tests for `gameEngine.ts`.
 *
 * Property-based tests (fast-check, ≥100 runs each, tag format
 * `Feature: whisker-runner-game, Property {N}: {title}`) cover the pure
 * gameplay logic's correctness properties from design.md. Unit tests cover
 * the documented example scenarios from design.md's "Unit Tests" section.
 *
 * See .kiro/specs/whisker-runner-game/design.md ("Correctness Properties",
 * "Testing Strategy") for the full behavioral spec each test validates.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  createInitialState,
  stepGame,
  requestJump,
  setDucking,
  checkCollision,
  computeScore,
} from "./gameEngine";
import {
  BASE_SPEED,
  MAX_SPEED,
  SPEED_RAMP_PER_SEC,
  GRAVITY,
  JUMP_VELOCITY,
  STAND_HEIGHT,
  DUCK_HEIGHT,
  CAT_X,
  CAT_WIDTH,
  GameState,
  GameStatus,
  InputState,
  Obstacle,
  ObstacleType,
} from "@/types/whiskerRunner";

// =============================================================================
// SHARED ARBITRARIES
// =============================================================================

const finiteDouble = (min: number, max: number) =>
  fc.double({ min, max, noNaN: true, noDefaultInfinity: true });

const arbitraryDeltaMs = finiteDouble(0, 5000);
const arbitraryInput: fc.Arbitrary<InputState> = fc.record({
  jumpPressed: fc.boolean(),
  isDucking: fc.boolean(),
});

const obstacleShape = fc.record({
  type: fc.constantFrom<ObstacleType>("ground", "air"),
  x: finiteDouble(-100, 2000),
  width: finiteDouble(1, 100),
  y: finiteDouble(0, 200),
  height: finiteDouble(1, 100),
});

/** Obstacles with unique, stable ids so id-based matching in tests is unambiguous. */
const arbitraryObstacles: fc.Arbitrary<Obstacle[]> = fc
  .array(obstacleShape, { maxLength: 6 })
  .map((shapes) => shapes.map((shape, index) => ({ id: `obstacle-${index}`, ...shape })));

/**
 * Builds an arbitrary, internally-consistent `GameState` for a given status
 * arbitrary. "Consistent" means `score === computeScore(distance)` and
 * `speed` matches the documented speed-ramp formula for `elapsedMs` — the
 * invariants every state actually produced by `stepGame` maintains (see
 * design.md's "Loop Invariants"). Generating states this way (rather than
 * fully independent random fields) is what makes properties like #4 (speed
 * is non-decreasing) meaningful to test against arbitrary *valid* states.
 */
function arbitraryGameState(statusArb: fc.Arbitrary<GameStatus>): fc.Arbitrary<GameState> {
  return fc
    .tuple(
      statusArb,
      finiteDouble(0, 120_000), // elapsedMs
      finiteDouble(0, 100_000), // distance
      finiteDouble(0, 500), // catY
      finiteDouble(-3000, 3000), // catVelocityY
      fc.boolean(), // isDucking
      arbitraryObstacles,
      fc.integer({ min: 0, max: 0xffffffff }), // rngSeed
      finiteDouble(0, 100_000), // nextSpawnDistance
      finiteDouble(0, 1_000_000) // bestScore
    )
    .map(
      ([
        status,
        elapsedMs,
        distance,
        catY,
        catVelocityY,
        isDucking,
        obstacles,
        rngSeed,
        nextSpawnDistance,
        bestScore,
      ]): GameState => ({
        status,
        elapsedMs,
        distance,
        score: computeScore(distance),
        bestScore,
        speed: Math.min(MAX_SPEED, BASE_SPEED + (SPEED_RAMP_PER_SEC * elapsedMs) / 1000),
        catY,
        catVelocityY,
        isDucking,
        obstacles,
        rngSeed,
        nextSpawnDistance,
      })
    );
}

const arbitraryRunningGameState = arbitraryGameState(fc.constant<GameStatus>("running"));
const arbitraryAnyStatusGameState = arbitraryGameState(
  fc.constantFrom<GameStatus>("idle", "running", "ended")
);
const arbitraryNonRunningGameState = arbitraryGameState(fc.constantFrom<GameStatus>("idle", "ended"));

// =============================================================================
// PROPERTY 1: Non-decreasing distance and score
// =============================================================================

describe("Property 1: Non-decreasing distance and score", () => {
  /**
   * **Validates: Requirements 3.1**
   *
   * For any valid running GameState and any non-negative deltaMs,
   * stepGame's result distance/score are >= the input's.
   */
  it("stepGame never decreases distance or score [Feature: whisker-runner-game, Property 1: Non-decreasing distance and score]", () => {
    fc.assert(
      fc.property(arbitraryRunningGameState, arbitraryDeltaMs, arbitraryInput, (state, deltaMs, input) => {
        const result = stepGame(state, deltaMs, input);
        expect(result.distance).toBeGreaterThanOrEqual(state.distance);
        expect(result.score).toBeGreaterThanOrEqual(state.score);
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 2: Score is a pure function of distance
// =============================================================================

describe("Property 2: Score is a pure function of distance", () => {
  /**
   * **Validates: Requirements 3.1**
   *
   * After any stepGame call, result.score === computeScore(result.distance).
   */
  it("stepGame's result score always equals computeScore(result.distance) [Feature: whisker-runner-game, Property 2: Score is a pure function of distance]", () => {
    fc.assert(
      fc.property(arbitraryRunningGameState, arbitraryDeltaMs, arbitraryInput, (state, deltaMs, input) => {
        const result = stepGame(state, deltaMs, input);
        expect(result.score).toBe(computeScore(result.distance));
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 3: Cat never goes below ground
// =============================================================================

describe("Property 3: Cat never goes below ground", () => {
  /**
   * **Validates: Requirements 2.4**
   *
   * For any sequence of stepGame calls starting from createInitialState,
   * catY is >= 0 in every resulting state.
   */
  it("catY stays >= 0 across any sequence of stepGame calls [Feature: whisker-runner-game, Property 3: Cat never goes below ground]", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.array(fc.tuple(arbitraryDeltaMs, arbitraryInput), { minLength: 1, maxLength: 60 }),
        (seed, frames) => {
          let state: GameState = { ...createInitialState(0, seed), status: "running" };

          for (const [deltaMs, input] of frames) {
            state = stepGame(state, deltaMs, input);
            expect(state.catY).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 4: Speed is non-decreasing and bounded
// =============================================================================

describe("Property 4: Speed is non-decreasing and bounded", () => {
  /**
   * **Validates: Requirements 2.7**
   *
   * Across a sequence of stepGame calls, speed is monotonic non-decreasing
   * and never exceeds MAX_SPEED.
   */
  it("speed is monotonic non-decreasing and capped at MAX_SPEED [Feature: whisker-runner-game, Property 4: Speed is non-decreasing and bounded]", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.array(fc.tuple(arbitraryDeltaMs, arbitraryInput), { minLength: 1, maxLength: 60 }),
        (seed, frames) => {
          let state: GameState = { ...createInitialState(0, seed), status: "running" };
          let previousSpeed = state.speed;

          for (const [deltaMs, input] of frames) {
            state = stepGame(state, deltaMs, input);
            expect(state.speed).toBeGreaterThanOrEqual(previousSpeed);
            expect(state.speed).toBeLessThanOrEqual(MAX_SPEED);
            previousSpeed = state.speed;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 5: Jump only affects grounded, non-ducking cats
// =============================================================================

describe("Property 5: Jump only affects grounded, non-ducking cats", () => {
  /**
   * **Validates: Requirements 2.5**
   *
   * For any GameState where catY > 0 (airborne) or isDucking === true,
   * requestJump leaves catVelocityY unchanged.
   */
  it("requestJump leaves catVelocityY unchanged when airborne or ducking [Feature: whisker-runner-game, Property 5: Jump only affects grounded, non-ducking cats]", () => {
    fc.assert(
      fc.property(
        arbitraryAnyStatusGameState.filter((state) => state.catY > 0 || state.isDucking),
        (state) => {
          const result = requestJump(state);
          expect(result.catVelocityY).toBe(state.catVelocityY);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 6: Jump is a no-op when not running
// =============================================================================

describe("Property 6: Jump is a no-op when not running", () => {
  /**
   * **Validates: Requirements 2.5**
   *
   * For any GameState with status !== "running", requestJump returns the
   * input state unchanged.
   */
  it("requestJump returns the state unchanged when status is not 'running' [Feature: whisker-runner-game, Property 6: Jump is a no-op when not running]", () => {
    fc.assert(
      fc.property(arbitraryNonRunningGameState, (state) => {
        const result = requestJump(state);
        expect(result).toBe(state);
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 7: Obstacle pruning invariant
// =============================================================================

describe("Property 7: Obstacle pruning invariant", () => {
  /**
   * **Validates: Requirements 2.6**
   *
   * After stepGame, no obstacle has x + width < 0.
   */
  it("no resulting obstacle satisfies x + width < 0 [Feature: whisker-runner-game, Property 7: Obstacle pruning invariant]", () => {
    fc.assert(
      fc.property(arbitraryRunningGameState, arbitraryDeltaMs, arbitraryInput, (state, deltaMs, input) => {
        const result = stepGame(state, deltaMs, input);
        for (const obstacle of result.obstacles) {
          expect(obstacle.x + obstacle.width).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 8: Obstacles only move leftward
// =============================================================================

describe("Property 8: Obstacles only move leftward", () => {
  /**
   * **Validates: Requirements 2.1, 2.6**
   *
   * For any obstacle present in both input and output of a stepGame call
   * (matched by id), the output obstacle's x is strictly less than the
   * input obstacle's x.
   *
   * deltaMs is generated strictly > 0 here: with deltaMs === 0 no world
   * time passes, so scroll distance is exactly 0 and x is unchanged rather
   * than strictly decreasing. The property (and design.md's "all obstacles
   * scroll left" postcondition) describes motion across an elapsed frame,
   * which presupposes a non-zero time step.
   */
  it("every matched obstacle's x strictly decreases [Feature: whisker-runner-game, Property 8: Obstacles only move leftward]", () => {
    fc.assert(
      fc.property(
        arbitraryRunningGameState,
        finiteDouble(1, 5000),
        arbitraryInput,
        (state, deltaMs, input) => {
          const result = stepGame(state, deltaMs, input);
          const inputById = new Map(state.obstacles.map((o) => [o.id, o]));

          for (const outputObstacle of result.obstacles) {
            const inputObstacle = inputById.get(outputObstacle.id);
            if (inputObstacle) {
              expect(outputObstacle.x).toBeLessThan(inputObstacle.x);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 9: Collision determinism
// =============================================================================

describe("Property 9: Collision determinism", () => {
  /**
   * **Validates: Requirements 2.8**
   *
   * checkCollision called twice on the same state returns the same result.
   */
  it("checkCollision is deterministic for a fixed state [Feature: whisker-runner-game, Property 9: Collision determinism]", () => {
    fc.assert(
      fc.property(arbitraryAnyStatusGameState, (state) => {
        expect(checkCollision(state)).toBe(checkCollision(state));
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 10: Ducking reduces hurtbox height
// =============================================================================

// Cat hurtbox inset constants mirror gameEngine's collision zone tightening.
// When these change the test geometry must also adapt or the
// duck-clearing scenario will generate obstacles that fall outside the
// standing cat's effective collision band.
// Mirror gameEngine's hurtbox tightening constants.
const CAT_HURTBOX_INSET_Y_TEST = 6;  // px, same as CAT_HURTBOX_INSET_Y
const OBSTACLE_HURTBOX_INSET_Y_RATIO_TEST = 0.30; // same as OBSTACLE_HURTBOX_INSET_Y_RATIO
const CAT_HURTBOX_INSET_X_TEST = 8; // px, same as CAT_HURTBOX_INSET_X

/**
 * Generates `catY` + air-obstacle geometry where the obstacle's collision
 * zone (after obstacle vertical insets) sits strictly above the ducking
 * cat's collision ceiling and strictly overlaps the standing cat's band.
 *
 * With CAT_HURTBOX_INSET_Y = 6, STAND_HEIGHT = 100, DUCK_HEIGHT = 50:
 *   - Ducking collision: [catY+6, catY+44]
 *   - Standing collision: [catY+6, catY+94]
 *   - Obstacle's effective y-range must be entirely in (catY+44, catY+94]
 *
 * A safety margin of 4px ensures the fuzzed values never graze the boundary.
 */
const arbitraryDuckClearingScenario = fc
  .tuple(
    finiteDouble(0, 100),  // catY
    finiteDouble(0, 1),    // r1: vertical position fraction
    finiteDouble(0, 1),    // r2: obstacle height fraction
    finiteDouble(8, 50)    // width (min 8 so 35% inset doesn't collapse to 0)
  )
  .map(([catY, r1, r2, width]) => {
    const standingTop = catY + STAND_HEIGHT - CAT_HURTBOX_INSET_Y_TEST; // catY + 92
    const duckingTop  = catY + DUCK_HEIGHT  - CAT_HURTBOX_INSET_Y_TEST; // catY + 42
    const bandH = standingTop - duckingTop; // 50

    // After 25% inset on both sides the effective height is rawHeight*0.5.
    // We want it to fit in bandH with 4px margin:
    const maxH = (bandH - 4) / (1 - 2 * OBSTACLE_HURTBOX_INSET_Y_RATIO_TEST); // 46/0.5=92
    const rawH = 8 + r2 * Math.max(maxH - 8, 1);

    const insetBot = rawH * OBSTACLE_HURTBOX_INSET_Y_RATIO_TEST;

    // ySafeMin + insetBot > duckingTop  =>  ySafeMin = duckingTop - insetBot + 2
    // y + (rawH - insetBot) < standingTop => y < standingTop - (rawH - insetBot) - 2
    const yMin = duckingTop - insetBot + 2;
    const yMax = standingTop - (rawH - insetBot) - 2;
    const y = yMin + r1 * Math.max(yMax - yMin, 1);

    // Center obstacle horizontally on the cat's *collision* hurtbox so
    // we always overlap in x regardless of insets.
    const catCx = CAT_X + CAT_HURTBOX_INSET_X_TEST + (CAT_WIDTH - 2 * CAT_HURTBOX_INSET_X_TEST) / 2;
    // Obstacle inset collision center = x + insetX + (width - 2*insetX)/2 = x + width/2
    // Set x + width/2 = catCx => x = catCx - width/2
    const x = catCx - width / 2;

    return { catY, y, height: rawH, x, width };
  });

describe("Property 10: Ducking reduces hurtbox height", () => {
  /**
   * **Validates: Requirements 2.3, 2.8**
   *
   * For a state + an air obstacle overlapping a standing cat, setDucking(true)
   * causes checkCollision to no longer report a collision (when the reduced
   * hurtbox no longer overlaps).
   */
  it("setDucking(true) clears an air obstacle a standing cat would collide with [Feature: whisker-runner-game, Property 10: Ducking reduces hurtbox height]", () => {
    fc.assert(
      fc.property(arbitraryDuckClearingScenario, ({ catY, y, height, x, width }) => {
        const baseState: GameState = {
          status: "running",
          elapsedMs: 0,
          distance: 0,
          score: 0,
          bestScore: 0,
          speed: BASE_SPEED,
          catY,
          catVelocityY: 0,
          isDucking: false,
          obstacles: [{ id: "air-1", type: "air", x, width, y, height }],
          rngSeed: 1,
          nextSpawnDistance: 1_000_000,
        };

        // Sanity: by construction, a standing cat collides with this obstacle.
        expect(checkCollision(baseState)).toBe(true);

        const duckedState = setDucking(baseState, true);
        expect(checkCollision(duckedState)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 13: Restart preserves best score, resets everything else
// =============================================================================

describe("Property 13: Restart preserves best score, resets everything else", () => {
  /**
   * **Validates: Requirements 4.4**
   *
   * For any GameState with an arbitrary bestScore, createInitialState(bestScore)
   * produces a state with status "idle", distance 0, score 0, no obstacles,
   * and bestScore equal to the value passed in.
   */
  it("createInitialState resets everything but carries over bestScore [Feature: whisker-runner-game, Property 13: Restart preserves best score, resets everything else]", () => {
    fc.assert(
      fc.property(finiteDouble(0, 1_000_000), (bestScore) => {
        const state = createInitialState(bestScore);
        expect(state.status).toBe("idle");
        expect(state.distance).toBe(0);
        expect(state.score).toBe(0);
        expect(state.obstacles.length).toBe(0);
        expect(state.bestScore).toBe(bestScore);
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 14: No NaN/Infinity leakage
// =============================================================================

type Action =
  | { kind: "step"; deltaMs: number; input: InputState }
  | { kind: "jump" }
  | { kind: "duck"; ducking: boolean };

const arbitraryAction: fc.Arbitrary<Action> = fc.oneof(
  fc.record({
    kind: fc.constant<"step">("step"),
    deltaMs: arbitraryDeltaMs,
    input: arbitraryInput,
  }),
  fc.record({ kind: fc.constant<"jump">("jump") }),
  fc.record({ kind: fc.constant<"duck">("duck"), ducking: fc.boolean() })
);

describe("Property 14: No NaN/Infinity leakage", () => {
  /**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
   *
   * For any sequence of stepGame/requestJump/setDucking calls, every
   * numeric field of the result is finite.
   */
  it("every numeric GameState field stays finite across any sequence of calls [Feature: whisker-runner-game, Property 14: No NaN/Infinity leakage]", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.array(arbitraryAction, { minLength: 1, maxLength: 60 }),
        (seed, actions) => {
          let state: GameState = { ...createInitialState(0, seed), status: "running" };

          for (const action of actions) {
            if (action.kind === "step") {
              state = stepGame(state, action.deltaMs, action.input);
            } else if (action.kind === "jump") {
              state = requestJump(state);
            } else {
              state = setDucking(state, action.ducking);
            }

            expect(Number.isFinite(state.distance)).toBe(true);
            expect(Number.isFinite(state.score)).toBe(true);
            expect(Number.isFinite(state.speed)).toBe(true);
            expect(Number.isFinite(state.catY)).toBe(true);
            expect(Number.isFinite(state.catVelocityY)).toBe(true);
            expect(Number.isFinite(state.elapsedMs)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 15: Deterministic replay
// =============================================================================

describe("Property 15: Deterministic replay", () => {
  /**
   * **Validates: Requirements 7.3**
   *
   * For a fixed seed and fixed sequence of (deltaMs, input) pairs,
   * replaying through createInitialState(bestScore, seed) + the same calls
   * produces an identical final GameState.
   */
  it("replaying the same seed and frame sequence twice yields an identical final state [Feature: whisker-runner-game, Property 15: Deterministic replay]", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffffff }),
        finiteDouble(0, 1_000_000),
        fc.array(fc.tuple(arbitraryDeltaMs, arbitraryInput), { minLength: 1, maxLength: 60 }),
        (seed, bestScore, frames) => {
          const replay = (): GameState => {
            let state: GameState = { ...createInitialState(bestScore, seed), status: "running" };
            for (const [deltaMs, input] of frames) {
              state = stepGame(state, deltaMs, input);
            }
            return state;
          };

          const resultA = replay();
          const resultB = replay();
          expect(resultA).toEqual(resultB);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// PROPERTY 16: Duck is a no-op when not running
// =============================================================================

describe("Property 16: Duck is a no-op when not running", () => {
  /**
   * **Validates: Requirements 2.11**
   *
   * For any GameState with status !== "running", setDucking returns the
   * input state unchanged.
   */
  it("setDucking returns the state unchanged when status is not 'running' [Feature: whisker-runner-game, Property 16: Duck is a no-op when not running]", () => {
    fc.assert(
      fc.property(arbitraryNonRunningGameState, fc.boolean(), (state, ducking) => {
        const result = setDucking(state, ducking);
        expect(result).toBe(state);
      }),
      { numRuns: 100 }
    );
  });
});

// =============================================================================
// UNIT TESTS (example-based, task 7.3)
// =============================================================================

describe("createInitialState (unit tests)", () => {
  it("returns the documented defaults: idle status, zeroed distance/score/obstacles, carried-over bestScore", () => {
    const state = createInitialState(42, 1234);

    expect(state.status).toBe("idle");
    expect(state.distance).toBe(0);
    expect(state.score).toBe(0);
    expect(state.elapsedMs).toBe(0);
    expect(state.obstacles).toEqual([]);
    expect(state.bestScore).toBe(42);
    expect(state.speed).toBe(BASE_SPEED);
    expect(state.catY).toBe(0);
    expect(state.catVelocityY).toBe(0);
    expect(state.isDucking).toBe(false);
  });
});

describe("stepGame no-op on non-running status (unit tests)", () => {
  it("returns the state unchanged when status is 'idle'", () => {
    const state = createInitialState(0, 1);
    const result = stepGame(state, 16, { jumpPressed: false, isDucking: false });
    expect(result).toBe(state);
  });

  it("returns the state unchanged when status is 'ended'", () => {
    const state: GameState = { ...createInitialState(0, 1), status: "ended" };
    const result = stepGame(state, 16, { jumpPressed: true, isDucking: true });
    expect(result).toBe(state);
  });
});

describe("Fixed jump scenario clears a fixed-position ground obstacle (unit test)", () => {
  it("jumping over a ground obstacle avoids a collision at the moment their x-ranges overlap", () => {
    // Ground obstacle placed far enough ahead of the cat's fixed hurtbox
    // that, by the time its x-range reaches the cat, the jump (peaking at
    // ~117px around t=300ms) has already lifted the cat's feet above the
    // obstacle's height (36px) — matching how a player times a jump ahead
    // of an oncoming obstacle rather than jumping the instant it arrives.
    const obstacle: Obstacle = {
      id: "ground-1",
      type: "ground",
      x: CAT_X + CAT_WIDTH + 60,
      width: 30,
      y: 0,
      height: 36,
    };

    let state: GameState = {
      status: "running",
      elapsedMs: 0,
      distance: 0,
      score: 0,
      bestScore: 0,
      speed: BASE_SPEED,
      catY: 0,
      catVelocityY: 0,
      isDucking: false,
      obstacles: [obstacle],
      rngSeed: 1,
      nextSpawnDistance: 1_000_000, // far away — no new spawns during this scenario
    };

    // Jump well before the obstacle reaches the cat.
    state = requestJump(state);
    expect(state.catVelocityY).toBe(JUMP_VELOCITY);

    const noInput: InputState = { jumpPressed: false, isDucking: false };

    // Step forward in small increments until the obstacle's x-range first
    // overlaps the cat's x-range, asserting no collision at that moment
    // (the cat should be airborne, clearing the ground obstacle).
    let overlapChecked = false;
    for (let i = 0; i < 200 && !overlapChecked; i++) {
      state = stepGame(state, 16, noInput);
      const obstacleNow = state.obstacles.find((o) => o.id === "ground-1");
      if (!obstacleNow) break;

      const overlapsX = obstacleNow.x < CAT_X + CAT_WIDTH && obstacleNow.x + obstacleNow.width > CAT_X;
      if (overlapsX) {
        overlapChecked = true;
        expect(checkCollision(state)).toBe(false);
      }
    }

    expect(overlapChecked).toBe(true);
  });
});

describe("Fixed duck scenario clears a fixed-position air obstacle (unit test)", () => {
  it("ducking under an air obstacle avoids a collision while the duck is held", () => {
    // Air obstacle positioned in the DUCK_HEIGHT..STAND_HEIGHT band, at
    // ground level (catY = 0), so it overlaps a standing cat but not a
    // ducking one.
    const obstacle: Obstacle = {
      id: "air-1",
      type: "air",
      x: CAT_X + CAT_WIDTH + 10,
      width: 30,
      y: DUCK_HEIGHT + 4,
      height: 16,
    };

    let state: GameState = {
      status: "running",
      elapsedMs: 0,
      distance: 0,
      score: 0,
      bestScore: 0,
      speed: BASE_SPEED,
      catY: 0,
      catVelocityY: 0,
      isDucking: false,
      obstacles: [obstacle],
      rngSeed: 1,
      nextSpawnDistance: 1_000_000,
    };

    state = setDucking(state, true);
    expect(state.isDucking).toBe(true);

    const duckInput: InputState = { jumpPressed: false, isDucking: true };

    let overlapChecked = false;
    for (let i = 0; i < 200; i++) {
      state = stepGame(state, 16, duckInput);
      const obstacleNow = state.obstacles.find((o) => o.id === "air-1");
      if (!obstacleNow) break;

      const overlapsX = obstacleNow.x < CAT_X + CAT_WIDTH && obstacleNow.x + obstacleNow.width > CAT_X;
      if (overlapsX) {
        overlapChecked = true;
        expect(checkCollision(state)).toBe(false);
      }
    }

    expect(overlapChecked).toBe(true);
  });
});

describe("Fixed 'do nothing' scenario against a ground obstacle collides (unit test)", () => {
  it("with no jump/duck input, the cat collides with a ground obstacle once their x-ranges overlap", () => {
    const obstacle: Obstacle = {
      id: "ground-1",
      type: "ground",
      x: CAT_X + CAT_WIDTH + 10,
      width: 30,
      y: 0,
      height: 36,
    };

    let state: GameState = {
      status: "running",
      elapsedMs: 0,
      distance: 0,
      score: 0,
      bestScore: 0,
      speed: BASE_SPEED,
      catY: 0,
      catVelocityY: 0,
      isDucking: false,
      obstacles: [obstacle],
      rngSeed: 1,
      nextSpawnDistance: 1_000_000,
    };

    const noInput: InputState = { jumpPressed: false, isDucking: false };

    let collided = false;
    for (let i = 0; i < 200; i++) {
      state = stepGame(state, 16, noInput);
      const obstacleNow = state.obstacles.find((o) => o.id === "ground-1");
      if (!obstacleNow) break;

      if (checkCollision(state)) {
        collided = true;
        break;
      }
    }

    expect(collided).toBe(true);
  });
});
