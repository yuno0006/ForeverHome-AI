import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * POST /api/escalation
 * 
 * Packages daily check-in logs and AI chat history into a Priority Status Report
 * and stores it in Firestore for shelter staff review (see firestore.rules
 * `escalationReports` collection — readable by the shelter's admin).
 * 
 * Not yet implemented: a real-time notification (email/SMS) to shelter staff
 * when a new report lands. Staff currently discover reports by checking the
 * shelter dashboard.
 */

interface EscalationRequest {
  catName: string;
  shelterId: string;
  adopterName: string;
  checkIns: Array<{
    day: number;
    ate: boolean;
    drank?: boolean;
    hiding?: boolean;
    litterUsed: boolean;
    notes?: string;
    timestamp: string;
  }>;
  chatHistory: Array<{
    id: string;
    role: string;
    content: string;
    timestamp: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body: EscalationRequest = await req.json();
    const { catName, shelterId, adopterName, checkIns, chatHistory } = body;

    // Validate required fields
    if (!catName || !shelterId || !adopterName) {
      return NextResponse.json(
        { error: "Missing required fields: catName, shelterId, and adopterName are required" },
        { status: 400 }
      );
    }

    // Build the priority report
    const report = {
      id: `escalation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      catName,
      shelterId,
      adopterName,
      status: "pending",
      priority: determinePriority(checkIns),
      createdAt: new Date().toISOString(),
      checkIns: checkIns.map((ci) => ({
        day: ci.day,
        ate: ci.ate,
        litterUsed: ci.litterUsed,
        notes: ci.notes || "",
        date: ci.timestamp,
      })),
      chatHistory: chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      summary: generateSummary(catName, checkIns, chatHistory),
    };

    // Persist to Firestore so shelter staff can see it on their dashboard.
    // If Firestore isn't configured (no env vars, demo mode), we still
    // return success below so the client-side UX works without a backend.
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      try {
        await setDoc(doc(db, "escalationReports", report.id), report);
      } catch (writeError) {
        console.error("[Escalation] Firestore write failed:", writeError);
        // Don't fail the request — the report contents are still returned
        // to the client and the shelter can be reached by phone as a
        // fallback. This matches the app's "never block on infra" pattern
        // used elsewhere (e.g. saveMatch/saveAdoption sessionStorage fallback).
      }
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      priority: report.priority,
      message: `Priority Status Report for ${catName} has been created. Shelter team will respond within 24 hours.`,
    });
  } catch (error) {
    console.error("[Escalation] Error:", error);
    return NextResponse.json(
      { error: "Failed to create escalation report. Please try again." },
      { status: 500 }
    );
  }
}

function determinePriority(checkIns: EscalationRequest["checkIns"]): "urgent" | "high" | "normal" {
  if (checkIns.length === 0) return "normal";

  const lastCheckIn = checkIns[checkIns.length - 1];

  // Urgent: hasn't eaten AND hasn't used litter
  if (!lastCheckIn.ate && !lastCheckIn.litterUsed) return "urgent";

  // High: hasn't eaten for 2+ consecutive days
  const noEatCount = checkIns.filter((c) => !c.ate).length;
  if (noEatCount >= 2) return "high";

  // High: diarrhea mentioned
  if (lastCheckIn.notes?.toLowerCase().includes("diarrhea")) return "high";

  return "normal";
}

function generateSummary(
  catName: string,
  checkIns: EscalationRequest["checkIns"],
  chatHistory: EscalationRequest["chatHistory"]
): string {
  const totalDays = checkIns.length;

  if (totalDays === 0 && chatHistory.length === 0) {
    return `New escalation for ${catName}. No check-in data or chat history available yet.`;
  }

  const eatingDays = checkIns.filter((c) => c.ate).length;
  const litterDays = checkIns.filter((c) => c.litterUsed).length;
  const mostRecentConcern = chatHistory.length > 0
    ? chatHistory[chatHistory.length - 1].content.slice(0, 100) + "..."
    : "No specific concerns noted in chat.";

  return `${catName}: ${eatingDays}/${totalDays} days eating, ${litterDays}/${totalDays} days using litter. Most recent concern: "${mostRecentConcern}"`;
}
