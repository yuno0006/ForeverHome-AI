/**
 * Best-score persistence for Whisker Runner.
 *
 * Wraps `localStorage` under the key `"whiskerRunner:bestScore"`, mirroring
 * the existing try/catch localStorage guard pattern used in
 * `src/lib/firestoreService.ts`. Every access is
 * guarded by a `typeof window !== "undefined"` check so this module remains
 * safely importable in any environment (SSR, Vitest/Node) without requiring
 * the DOM at import time.
 *
 * If `localStorage`/`window` is unavailable, or `localStorage` throws (e.g.
 * private browsing), the best score falls back to an in-memory,
 * module-level variable for the current session. Corrupted or non-numeric
 * stored values are treated as `0`.
 */

const STORAGE_KEY = "whiskerRunner:bestScore";

/** In-memory fallback store, used when `localStorage` is unavailable or throws. */
let inMemoryBestScore = 0;

/**
 * Parses a raw stored value into a valid best score.
 * Returns `0` if the value is missing, non-numeric, negative, or non-finite.
 */
function parseStoredScore(raw: string | null): number {
  if (raw === null) return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

/**
 * Returns the persisted best score, or `0` if no value has ever been
 * persisted, `localStorage` is unavailable, or the stored value is
 * corrupted/non-numeric. Never throws.
 */
export function getBestScore(): number {
  if (typeof window === "undefined") {
    return inMemoryBestScore;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = parseStoredScore(raw);
    return Math.max(parsed, inMemoryBestScore);
  } catch {
    // localStorage unavailable or throwing (e.g. private browsing).
    return inMemoryBestScore;
  }
}

/**
 * If `score` exceeds the current best score, persists it (falling back to
 * in-memory tracking if `localStorage` is unavailable or throws) and
 * returns `{ best: score, isNewHighScore: true }`. Otherwise leaves the
 * best score unchanged and returns
 * `{ best: getBestScore(), isNewHighScore: false }`. Never throws.
 */
export function setBestScoreIfHigher(score: number): { best: number; isNewHighScore: boolean } {
  const currentBest = getBestScore();

  if (score <= currentBest) {
    return { best: currentBest, isNewHighScore: false };
  }

  // Always update the in-memory fallback so the best score remains
  // monotonically non-decreasing across calls even without persistence.
  inMemoryBestScore = score;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(score));
    } catch {
      // localStorage unavailable or throwing — in-memory fallback above
      // already tracks the new best score for this session.
    }
  }

  return { best: score, isNewHighScore: true };
}
