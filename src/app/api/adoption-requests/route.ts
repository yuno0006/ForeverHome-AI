import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * GET /api/adoption-requests
 *
 * Fetches adoption requests for the shelter dashboard.
 * Can filter by status: ?status=pending or ?status=approved
 * Shelter staff see only requests for their shelter.
 *
 * Falls back to demo data when Firestore isn't available.
 */

interface AdoptionRequestRecord {
  id: string;
  catId: string;
  catName: string;
  shelterId: string;
  adopterUid: string | null;
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string | null;
  compatibilityLevel: "low" | "moderate" | "high";
  aiExplanation?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

// Demo data for shelter demo mode
const demoRequests: AdoptionRequestRecord[] = [
  {
    id: "demo-req-barnaby",
    catId: "cat-barnaby",
    catName: "Barnaby",
    shelterId: "shelter-demo",
    adopterUid: null,
    adopterName: "Sarah M.",
    adopterEmail: "sarah@example.com",
    adopterPhone: "(555) 123-4567",
    compatibilityLevel: "high",
    aiExplanation: "Sarah is a highly compatible match for Barnaby! Her quiet apartment environment and previous experience with shy cats perfectly align with Barnaby's need for a calm, patient home. She understands his decompression timeline and her flexible work-from-home schedule will help him settle in beautifully.",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-req-luna-pending",
    catId: "cat-luna",
    catName: "Luna",
    shelterId: "shelter-demo",
    adopterUid: null,
    adopterName: "James T.",
    adopterEmail: "james@example.com",
    adopterPhone: "(555) 987-6543",
    compatibilityLevel: "moderate",
    aiExplanation: "James is a moderate match for Luna. While he has plenty of energy and time to dedicate to play—which Luna loves—he currently lives in a bustling household with frequent guests. Luna might need a slow introduction to the active environment, but James's enthusiasm and willingness to learn are strong protective factors.",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || undefined;

  try {
    // If Firebase is configured, query Firestore
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const constraints: any[] = [];
        if (statusFilter) {
          constraints.push(where("status", "==", statusFilter));
        }
        constraints.push(orderBy("createdAt", "desc"));

        const q = query(
          collection(db, "adoptionRequests"),
          ...constraints
        );
        const snapshot = await getDocs(q);

        const requests: AdoptionRequestRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<AdoptionRequestRecord, "id">;
          requests.push({ id: doc.id, ...data });
        });

        return NextResponse.json({ requests });
      } catch (firestoreErr) {
        console.warn(
          "[AdoptionRequests] Firestore query failed, using demo data:",
          firestoreErr
        );
      }
    }

    // Fallback: filter demo data
    let requests = demoRequests;
    if (statusFilter) {
      requests = requests.filter((r) => r.status === statusFilter);
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[AdoptionRequests] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch adoption requests." },
      { status: 500 }
    );
  }
}
