"use client";

import { useEffect, useState, useRef } from "react";
import {
  subscribeLeaderboard,
  type LeaderboardEntry,
} from "@/lib/whiskerRunner/leaderboardService";
import { useAuth } from "@/hooks/useAuth";

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

  if (entries.length === 0) {
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
      className="w-full sm:w-[180px] shrink-0 rounded-xl border-2 border-amber-200 p-2 sm:p-3 shadow-sm"
      style={{
        background:
          "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)",
      }}
    >
      {/* Header */}
      <div className="mb-1 sm:mb-2 text-center">
        <div className="text-lg sm:text-xl">🏆</div>
        <div
          className="text-[10px] sm:text-xs font-bold tracking-wide"
          style={{ color: "#5D4037" }}
        >
          Leaderboard
        </div>
        <div
          className="mt-0.5 h-0.5 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, #F9A825, transparent)",
          }}
        />
      </div>

      {/* Rankings — compact horizontal on mobile, vertical on sm+ */}
      <div className="flex flex-row flex-wrap gap-1 sm:flex-col sm:flex-nowrap sm:gap-0 sm:space-y-1">
        {entries.slice(0, 8).map((entry, index) => {
          const isTop3 = index < 3;
          const isMe = currentUid && entry.userId === currentUid;
          const medalColor = isTop3 ? MEDAL_COLORS[index] : undefined;

          return (
            <div
              key={entry.id}
              className="flex items-center gap-1 sm:gap-1.5 rounded-lg px-1 sm:px-1.5 py-0.5 sm:py-1 transition-colors"
              style={
                isMe
                  ? {
                      background: "rgba(255, 107, 107, 0.12)",
                      border: "1px solid rgba(255, 107, 107, 0.25)",
                    }
                  : isTop3
                    ? { background: `${medalColor}15` }
                    : { background: "transparent" }
              }
            >
              {/* Rank */}
              <span
                className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full text-[9px] sm:text-[10px] font-bold"
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
                  className="truncate text-[10px] sm:text-[11px] font-semibold leading-tight max-w-[80px] sm:max-w-none"
                  style={{ color: isMe ? "#D94545" : "#4E342E" }}
                >
                  {isMe ? "You" : entry.displayName || "Cat Lover"}
                </div>
                <div
                  className="text-[9px] sm:text-[10px] leading-tight"
                  style={{ color: "#8D6E63" }}
                >
                  {formatScore(entry.score)} pts
                </div>
              </div>

              {/* Crown for #1 */}
              {index === 0 && (
                <span className="text-[10px] sm:text-xs shrink-0" title="Top Cat!">
                  👑
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with entry count */}
      <div className="mt-1 sm:mt-2 flex items-center justify-between text-[10px] opacity-40" style={{ color: "#5D4037" }}>
        <span>🐾 · 🐾 · 🐾</span>
        <span>{entries.length} players</span>
      </div>
    </div>
  );
}
