/**
 * AI Logging Service — Minimal, privacy-first logging of AI interactions.
 *
 * Firestore Path: aiLogs/{logId}
 * Security: Write-only for authenticated users (see firestore.rules)
 *
 * Policy:
 * - Only stores the user's question, AI's response, and metadata
 * - No full conversation context stored
 * - Logs are immutable — no updates or deletes
 * - Read access restricted to admins via Cloud Functions
 *
 * Note: Firestore writes only work from the browser (client SDK has auth).
 * Server-side API routes lack an auth context, so writes are silently skipped.
 */
import { db } from "./firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { AILogInput, AISource } from "@/types/aiLog";

const IS_BROWSER = typeof window !== "undefined";
const USE_FIRESTORE = process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== undefined;

/**
 * Log an AI interaction to Firestore (browser) or sessionStorage (demo mode).
 * Server-side calls are silently skipped — Firestore client SDK has no auth
 * context in API routes.
 *
 * @param input - The AI log entry (uid, catId, question, response, source)
 * @returns The generated log ID, or null if logging is unavailable
 */
export async function logAIInteraction(input: AILogInput): Promise<string | null> {
  // Server-side: skip Firestore write (client SDK lacks auth context)
  if (!IS_BROWSER) return null;

  try {
    if (!USE_FIRESTORE) {
      // Demo mode: store in sessionStorage (cleared on tab close)
      const stored = JSON.parse(sessionStorage.getItem("aiLogs") || "[]");
      const entry = {
        ...input,
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
      };
      stored.push(entry);
      if (stored.length > 100) stored.shift(); // Keep only last 100 entries
      sessionStorage.setItem("aiLogs", JSON.stringify(stored));
      return entry.id;
    }

    const docRef = await addDoc(collection(db, "aiLogs"), {
      uid: input.uid,
      catId: input.catId,
      question: input.question,
      response: input.response,
      source: input.source,
      timestamp: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Failed to log AI interaction:", error);
    return null;
  }
}

/**
 * Convenience wrapper that logs asynchronously (fire-and-forget).
 * Use when you don't want logging to block the API response.
 */
export function logAIInteractionAsync(input: AILogInput): void {
  logAIInteraction(input).catch((err) => {
    console.error("Background AI log failed:", err);
  });
}
