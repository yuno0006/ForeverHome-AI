"use client";

// Whisker Runner gameplay surface: owns the requestAnimationFrame loop and
// the authoritative GameState (kept in a ref, per design.md's "WhiskerRunnerGame"
// section), and renders the cat + obstacles by writing ref-driven inline
// `transform` styles rather than re-rendering on every frame.
//
// Nyan Cat Visual Style (Requirement 5.5):
//   - Blue sky background and green land
//   - Nyan Cat sprite with animations (jump, run, tail wag)
//   - Only ground obstacles (no duck/air obstacles)
//   - Space/ArrowUp or tap to jump
//
// Keyboard input (Space/ArrowUp = jump) is wired in (task 12.2).
// Pointer/touch input (tap-to-jump on the track, on-screen Jump button)
// is wired in (task 12.3). Remaining pieces are extended by later tasks:
//   12.4 - parallax background layer (now Nyan Cat sky)
//   12.5 - HUD (score / best score) — done, see the HUD row below
//   12.6 - idle overlay (start prompt) — done, see the idle overlay Card
//          below; the idle->running status transition itself is wired
//          from jump input (see the keydown handler and
//          `triggerJumpRequest` above).
//   12.7 - Results_Panel (post-collision Card with Play again / Back) —
//          done, see the Results_Panel block below.

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { submitScore } from "@/lib/whiskerRunner/leaderboardService";
import { NyanCatSprite, type CatPose } from "@/components/game/sprites/NyanCatSprite";
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
import { CAT_X, CAT_WIDTH, STAND_HEIGHT, CAT_RENDER_WIDTH, CAT_RENDER_HEIGHT } from "@/types/whiskerRunner";

// ─── Web Audio API sound effects (synthesised, no external files) ───

let _audioCtx: AudioContext | null = null;
let _masterGain: GainNode | null = null;
let _audioReady = false;
let _isMuted = false;

let _musicTimer: number | null = null;
let _musicIndex = 0;
const MELODY = [
  523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
  880.00, 1046.50, 1318.51, 1046.50, // A5, C6, E6, C6
  698.46, 880.00, 1046.50, 880.00, // F5, A5, C6, A5
  783.99, 987.77, 1174.66, 987.77, // G5, B5, D6, B5
];

function playMusicNote(freq: number) {
  if (!_audioCtx || !_masterGain || !_audioReady) return;
  const ctx = _audioCtx;
  const now = ctx.currentTime;
  const duration = 0.8; // 800ms note duration
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = "sine"; // soft healing tone
  osc.frequency.setValueAtTime(freq, now);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.1); // soft ambient music level
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
  osc.connect(gain);
  gain.connect(_masterGain);
  
  osc.start(now);
  osc.stop(now + duration);
}

function startMusic() {
  if (_musicTimer) return;
  initAudio();
  _musicIndex = 0;
  
  if (MELODY[_musicIndex]) {
    playMusicNote(MELODY[_musicIndex]);
  }
  
  _musicTimer = window.setInterval(() => {
    _musicIndex = (_musicIndex + 1) % MELODY.length;
    playMusicNote(MELODY[_musicIndex]);
  }, 750);
}

function stopMusic() {
  if (_musicTimer) {
    clearInterval(_musicTimer);
    _musicTimer = null;
  }
}

/** Must be called from a user-gesture handler (pointer/key-down) so the
 *  browser unsuspends the AudioContext. Safe to call multiple times. */
function initAudio(): void {
  if (_audioReady) return;
  if (typeof window === "undefined") return;
  try {
    if (!_audioCtx || _audioCtx.state === "closed") {
      _audioCtx = new AudioContext();
    }
    if (_audioCtx.state === "suspended") {
      _audioCtx.resume();
    }
    if (!_masterGain) {
      _masterGain = _audioCtx.createGain();
      _masterGain.gain.value = 1.0;
      _masterGain.connect(_audioCtx.destination);
    }
    _audioReady = true;
  } catch {
    // Silently ignore — audio is optional decoration
  }
}

function playTone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = "square",
  volume = 0.6,
  frequencyEnd?: number,
): OscillatorNode | null {
  initAudio();
  if (!_audioCtx || !_masterGain || !_audioReady) return null;

  const ctx = _audioCtx;
  const now = ctx.currentTime;
  const end = now + durationMs / 1000;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (frequencyEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(frequencyEnd, end);
  }
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, end);
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(now);
  osc.stop(end);
  return osc;
}

const SoundFx = {
  /** Cute "boing" chirp on jump */
  jump() {
    playTone(523, 80, "square", 0.16, 1047);       // C5→C6 chirp
    setTimeout(() => playTone(659, 50, "square", 0.10), 40); // quick E5 follow
  },
  /** Sparkly coin ding every 100 points */
  score() {
    playTone(1175, 130, "triangle", 0.22);          // D6
    setTimeout(() => playTone(1480, 100, "triangle", 0.18), 80);   // F#6
    setTimeout(() => playTone(1760, 120, "triangle", 0.14), 160);  // A6
  },
  /** Sad descending buzz on game over */
  gameOver() {
    playTone(523, 150, "sawtooth", 0.4, 392);  // C5→G4 fall
    setTimeout(() => playTone(330, 200, "sawtooth", 0.35, 196), 130);   // E4→G3
    setTimeout(() => playTone(220, 350, "sawtooth", 0.3, 110), 280);  // A3→A2
  },
};

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
const TRACK_HEIGHT = 400;

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
  const { user, userDoc } = useAuth();

  // Keep auth info in refs so the RAF loop (captured in useEffect([], []))
  // always reads the latest identity, not stale closure values.
  const userIdRef = useRef(user?.uid ?? "guest");
  const displayNameRef = useRef(
    userDoc?.displayName || user?.displayName || user?.email?.split("@")[0] || "Anonymous Cat",
  );
  userIdRef.current = user?.uid ?? "guest";
  displayNameRef.current =
    userDoc?.displayName || user?.displayName || user?.email?.split("@")[0] || "Anonymous Cat";

  // Authoritative game state, mutated every frame by the pure `stepGame`.
  // A ref (not useState) so the RAF loop can read/write it every frame
  // without triggering a re-render on every single update.
  const stateRef = useRef<GameState>(createInitialState(getBestScore()));

  // Throttled(-ish) React state slice for the pieces of the UI that need to
  // re-render (score digits, status banner, etc.). Synced from `stateRef`
  // once per frame for now; later tasks may refine the throttling.
  const [tick, setTick] = useState<GameTick>(() => tickFromState(stateRef.current, false));

  // Audio muting state
  const [isMutedState, setIsMutedState] = useState(false);

  // Milestone confetti burst and celebration banner
  const [milestoneTrigger, setMilestoneTrigger] = useState(0);
  const currentMilestone = Math.floor(tick.score / 100);

  useEffect(() => {
    if (currentMilestone > 0) {
      setMilestoneTrigger(currentMilestone);
      const timer = setTimeout(() => setMilestoneTrigger(0), 1800); // Display for 1.8s
      return () => clearTimeout(timer);
    }
  }, [currentMilestone]);

  // Controlled background music loop
  useEffect(() => {
    if (tick.status === "running") {
      startMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [tick.status]);

  // DOM refs for direct, reconciliation-free positioning of the cat and
  // obstacle sprites every frame.
  const catNodeRef = useRef<HTMLDivElement | null>(null);
  const obstacleNodesRef = useRef<Map<string, HTMLDivElement | null>>(new Map());

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
  const passedObstaclesRef = useRef<Set<string>>(new Set());
  const backHillsRef = useRef<HTMLDivElement | null>(null);
  const frontHillsRef = useRef<HTMLDivElement | null>(null);

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

  // Keyboard listeners (task 12.2). Registered in their own `useEffect` with
  // its own cleanup, kept separate from the RAF effect below so the two
  // concerns (input wiring vs. the frame loop) don't need to share a single
  // effect body or teardown function.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key;

      if (key === " " || key === "Spacebar" || key === "ArrowUp") {
        event.preventDefault();

        if (!heldKeysRef.current.has(key)) {
          heldKeysRef.current.add(key);
          triggerJumpRequest();
        }
        return;
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      const key = event.key;

      if (key === " " || key === "Spacebar" || key === "ArrowUp") {
        heldKeysRef.current.delete(key);
        return;
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
    // Only allow jump if no jump is already requested this frame,
    // and the cat is either on the ground (catY === 0) or the game is idle.
    if (
      !jumpRequestedRef.current &&
      (stateRef.current.status === "idle" ||
        (stateRef.current.status === "running" && stateRef.current.catY === 0))
    ) {
      jumpRequestedRef.current = true;
      SoundFx.jump();

      if (stateRef.current.status === "idle") {
        bestScoreBeforeRunRef.current = stateRef.current.bestScore;
        stateRef.current = { ...stateRef.current, status: "running" };
        passedObstaclesRef.current.clear();
      }
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
    passedObstaclesRef.current.clear();
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
            SoundFx.gameOver();
            if (!bestScoreRecordedRef.current) {
              bestScoreRecordedRef.current = true;
              const { best, isNewHighScore } = setBestScoreIfHigher(stepped.score);

              // Submit score to global leaderboard (personal best per user)
              if (stepped.score > 0) {
                submitScore(userIdRef.current, displayNameRef.current, stepped.score).catch((err) => {
                  console.error("Failed to submit score:", err);
                });
              }

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
            // Play score sound when passing an obstacle
            for (const obstacle of stepped.obstacles) {
              if (obstacle.x + obstacle.width < CAT_X && !passedObstaclesRef.current.has(obstacle.id)) {
                passedObstaclesRef.current.add(obstacle.id);
                SoundFx.score();
              }
            }
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

        // Parallax scrolling for hills
        const distance = next.distance;
        const backOffset = -(distance * 0.08) % 512;
        const frontOffset = -(distance * 0.22) % 512;

        if (backHillsRef.current) {
          backHillsRef.current.style.transform = `translateX(${backOffset}px)`;
        }
        if (frontHillsRef.current) {
          frontHillsRef.current.style.transform = `translateX(${frontOffset}px)`;
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

  // Automated 7-Phase Cycle: repeats every 7000 points.
  // 7 seasons of 1000 pts each (700 pts stay, 300 pts transition).
  const localScore = tick.score % 7000;
  const seasonIndex = Math.floor(localScore / 1000);
  const nextSeasonIndex = (seasonIndex + 1) % 7;
  const progressInSeason = localScore % 1000;

  let currentWeight = 1;
  let nextWeight = 0;

  if (progressInSeason >= 700) {
    const t = (progressInSeason - 700) / 300;
    currentWeight = 1 - t;
    nextWeight = t;
  }

  const weights = Array(7).fill(0);
  weights[seasonIndex] = currentWeight;
  weights[nextSeasonIndex] = nextWeight;

  // Let's define the moon weight (Spooky season (1) and Cosmic space (3) are night!)
  const nightW = weights[1] + weights[3];
  
  // Morning/Day weight (Summer (0), Spring (2), Rainy (5), Winter (6))
  const morningW = weights[0] + weights[2] + weights[5] + weights[6];

  // Evening/Sunset weight (Autumn (4))
  const eveningW = weights[4];

  // Calculate Sun position and size based on Morning vs Evening weights
  const sunActiveW = morningW + eveningW;
  const sunRightPercent = sunActiveW > 0 ? (morningW * 15 + eveningW * 65) / sunActiveW : 15;
  const sunTopPx = sunActiveW > 0 ? (morningW * 28 + eveningW * 65) / sunActiveW : 28;
  const sunScale = sunActiveW > 0 ? (morningW * 1.0 + eveningW * 1.15) / sunActiveW : 1.0;

  // Select thematic information for Game Over screen based on crashed season
  const crashSeason = Math.floor((tick.score % 7000) / 1000);
  const seasonDetails = [
    { label: "Beach Breeze 🏖️", msg: "Splashed by a big wave!" },
    { label: "Mystic Night 👻", msg: "Spooked by glowing wisps!" },
    { label: "Spring Breeze 🌸", msg: "Cherry blossoms caught your paws!" },
    { label: "Cosmic Space 🌌", msg: "Lost in the sparkling kitty nebula!" },
    { label: "Autumn Wind 🍂", msg: "Swept away by tumbling leaves!" },
    { label: "Monsoon Rain 🌧️", msg: "Slipped on a wet puddle!" },
    { label: "Winter Snow ❄️", msg: "Brrr! Paws are frozen solid!" },
  ];
  const currentSeasonInfo = seasonDetails[crashSeason] || seasonDetails[0];

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
      {/* ─── Sky Layer 0: Summer Beach (Vibrant Sky Blue) ─── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #1E88E5 0%, #4FC3F7 60%, #E0F7FA 100%)",
          opacity: weights[0],
        }}
      />
      {/* ─── Sky Layer 1: Spooky (Indigo & Glow Green) ─── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #2C003E 0%, #510A32 50%, #15B7B9 100%)",
          opacity: weights[1],
        }}
      />
      {/* ─── Sky Layer 2: Spring (Cherry Blossom Pink) ─── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #FFD1D4 0%, #D4E6F1 100%)",
          opacity: weights[2],
        }}
      />
      {/* ─── Sky Layer 3: Cosmic (Galaxy Pink-Purple) ─── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #090A1A 0%, #120D2C 40%, #5F0F40 75%, #0F4C81 100%)",
          opacity: weights[3],
        }}
      />
      {/* ─── Sky Layer 4: Autumn (Sunset Orange) ─── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #D35400 0%, #F39C12 60%, #FDEBD0 100%)",
          opacity: weights[4],
        }}
      />
      {/* ─── Sky Layer 5: Rainy (Stormy Dark Grey) ─── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #34495E 0%, #5D6D7E 50%, #BDC3C7 100%)",
          opacity: weights[5],
        }}
      />
      {/* ─── Sky Layer 6: Winter (Soft Grey-Blue) ─── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #5D6D7E 0%, #AEB6BF 60%, #EAEDED 100%)",
          opacity: weights[6],
        }}
      />

      {/* ─── Stars (Visible in Night: Case 5 & 6) ─── */}
      <div
        className="absolute inset-0 z-[1] overflow-hidden pointer-events-none"
        style={{ opacity: nightW }}
        aria-hidden="true"
      >
        {[
          [5,4], [14,8], [23,3], [35,10], [48,5],
          [55,12], [66,6], [78,9], [88,4], [92,11],
          [8,16], [18,18], [30,14], [42,20], [60,15],
          [72,19], [85,13], [94,17], [28,22], [50,24],
          [68,26], [82,22], [10,28], [38,30], [58,28],
        ].map(([left, top], i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${1.5 + (i % 3) * 1.2}px`,
              height: `${1.5 + (i % 3) * 1.2}px`,
              opacity: 0.35 + (i % 5) * 0.13,
              animation: `star-twinkle ${2 + (i % 3)}s ease-in-out ${i * 0.17}s infinite`,
              boxShadow: i % 7 === 0 ? "0 0 3px 1px rgba(255,255,255,0.3)" : "none",
            }}
          />
        ))}
      </div>

      {/* ─── Cute Crescent Moon (Rises at night, sets otherwise) ─── */}
      <div
        className="absolute left-[15%] z-[1] pointer-events-none select-none"
        style={{
          top: "32px",
          transform: `translateY(${(1 - nightW) * 60}px) rotate(${(1 - nightW) * -15}deg)`,
          opacity: nightW,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-12 h-12 filter drop-shadow-[0_0_8px_rgba(255,253,200,0.4)]">
          <path d="M60,15 C35,15 15,32 15,55 C15,78 35,95 60,95 C44,95 35,80 35,55 C35,30 44,15 60,15 Z" fill="#FFFDE6" />
          {/* Left Eye (Closed happy/sleeping) */}
          <path d="M21,50 Q23,47 25,50" stroke="#3A2E2B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Right Eye (Closed happy/sleeping) */}
          <path d="M27,50 Q29,47 31,50" stroke="#3A2E2B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Cute Cat Smile */}
          <path d="M24.5,53.8 Q26,55.5 27.5,53.8" stroke="#3A2E2B" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Rosy Cheeks */}
          <circle cx="19.5" cy="53.5" r="1.8" fill="#FF8A80" opacity="0.8" />
          <circle cx="32.5" cy="53.5" r="1.8" fill="#FF8A80" opacity="0.8" />
        </svg>
      </div>

      {/* ─── Cute Smiling Sun (Transitions/transits during morning and evening) ─── */}
      <div
        className="absolute z-[1] pointer-events-none select-none"
        style={{
          right: `${sunRightPercent}%`,
          top: `${sunTopPx}px`,
          transform: `scale(${sunScale}) rotate(${(1 - sunActiveW) * 15}deg)`,
          opacity: sunActiveW > 0 ? (morningW * 1.0 + eveningW * 0.8) : 0,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-14 h-14 filter drop-shadow-[0_0_10px_rgba(255,200,50,0.35)]">
          <defs>
            <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF59D" />
              <stop offset="100%" stopColor="#FF9800" />
            </linearGradient>
          </defs>
          <path d="M50,10 L50,16 M50,84 L50,90 M10,50 L16,50 M84,50 L90,50 M22,22 L26,26 M74,74 L78,78 M22,74 L26,70 M74,22 L78,26" stroke="#FFB74D" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="50" r="24" fill="url(#sunGrad)" />
          {/* Cute Face */}
          <circle cx="44" cy="48" r="2" fill="#5D4037" />
          <circle cx="56" cy="48" r="2" fill="#5D4037" />
          <path d="M48,54 Q50,57 52,54" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="40" cy="52" r="2" fill="#FF8A80" opacity="0.8" />
          <circle cx="60" cy="52" r="2" fill="#FF8A80" opacity="0.8" />
        </svg>
      </div>
      {/* ─── Season 0: Summer Beach (Drifting Dandelions in Sky) ─── */}
      {weights[0] > 0.1 && (
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none" style={{ opacity: weights[0] }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={`dandelion-${i}`}
              className="absolute pointer-events-none"
              style={{
                left: `${i * 18 + 5}%`,
                top: `${(i % 3) * 20 - 20}px`,
                animation: `petal-drift ${5 + (i % 3) * 1.5}s linear ${i * 0.4}s infinite`,
              }}
            >
              <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 fill-white/80 filter drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]">
                <circle cx="6" cy="3" r="1.2" />
                <line x1="6" y1="3" x2="3.5" y2="1.5" stroke="white" strokeWidth="0.8" />
                <line x1="6" y1="3" x2="8.5" y2="1.5" stroke="white" strokeWidth="0.8" />
                <line x1="6" y1="3" x2="6" y2="0.8" stroke="white" strokeWidth="0.8" />
                <line x1="6" y1="3" x2="6" y2="8.5" stroke="white" strokeWidth="0.8" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* ─── Season 1: Spring (Cherry Blossom Petals) ─── */}
      {weights[1] > 0.1 && (
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none" style={{ opacity: weights[1] }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={`petal-${i}`}
              className="absolute w-2.5 h-3.5 rounded-br-full rounded-tl-full bg-[#FF6CA7] shadow-[0_0_5px_rgba(255,108,167,0.6)]"
              style={{
                left: `${i * 18 + 5}%`,
                top: `${(i % 3) * 20 - 20}px`,
                animation: `petal-drift ${4 + (i % 3) * 1.5}s linear ${i * 0.4}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ─── Season 2: Autumn (Maple Leaves) ─── */}
      {weights[2] > 0.1 && (
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none" style={{ opacity: weights[2] }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={`leaf-${i}`}
              className="absolute w-3 h-3 bg-amber-600/90"
              style={{
                left: `${i * 18 + 5}%`,
                top: `${(i % 3) * 20 - 20}px`,
                borderRadius: "50% 0 50% 0",
                animation: `leaf-drift ${5 + (i % 2) * 2}s linear ${i * 0.5}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ─── Season 3: Winter (Falling Snowflakes) ─── */}
      {weights[3] > 0.1 && (
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none" style={{ opacity: weights[3] }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={`snow-${i}`}
              className="absolute rounded-full bg-white/90 shadow-[0_0_2px_white]"
              style={{
                left: `${i * 13 + 3}%`,
                top: `-10px`,
                width: `${2 + (i % 3) * 1.5}px`,
                height: `${2 + (i % 3) * 1.5}px`,
                animation: `snow-fall ${3 + (i % 3) * 1.2}s linear ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ─── Season 4: Rainy (Falling Raindrops) ─── */}
      {weights[4] > 0.1 && (
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none" style={{ opacity: weights[4] }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={`rain-${i}`}
              className="absolute bg-sky-200/50"
              style={{
                left: `${i * 10 + 2}%`,
                top: `-20px`,
                width: "1px",
                height: "14px",
                transform: "rotate(15deg)",
                animation: `rain-fall ${1 + (i % 3) * 0.4}s linear ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ─── Season 5: Spooky (Floating Glowing Fireflies) ─── */}
      {weights[5] > 0.1 && (
        <div
          className="absolute inset-0 z-[1] overflow-hidden pointer-events-none"
          style={{ opacity: weights[5] }}
          aria-hidden="true"
        >
          {[
            { left: 15, bottom: 42, delay: 0 },
            { left: 35, bottom: 62, delay: 1.2 },
            { left: 58, bottom: 38, delay: 0.5 },
            { left: 72, bottom: 52, delay: 1.8 },
            { left: 88, bottom: 46, delay: 2.3 },
          ].map((ff, i) => (
            <div
              key={`firefly-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-yellow-200 filter blur-[0.4px] shadow-[0_0_8px_3px_rgba(254,240,138,0.6)]"
              style={{
                left: `${ff.left}%`,
                bottom: `${ff.bottom}px`,
                animation: `firefly-float ${3.5 + (i % 2) * 0.8}s ease-in-out ${ff.delay}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {/* ─── Season 6: Cosmic (Shooting Stars & Nebula dust) ─── */}
      {weights[6] > 0.1 && (
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none" style={{ opacity: weights[6] }}>
          {[0, 1, 2].map((i) => (
            <div
              key={`shooting-star-${i}`}
              className="absolute bg-gradient-to-r from-cyan-300 to-transparent"
              style={{
                left: `${i * 30 + 10}%`,
                top: `${i * 15 + 10}%`,
                width: "60px",
                height: "2px",
                transform: "rotate(-35deg)",
                animation: `cosmic-shoot ${6 + i * 4}s linear ${i * 1.5}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ─── Milestone Celebration Notification Overlay (Top Right Corner) ─── */}
      {milestoneTrigger > 0 && (
        <div className="absolute top-3 right-3 z-30 pointer-events-none flex items-center justify-center animate-milestone-popup">
          <div className="text-honey text-sm font-extrabold drop-shadow-[0_1px_4px_rgba(212,163,89,0.2)] bg-white/95 px-4 py-2 rounded-xl border border-honey/30 shadow-lg flex items-center gap-1">
            ✨ {milestoneTrigger * 100} pts!
          </div>
          {/* Confetti bursting particles */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(12)].map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-honey"
                style={{
                  "--angle": `${i * 30}deg`,
                  animation: "confetti-burst 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards",
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Self-contained custom keyframe animations ─── */}
      <style>{`
        @keyframes bird-fly-1 {
          0% { left: -40px; transform: translateY(0px) scale(0.8); }
          50% { transform: translateY(-10px) scale(0.8); }
          100% { left: 550px; transform: translateY(0px) scale(0.8); }
        }
        @keyframes bird-fly-2 {
          0% { left: -40px; transform: translateY(0px) scale(0.6); }
          50% { transform: translateY(-8px) scale(0.6); }
          100% { left: 550px; transform: translateY(0px) scale(0.6); }
        }
        @keyframes firefly-float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { opacity: 1.0; }
          100% { transform: translateY(-16px) translateX(6px); opacity: 0.4; }
        }
        @keyframes petal-drift {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(380px) translateX(-50px) rotate(360deg); opacity: 0; }
        }
        @keyframes leaf-drift {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.9; }
          85% { opacity: 0.9; }
          100% { transform: translateY(380px) translateX(-80px) rotate(720deg); opacity: 0; }
        }
        @keyframes snow-fall {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(380px) translateX(30px); opacity: 0; }
        }
        @keyframes rain-fall {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(380px) translateX(-100px); opacity: 0; }
        }
        @keyframes cosmic-shoot {
          0% { transform: translate(-100px, -100px) rotate(-35deg); opacity: 0; }
          5% { opacity: 1.0; }
          15% { transform: translate(300px, 200px) rotate(-35deg); opacity: 0; }
          100% { transform: translate(300px, 200px) rotate(-35deg); opacity: 0; }
        }
        @keyframes milestone-popup {
          0% { transform: scale(0.6); opacity: 0; }
          15% { transform: scale(1.15); opacity: 1; }
          85% { transform: scale(1.0); opacity: 1; }
          100% { transform: scale(1.2) translateY(-25px); opacity: 0; }
        }
        @keyframes confetti-burst {
          0% { transform: rotate(var(--angle, 0deg)) translateY(0px) scale(1); opacity: 1; }
          100% { transform: rotate(var(--angle, 0deg)) translateY(65px) scale(0); opacity: 0; }
        }
      `}</style>

      {/* ─── Clouds: fluffy clouds drifting across the sky ─── */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none" aria-hidden="true">
        {[
          { top: 28, scale: 0.55, speed: 32, delay: 0 },
          { top: 38, scale: 0.40, speed: 26, delay: 7 },
          { top: 22, scale: 0.48, speed: 29, delay: 14 },
          { top: 32, scale: 0.35, speed: 35, delay: 3 },
          { top: 18, scale: 0.62, speed: 24, delay: 18 },
        ].map((cloud, i) => (
          <div
            key={`cloud-${i}`}
            className="absolute"
            style={{
              top: `${cloud.top}%`,
              left: `${i * 22 + 5}%`,
              transform: `scale(${cloud.scale})`,
              animation: `cloud-float ${cloud.speed}s linear ${cloud.delay}s infinite`,
              opacity: 0.8,
            }}
          >
            <div className="relative" style={{ width: 90, height: 44 }}>
              <div className="absolute bg-white/75 rounded-full" style={{ width: 44, height: 44, bottom: 0, left: 0 }} />
              <div className="absolute bg-white/85 rounded-full" style={{ width: 54, height: 54, bottom: 8, left: 18 }} />
              <div className="absolute bg-white/70 rounded-full" style={{ width: 38, height: 38, bottom: 2, left: 46 }} />
              <div className="absolute bg-white/80 rounded-full" style={{ width: 34, height: 34, bottom: 0, left: 30 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Distant Parallax Hills & Oceans (Back Layer) ─── */}
      <div className="absolute inset-x-0 bottom-[26px] z-[2] h-[75px] overflow-hidden pointer-events-none select-none">
        <div
          ref={backHillsRef}
          className="flex h-full w-[1536px] will-change-transform"
          style={{ transform: "translateX(0px)" }}
        >
          {[0, 1, 2].map((idx) => (
            <div key={`back-layer-${idx}`} className="relative w-[512px] h-full shrink-0">
              {/* Green Hills (Visible in all non-beach seasons) */}
              <div className="absolute inset-0" style={{ opacity: 1 - weights[0] }}>
                <svg viewBox="0 0 512 80" className="w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M0,80 L0,40 Q60,15 130,45 T280,35 Q360,10 440,38 T512,30 L512,80 Z"
                    fill="#5E9374"
                    opacity="0.45"
                  />
                  <circle cx="100" cy="30" r="5" fill="#4B7A5C" opacity="0.4" />
                  <circle cx="106" cy="32" r="4" fill="#4B7A5C" opacity="0.4" />
                  <polygon points="360,14 356,22 364,22" fill="#4B7A5C" opacity="0.4" />
                  <polygon points="360,8 357,14 363,14" fill="#4B7A5C" opacity="0.4" />
                </svg>
              </div>
              {/* Blue Ocean Horizon & Waves (Visible in Beach Season) */}
              <div className="absolute inset-0" style={{ opacity: weights[0] }}>
                <svg viewBox="0 0 512 80" className="w-full h-full" preserveAspectRatio="none">
                  {/* Distant Sea Horizon */}
                  <rect x="0" y="32" width="512" height="48" fill="#1565C0" opacity="0.4" />
                  {/* Distant Wave crests */}
                  <path d="M0,45 Q40,41 80,45 T160,45 T240,45 T320,45 T400,45 T480,45 T512,45" fill="none" stroke="#2196F3" strokeWidth="1.5" opacity="0.5" />
                  <path d="M0,58 Q40,54 80,58 T160,58 T240,58 T320,58 T400,58 T480,58 T512,58" fill="none" stroke="#2196F3" strokeWidth="1.5" opacity="0.4" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Near Parallax Hills & Oceans (Front Layer) ─── */}
      <div className="absolute inset-x-0 bottom-[26px] z-[2] h-[50px] overflow-hidden pointer-events-none select-none">
        <div
          ref={frontHillsRef}
          className="flex h-full w-[1536px] will-change-transform"
          style={{ transform: "translateX(0px)" }}
        >
          {[0, 1, 2].map((idx) => (
            <div key={`front-layer-${idx}`} className="relative w-[512px] h-full shrink-0">
              {/* Green Hills (Visible in all non-beach seasons) */}
              <div className="absolute inset-0" style={{ opacity: 1 - weights[0] }}>
                <svg viewBox="0 0 512 80" className="w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M0,80 L0,50 Q80,25 160,55 T320,45 Q400,20 470,52 T512,45 L512,80 Z"
                    fill="#4D8061"
                    opacity="0.75"
                  />
                  <circle cx="200" cy="46" r="6" fill="#3D664D" opacity="0.7" />
                  <circle cx="207" cy="48" r="5" fill="#3D664D" opacity="0.7" />
                  <polygon points="410,28 405,38 415,38" fill="#3D664D" opacity="0.7" />
                  <polygon points="410,33 403,45 417,45" fill="#3D664D" opacity="0.7" />
                </svg>
              </div>
              {/* Nearer Ocean Waves (Visible in Beach Season) */}
              <div className="absolute inset-0" style={{ opacity: weights[0] }}>
                <svg viewBox="0 0 512 80" className="w-full h-full" preserveAspectRatio="none">
                  {/* Rolling turquoise waves */}
                  <path
                    d="M0,80 L0,48 Q40,38 80,48 T160,48 T240,48 T320,48 T400,48 T480,48 T512,48 L512,80 Z"
                    fill="#00ACC1"
                    opacity="0.75"
                  />
                  {/* Wave foam accents */}
                  <path d="M0,48 Q40,38 80,48 T160,48 T240,48 T320,48 T400,48 T480,48 T512,48" fill="none" stroke="#E0F7FA" strokeWidth="2.5" opacity="0.9" />
                  {/* Additional wave lines */}
                  <path d="M20,62 Q60,56 100,62 T180,62 T260,62 T340,62 T420,62 T500,62" fill="none" stroke="#E0F7FA" strokeWidth="1.5" opacity="0.6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Ground: dynamically crossfaded earth matching the time of day ─── */}
      <div
        className="absolute inset-x-0 bottom-0 z-[2] overflow-hidden"
        style={{
          height: "28px",
          borderTop: "2px solid rgba(255,255,255,0.18)",
          boxShadow: "0 -1px 3px rgba(0,0,0,0.05) inset",
        }}
        aria-hidden="true"
      >
        {/* Ground: Summer Beach Sand (golden sandy brown) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #F4D090 0%, #E2B770 40%, #C49850 85%, #9E7430 100%)",
            opacity: weights[0],
          }}
        />
        {/* Ground: Spooky (graveyard moss green) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #4A574A 0%, #303A30 40%, #202720 85%, #121812 100%)",
            opacity: weights[1],
          }}
        />
        {/* Ground: Spring (Vibrant blossom green) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #A2D19E 0%, #76A572 40%, #52824E 85%, #395E35 100%)",
            opacity: weights[2],
          }}
        />
        {/* Ground: Cosmic (galactic purple/neon) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #5C2C90 0%, #3F176B 40%, #29084A 85%, #180033 100%)",
            opacity: weights[3],
          }}
        />
        {/* Ground: Autumn (warm sunset-kissed orange-gold) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #DEAA73 0%, #B98651 40%, #7E5F3D 85%, #594025 100%)",
            opacity: weights[4],
          }}
        />
        {/* Ground: Rainy (wet dark mud) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #786C5F 0%, #5A4E42 40%, #3F3327 85%, #2B2117 100%)",
            opacity: weights[5],
          }}
        />
        {/* Ground: Winter Snow (soft white-grey snow) */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #E4E7EB 40%, #C8CED4 85%, #ADB5BD 100%)",
            opacity: weights[6],
          }}
        />

        {/* Grass blade accents (semi-transparent white so they auto-tint with the ground) */}
        {[4, 14, 26, 38, 50, 62, 74, 86, 94].map((left, i) => (
          <div
            key={`grass-${i}`}
            className="absolute z-10"
            style={{
              left: `${left}%`,
              bottom: "22px",
              width: "2px",
              height: `${6 + (i % 3) * 3}px`,
              background: "rgba(255, 255, 255, 0.28)",
              borderRadius: "1px 1px 0 0",
              transform: `rotate(${(i % 5) * 6 - 12}deg)`,
            }}
          />
        ))}
      </div>

      {/* ─── HUD: always-visible scoreboard on the left, Chrome Dino style ─── */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2.5 pointer-events-none">
        <span className="rounded-xl bg-white/90 backdrop-blur-md px-4 py-2 text-base font-extrabold text-cocoa shadow-lg border border-cocoa/10 tracking-tight">
          🐾 {tick.score.toString().padStart(5, "0")}
        </span>
        <span className="rounded-xl bg-white/80 backdrop-blur-md px-3 py-2 text-xs font-bold text-cocoa/50 shadow-sm border border-cocoa/5 tracking-wide uppercase">
          HI {tick.bestScore.toString().padStart(5, "0")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onPointerDown={(e) => {
            e.stopPropagation();
            initAudio();
            if (_masterGain) {
              _isMuted = !_isMuted;
              _masterGain.gain.setValueAtTime(_isMuted ? 0 : 1.0, _audioCtx?.currentTime || 0);
              setIsMutedState(_isMuted);
            }
          }}
          className="h-8 w-8 rounded-xl bg-white/80 backdrop-blur-md shadow-sm border border-cocoa/5 hover:bg-white flex items-center justify-center pointer-events-auto"
          aria-label={isMutedState ? "Unmute audio" : "Mute audio"}
        >
          {isMutedState ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-cocoa/60">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM4.3 3L3 4.3 8.7 10H5v4h3l5 5v-6.7l4.3 4.3c-.63.48-1.34.86-2.13 1.1v2.04c1.33-.29 2.53-.94 3.54-1.84L20.3 21 21 19.7 4.3 3zM12 4L9.9 6.1 12 8.2V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-cocoa/60">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </Button>
      </div>

      {/* ─── Idle overlay: polished start prompt ─── */}
      {tick.status === "idle" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-cocoa/15 backdrop-blur-[2px]">
          <Card className="max-w-xs text-center shadow-2xl border-cocoa/10 bg-white/95">
            <CardContent className="pt-6 pb-5 space-y-2">
              <p className="text-xl font-bold text-cocoa">🐾 Whisker Runner</p>
              <p className="text-sm text-cocoa/60 leading-relaxed">
                Help <span className="font-bold text-cocoa/80">{catName}</span> dodge household hazards!<br />
                <span className="text-xs text-cocoa/40">Tap anywhere • Click • Press Space</span>
              </p>
              <Button
                type="button"
                className="mt-2 rounded-full px-6 font-bold shadow-md"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  triggerJumpRequest();
                }}
              >
                Start Running
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Results panel: polished game-over card ─── */}
      {tick.status === "ended" && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-cocoa/25 backdrop-blur-[2px]"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Card className="max-w-xs text-center shadow-2xl border-cocoa/10 bg-white/95 animate-pop-in">
            <CardContent className="pt-6 pb-5 space-y-2">
              {tick.isNewHighScore && (
                <div className="mx-auto rounded-full bg-honey/20 px-4 py-1 text-sm font-extrabold text-honey border border-honey/30">
                  ⭐ New High Score!
                </div>
              )}
              <div className="space-y-0.5">
                <p className="text-3xl font-extrabold text-cocoa">{tick.score}</p>
                <p className="text-xs text-cocoa/40">
                  Best: <span className="font-bold text-cocoa/60">{tick.bestScore}</span>
                </p>
              </div>
              <div className="rounded-xl bg-cocoa/5 p-2.5 border border-cocoa/5">
                <p className="text-xs font-extrabold text-honey">{currentSeasonInfo.label}</p>
                <p className="text-[11px] text-cocoa/60 font-medium italic leading-snug mt-0.5">
                  "{currentSeasonInfo.msg}"
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-center pt-1 sm:flex-row">
                <Button type="button" onClick={handlePlayAgain} className="font-bold rounded-full px-5">
                  Play Again
                </Button>
                <Button type="button" variant="outline" onClick={handleBackToRequest} className="rounded-full px-5">
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      <div
        ref={catNodeRef}
        className="absolute bottom-0 left-0 overflow-visible z-[3]"
        style={{
          width: CAT_RENDER_WIDTH,
          height: CAT_RENDER_HEIGHT,
          // Offset so the collision hurtbox stays centered inside the larger visual container
          marginLeft: -(CAT_RENDER_WIDTH - CAT_WIDTH) / 2,
          marginBottom: -(CAT_RENDER_HEIGHT - STAND_HEIGHT),
          transform: `translateX(${CAT_X}px) translateY(0px)`,
        }}
      >
        <NyanCatSprite pose={tick.pose} />
      </div>

      {obstacles.map((obstacle) => (
        <div
          key={obstacle.id}
          ref={(node) => {
            obstacleNodesRef.current.set(obstacle.id, node);
          }}
          className="absolute left-0 z-[2]"
          style={{
            width: obstacle.width,
            height: obstacle.height,
            bottom: obstacle.y,
            transform: `translateX(${obstacle.x}px)`,
          }}
        >
          <ObstacleSprite
            type={obstacle.type}
            size={obstacle.height}
            variant={parseInt(obstacle.id.split("-")[1]) || 0}
            seasonIndex={seasonIndex}
          />
        </div>
      ))}
    </div>
  );
}
