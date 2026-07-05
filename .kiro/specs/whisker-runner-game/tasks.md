# Implementation Plan: Whisker Runner Game

## Overview

This plan builds Whisker Runner bottom-up: pure, framework-free data models and logic first (`gameEngine`, `rng`, `highScoreStorage`, each backed by property-based tests for the design's 16 correctness properties), then the presentation layer (pixel-art sprites, the `WhiskerRunnerGame` component with its RAF loop and input handling), then the integration layer (`WhiskerRunnerDialog`, the Report Page trigger button), and finally an accessibility/responsive verification pass. This mirrors the existing `compatibilityEngine.ts` pattern already used in this codebase: gameplay logic is fully testable in Node/Vitest before any DOM or rendering code exists.

## Tasks

- [x] 1. Set up types and tuning constants
  - [x] 1.1 Create `src/types/whiskerRunner.ts` with `GameStatus`, `ObstacleType`, `Obstacle`, `InputState`, `GameState` interfaces and all tuning constants (`GROUND_Y`, `GRAVITY`, `JUMP_VELOCITY`, `STAND_HEIGHT`, `DUCK_HEIGHT`, `CAT_X`, `CAT_WIDTH`, `BASE_SPEED`, `MAX_SPEED`, `SPEED_RAMP_PER_SEC`, `MIN_SPAWN_GAP`, `MAX_SPAWN_GAP`, `SCORE_PER_WORLD_UNIT`) exactly as specified in the design
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 3.1_
  - [x] 1.2 Create `src/lib/whiskerRunner/rng.ts` exporting the `Rng` type and `createRng(seed)` implementing the mulberry32 deterministic PRNG (no external dependency), guarded to be safely importable in any environment
    - _Requirements: 7.1, 7.2, 7.3_
  - [x]* 1.3 Write unit tests for `rng.ts` verifying `createRng` returns numbers in `[0, 1)` and that the same seed always produces the same output sequence
    - _Requirements: 7.3_

- [x] 2. Implement gameEngine: initial state and scoring
  - [x] 2.1 In `src/lib/whiskerRunner/gameEngine.ts`, implement `createInitialState(bestScore, seed?)` (status `"idle"`, zeroed distance/score/elapsedMs, empty obstacles, carried-over `bestScore`, `BASE_SPEED`, initialized `rngSeed`/`nextSpawnDistance`) and `computeScore(distance)` (`Math.floor(distance * SCORE_PER_WORLD_UNIT)`)
    - _Requirements: 3.1, 4.4_
  - [x]* 2.2 Write property test for `createInitialState`
    - **Property 13: Restart preserves best score, resets everything else**
    - **Validates: Requirements 4.4**

- [x] 3. Implement gameEngine: physics integration in `stepGame`
  - [x] 3.1 In `gameEngine.ts`, implement the core of `stepGame(state, deltaMs, input)`: no-op on non-`"running"` status, `deltaMs` clamping to `MAX_DELTA_MS`, elapsed-time-driven speed ramp (capped at `MAX_SPEED`), gravity/velocity integration for `catY`/`catVelocityY` (clamped at the ground line), distance accumulation from `speed`, and `score = computeScore(distance)` — obstacle spawning/collision are not part of this sub-task
    - _Requirements: 2.1, 2.4, 2.7, 3.1_
  - [x]* 3.2 Write property test for `stepGame`
    - **Property 1: Non-decreasing distance and score**
    - **Validates: Requirements 3.1**
  - [x]* 3.3 Write property test for `stepGame`
    - **Property 3: Cat never goes below ground**
    - **Validates: Requirements 2.4**
  - [x]* 3.4 Write property test for `stepGame`
    - **Property 4: Speed is non-decreasing and bounded**
    - **Validates: Requirements 2.7**
  - [x]* 3.5 Write property test for `stepGame`/`computeScore`
    - **Property 2: Score is a pure function of distance**
    - **Validates: Requirements 3.1**
  - [x]* 3.6 Write property test for `stepGame`
    - **Property 14: No NaN/Infinity leakage**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [x] 4. Implement gameEngine: jump and duck controls
  - [x] 4.1 In `gameEngine.ts`, implement `requestJump(state)`: applies `JUMP_VELOCITY` only when `status === "running" && catY === 0 && !isDucking`; otherwise returns the input state unchanged (idempotent no-op)
    - _Requirements: 2.2, 2.5, 2.11_
  - [x]* 4.2 Write property test for `requestJump`
    - **Property 5: Jump only affects grounded, non-ducking cats**
    - **Validates: Requirements 2.5**
  - [x]* 4.3 Write property test for `requestJump`
    - **Property 6: Jump is a no-op when not running**
    - **Validates: Requirements 2.5**
  - [x] 4.4 In `gameEngine.ts`, implement `setDucking(state, ducking)`: no-op when `status !== "running"`; otherwise sets `isDucking` (allowed mid-air) with all other fields unchanged
    - _Requirements: 2.3, 2.11_
  - [x]* 4.5 Write property test for `setDucking`
    - **Property 16: Duck is a no-op when not running**
    - **Validates: Requirements 2.11**

- [x] 5. Implement gameEngine: obstacle spawning and pruning
  - [x] 5.1 In `gameEngine.ts`, wire obstacle spawning into `stepGame`: when `distance >= nextSpawnDistance`, append exactly one new `Obstacle` (randomly `"ground"` or `"air"` type with type-appropriate `y`/`height`) using `createRng`/`rngSeed`, advance `nextSpawnDistance` by a value drawn from `[MIN_SPAWN_GAP, MAX_SPAWN_GAP)`, scroll all existing obstacles left by `speed * deltaMs / 1000`, and prune any obstacle where `x + width < 0`
    - _Requirements: 2.1, 2.6, 7.3_
  - [x]* 5.2 Write property test for `stepGame`'s obstacle handling
    - **Property 7: Obstacle pruning invariant**
    - **Validates: Requirements 2.6**
  - [x]* 5.3 Write property test for `stepGame`'s obstacle handling
    - **Property 8: Obstacles only move leftward**
    - **Validates: Requirements 2.1, 2.6**

- [x] 6. Implement gameEngine: collision detection
  - [x] 6.1 In `gameEngine.ts`, implement `checkCollision(state)`: axis-aligned bounding box overlap between the cat's hurtbox (`x ∈ [CAT_X, CAT_X + CAT_WIDTH]`, `y ∈ [catY, catY + (isDucking ? DUCK_HEIGHT : STAND_HEIGHT)]`) and each obstacle's box, returning `true` on any overlap and side-effect free
    - _Requirements: 2.8, 2.9, 2.10_
  - [x]* 6.2 Write property test for `checkCollision`
    - **Property 9: Collision determinism**
    - **Validates: Requirements 2.8**
  - [x]* 6.3 Write property test for `checkCollision`/`setDucking`
    - **Property 10: Ducking reduces hurtbox height**
    - **Validates: Requirements 2.3, 2.8**

- [x] 7. Finalize gameEngine module and verify determinism
  - [x] 7.1 Export all six `gameEngine` functions from `gameEngine.ts` per the design's public API, ensuring `stepGame` composes velocity integration, spawning/pruning, and score/distance updates into a single cohesive step matching the Example Usage in the design document
    - _Requirements: 7.1, 7.2, 7.3_
  - [x]* 7.2 Write property test for the full `gameEngine` module
    - **Property 15: Deterministic replay**
    - **Validates: Requirements 7.3**
  - [x]* 7.3 Write unit tests for `gameEngine`: `createInitialState` documented defaults, `stepGame` no-op on `"idle"`/`"ended"` status, a fixed jump scenario clearing a fixed ground obstacle, a fixed duck scenario clearing a fixed air obstacle, and a fixed "do nothing" scenario colliding with a ground obstacle
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 2.9, 2.10, 2.11_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement highScoreStorage module
  - [x] 9.1 Create `src/lib/whiskerRunner/highScoreStorage.ts` implementing `getBestScore()` and `setBestScoreIfHigher(score)` under key `"whiskerRunner:bestScore"`, mirroring the `try { ... } catch { /* private browsing */ }` guard pattern from `firestoreService.ts`, with an in-memory fallback when `localStorage`/`window` is unavailable or throws, and treating corrupted/non-numeric stored values as `0`
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  - [x]* 9.2 Write property test for `highScoreStorage`
    - **Property 11: Best score never decreases**
    - **Validates: Requirements 3.2, 3.4**
  - [x]* 9.3 Write property test for `highScoreStorage`
    - **Property 12: New-high-score flag correctness**
    - **Validates: Requirements 3.3, 4.3, 4.6**
  - [x]* 9.4 Write unit tests for `highScoreStorage`: round-trips a value through a mocked `localStorage`, and degrades gracefully (never throws, in-memory fallback) when `localStorage.getItem`/`setItem` is mocked to throw
    - _Requirements: 3.5_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement pixel-art sprite rendering layer
  - [x] 11.1 Create `src/components/game/sprites/CatSprite.tsx`: a blocky, low-resolution "pixel" grid (inline SVG built from a `<rect>` grid, or a raster sprite with `image-rendering: pixelated` / `-webkit-crisp-edges`) for the cat character in standing, jumping, and ducking poses, using only `coral`/`sage`/`honey`/`cocoa`/`cream` design tokens for pixel fills
    - _Requirements: 5.1, 5.5_
  - [x] 11.2 Create `src/components/game/sprites/ObstacleSprite.tsx`: pixel-art variants for ground obstacles (vacuum cleaner, laundry basket, broom) and air obstacles (hanging string/bird toy), selected by `ObstacleType`, using the same crisp-edge pixel-art technique and design token palette
    - _Requirements: 2.6, 5.1, 5.5_
  - [x]* 11.3 Write unit tests verifying `CatSprite` and `ObstacleSprite` render with the pixelated rendering technique applied and use only design-palette color tokens (no colors outside `coral`/`sage`/`honey`/`cocoa`/`cream`)
    - _Requirements: 5.1, 5.5_

- [x] 12. Implement WhiskerRunnerGame component
  - [x] 12.1 Create `src/components/game/WhiskerRunnerGame.tsx` with the RAF loop: `GameState` held in a `useRef` updated every frame via `stepGame`/`checkCollision`, a throttled `useState` tick for score/status HUD, cat/obstacle DOM nodes positioned via direct `style.transform` writes from the ref, and cleanup on unmount (cancel RAF, remove listeners)
    - _Requirements: 2.1, 7.1, 7.3_
  - [x] 12.2 Add keyboard input handling: `Space`/`ArrowUp` calling `requestJump` on edge-triggered `keydown` (not `keypress`-repeat), `ArrowDown` calling `setDucking(true)` on `keydown` and `setDucking(false)` on `keyup`
    - _Requirements: 2.2, 2.3, 2.9, 6.1_
  - [x] 12.3 Add pointer/touch input handling: a `pointerdown`/`click` listener on the game track area triggering `requestJump` (primary input), always-visible on-screen Jump `Button` (redundant trigger for the same jump action) and Duck `Button`/press-and-hold (secondary control, `pointerdown`/`pointerup` calling `setDucking`), with both on-screen buttons calling `stopPropagation()` so they don't double-trigger a canvas tap-jump
    - _Requirements: 2.2, 2.3, 2.9, 6.2, 6.3_
  - [x] 12.4 Implement the two-layer parallax background (sky gradient + drifting cloud/paw-print strip using existing `.paw-pattern`/dot-pattern utility classes) with `window.matchMedia("(prefers-reduced-motion: reduce)")` detection that disables the background's drift animation and non-gameplay CSS transitions when reduced motion is preferred, without affecting `stepGame` timing/physics
    - _Requirements: 5.3, 6.5_
  - [x] 12.5 Implement the HUD row displaying the current score and Best_Score simultaneously during `"running"` and `"ended"` status
    - _Requirements: 3.6_
  - [x] 12.6 Implement the `"idle"` status overlay (`Card`-based start prompt) shown before a Run begins, dismissed by any jump input starting the Run
    - _Requirements: 2.1_
  - [x] 12.7 Implement the Results_Panel shown on `"ended"` status: current score, Best_Score, a `StickerBadge` "New High Score! 🎉" plus a `canvas-confetti` burst (wrapped in try/catch) when `isNewHighScore || state.score > bestScoreBeforeRun`, and "Play again" (calls `createInitialState(bestScore)`) / "Back to your request" (calls `onClose`) `Button`s — guarded by a ref flag so `setBestScoreIfHigher` fires exactly once per Run
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [x]* 12.8 Write unit tests for `WhiskerRunnerGame`: renders the start prompt in `"idle"`, renders the Results_Panel with correct new-high-score condition on `"ended"`, keyboard/pointer handlers invoke the corresponding `gameEngine` functions, and reduced-motion disables the parallax animation while leaving jump/duck controls functional
    - _Requirements: 2.9, 4.1, 4.3, 6.5_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement WhiskerRunnerDialog wrapper
  - [x] 14.1 Create `src/components/game/WhiskerRunnerDialog.tsx` wrapping `Dialog`/`DialogContent` from `@/components/ui/dialog` with a `DialogTitle` ("Whisker Runner 🐾"), dynamically importing `WhiskerRunnerGame` via `next/dynamic(() => import("./WhiskerRunnerGame"), { ssr: false })`, passing `catName` through, and relying on `Dialog`'s default unmount-on-close behavior
    - _Requirements: 1.5, 1.7, 7.1, 7.2_
  - [x]* 14.2 Write unit tests for `WhiskerRunnerDialog`: renders no game DOM when `open === false`, and dynamically mounts the game when `open === true`
    - _Requirements: 1.5, 1.7_

- [x] 15. Report Page integration
  - [x] 15.1 In `src/app/report/[matchId]/page.tsx`'s `requestSent` branch, add a `gameOpen` `useState(false)`, insert the new row (breather copy text + secondary `outline`-styled "Play: Whisker Runner 🐾" `Button` with a `Gamepad2` icon) between the shelter contact block and the existing "Continue to 14-Day Coach" button (left unchanged), and mount `<WhiskerRunnerDialog open={gameOpen} onOpenChange={setGameOpen} catName={cat.name} />`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [x]* 15.2 Write unit tests for the Report Page `requestSent` branch: both buttons render, the "Continue to 14-Day Coach" button's existing `onClick`/styling is unchanged, and clicking "Play: Whisker Runner 🐾" opens the dialog without navigation or a URL change
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Accessibility, reduced-motion, and responsive verification
  - [x] 17.1 Verify and adjust the on-screen Jump/Duck `Button`s in `WhiskerRunnerGame.tsx` render on both desktop and mobile viewports (not a touch-only fallback) with appropriate `aria-label`s for icon-only controls
    - _Requirements: 6.2_
  - [x] 17.2 Verify and adjust `WhiskerRunnerDialog`/`WhiskerRunnerGame` layout so the game renders and remains playable across mobile and desktop viewport widths without horizontal scrolling under normal conditions, adding `overflow-x-auto` as a fallback within the Game_Dialog only if the viewport is too narrow to render the track fully
    - _Requirements: 6.4, 6.6_
  - [x]* 17.3 Write an automated test confirming `prefers-reduced-motion: reduce` (mocked `matchMedia`) disables the decorative parallax drift animation while jump/duck/scroll/collision gameplay remains fully functional
    - _Requirements: 6.5_

- [x] 18. Final checkpoint and manual verification notes
  - Ensure all automated tests pass, ask the user if questions arise.
  - The following checks from the design's Testing Strategy are manual/DOM-interactive and are not part of this task list — perform them yourself after the tasks above are complete: a keyboard-only playthrough (Space to jump, Down arrow held to duck) with no mouse/touch input; a touch-only playthrough using only the on-screen Jump/Duck buttons; enabling `prefers-reduced-motion: reduce` via OS setting or DevTools emulation to confirm the parallax background stops animating while gameplay stays fully playable; and confirming the Game_Dialog is dismissible via Escape, backdrop click, and the explicit close button at every game status (`idle`, `running`, `ended`).

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- All 16 correctness properties from the design are covered as PBT sub-tasks using `fast-check` (≥100 runs per property, tag format `Feature: whisker-runner-game, Property {N}: {title}`), placed immediately after the implementation they validate.
- `gameEngine.ts` and `highScoreStorage.ts` are pure, framework-free modules (no React, DOM, or `window` at import time) so they are fully testable in Node/Vitest before any rendering code exists.
- `WhiskerRunnerGame` is only ever mounted client-side via `next/dynamic({ ssr: false })` from `WhiskerRunnerDialog`, so its RAF loop, `localStorage`, and `matchMedia` reads never execute during SSR.
- No new runtime dependencies are introduced; `fast-check`, `framer-motion`, `lucide-react`, `canvas-confetti`, and `@testing-library/react` are already present in `package.json`.
- Checkpoints ensure incremental validation between the pure-logic phase, the rendering/component phase, and the integration phase.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1", "9.1", "11.1", "11.2"] },
    { "id": 2, "tasks": ["2.2", "3.1", "9.2", "9.3", "11.3"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "4.1", "9.4"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 5, "tasks": ["4.5", "5.1"] },
    { "id": 6, "tasks": ["5.2", "5.3", "6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 8, "tasks": ["7.2", "7.3"] },
    { "id": 9, "tasks": ["12.1"] },
    { "id": 10, "tasks": ["12.2"] },
    { "id": 11, "tasks": ["12.3"] },
    { "id": 12, "tasks": ["12.4"] },
    { "id": 13, "tasks": ["12.5"] },
    { "id": 14, "tasks": ["12.6"] },
    { "id": 15, "tasks": ["12.7"] },
    { "id": 16, "tasks": ["12.8"] },
    { "id": 17, "tasks": ["14.1"] },
    { "id": 18, "tasks": ["14.2"] },
    { "id": 19, "tasks": ["15.1"] },
    { "id": 20, "tasks": ["15.2"] },
    { "id": 21, "tasks": ["17.1", "17.2"] },
    { "id": 22, "tasks": ["17.3"] }
  ]
}
```
