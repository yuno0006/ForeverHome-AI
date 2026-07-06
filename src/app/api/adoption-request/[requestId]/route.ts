import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateCat } from "@/lib/catService";

/**
 * PATCH /api/adoption-request/[requestId]
 *
 * Allows shelter staff to approve or reject an adoption request.
 * Body: { action: "approve" | "reject" }
 *
 * On approve:
 *  - Sets request status to "approved"
 *  - Creates a companion "activeAdoptions/{adoptionId}" record
 *  - Updates the cat's status to "adopted"
 *
 * On reject:
 *  - Sets request status to "rejected"
 */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;

  try {
    const body = await req.json();
    const { action } = body as { action: "approve" | "reject" };

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Missing or invalid 'action'. Must be 'approve' or 'reject'." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const status = action === "approve" ? "approved" : "rejected";

    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      try {
        // 1. Update the adoption request status
        await updateDoc(doc(db, "adoptionRequests", requestId), {
          status,
          ...(action === "approve" ? { approvedAt: now } : { rejectedAt: now }),
        });

        if (action === "approve") {
          // 2. Read the request to get catId and adopter info
          const { getDoc } = await import("firebase/firestore");
          const requestSnap = await getDoc(doc(db, "adoptionRequests", requestId));
          
          if (requestSnap.exists()) {
            const requestData = requestSnap.data();
            const catId = requestData.catId;
            const adopterName = requestData.adopterName || "Adopter";

            // 3. Create active adoption record
            const adoptionId = `adoption-${Date.now()}`;
            await setDoc(doc(db, "activeAdoptions", adoptionId), {
              id: adoptionId,
              catId,
              catName: requestData.catName,
              adopterName,
              adopterEmail: requestData.adopterEmail,
              adopterUid: requestData.adopterUid || null,
              shelterId: requestData.shelterId,
              approvedAt: now,
              currentDay: 1,
              status: "active",
            });

            // 4. Update cat status to "adopted"
            if (catId) {
              try {
                await updateCat(catId, { status: "adopted" } as Record<string, unknown> as never);
              } catch (catErr) {
                console.warn("[AdoptionRequest] Failed to update cat status:", catErr);
              }
            }
          }
        }
      } catch (firestoreErr) {
        console.error("[AdoptionRequest] Firestore update failed:", firestoreErr);
        return NextResponse.json(
          { error: "Failed to update adoption request in database." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      requestId,
      status,
      message:
        action === "approve"
          ? "Adoption approved! The cat's status has been updated and the 14-day coaching journey has begun."
          : "Adoption request has been rejected.",
    });
  } catch (error) {
    console.error("[AdoptionRequest] Error:", error);
    return NextResponse.json(
      { error: "Failed to process adoption request." },
      { status: 500 }
    );
  }
}
