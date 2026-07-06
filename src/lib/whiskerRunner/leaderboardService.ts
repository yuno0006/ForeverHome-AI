/**
 * Leaderboard service for Whisker Runner.
 *
 * Stores high scores to Firestore so all players can see the global
 * rankings. One document per user (docId === userId), updated only when
 * the new score beats the user's previous best — prevents the same player
 * from monopolising multiple leaderboard spots.
 *
 * Firestore path: whiskerRunnerScores/{userId}
 * Fields: userId, displayName, score, timestamp
 */

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";

const USE_FIRESTORE = process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== undefined;
const COLLECTION = "whiskerRunnerScores";
const LEADERBOARD_LIMIT = 20;

// In-memory store for demo mode (sessionStorage-backed so scores
// survive page refreshes during a session).
const DEMO_KEY = "fh_leaderboard";

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  score: number;
  timestamp: string;
}

function loadDemoScores(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(DEMO_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDemoScore(entry: LeaderboardEntry) {
  if (typeof window === "undefined") return;
  try {
    const scores = loadDemoScores();
    // Upsert: replace existing entry for same user, keep highest
    const idx = scores.findIndex((s) => s.userId === entry.userId);
    if (idx >= 0) {
      if (entry.score > scores[idx].score) {
        scores[idx] = entry;
      } else {
        return; // not higher — skip
      }
    } else {
      scores.push(entry);
    }
    scores.sort((a, b) => b.score - a.score);
    sessionStorage.setItem(
      DEMO_KEY,
      JSON.stringify(scores.slice(0, LEADERBOARD_LIMIT)),
    );
  } catch {
    // noop
  }
}

/**
 * Submit a score to the global leaderboard.
 *
 * Uses a Firestore transaction to atomically check the existing score for
 * this user and only overwrite if the new score is higher.  This guarantees
 * exactly one entry per player — their personal best.
 */
export async function submitScore(
  userId: string,
  displayName: string,
  score: number,
): Promise<LeaderboardEntry | null> {
  if (score <= 0) return null;

  const now = new Date().toISOString();

  if (!USE_FIRESTORE || !db) {
    const entry: LeaderboardEntry = {
      id: userId || `score-${Date.now()}`,
      userId,
      displayName,
      score,
      timestamp: now,
    };
    saveDemoScore(entry);
    return entry;
  }

  try {
    const scoreRef = doc(db, COLLECTION, userId);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(scoreRef);
      const current = snap.exists() ? (snap.data().score ?? 0) : 0;

      if (score > current) {
        transaction.set(scoreRef, {
          userId,
          displayName,
          score,
          timestamp: serverTimestamp(),
        });
      }
    });

    return { id: userId, userId, displayName, score, timestamp: now };
  } catch (err) {
    console.error("[leaderboard] submitScore failed:", err);
    return null;
  }
}

/**
 * Subscribe to the global leaderboard (real-time, top N).
 * Returns an unsubscribe function.
 */
export function subscribeLeaderboard(
  onEntries: (entries: LeaderboardEntry[]) => void
): Unsubscribe {
  if (!USE_FIRESTORE) {
    // Demo mode: poll sessionStorage and call once, then poll
    // periodically for cross-tab updates.
    const emit = () => onEntries(loadDemoScores());
    emit();
    const interval = setInterval(emit, 1000);
    return () => clearInterval(interval);
  }

  const q = query(
    collection(db, COLLECTION),
    orderBy("score", "desc"),
    limit(LEADERBOARD_LIMIT)
  );

  return onSnapshot(q, (snapshot) => {
    const entries: LeaderboardEntry[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId ?? "",
        displayName: data.displayName ?? "Anonymous Cat",
        score: data.score ?? 0,
        timestamp: data.timestamp?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });
    onEntries(entries);
  });
}

/**
 * One-shot fetch of the top leaderboard entries.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!USE_FIRESTORE) return loadDemoScores();

  const { getDocs } = await import("firebase/firestore");
  const q = query(
    collection(db, COLLECTION),
    orderBy("score", "desc"),
    limit(LEADERBOARD_LIMIT)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId ?? "",
      displayName: data.displayName ?? "Anonymous Cat",
      score: data.score ?? 0,
      timestamp: data.timestamp?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    };
  });
}
