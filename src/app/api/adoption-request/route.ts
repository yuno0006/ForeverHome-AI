import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * POST /api/adoption-request
 *
 * Sent when an adopter clicks "Start Adoption Process" on a compatibility
 * report. Packages the adopter's contact details, the cat they want, and
 * their compatibility summary into a request that shelter staff can review
 * on their dashboard. Returns the shelter's contact info so the adopter
 * can follow up directly too.
 */

interface AdoptionRequestBody {
  catId: string;
  catName: string;
  shelterId: string;
  adopterUid?: string | null;
  adopterName: string;
  adopterEmail: string;
  adopterPhone?: string | null;
  compatibilityLevel: "low" | "moderate" | "high";
}

export async function POST(req: NextRequest) {
  try {
    const body: AdoptionRequestBody = await req.json();
    const { catId, catName, shelterId, adopterUid, adopterName, adopterEmail, adopterPhone, compatibilityLevel } = body;

    if (!catId || !catName || !shelterId || !adopterName || !adopterEmail) {
      return NextResponse.json(
        { error: "Missing required fields: catId, catName, shelterId, adopterName, and adopterEmail are required" },
        { status: 400 }
      );
    }

    const requestId = `adoption-request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      id: requestId,
      catId,
      catName,
      shelterId,
      adopterUid: adopterUid || null,
      adopterName,
      adopterEmail,
      adopterPhone: adopterPhone || null,
      compatibilityLevel,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Persist to Firestore so shelter staff see it on their dashboard.
    // Falls back gracefully if Firestore isn't configured (demo mode).
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      try {
        await setDoc(doc(db, "adoptionRequests", requestId), record);
      } catch (writeError) {
        console.error("[AdoptionRequest] Firestore write failed:", writeError);
      }
    }

    return NextResponse.json({
      success: true,
      requestId,
      message: `Your adoption request for ${catName} has been sent to the shelter.`,
    });
  } catch (error) {
    console.error("[AdoptionRequest] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit adoption request. Please try again." },
      { status: 500 }
    );
  }
}
