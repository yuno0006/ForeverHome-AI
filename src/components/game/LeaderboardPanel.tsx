"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  subscribeLeaderboard,
  type LeaderboardEntry,
} from "@/lib/whiskerRunner/leaderboardService";
import { useAuth } from "@/hooks/useAuth";
import { getBestScore } from "@/lib/whiskerRunner/highScoreStorage";

const MEDAL_COLORS = ["#F9A825", "#9E9E9E", "#8D6E63"];
const MEDAL_EMOJIS = ["🥇", "🥈", "🥉"];

function formatScore(score: number): string {
  return score.toString().padStart(4, "0");
}

export function LeaderboardPanel() {
  const { user } = useAuth();
  const currentUid = user?.uid ?? null;
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [guestScore, setGuestScore] = useState<number>(0);

  // Track whether we've already rendered, so loading only shows on first load
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    try {
      const unsub = subscribeLeaderboard((data) => {
        if (cancelled) return;
        setEntries(data);
        setLoading(false);
        hasLoadedRef.current = true;
      });
      return () => {
        cancelled = true;
        unsub();
      };
    } catch (err) {
      console.error("[LeaderboardPanel] subscription failed:", err);
      setError("Could not load leaderboard");
      setLoading(false);
    }
  }, []);

  // Poll for local high score for guests so they can see themselves on the board
  useEffect(() => {
    if (!currentUid) {
      setGuestScore(getBestScore());
      const interval = setInterval(() => {
        setGuestScore(getBestScore());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentUid]);

  const displayEntries = useMemo(() => {
    let list = [...entries];
    // If not logged in and has a local score, inject a "Guest" entry
    if (!currentUid && guestScore > 0) {
      list.push({
        id: "guest-local",
        userId: "guest",
        displayName: "You (Guest)",
        score: guestScore,
        timestamp: new Date().toISOString(),
      });
      list.sort((a, b) => b.score - a.score);
    }
    return list;
  }, [entries, currentUid, guestScore]);

  // Loading state — only shown on first mount before any data arrives
  if (loading && !hasLoadedRef.current) {
    return (
      <div
        className="w-full sm:w-[180px] shrink-0 rounded-xl border-2 border-amber-200 bg-cream/70 p-3"
        style={{
          background:
            "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)",
        }}
      >
        <div className="mb-2 text-center">
          <div className="text-lg sm:text-xl">🏆</div>
          <div
            className="text-[10px] sm:text-xs font-bold tracking-wide"
            style={{ color: "#5D4037" }}
          >
            Leaderboard
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 py-4 text-center">
          <div className="size-5 animate-spin rounded-full border-2 border-cocoa/20 border-t-cocoa/60" />
          <p className="text-[10px]" style={{ color: "#8D6E63" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && entries.length === 0) {
    return (
      <div
        className="w-full sm:w-[180px] shrink-0 rounded-xl border-2 border-amber-200 p-3"
        style={{
          background:
            "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)",
        }}
      >
        <div className="mb-2 text-center">
          <div className="text-lg sm:text-xl">🏆</div>
          <div
            className="text-[10px] sm:text-xs font-bold tracking-wide"
            style={{ color: "#5D4037" }}
          >
            Leaderboard
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 py-2 text-center">
          <span className="text-sm">⚠️</span>
          <p className="text-[10px]" style={{ color: "#8D6E63" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (displayEntries.length === 0) {
    return (
      <div
        className="w-full sm:w-[180px] shrink-0 rounded-xl border-2 border-amber-200 bg-cream/70 p-3"
        style={{
          background:
            "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)",
        }}
      >
        {/* Header */}
        <div className="mb-2 text-center">
          <div className="text-lg sm:text-xl">🏆</div>
          <div
            className="text-[10px] sm:text-xs font-bold tracking-wide"
            style={{ color: "#5D4037" }}
          >
            Leaderboard
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center gap-1 py-2 text-center">
          <span className="text-lg sm:text-2xl">🐾</span>
          <p className="text-[10px] leading-tight" style={{ color: "#8D6E63" }}>
            No scores yet!
            <br />
            Play to be the first 🐱
          </p>
        </div>

        {/* Footer paw decoration */}
        <div className="text-center text-[10px] opacity-40" style={{ color: "#5D4037" }}>
          🐾 · 🐾 · 🐾
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full shrink-0 rounded-2xl border-2 border-amber-200 bg-cream/70 backdrop-blur-md p-3 sm:p-4 shadow-xl text-[#5D4037] hover:shadow-2xl transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, rgba(255,248,225,0.85) 0%, rgba(255,236,179,0.7) 100%)",
      }}
    >
      {/* Header */}
      <div className="mb-3 text-center relative">
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</span>
        <h3 className="text-sm font-extrabold tracking-wide mt-2 text-[#4E342E] flex items-center justify-center gap-1">
          🐾 Top Runners
        </h3>
        <div className="text-[10px] text-[#8D6E63] font-semibold mt-0.5">Global High Scores</div>
        <div className="flex items-center justify-center gap-1 mt-1.5 opacity-40">
          <span>🐾</span>
          <span className="text-[8px]">·</span>
          <span>🐾</span>
          <span className="text-[8px]">·</span>
          <span>🐾</span>
        </div>
      </div>

      {/* Rankings */}
      <div className="flex flex-col gap-1.5">
        {displayEntries.slice(0, 8).map((entry, index) => {
          const isTop3 = index < 3;
          const isMe = (currentUid && entry.userId === currentUid) || (!currentUid && entry.userId === "guest");
          const medalColor = isTop3 ? MEDAL_COLORS[index] : undefined;

          let cardClass = "flex items-center gap-2 rounded-xl px-2 py-1.5 transition-transform hover:scale-[1.02] duration-200 border border-transparent ";
          
          if (isMe) {
            cardClass += "bg-rose-50/90 border-rose-300 shadow-sm ";
          } else if (index === 0) {
            cardClass += "bg-gradient-to-r from-yellow-100/80 to-amber-50/50 border-yellow-200/70 shadow-sm ";
          } else if (index === 1) {
            cardClass += "bg-gradient-to-r from-slate-100/80 to-zinc-50/50 border-slate-200/50 ";
          } else if (index === 2) {
            cardClass += "bg-gradient-to-r from-amber-100/60 to-orange-50/40 border-amber-200/40 ";
          } else {
            cardClass += "bg-white/40 hover:bg-white/60 ";
          }

          return (
            <div key={entry.id} className={cardClass}>
              {/* Rank / Medal */}
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={
                  isTop3
                    ? {
                        background: medalColor,
                        color: "#FFF",
                      }
                    : {
                        background: "#F5F0EB",
                        color: "#8D6E63",
                      }
                }
              >
                {isTop3 ? MEDAL_EMOJIS[index] : index + 1}
              </span>

              {/* Name + score */}
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[11px] font-bold leading-tight"
                  style={{ color: isMe ? "#D32F2F" : "#4E342E" }}
                >
                  {isMe ? "You" : entry.displayName || "Cat Lover"}
                </div>
                <div className="text-[9px] font-medium leading-tight text-[#8D6E63]">
                  {formatScore(entry.score)} pts
                </div>
              </div>

              {/* Special decorations */}
              {index === 0 && (
                <span className="text-[10px] animate-pulse" title="Top Cat!">
                  ✨
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with entry count */}
      <div className="mt-3 flex flex-col gap-1.5 border-t border-[#5D4037]/10 pt-2 text-[10px] text-[#8D6E63] font-medium">
        <div className="flex items-center justify-between opacity-60">
          <span>Total Players:</span>
          <span className="font-extrabold">{displayEntries.length} 🐱</span>
        </div>
        {!currentUid && (
          <div className="text-center italic mt-0.5 font-bold text-rose-600/90 leading-tight">
            💡 Log in to save your score to the global leaderboards!
          </div>
        )}
      </div>
    </div>
  );
}
