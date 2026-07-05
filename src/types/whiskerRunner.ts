// Data models and tuning constants for the Whisker Runner mini-game.
// Pure types/constants only — no React, no DOM, no `window`.
// See .kiro/specs/whisker-runner-game/design.md ("Data Models" / "Tuning Constants").

export type GameStatus = "idle" | "running" | "ended";

export type ObstacleType = "ground" | "air";
// "ground": vacuum cleaner, laundry basket, broom — avoided by jumping
// "air": hanging string / bird toy swinging overhead — avoided by ducking

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number; // left edge, px, in world space (decreases each frame; removed when x + width < 0)
  width: number; // px
  y: number; // height of the obstacle's bottom edge above the ground line, px (0 for "ground" obstacles)
  height: number; // px
}

export interface InputState {
  jumpPressed: boolean; // edge-triggered: true only on the frame the jump input began
  isDucking: boolean; // level-triggered: true for every frame duck is held
}

export interface GameState {
  status: GameStatus;
  elapsedMs: number; // total run time, drives speed ramp
  distance: number; // world-space distance traveled, drives score
  score: number; // derived from distance via computeScore
  bestScore: number; // carried over from localStorage at run start; never decreases mid-run
  speed: number; // px/s, non-decreasing, capped at MAX_SPEED
  catY: number; // height of cat's feet above the ground line, px (0 = grounded)
  catVelocityY: number; // px/s, positive = upward
  isDucking: boolean;
  obstacles: Obstacle[];
  rngSeed: number; // current PRNG state, advanced on every spawn
  nextSpawnDistance: number; // world distance at which the next obstacle spawns
}

// Tuning Constants

export const GROUND_Y = 0;
// Gravity/jump retuned for a snappier, more forgiving arc: the cat's feet
// now clear the tallest ground obstacle (see GROUND_OBSTACLE_MAX_HEIGHT in
// gameEngine.ts) within ~35ms of a jump being triggered, instead of ~57ms
// under the old values — so a jump started right as an obstacle reaches
// the cat (a "close" jump) now has enough time to rise above it before
// the x-ranges finish overlapping, not just a jump started well in advance.
export const GRAVITY = -2200; // px/s^2
export const JUMP_VELOCITY = 760; // px/s, applied instantaneously on jump
export const STAND_HEIGHT = 56; // px, cat hurtbox height when standing/jumping
export const DUCK_HEIGHT = 28; // px, cat hurtbox height while ducking
export const CAT_X = 48; // px, fixed horizontal hurtbox position
export const CAT_WIDTH = 48; // px
// Speed/spacing eased down overall (easier, less twitchy): slower start,
// lower ceiling, slower ramp, and more breathing room between obstacles.
export const BASE_SPEED = 220; // px/s at run start
export const MAX_SPEED = 480; // px/s speed cap
export const SPEED_RAMP_PER_SEC = 4; // px/s added per elapsed second, until MAX_SPEED
export const MIN_SPAWN_GAP = 380; // px, minimum world distance between spawns
export const MAX_SPAWN_GAP = 680; // px, maximum world distance between spawns
export const SCORE_PER_WORLD_UNIT = 0.1; // score = floor(distance * SCORE_PER_WORLD_UNIT)

// design.md's stepGame preconditions reference a clamp for a stalled/backgrounded
// tab's frame delta (MAX_DELTA_MS) but it wasn't listed in the Tuning Constants
// block above. 100ms (~6 frames at 60fps) is a reasonable clamp: long enough to
// not visibly stutter normal frames, short enough to prevent a single frame from
// teleporting the cat through an obstacle after the tab regains focus.
export const MAX_DELTA_MS = 100; // ms, clamp applied to deltaMs before physics integration
