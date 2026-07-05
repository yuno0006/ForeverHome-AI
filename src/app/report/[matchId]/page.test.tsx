/**
 * Unit tests for the Report Page's `requestSent` branch
 * (`src/app/report/[matchId]/page.tsx`), covering the Whisker Runner
 * integration added in task 15.1:
 *
 * - Both the "Play: Whisker Runner 🐾" button and the existing
 *   "Continue to 14-Day Coach" button render once `requestSent` is true.
 * - The "Continue to 14-Day Coach" button's `onClick` is unchanged: it
 *   still calls `router.push` with `/coach/{catId}-adoption-1`.
 * - Clicking "Play: Whisker Runner 🐾" opens the Game_Dialog (asserted via
 *   a mocked `WhiskerRunnerDialog` test double) without calling
 *   `router.push` and without changing the current URL.
 *
 * To reach `requestSent` without a full integration setup, this test
 * mocks `next/navigation`, `@/hooks/useAuth`, `global.fetch` (for
 * `/api/counselor` and `/api/adoption-request`), and
 * `@/components/game/WhiskerRunnerDialog` (already covered by its own
 * test file), then drives the real component through its actual
 * "Start Adoption Process" -> fill form -> "Send Request" UI flow so
 * `requestSent` becomes `true` via the component's own
 * `handleSubmitAdoptionRequest`, rather than reaching into internal
 * state directly. `sessionStorage.getItem(matchId)` is seeded with a
 * `Match` fixture referencing "luna" (a real id from `demoCats`) so
 * `loadMatch` resolves synchronously from session storage and never
 * needs to call `fetchAssessment`/`fetchAdopterProfile`. `ttsSupported`
 * naturally evaluates to `false` in jsdom (no `speechSynthesis`), so no
 * TTS mocking is needed either.
 *
 * _Requirements: 1.2, 1.3, 1.4, 1.5_
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import type { Match } from "@/types/match";

const MATCH_ID = "test-match-1";
const CAT_ID = "luna"; // real id from demoCats

const routerControls = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ matchId: MATCH_ID }),
  useRouter: () => ({ push: routerControls.push }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, userDoc: null }),
}));

// `loadMatch` resolves synchronously from `sessionStorage` in these tests,
// so these are never actually invoked — but `firestoreService.ts` eagerly
// initializes Firebase Auth at import time (`src/lib/firebase.ts`), which
// throws in this test environment without real Firebase config. Mocking
// the module avoids that unrelated initialization failure.
vi.mock("@/lib/firestoreService", () => ({
  fetchAssessment: vi.fn(),
  fetchAdopterProfile: vi.fn(),
}));

// Already covered by its own test file (WhiskerRunnerDialog.test.tsx) —
// mocked here with a simple test double so this test focuses on the
// report page's own button wiring, not the dialog's internals.
vi.mock("@/components/game/WhiskerRunnerDialog", () => ({
  WhiskerRunnerDialog: (props: { open: boolean }) =>
    props.open ? <div data-testid="game-dialog-open" /> : null,
}));

// Dynamically imported after the above mocks are registered, per Vitest's
// hoisting model for `vi.mock`.
import ReportPage from "./page";

function buildMatchFixture(): Match {
  return {
    id: MATCH_ID,
    catId: CAT_ID,
    adopterAnswers: {
      homeType: "house",
      adultsInHome: 2,
      children: [],
      existingPets: { cats: 0, dogs: 0 },
      householdNoise: "low",
      hoursAway: 4,
      travelFrequency: "rare",
      previousCatExperience: true,
      specialNeedsExperience: false,
      canProvideVerticalSpace: true,
      indoorSafety: "secure",
      veterinaryAccess: "yes",
      comfortableWithRoutineCare: true,
      scenarioAnswers: [],
    },
    result: {
      level: "high",
      concerns: [],
      strengths: [],
      mitigations: [],
      requiresShelterReview: false,
      alternativeCatIds: [],
    },
    timestamp: new Date().toISOString(),
  };
}

beforeEach(() => {
  sessionStorage.clear();
  sessionStorage.setItem(MATCH_ID, JSON.stringify(buildMatchFixture()));
  routerControls.push.mockClear();

  global.fetch = vi.fn((url: unknown) => {
    const href = String(url);
    if (href.includes("/api/counselor")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ explanation: "This is a great match!" }),
      } as Response);
    }
    if (href.includes("/api/adoption-request")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response);
    }
    return Promise.reject(new Error(`Unhandled fetch in test: ${href}`));
  }) as unknown as typeof fetch;
});

/**
 * Renders the Report Page and drives it through the real adoption-request
 * UI flow (Start Adoption Process -> fill form -> Send Request) so
 * `requestSent` becomes `true` via the component's own
 * `handleSubmitAdoptionRequest`, landing on the Congrats_Card.
 */
async function renderAndReachRequestSent() {
  render(<ReportPage />);

  const startButton = await screen.findByRole("button", {
    name: /Start Adoption Process/i,
  });
  fireEvent.click(startButton);

  const nameInput = await screen.findByLabelText(/Your name/i);
  const emailInput = screen.getByLabelText(/Email/i);
  fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
  fireEvent.change(emailInput, { target: { value: "jane@example.com" } });

  const sendButton = screen.getByRole("button", { name: /Send Request/i });
  fireEvent.click(sendButton);

  await screen.findByText(/Congrats on taking the next step/i);
}

describe("ReportPage requestSent branch", () => {
  it("renders both the Whisker Runner button and the Continue to 14-Day Coach button, wired correctly", async () => {
    await renderAndReachRequestSent();

    const playButton = screen.getByRole("button", {
      name: /Play: Whisker Runner/i,
    });
    const continueButton = screen.getByRole("button", {
      name: /Continue to 14-Day Coach/i,
    });
    expect(playButton).toBeTruthy();
    expect(continueButton).toBeTruthy();

    fireEvent.click(continueButton);
    expect(routerControls.push).toHaveBeenCalledWith(
      `/coach/${CAT_ID}-adoption-1`
    );
  });

  it("opens the game dialog on 'Play: Whisker Runner' without navigating or changing the URL", async () => {
    await renderAndReachRequestSent();

    const initialPathname = window.location.pathname;
    expect(screen.queryByTestId("game-dialog-open")).toBeNull();

    const playButton = screen.getByRole("button", {
      name: /Play: Whisker Runner/i,
    });
    fireEvent.click(playButton);

    expect(screen.getByTestId("game-dialog-open")).toBeTruthy();
    expect(routerControls.push).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe(initialPathname);
  });
});
