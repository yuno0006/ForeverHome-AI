"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Cat } from "lucide-react";
import { demoCats } from "@/data/demoCats";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const WhiskerRunnerGame = dynamic(
  () =>
    import("@/components/game/WhiskerRunnerGame").then(
      (mod) => mod.WhiskerRunnerGame
    ),
  { ssr: false }
);

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getBestScore } from "@/lib/whiskerRunner/highScoreStorage";

export default function GamePage() {
  const { user, role, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [upcomingSeason, setUpcomingSeason] = useState<{
    current: string;
    next: string;
    targetScore: number;
  } | null>(null);

  const randomCatName = useMemo(() => {
    return demoCats[Math.floor(Math.random() * demoCats.length)].name;
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user || role !== "adopter") {
      setHasAccess(false);
      return;
    }

    const uid = user.uid;

    async function checkAdoptions() {
      const USE_FIRESTORE = process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== undefined;
      if (USE_FIRESTORE) {
        try {
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");
          const q = query(
            collection(db, "activeAdoptions"),
            where("adopterUid", "==", uid)
          );
          const snap = await getDocs(q);
          setHasAccess(!snap.empty);
        } catch (err) {
          console.error("Failed to check active adoptions for game:", err);
          setHasAccess(false);
        }
      } else {
        const stored = JSON.parse(sessionStorage.getItem("activeAdoptions") || "[]");
        const userAdoptions = stored.filter((item: any) => !item.adopterUid || item.adopterUid === uid);
        setHasAccess(userAdoptions.length > 0);
      }
    }

    checkAdoptions();
  }, [user, role, loading]);

  if (loading || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-sunny" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] border-2 border-cocoa/15">
          <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-coral/20">
            <Cat className="w-8 h-8 text-coral" />
          </div>
          <h2 className="text-2xl font-bold text-cocoa mb-3">Exclusive Adopter Reward!</h2>
          <p className="text-cocoa/70 mb-6 leading-relaxed">
            The Whisker Runner game is a special perk unlocked only for users who have completed the adoption process. Find your perfect feline friend to unlock this game!
          </p>
          <Link href="/cats">
            <Button className="w-full bg-coral hover:bg-coral/90 text-white rounded-xl py-6 text-lg font-bold shadow-[2px_2px_0px_0px_rgba(42,29,20,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] transition-all active:translate-y-0 active:shadow-none">
              Find a Cat to Adopt
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row items-center justify-center p-4 gap-6 max-w-7xl mx-auto">
      {/* Game track centered perfectly in the screen (order-1 on mobile/tablet, order-2 on large screens) */}
      <div className="w-full max-w-2xl z-10 order-1 lg:order-2">
        <WhiskerRunnerGame 
          catName={randomCatName} 
          onSeasonChange={(current, next, targetScore) => {
            setUpcomingSeason({ current, next, targetScore });
          }}
        />
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

              <div className="border-t border-[#5D4037]/10 pt-2 text-[10px] text-[#8D6E63] space-y-1.5">
                {upcomingSeason ? (
                  <>
                    <p className="flex justify-between">
                      <span>🌅 Current Theme:</span>
                      <span className="font-bold text-[#5D4037]">{upcomingSeason.current}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>🌃 Next Up Theme:</span>
                      <span className="font-bold text-[#D84315]">{upcomingSeason.next}</span>
                    </p>
                    <p className="text-right text-[9px] text-[#8D6E63]/70 font-medium">
                      Unlocks at {upcomingSeason.targetScore} points
                    </p>
                  </>
                ) : (
                  <p className="italic text-center">Loading game themes...</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
