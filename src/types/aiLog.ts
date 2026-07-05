import { Timestamp } from "firebase/firestore";

/**
 * AI Log Types - Minimal logging of AI interactions for debugging and analytics
 *
 * Firestore Path: aiLogs/{logId}
 *
 * Note: No full conversation context stored to protect user privacy
 */

export type AISource = "gemini" | "fallback";

export interface AILog {
  id: string;
  uid: string;      // User ID
  catId: string;    // Cat being discussed
  question: string; // User's question
  response: string; // AI response
  timestamp: Timestamp;
  source: AISource;
  // Note: No full context stored
}

export interface AILogInput {
  uid: string;
  catId: string;
  question: string;
  response: string;
  source: AISource;
}
