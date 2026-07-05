/**
 * Unit tests for `WhiskerRunnerDialog`.
 *
 * Covers:
 * - When `open === false`, no game DOM is rendered at all — neither the
 *   game's own track element (identified by its `data-status` attribute)
 *   nor its idle start-prompt text. Note: the dialog's `DialogTitle` also
 *   reads "Whisker Runner 🐾", which is NOT the same node as the game's own
 *   idle-card paragraph with that same text — these tests assert on the
 *   game's mocked test double (absent) rather than that shared string, to
 *   avoid any ambiguity between the two.
 * - When `open === true`, the game is dynamically mounted (its mocked DOM
 *   appears), awaited via `waitFor` since `WhiskerRunnerGame` is loaded
 *   through `next/dynamic(..., { ssr: false })`.
 *
 * The real `WhiskerRunnerGame` (its RAF loop, `localStorage`/`matchMedia`
 * reads, keyboard/pointer input, etc.) is already covered by
 * `WhiskerRunnerGame.test.tsx`; it's mocked here with a simple test double
 * so these tests stay focused on the Dialog's own open/close/mount
 * behavior (Requirements 1.5, 1.7).
 *
 * _Requirements: 1.5, 1.7_
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { WhiskerRunnerDialog } from "./WhiskerRunnerDialog";

vi.mock("./WhiskerRunnerGame", () => ({
  WhiskerRunnerGame: () => <div data-testid="whisker-runner-game" data-status="idle" />,
}));

describe("WhiskerRunnerDialog", () => {
  it("renders no game DOM when closed", () => {
    render(
      <WhiskerRunnerDialog open={false} onOpenChange={() => {}} catName="Mochi" />
    );

    // No track element (identified by its `data-status` attribute) and no
    // mocked game test double should be present anywhere in the document.
    expect(screen.queryByTestId("whisker-runner-game")).toBeNull();
    expect(document.querySelector("[data-status]")).toBeNull();
  });

  it("dynamically mounts the game when open", async () => {
    render(
      <WhiskerRunnerDialog open={true} onOpenChange={() => {}} catName="Mochi" />
    );

    // `WhiskerRunnerGame` is loaded via `next/dynamic(..., { ssr: false })`,
    // so its (mocked) DOM appears only after that dynamic import resolves.
    await waitFor(() => {
      expect(screen.queryByTestId("whisker-runner-game")).toBeTruthy();
    });

    expect(document.querySelector("[data-status]")).not.toBeNull();

    // The dialog's own title is a separate node from the game's idle-card
    // text, even though both happen to read "Whisker Runner 🐾".
    expect(screen.getByRole("heading", { name: "Whisker Runner 🐾" })).toBeTruthy();
  });
});
