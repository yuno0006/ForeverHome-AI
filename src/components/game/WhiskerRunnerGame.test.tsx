/**
 * Unit tests for `WhiskerRunnerGame`.
 *
 * Covers:
 * - The "idle" start prompt Card rendering on initial mount.
 * - The Results_Panel with the correct new-high-score condition on
 *   "ended" status (driven deterministically via a partial mock of
 *   `gameEngine`'s `stepGame`/`checkCollision` so a collision + high score
 *   happen on the very next real animation frame, rather than trying to
 *   naturally simulate real gameplay physics/timing).
 * - Keyboard input (Space) transitioning idle -> running.
 * - Pointer input (pointerdown on the track) transitioning idle -> running.
 * - `prefers-reduced-motion` disabling the parallax drift animation class
 *   while leaving the on-screen Jump/Duck controls rendered and functional.
 *
 * The component's RAF loop is left running with the real
 * `window.requestAnimationFrame` (available in this project's jsdom test
 * environment) rather than faked/stubbed — `waitFor` is used to await the
 * next real frame's effects, since `setTick` (the only state update that
 * causes a re-render) is skipped on the very first frame after mount.
 *
 * _Requirements: 2.9, 4.1, 4.3, 6.5_
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { WhiskerRunnerGame } from "./WhiskerRunnerGame";

// Mutable control flags read by the `gameEngine` mock below. Declared via
// `vi.hoisted` so they're initialized before the hoisted `vi.mock` factory
// (which is hoisted above this file's imports) can reference them.
const controls = vi.hoisted(() => ({
  forceCollision: false,
  forceHighScore: false,
}));

// Partial mock: real `createInitialState`/`requestJump`/`setDucking`/
// `computeScore` behavior is preserved (imported via `importActual`), but
// `stepGame` and `checkCollision` are wrapped so a single test can force a
// deterministic collision + high-scoring run without depending on real
// obstacle-spawn timing/physics (which is randomized per design.md).
// `canvas-confetti` drives its own internal `requestAnimationFrame` loop
// that calls `HTMLCanvasElement#getContext("2d")`, which jsdom doesn't
// implement (no bundled `canvas` package here) and throws asynchronously
// well after the synchronous `try/catch` in `WhiskerRunnerGame` around the
// `confetti(...)` call has already returned. Since the celebration burst is
// purely decorative and not part of what these tests assert on, it's
// replaced with a no-op so the "new high score" test doesn't trip over an
// unrelated jsdom canvas limitation.
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

vi.mock("@/lib/whiskerRunner/gameEngine", async () => {
  const actual = await vi.importActual<typeof import("@/lib/whiskerRunner/gameEngine")>(
    "@/lib/whiskerRunner/gameEngine"
  );

  return {
    ...actual,
    stepGame: vi.fn((state: Parameters<typeof actual.stepGame>[0], deltaMs: number, input: Parameters<typeof actual.stepGame>[2]) => {
      const result = actual.stepGame(state, deltaMs, input);
      if (controls.forceHighScore) {
        return { ...result, score: 9999, distance: 99999 };
      }
      return result;
    }),
    checkCollision: vi.fn((state: Parameters<typeof actual.checkCollision>[0]) => {
      if (controls.forceCollision) return true;
      return actual.checkCollision(state);
    }),
  };
});

/** Installs a `window.matchMedia` mock returning a fixed `matches` value. */
function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => {
  window.localStorage.clear();
  controls.forceCollision = false;
  controls.forceHighScore = false;
  // Default: no reduced-motion preference, so the parallax drift animation
  // is enabled unless a specific test overrides this.
  mockMatchMedia(false);
});

describe("WhiskerRunnerGame", () => {
  it("renders the idle start prompt before any input", () => {
    render(<WhiskerRunnerGame catName="Luna" />);

    expect(screen.getByText("Whisker Runner 🐾")).toBeTruthy();

    const track = document.querySelector("[data-status]");
    expect(track?.getAttribute("data-status")).toBe("idle");
  });

  it("renders the Results_Panel with the new-high-score condition on ended status", async () => {
    controls.forceCollision = true;
    controls.forceHighScore = true;

    const { container } = render(<WhiskerRunnerGame catName="Luna" />);

    // Start the run (idle -> running) via a jump input, then let the real
    // RAF loop process a frame where the mocked `stepGame`/`checkCollision`
    // force an immediate, high-scoring collision.
    fireEvent.keyDown(document, { key: " " });

    await waitFor(
      () => {
        const track = container.querySelector("[data-status]");
        expect(track?.getAttribute("data-status")).toBe("ended");
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("New High Score! 🎉")).toBeTruthy();
    expect(screen.getByText("9999")).toBeTruthy();
    // "Best: 9999" appears both in the HUD and the Results_Panel once the
    // run has ended with a new high score.
    expect(screen.getAllByText("Best: 9999").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Play again")).toBeTruthy();
    expect(screen.getByText("Back to your request")).toBeTruthy();
  });

  it("transitions from idle to running on a keydown Space press", async () => {
    const { container } = render(<WhiskerRunnerGame catName="Luna" />);

    const track = container.querySelector("[data-status]");
    expect(track?.getAttribute("data-status")).toBe("idle");

    fireEvent.keyDown(document, { key: " " });

    await waitFor(() => {
      expect(track?.getAttribute("data-status")).toBe("running");
    });

    // The idle Card should have unmounted once running.
    expect(screen.queryByText("Whisker Runner 🐾")).toBeNull();
  });

  it("transitions from idle to running on a pointerdown on the track", async () => {
    const { container } = render(<WhiskerRunnerGame catName="Luna" />);

    const track = container.querySelector("[data-status]") as HTMLElement;
    expect(track.getAttribute("data-status")).toBe("idle");

    fireEvent.pointerDown(track);

    await waitFor(() => {
      expect(track.getAttribute("data-status")).toBe("running");
    });

    expect(screen.queryByText("Whisker Runner 🐾")).toBeNull();
  });

  it("disables the parallax drift animation under prefers-reduced-motion while keeping controls functional", () => {
    mockMatchMedia(true);

    const { container } = render(<WhiskerRunnerGame catName="Luna" />);

    const pawPatternLayer = container.querySelector(".paw-pattern");
    expect(pawPatternLayer).not.toBeNull();
    expect(pawPatternLayer?.classList.contains("animate-bg-drift")).toBe(false);

    // Jump/Duck controls remain rendered and enabled under reduced motion.
    const jumpButton = screen.getByRole("button", { name: "Jump" });
    const duckButton = screen.getByRole("button", { name: "Duck" });
    expect(jumpButton).toBeTruthy();
    expect(duckButton).toBeTruthy();
    expect(jumpButton.hasAttribute("disabled")).toBe(false);
    expect(duckButton.hasAttribute("disabled")).toBe(false);
  });

  it("keeps jump/duck/scroll/collision gameplay fully functional under prefers-reduced-motion", async () => {
    mockMatchMedia(true);

    const { container } = render(<WhiskerRunnerGame catName="Luna" />);

    const pawPatternLayer = container.querySelector(".paw-pattern");
    expect(pawPatternLayer).not.toBeNull();
    expect(pawPatternLayer?.classList.contains("animate-bg-drift")).toBe(false);

    const track = container.querySelector("[data-status]") as HTMLElement;
    expect(track.getAttribute("data-status")).toBe("idle");

    // Start the run (idle -> running) via a jump input, same pattern as the
    // "transitions from idle to running" tests above.
    fireEvent.keyDown(document, { key: " " });

    await waitFor(() => {
      expect(track.getAttribute("data-status")).toBe("running");
    });

    // Simulate a duck input while running: this should not throw or crash,
    // confirming gameplay stays responsive under reduced motion.
    expect(() => {
      fireEvent.keyDown(document, { key: "ArrowDown" });
      fireEvent.keyUp(document, { key: "ArrowDown" });
    }).not.toThrow();

    // Force a collision to drive the full run-to-collision gameplay loop
    // (scroll + collision) to completion.
    controls.forceCollision = true;

    await waitFor(
      () => {
        expect(track.getAttribute("data-status")).toBe("ended");
      },
      { timeout: 3000 }
    );

    // The Results_Panel appears, confirming the collision->end->panel
    // gameplay loop still works end-to-end under reduced motion.
    expect(screen.getByText("Play again")).toBeTruthy();

    // The decorative reduced-motion toggle is untouched by gameplay
    // progressing to "ended".
    expect(pawPatternLayer?.classList.contains("animate-bg-drift")).toBe(false);
  });
});
