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

const WhiskerRunnerGame = dynamic(
  () => import("./WhiskerRunnerGame").then((mod) => mod.WhiskerRunnerGame),
  { ssr: false }
);

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
      {/* `overflow-x-auto` is a fallback for Requirement 6.6, not the
          primary responsive strategy: `WhiskerRunnerGame`'s track scales
          via `w-full` and only carries a `min-w-[240px]` floor, so on
          ordinary mobile/desktop viewport widths the dialog and track fit
          without a scrollbar ever appearing (Requirement 6.4). This only
          engages if a viewport is narrower than the track can otherwise
          shrink to, letting the dialog scroll horizontally rather than
          clipping/breaking the game. */}
      <DialogContent className="sm:max-w-md overflow-x-auto">
        <DialogHeader>
          <DialogTitle>Whisker Runner 🐾</DialogTitle>
        </DialogHeader>
        <WhiskerRunnerGame
          catName={catName}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
