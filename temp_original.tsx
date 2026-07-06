"use client";

// Whisker Runner gameplay surface: owns the requestAnimationFrame loop and
// the authoritative GameState (kept in a ref, per design.md's "WhiskerRunnerGame"
// section), and renders the cat + obstacles by writing ref-driven inline
// `transform` styles rather than re-rendering on every frame.
//
// Keyboard input (Space/ArrowUp = jump, ArrowDown = duck-while-held) is
// wired in (task 12.2). Pointer/touch input (tap-to-jump on the track,
// on-screen Jump/Duck buttons) is wired in (task 12.3). Remaining pieces
// are extended by later tasks:
//   12.4 - parallax background layer
//   12.5 - HUD (score / best score) — done, see the HUD row below
//   12.6 - idle overlay (start prompt) — done, see the idle overlay Card
//          below; the idle->running status transition itself is wired
//          from jump input (see the keydown handler and
//          `triggerJumpRequest` above).
//   12.7 - Results_Panel (post-collision Card with Play again / Back) —
//          done, see the Results_Panel block below.

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StickerBadge } from "@/components/ui/CatElements";
import { CatSprite, type CatPose } from "@/components/game/sprites/CatSprite";
import { ObstacleSprite } from "@/components/game/sprites/ObstacleSprite";
import {
  createInitialState,
  stepGame,
  checkCollision,
} from "@/lib/whiskerRunner/gameEngine";
import {
  getBestScore,
  setBestScoreIfHigher,
} from "@/lib/whiskerRunner/highScoreStorage";
import type { GameState, InputState } from "@/types/whiskerRunner";
import { CAT_X, CAT_WIDTH, STAND_HEIGHT } from "@/types/whiskerRunner";

interface WhiskerRunnerGameProps {
  catName: string;
  /**
   * Invoked by the Results_Panel's "Back to your request" action
   * (Requirement 4.5). Optional: the game surface itself never dictates
   * how it's hosted, so this defaults to a safe no-op when not provided.
   * `WhiskerRunnerDialog` (task 14.1) wires this to its own close/dismiss
   * behavior.
   */
  onClose?: () => void;
}

/** Fixed height of the track's rendering surface, in px. */
const TRACK_HEIGHT = 220;

/**
 * Minimal, HUD-relevant slice of `GameState` that drives re-renders. Kept
 * intentionally small: everything else (obstacle/cat positions) is written
 * directly to the DOM via refs on every frame to avoid unnecessary React
 * reconciliation, per design.md's "WhiskerRunnerGame" responsibilities.
 */
interface GameTick {
  status: GameState["status"];
  score: number;
  bestScore: number;
  /**
   * Whether the run that just ended (or is ending) should trigger the
   * Results_Panel's "new high score" celebration (Requirement 4.3, 4.6).
   * Always `false` when `status !== "ended"`.
   */
  isNewHighScore: boolean;
  /** Discrete cat pose derived from physics state, for CatSprite swapping. */
  pose: CatPose;
}

function poseFromState(state: GameState): CatPose {
  if (state.isDucking) return "ducking";
  if (state.catY > 0) return "jumping";
  return "standing";
}

function tickFromState(state: GameState, isNewHighScore: boolean): GameTick {
  return {
    status: state.status,
    score: state.score,
    bestScore: state.bestScore,
    isNewHighScore: state.status === "ended" ? isNewHighScore : false,
    pose: poseFromState(state),
  };
}

/** Shallow-equality check so the RAF loop only re-renders React when a
 * HUD-relevant field actually changed, instead of forcing a full
 * reconciliation on every single animation frame (60/sec) regardless of
 * whether anything visible changed — that constant re-rendering was adding
 * needless main-thread work that made touch input feel sluggish,
 * especially on lower-power devices. Obstacle/cat positions are unaffected
 * since those are still written directly to the DOM via refs every frame. */
function tickEquals(a: GameTick, b: GameTick): boolean {
  return (
    a.status === b.status &&
    a.score === b.score &&
    a.bestScore === b.bestScore &&
    a.isNewHighScore === b.isNewHighScore &&
    a.pose === b.pose
  );
}

export function WhiskerRunnerGame({ catName, onClose }: WhiskerRunnerGameProps) {
  // Authoritative game state, mutated every frame by the pure `stepGame`.
  // A ref (not useState) so the RAF loop can read/write it every frame
  // without triggering a re-render on every single update.
  const stateRef = useRef<GameState>(createInitialState(getBestScore()));

  // Throttled(-ish) React state slice for the pieces of the UI that need to
  // re-render (score digits, status banner, etc.). Synced from `stateRef`
  // once per frame for now; later tasks may refine the throttling.
  const [tick, setTick] = useState<GameTick>(() => tickFromState(stateRef.current, false));

  // DOM refs for direct, reconciliation-free positioning of the cat and
  // obstacle sprites every frame.
  const catNodeRef = useRef<HTMLDivElement | null>(null);
  const obstacleNodesRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
  // Scrolling ground strip (fixes "no land illustrating the cat is
  // running"): a dashed baseline whose `backgroundPosition` is advanced
  // every frame in lockstep with `distance`, exactly like obstacle
  // scrolling, so it reads as a physical running surface rather than a
  // decorative loop disconnected from the actual game speed.
  const groundNodeRef = useRef<HTMLDivElement | null>(null);

  // Keyboard input state (task 12.2). `jumpRequestedRef` is edge-triggered:
  // `keydown` sets it to `true` only on the initial press (tracked via
  // `heldKeysRef` so OS key-repeat `keydown` events while a key is held
  // don't re-trigger a jump every repeat), and the RAF loop consumes
  // (resets) it after reading it into that frame's `InputState.jumpPressed`.
  // `isDuckingRef` is level-triggered: it stays `true` for as long as
  // `ArrowDown` is held and is set back to `false` on `keyup`.
  const heldKeysRef = useRef<Set<string>>(new Set());
  const jumpRequestedRef = useRef(false);
  const isDuckingRef = useRef(false);

  // Guards `setBestScoreIfHigher` so it only fires once per run, even though
  // the RAF loop may observe `status === "ended"` on multiple consecutive
  // frames before the loop is torn down/rendering catches up. Also guards
  // the one-time confetti burst (task 12.7), so both fire exactly once per
  // run regardless of how many "ended" frames are observed.
  const bestScoreRecordedRef = useRef(false);

  // Best_Score as it stood immediately before the current run started
  // (Requirement 4.6). Captured at the idle->running transition (see the
  // keydown handler and `triggerJumpRequest` below) so the Results_Panel's
  // celebration can treat "final score beat the pre-run best" as an
  // equivalent, redundant trigger alongside `setBestScoreIfHigher`'s own
  // `isNewHighScore` signal.
  const bestScoreBeforeRunRef = useRef(getBestScore());

  // Whether the run that just ended qualifies for the "new high score"
  // celebration (Requirement 4.3, 4.6). Computed once per run at the same
  // point `bestScoreRecordedRef` guards the one-time `setBestScoreIfHigher`
  // call, then read every frame afterward to drive the Results_Panel and
  // HUD without recomputing (and without re-firing confetti).
  const isNewHighScoreRef = useRef(false);

  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  // Parallax background (task 12.4): purely decorative, has no bearing on
  // `stepGame`'s timing/physics or the RAF loop above. Tracks the OS/browser
  // `prefers-reduced-motion` preference so the slow-drifting paw-pattern
  // layer can be paused without touching gameplay.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Keyboard listeners (task 12.2). Registered in their own `useEffect` with
  // its own cleanup, kept separate from the RAF effect below so the two
  // concerns (input wiring vs. the frame loop) don't need to share a single
  // effect body or teardown function.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key;

      if (key === " " || key === "Spacebar" || key === "ArrowUp") {
        // Prevent default browser behavior (page scroll on Space/Up) only
        // for the keys this game actually uses.
        event.preventDefault();

        // Edge-trigger: only flag a jump request on the initial press, not
        // on OS key-repeat `keydown` events fired while the key is held.
        if (!heldKeysRef.current.has(key)) {
          heldKeysRef.current.add(key);
          jumpRequestedRef.current = true;

          // Starting the Run: a jump input while `"idle"` dismisses the
          // start prompt and begins the Run. The idle overlay itself is
          // task 12.6's concern; this is just the underlying status
          // transition, wired here since it's tightly coupled to jump
          // input handling.
          if (stateRef.current.status === "idle") {
            bestScoreBeforeRunRef.current = stateRef.current.bestScore;
            stateRef.current = { ...stateRef.current, status: "running" };
          }
        }
        return;
      }

      if (key === "ArrowDown") {
        event.preventDefault();
        heldKeysRef.current.add(key);
        isDuckingRef.current = true;
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      const key = event.key;

      if (key === " " || key === "Spacebar" || key === "ArrowUp") {
        heldKeysRef.current.delete(key);
        return;
      }

      if (key === "ArrowDown") {
        heldKeysRef.current.delete(key);
        isDuckingRef.current = false;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Shared jump-request mechanism (task 12.3): the SAME edge-triggered flag
  // and idle->running transition used by the keyboard handler above, so
  // canvas taps and the on-screen Jump button both funnel through this one
  // path.
  function triggerJumpRequest() {
    jumpRequestedRef.current = true;

    if (stateRef.current.status === "idle") {
      bestScoreBeforeRunRef.current = stateRef.current.bestScore;
      stateRef.current = { ...stateRef.current, status: "running" };
    }
  }

  // Primary input (Requirement 2.9): tapping/clicking anywhere on the game
  // track triggers a jump, mirroring the Chrome Dino game's single-input
  // feel. This is a React-level handler scoped to the track container
  // (rather than a native `document` listener like the keyboard handlers
  // above, which must listen globally) so it only fires for pointerdowns
  // that land on the track itself.
  function handleTrackPointerDown() {
    triggerJumpRequest();
  }

  // On-screen Jump button: a redundant, always-visible path to the same
  // jump-request mechanism. `stopPropagation` prevents this pointerdown
  // from also bubbling up to the track's own handler and double-triggering
  // a jump.
  function handleJumpButtonPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    triggerJumpRequest();
  }

  // On-screen Duck button: press-and-hold semantics matching the keyboard's
  // ArrowDown-held behavior. `onPointerUp`/`onPointerLeave`/`onPointerCancel`
  // all release the duck so a finger/mouse leaving the button while still
  // "down" can't leave `isDuckingRef` stuck at `true`.
  function handleDuckButtonPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    isDuckingRef.current = true;
  }

  function handleDuckButtonRelease() {
    isDuckingRef.current = false;
  }

  // Results_Panel (task 12.7): "Play again" (Requirement 4.4). Per
  // design.md's Example Usage ("Restart, preserving the best score":
  // `state = createInitialState(state.bestScore)`), this returns the game
  // to `"idle"` for a fresh tap-to-start rather than auto-starting a new
  // run immediately. Resets the per-run guards/timing refs so the next run
  // (and the RAF loop's first frame after this reset) behaves exactly like
  // a freshly mounted game.
  function handlePlayAgain() {
    stateRef.current = createInitialState(stateRef.current.bestScore);
    bestScoreRecordedRef.current = false;
    isNewHighScoreRef.current = false;
    lastFrameTimeRef.current = null;
    setTick(tickFromState(stateRef.current, false));
  }

  // Results_Panel: "Back to your request" (Requirement 4.5). Closes the
  // hosting dialog; safe no-op when `onClose` isn't provided (e.g. this
  // component rendered standalone before task 14.1 wires the real dialog).
  function handleBackToRequest() {
    onClose?.();
  }

  useEffect(() => {
    function frame(now: number) {
      const last = lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // First frame has no prior timestamp to diff against; skip stepping
      // this frame rather than passing a bogus/huge deltaMs.
      if (last !== null) {
        const deltaMs = now - last;

        // Real keyboard input (task 12.2): the edge-triggered jump flag is
        // consumed (reset) here after being read into this frame's
        // `InputState.jumpPressed`, so a held key cannot re-trigger a jump
        // every frame. Duck is level-triggered and read directly from the
        // ref. Pointer/touch input sources are wired in by task 12.3.
        const jumpPressed = jumpRequestedRef.current;
        jumpRequestedRef.current = false;
        const input: InputState = {
          jumpPressed,
          isDucking: isDuckingRef.current,
        };

        const current = stateRef.current;
        if (current.status === "running") {
          const stepped = stepGame(current, deltaMs, input);
          const collided = checkCollision(stepped);

          if (collided) {
            if (!bestScoreRecordedRef.current) {
              bestScoreRecordedRef.current = true;
              const { best, isNewHighScore } = setBestScoreIfHigher(stepped.score);

              // Requirement 4.6: treat "final score beat the pre-run best"
              // as an equivalent, redundant celebration trigger alongside
              // `setBestScoreIfHigher`'s own `isNewHighScore` signal, so the
              // celebration still fires even if that primary signal ever
              // fails to report success for a run that did in fact beat the
              // pre-run best.
              const shouldCelebrate =
                isNewHighScore || stepped.score > bestScoreBeforeRunRef.current;
              isNewHighScoreRef.current = shouldCelebrate;

              if (shouldCelebrate) {
                try {
                  confetti({
                    particleCount: 40,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: ["#FF6B6B", "#9B8CE0", "#5FC79B"],
                  });
                } catch {
                  // Decorative only — never let a confetti failure affect
                  // gameplay or the Results_Panel.
                }
              }

              stateRef.current = { ...stepped, status: "ended", bestScore: best };
            } else {
              stateRef.current = { ...stepped, status: "ended" };
            }
          } else {
            stateRef.current = stepped;
          }
        }

        // Write DOM positions directly from the ref state, bypassing React
        // reconciliation for the cat/obstacle nodes.
        const next = stateRef.current;
        const catNode = catNodeRef.current;
        if (catNode) {
          // catY increases upward from the ground line, so translateY must
          // decrease (move up) as catY increases.
          catNode.style.transform = `translateX(${CAT_X}px) translateY(${-next.catY}px)`;
        }
        for (const obstacle of next.obstacles) {
          const node = obstacleNodesRef.current.get(obstacle.id);
          if (node) {
            node.style.transform = `translateX(${obstacle.x}px)`;
          }
        }
        // Scroll the ground strip in lockstep with world-space `distance`
        // (same value obstacles scroll by), so the running surface always
        // matches the game's actual speed instead of an independent loop.
        const groundNode = groundNodeRef.current;
        if (groundNode) {
          groundNode.style.backgroundPositionX = `${-next.distance}px`;
        }

        const nextTick = tickFromState(next, isNewHighScoreRef.current);
        setTick((prev) => (tickEquals(prev, nextTick) ? prev : nextTick));
      }

      rafIdRef.current = requestAnimationFrame(frame);
    }

    rafIdRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastFrameTimeRef.current = null;
    };
  }, []);

  const obstacles = stateRef.current.obstacles;

  return (
    <div
      // `min-w-[240px]` sets a functional floor for the track — below this
      // width the HUD pills, cat, and on-screen controls would start to
      // clip/overlap in ways that break gameplay legibility. Ordinary
      // mobile viewports (~320px+, minus the Game_Dialog's own padding)
      // stay comfortably above this floor, so it never triggers the
      // `overflow-x-auto` fallback added on `WhiskerRunnerDialog`'s
      // `DialogContent` under normal conditions (Requirement 6.4); only a
      // pathologically narrow viewport would cause the track to exceed the
      // dialog's available width and engage that fallback (Requirement
      // 6.6).
      className="relative w-full min-w-[240px] overflow-hidden rounded-lg bg-cream select-none touch-none"
      style={{ height: TRACK_HEIGHT }}
      data-status={tick.status}
      data-cat-name={catName}
      onPointerDown={handleTrackPointerDown}
    >
      {/* Parallax background, layer 1 (task 12.4): bottommost sky-gradient
          layer, behind the cat/obstacles/HUD. Purely decorative. */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-honey/10 to-cream" />

      {/* Parallax background, layer 2 (task 12.4): a slow-drifting
          paw-print strip, paused when `prefers-reduced-motion: reduce` is
          set. This is a decorative/visual toggle only — it never affects
          `stepGame`'s timing/physics or the RAF loop. */}
      <div
        className={`absolute inset-0 z-0 paw-pattern opacity-70 ${
          prefersReducedMotion ? "" : "animate-bg-drift"
        }`}
        aria-hidden="true"
      />

      {/* Ground: the "land" the cat runs on, previously missing entirely
          (nothing communicated forward motion besides the obstacles
          scrolling by). Two pieces, Chrome-Dino-style:
          1. A solid baseline right at the ground line (where the cat's
             feet and ground obstacles actually sit) — static, since it's
             a fixed reference line, not something that needs to scroll.
          2. A textured pebble/crack strip just above the baseline, whose
             `backgroundPositionX` is written from the ref every frame in
             lockstep with `distance` (the exact same value obstacles
             scroll by), so it always visually matches the game's real
             speed instead of running as a disconnected decorative loop. */}
      <div
        className="absolute inset-x-0 bottom-0 z-[1] h-[3px] bg-cocoa/70"
        aria-hidden="true"
      />
      <div
        ref={groundNodeRef}
        className="absolute inset-x-0 bottom-[3px] z-[1] h-2 bg-repeat-x opacity-60"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='8' viewBox='0 0 40 8'%3E%3Cg fill='%232A1D14'%3E%3Crect x='2' y='5' width='3' height='2'/%3E%3Crect x='11' y='6' width='2' height='1'/%3E%3Crect x='19' y='4' width='4' height='2'/%3E%3Crect x='28' y='6' width='2' height='2'/%3E%3Crect x='34' y='5' width='3' height='1'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "40px 8px",
          backgroundPosition: "0 0",
        }}
        aria-hidden="true"
      />

      {/* HUD (task 12.5): current score + Best_Score, shown simultaneously
          during "running" and "ended" (Requirement 3.6). Positioned at the
          top of the track, above the parallax background layers (z-10 vs
          their z-0) but `pointer-events-none` so it never intercepts the
          track's own tap-to-jump pointerdown handler. */}
      {(tick.status === "running" || tick.status === "ended") && (
        <div className="absolute top-2 left-2 z-10 flex gap-2 pointer-events-none">
          <span className="rounded-full bg-cream/90 px-3 py-1 text-sm font-bold text-cocoa shadow-sm">
            Score: {tick.score}
          </span>
          <span className="rounded-full bg-cream/90 px-3 py-1 text-sm font-bold text-cocoa shadow-sm">
            Best: {tick.bestScore}
          </span>
        </div>
      )}

      {/* Idle overlay (task 12.6): start prompt shown before a Run begins.
          Conditionally rendered on `tick.status === "idle"`, so it
          disappears automatically once the idle->running transition (wired
          in the keydown handler and `triggerJumpRequest` above) flips the
          status — no separate dismiss logic is needed here. Deliberately
          does NOT stop propagation or use `pointer-events-none`: a tap
          anywhere on the track, including directly on this card, should
          bubble up to the track's own `onPointerDown` and start the Run,
          mirroring the primary tap-to-jump input model (Requirement 2.9). */}
      {tick.status === "idle" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <Card className="max-w-xs text-center">
            <CardContent className="pt-6 space-y-1">
              <p className="text-lg font-bold text-cocoa">Whisker Runner 🐾</p>
              <p className="text-sm text-cocoa/70">
                Help {catName} dodge the household hazards! Tap, click, or
                press Space to start.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results_Panel (task 12.7): shown immediately after a collision
          ends the Run, inline within the same game surface — no separate
          "Game Over" screen (Requirement 4.1). Positioned like the idle
          overlay above it, but DOES stop propagation on pointerdown:
          unlike idle's "tap anywhere to start", taps on this panel's own
          buttons must not also bubble up to the track's tap-to-jump
          handler (which would be meaningless anyway since a jump input is
          a no-op once `status === "ended"`, but stopping propagation here
          keeps intent explicit and avoids relying on that no-op). */}
      {tick.status === "ended" && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center p-4"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Card className="max-w-xs text-center">
            <CardContent className="pt-6 space-y-2">
              {tick.isNewHighScore && (
                <StickerBadge color="honey" className="mx-auto">
                  New High Score! 🎉
                </StickerBadge>
              )}
              <p className="text-2xl font-bold text-cocoa">{tick.score}</p>
              <p className="text-sm text-cocoa/50">Best: {tick.bestScore}</p>
              {/* Stacked on narrow widths (`flex-col`) rather than a fixed
                  side-by-side row: at the track's `min-w-[240px]` floor,
                  "Play again" + "Back to your request" side-by-side would
                  exceed the available width (both buttons use
                  `whitespace-nowrap` text), clipping "Back to your
                  request". Stacking keeps both fully legible and tappable
                  without needing horizontal scrolling (Requirement 6.4);
                  `sm:flex-row` restores the side-by-side layout once
                  there's room. */}
              <div className="flex flex-col gap-2 justify-center pt-2 sm:flex-row">
                <Button type="button" onClick={handlePlayAgain}>
                  Play again
                </Button>
                <Button type="button" variant="outline" onClick={handleBackToRequest}>
                  Back to your request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="absolute bottom-2 right-2 z-10 flex gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          // Bumped from the default `icon` size (32px) to meet the ~44x44px
          // minimum touch target guidance (WCAG 2.5.5 / mobile platform
          // guidelines), since this button is a primary touch control
          // (Requirement 6.2), not just a desktop-only affordance.
          // `touch-none` (touch-action: none) stops the browser from
          // waiting to see if this is the start of a scroll/zoom gesture
          // before delivering the pointerdown — without it, taps on mobile
          // can feel delayed by up to ~300ms.
          className="size-11 touch-none"
          aria-label="Jump"
          onPointerDown={handleJumpButtonPointerDown}
        >
          <ArrowUp />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-11 touch-none"
          aria-label="Duck"
          onPointerDown={handleDuckButtonPointerDown}
          onPointerUp={handleDuckButtonRelease}
          onPointerLeave={handleDuckButtonRelease}
          onPointerCancel={handleDuckButtonRelease}
        >
          <ArrowDown />
        </Button>
      </div>

      <div
        ref={catNodeRef}
        className="absolute bottom-0 left-0"
        style={{
          width: CAT_WIDTH,
          height: STAND_HEIGHT,
          transform: `translateX(${CAT_X}px) translateY(0px)`,
        }}
      >
        <CatSprite pose={tick.pose} size={CAT_WIDTH} />
      </div>

      {obstacles.map((obstacle) => (
        <div
          key={obstacle.id}
          ref={(node) => {
            obstacleNodesRef.current.set(obstacle.id, node);
          }}
          className="absolute left-0"
          style={{
            width: obstacle.width,
            height: obstacle.height,
            bottom: obstacle.y,
            transform: `translateX(${obstacle.x}px)`,
          }}
        >
          <ObstacleSprite type={obstacle.type} size={obstacle.height} />
        </div>
      ))}
    </div>
  );
}
