/**
 * Pure gameplay logic for the Whisker Runner mini-game.
 *
 * No React, no DOM, no `window` — importable and testable in plain
 * Node/Vitest, mirroring the existing `compatibilityEngine.ts` pattern used
 * elsewhere in this codebase. All state transitions are expressed as pure
 * functions of `GameState` so a Run can be property-tested deterministically.
 *
 * See .kiro/specs/whisker-runner-game/design.md ("gameEngine (pure logic
 * module)" and "Algorithmic Pseudocode & Key Functions with Formal
 * Specifications") for the full behavioral spec.
 */

import {
  BASE_SPEED,
  CAT_WIDTH,
  CAT_X,
  DUCK_HEIGHT,
  GRAVITY,
  InputState,
  JUMP_VELOCITY,
  MAX_DELTA_MS,
  MAX_SPAWN_GAP,
  MAX_SPEED,
  MIN_SPAWN_GAP,
  Obstacle,
  ObstacleType,
  SCORE_PER_WORLD_UNIT,
  SPEED_RAMP_PER_SEC,
  STAND_HEIGHT,
  GameState,
} from "@/types/whiskerRunner";
import { createRng } from "@/lib/whiskerRunner/rng";

// Ground obstacle sizing (vacuum cleaner / laundry basket / broom): low
// enough that jumping clears them, but tall enough (and at `y = 0`) that
// they still overlap a grounded cat's hurtbox.
const GROUND_OBSTACLE_MIN_WIDTH = 24; // px
const GROUND_OBSTACLE_MAX_WIDTH = 32; // px
const GROUND_OBSTACLE_MIN_HEIGHT = 32; // px
const GROUND_OBSTACLE_MAX_HEIGHT = 40; // px

// Air obstacle sizing (hanging string / bird toy): `y` is fixed just above
// `DUCK_HEIGHT` so the obstacle's box always sits inside the
// `(DUCK_HEIGHT, STAND_HEIGHT)` band — it overlaps a standing cat's hurtbox
// (`[0, STAND_HEIGHT]`) but not a ducking cat's shorter hurtbox
// (`[0, DUCK_HEIGHT]`), matching `checkCollision`'s (task 6.1) expected
// duck-vs-jump dilemma. `AIR_OBSTACLE_Y + AIR_OBSTACLE_MAX_HEIGHT` (52px)
// stays safely below `STAND_HEIGHT` (56px) for every possible height roll.
const AIR_OBSTACLE_MIN_WIDTH = 28; // px
const AIR_OBSTACLE_MAX_WIDTH = 36; // px
const AIR_OBSTACLE_MIN_HEIGHT = 16; // px
const AIR_OBSTACLE_MAX_HEIGHT = 20; // px
const AIR_OBSTACLE_Y = DUCK_HEIGHT + 4; // px, 32 — safely above DUCK_HEIGHT (28)

// The pure engine has no concept of the rendered track's pixel width (that's
// a rendering-layer concern per design.md — the design doesn't hard-code an
// exact track width either), so new obstacles spawn at a fixed
// offscreen-right world-space x, consistent with a typical dialog/game
// width, and scroll into view from there.
const SPAWN_X = 800; // px

/**
 * Creates a fresh `GameState` in `"idle"` status, ready to be flipped to
 * `"running"` when the player starts a Run.
 *
 * `bestScore` is carried over as-is (typically read from `localStorage` via
 * `highScoreStorage.getBestScore()` by the caller) so the best score is
 * never lost across restarts. `seed` allows deterministic runs (used by
 * property-based tests); when omitted, a random seed is generated so real
 * play sessions get varied obstacle spawning.
 */
export function createInitialState(bestScore: number, seed?: number): GameState {
  const rngSeed = seed ?? Math.floor(Math.random() * 0x100000000);
  const rng = createRng(rngSeed);
  const nextSpawnDistance = MIN_SPAWN_GAP + rng() * (MAX_SPAWN_GAP - MIN_SPAWN_GAP);

  return {
    status: "idle",
    elapsedMs: 0,
    distance: 0,
    score: 0,
    bestScore,
    speed: BASE_SPEED,
    catY: 0,
    catVelocityY: 0,
    isDucking: false,
    obstacles: [],
    rngSeed,
    nextSpawnDistance,
  };
}

/**
 * Derives the score from world-space distance traveled. Score is always a
 * pure function of distance — it is never independently mutated.
 */
export function computeScore(distance: number): number {
  return Math.floor(distance * SCORE_PER_WORLD_UNIT);
}

/**
 * Advances a running `GameState` by `deltaMs` milliseconds given the current
 * frame's `input`.
 *
 * A documented no-op when `state.status !== "running"` (calling `stepGame`
 * on an `"idle"` or `"ended"` state returns `state` unchanged) — see
 * design.md's "stepGame" preconditions.
 *
 * Obstacle handling composed into this same step: existing obstacles scroll
 * left by this frame's world-space travel, fully off-screen obstacles are
 * pruned, and at most one new obstacle spawns once `distance` crosses
 * `nextSpawnDistance` (using the seeded RNG for type/size/next-gap). See
 * design.md's "stepGame" postconditions.
 *
 * NOTE: collision detection is implemented in a later task (6.1) —
 * `checkCollision` is a separate pure function called by the caller after
 * `stepGame`, per the Example Usage in design.md.
 */
export function stepGame(
  state: GameState,
  deltaMs: number,
  input: InputState
): GameState {
  if (state.status !== "running") {
    return state;
  }

  // Clamp deltaMs before physics integration so a stalled/backgrounded tab
  // resuming with a huge deltaMs can't teleport the cat through an obstacle.
  const clampedDeltaMs = Math.min(Math.max(deltaMs, 0), MAX_DELTA_MS);
  const dtSec = clampedDeltaMs / 1000;

  const elapsedMs = state.elapsedMs + clampedDeltaMs;

  // Speed ramp: non-decreasing, capped at MAX_SPEED.
  const speed = Math.min(
    MAX_SPEED,
    BASE_SPEED + (SPEED_RAMP_PER_SEC * elapsedMs) / 1000
  );

  // Jump impulse: only when grounded, not ducking, and jump was requested
  // this frame. `requestJump` implements the same guard independently for
  // callers that invoke it directly; both must agree on this precondition.
  const shouldJump =
    input.jumpPressed && state.catY === 0 && !input.isDucking;
  let catVelocityY = shouldJump ? JUMP_VELOCITY : state.catVelocityY;

  // Gravity/velocity integration over this frame.
  catVelocityY += GRAVITY * dtSec;
  let catY = state.catY + catVelocityY * dtSec;

  // Clamp at the ground line; landing zeroes out vertical velocity.
  if (catY <= 0) {
    catY = 0;
    catVelocityY = 0;
  }

  // Distance accumulation uses this frame's starting speed, per design.md.
  const distance = state.distance + (state.speed * clampedDeltaMs) / 1000;
  const score = computeScore(distance);

  // Scroll existing obstacles left by this frame's world-space travel, then
  // prune anything fully off-screen. Uses the same `state.speed` /
  // `clampedDeltaMs` this step already integrated distance with, so
  // obstacle scroll distance always matches `distance` accumulation exactly.
  const scrollDelta = (state.speed * clampedDeltaMs) / 1000;
  const scrolledObstacles = state.obstacles
    .map((obstacle) => ({ ...obstacle, x: obstacle.x - scrollDelta }))
    .filter((obstacle) => obstacle.x + obstacle.width >= 0);

  // Spawn at most one new obstacle per step (plain `if`, never `while`) when
  // the resulting distance has crossed the next spawn threshold.
  let obstacles = scrolledObstacles;
  let rngSeed = state.rngSeed;
  let nextSpawnDistance = state.nextSpawnDistance;

  if (distance >= state.nextSpawnDistance) {
    const rng = createRng(state.rngSeed);
    const typeRoll = rng();
    const type: ObstacleType = typeRoll < 0.5 ? "ground" : "air";
    const sizeRoll = rng();
    const gapRoll = rng();

    const newObstacle: Obstacle =
      type === "ground"
        ? {
            id: `obstacle-${state.rngSeed}-${scrolledObstacles.length}`,
            type,
            x: SPAWN_X,
            width:
              GROUND_OBSTACLE_MIN_WIDTH +
              sizeRoll * (GROUND_OBSTACLE_MAX_WIDTH - GROUND_OBSTACLE_MIN_WIDTH),
            y: 0,
            height:
              GROUND_OBSTACLE_MIN_HEIGHT +
              sizeRoll * (GROUND_OBSTACLE_MAX_HEIGHT - GROUND_OBSTACLE_MIN_HEIGHT),
          }
        : {
            id: `obstacle-${state.rngSeed}-${scrolledObstacles.length}`,
            type,
            x: SPAWN_X,
            width:
              AIR_OBSTACLE_MIN_WIDTH +
              sizeRoll * (AIR_OBSTACLE_MAX_WIDTH - AIR_OBSTACLE_MIN_WIDTH),
            y: AIR_OBSTACLE_Y,
            height:
              AIR_OBSTACLE_MIN_HEIGHT +
              sizeRoll * (AIR_OBSTACLE_MAX_HEIGHT - AIR_OBSTACLE_MIN_HEIGHT),
          };

    obstacles = [...scrolledObstacles, newObstacle];
    // Derive a new seed from this spawn's random draws so subsequent spawns
    // aren't identical, while keeping the sequence deterministic/replayable
    // for a given starting seed. `rngSeed` only changes on a spawning step,
    // per design.md's postcondition, preserving exact replay determinism on
    // non-spawning steps.
    rngSeed = Math.floor(gapRoll * 0x100000000);
    nextSpawnDistance =
      state.nextSpawnDistance + MIN_SPAWN_GAP + gapRoll * (MAX_SPAWN_GAP - MIN_SPAWN_GAP);
  }

  return {
    ...state,
    elapsedMs,
    speed,
    catY,
    catVelocityY,
    distance,
    score,
    isDucking: input.isDucking,
    obstacles,
    rngSeed,
    nextSpawnDistance,
  };
}

/**
 * Requests a jump. Only takes effect when the cat is grounded, not ducking,
 * and the Run is currently `"running"` — otherwise this is an idempotent
 * no-op that returns `state` unchanged (see design.md's "requestJump"
 * postconditions).
 *
 * In particular, once `state.status === "ended"`, jump input has zero
 * gameplay effect until a new Run is started via `createInitialState`
 * (Requirement 2.11). There is no precondition — it is safe to call this on
 * any `GameState`; edge-triggering (e.g. `keydown` firing once, not
 * `keypress`-repeat) is the caller's responsibility, not this function's.
 */
export function requestJump(state: GameState): GameState {
  if (state.status === "running" && state.catY === 0 && !state.isDucking) {
    return {
      ...state,
      catVelocityY: JUMP_VELOCITY,
    };
  }

  return state;
}

/**
 * Sets whether the cat is ducking. A documented no-op when
 * `state.status !== "running"` — duck input has zero gameplay effect once a
 * Run has ended, mirroring `requestJump`'s guard, until a new Run is started
 * via the Results_Panel's "Play again" action (Requirement 2.11).
 *
 * Transitioning into ducking while airborne (`state.catY > 0`) is allowed:
 * this is intentional, since a low-hanging "air" obstacle can be avoided by
 * ducking mid-air even if the player mistimed a jump (see design.md's
 * "setDucking" postconditions).
 */
export function setDucking(state: GameState, ducking: boolean): GameState {
  if (state.status !== "running") {
    return state;
  }

  return {
    ...state,
    isDucking: ducking,
  };
}

/**
 * Detects whether the cat's current hurtbox overlaps any obstacle's box on
 * both axes simultaneously. Pure and side-effect free — calling this twice
 * on the same `state` returns the same result and never mutates `state`
 * (see design.md's "checkCollision" postconditions).
 *
 * Collision itself is type-agnostic: it is the obstacle's `y`/`height`
 * (set at spawn time based on `ObstacleType`) that makes jumping vs.
 * ducking the correct response, not any special-casing here.
 */
// Forgiveness margin applied only to the horizontal collision check (not to
// obstacles' rendered/scroll/pruning geometry, which is untouched) so a
// jump or duck started even when an obstacle is very close to the cat
// still reliably clears it. Without this, a player had to react well
// before an obstacle's edge visually reached the cat — timing a jump when
// the obstacle looked "close" would frequently still count as a collision,
// since the x-ranges begin overlapping before the jump has risen high
// enough. Shrinking each obstacle's *collision* width by this ratio (split
// evenly off both edges) gives a grace window without changing how fast
// obstacles move or how they look. Vertical (duck-vs-jump) geometry is
// left exactly as documented, since that distinction should stay crisp.
const OBSTACLE_HURTBOX_INSET_RATIO = 0.25;

export function checkCollision(state: GameState): boolean {
  const catHurtboxHeight = state.isDucking ? DUCK_HEIGHT : STAND_HEIGHT;
  const catXMin = CAT_X;
  const catXMax = CAT_X + CAT_WIDTH;
  const catYMin = state.catY;
  const catYMax = state.catY + catHurtboxHeight;

  return state.obstacles.some((obstacle) => {
    const insetX = obstacle.width * OBSTACLE_HURTBOX_INSET_RATIO;
    const obstacleXMin = obstacle.x + insetX;
    const obstacleXMax = obstacle.x + obstacle.width - insetX;
    const obstacleYMin = obstacle.y;
    const obstacleYMax = obstacle.y + obstacle.height;

    const xOverlaps = catXMin < obstacleXMax && obstacleXMin < catXMax;
    const yOverlaps = catYMin < obstacleYMax && obstacleYMin < catYMax;

    return xOverlaps && yOverlaps;
  });
}
