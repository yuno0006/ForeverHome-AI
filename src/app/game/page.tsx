"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { demoCats } from "@/data/demoCats";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { Card, CardContent } from "@/components/ui/card";

const WhiskerRunnerGame = dynamic(
  () =>
    import("@/components/game/WhiskerRunnerGame").then(
      (mod) => mod.WhiskerRunnerGame
    ),
  { ssr: false }
);

export default function GamePage() {
  const randomCatName = useMemo(() => {
    return demoCats[Math.floor(Math.random() * demoCats.length)].name;
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row items-center justify-center p-4 gap-6 max-w-7xl mx-auto">
      {/* Game track centered perfectly in the screen (order-1 on mobile/tablet, order-2 on large screens) */}
      <div className="w-full max-w-2xl z-10 order-1 lg:order-2">
        <WhiskerRunnerGame catName={randomCatName} />
      </div>

      {/* Leaderboard on the left (order-3 on mobile/tablet, order-1 on large screens, floats absolutely on XL+) */}
      <div className="w-full lg:w-64 max-w-xs shrink-0 z-20 order-3 lg:order-1 xl:absolute xl:left-8 xl:top-1/2 xl:-translate-y-1/2">
        <LeaderboardPanel />
      </div>

      {/* Game Info Panel on the right (order-2 on mobile/tablet, order-3 on large screens, floats absolutely on XL+) */}
      <div className="w-full lg:w-64 max-w-xs shrink-0 z-20 order-2 lg:order-3 xl:absolute xl:right-8 xl:top-1/2 xl:-translate-y-1/2">
        <Card className="border-2 border-amber-200 bg-cream/70 backdrop-blur-md shadow-xl text-[#5D4037]">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-base font-extrabold flex items-center gap-1.5 border-b border-[#5D4037]/15 pb-2 text-[#5D4037]">
              🎮 Whisker Runner Guide
            </h3>
            
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <p className="font-extrabold text-[#8D6E63] uppercase tracking-wider text-[10px]">How to Jump</p>
                <p className="mt-1">💻 <span className="font-semibold">Desktop</span>: Press <kbd className="px-1.5 py-0.5 bg-white/80 rounded border border-amber-300 font-mono text-[10px]">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-white/80 rounded border border-amber-300 font-mono text-[10px]">Arrow Up</kbd></p>
                <p className="mt-1">📱 <span className="font-semibold">Mobile</span>: Tap anywhere on the track</p>
              </div>

              <div>
                <p className="font-extrabold text-[#8D6E63] uppercase tracking-wider text-[10px]">Character</p>
                <p className="mt-1">🐱 Playing as: <span className="font-bold text-[#D84315]">{randomCatName}</span> (Nyan Cat)</p>
              </div>

              <div>
                <p className="font-extrabold text-[#8D6E63] uppercase tracking-wider text-[10px]">Difficulty Tiers</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li><span className="font-medium text-[#2E7D32]">Easy</span>: 0 – 500</li>
                  <li><span className="font-medium text-[#F57C00]">Moderate</span>: 500 – 1,500</li>
                  <li><span className="font-medium text-[#E64A19]">Medium</span>: 1,500 – 3,000</li>
                  <li><span className="font-medium text-[#C62828]">Hard</span>: 3,000+ (Extreme Speed!)</li>
                </ul>
              </div>

              <div className="border-t border-[#5D4037]/10 pt-2 text-[10px] text-[#8D6E63] italic">
                🌃 Reach 8,000 points to unlock the new City Night Lights theme!
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
