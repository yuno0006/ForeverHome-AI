"use client";

import dynamic from "next/dynamic";

import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";

const WhiskerRunnerGame = dynamic(
  () =>
    import("@/components/game/WhiskerRunnerGame").then(
      (mod) => mod.WhiskerRunnerGame
    ),
  { ssr: false }
);

export default function GamePage() {
  return (
    <div className="relative flex min-h-screen flex-col-reverse md:flex-row items-center justify-center p-4">
      {/* Leaderboard on the left side corner on desktop, below the game on mobile */}
      <div className="md:absolute md:left-8 md:top-1/2 md:-translate-y-1/2 w-full md:w-auto max-w-xs shrink-0 z-20 mt-6 md:mt-0">
        <LeaderboardPanel />
      </div>
      {/* Game track centered perfectly in the screen */}
      <div className="w-full max-w-2xl z-10">
        <WhiskerRunnerGame catName="Whiskers" />
      </div>
    </div>
  );
}
