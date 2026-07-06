"use client";

// Thin integration wrapper around the existing `Dialog` primitive
// (@/components/ui/dialog) that hosts the Whisker Runner game (task 14.1,
// per design.md's "WhiskerRunnerDialog" section).
//
// `WhiskerRunnerGame` is loaded via `next/dynamic({ ssr: false })` so its
// requestAnimationFrame loop, `localStorage` access, and
// `window`/`matchMedia` reads never execute during SSR and add zero
// weight to the report page's bundle until the dialog is actually opened
// (Requirements 7.1, 7.2). Rendering is otherwise handled entirely by the
// `Dialog`/`DialogContent` primitive: it unmounts its content by default
// when closed, so no game loop keeps running in the background after the
// dialog is dismissed, and the close button, Escape key, and backdrop
// click all work "for free" from that primitive without any custom logic
// here (Requirements 1.5, 1.7).

import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeaderboardPanel } from "./LeaderboardPanel";

const WhiskerRunnerGame = dynamic(
  () => import("./WhiskerRunnerGame").then((mod) => mod.WhiskerRunnerGame),
  { ssr: false }
);

// Leaderboard panel is small and pure-UI (no game loop/RAF), so load it
// eagerly — its 180px width is needed for the dialog layout from the start.
const LeaderboardPanelEager = LeaderboardPanel;

interface WhiskerRunnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catName: string;
}

export function WhiskerRunnerDialog({
  open,
  onOpenChange,
  catName,
}: WhiskerRunnerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Wider dialog to accommodate leaderboard + game side-by-side.
          On small screens (<640px), the leaderboard hides and the game
          takes full width with `overflow-x-auto` fallback per Requirement 6.6. */}
      <DialogContent className="sm:max-w-[800px] max-w-[95vw] overflow-x-auto">
        <DialogHeader>
          <DialogTitle>Whisker Runner 🐾</DialogTitle>
        </DialogHeader>

        {/* Game + Leaderboard side by side on sm+ screens;
            stacked vertically on mobile. */}
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          {/* Leaderboard on the left — visible on all screen sizes.
              On mobile, it renders below the game in a compact row. */}
          <div className="shrink-0 w-full sm:w-auto">
            <LeaderboardPanelEager />
          </div>

          {/* Game track fills remaining space */}
          <div className="flex-1 min-w-0">
            <WhiskerRunnerGame
              catName={catName}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
