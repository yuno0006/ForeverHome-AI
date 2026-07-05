import { NextRequest, NextResponse } from "next/server";
import {
  fetchSavedCatIds,
  saveCatToWishlist,
  removeCatFromWishlist,
} from "@/lib/firestoreService";
import { getAuthenticatedUid } from "@/lib/verifyAuthToken";

// GET /api/saved?uid=xxx — list saved cat IDs for a user
export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get("uid");
    if (!uid) {
      return NextResponse.json({ saved: [] });
    }

    // Require the caller to be authenticated as the user they're asking about.
    // Without this, anyone could read another user's wishlist by uid.
    const authedUid = await getAuthenticatedUid(req);
    if (!authedUid || authedUid !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await fetchSavedCatIds(uid);
    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Saved cats GET error:", error);
    return NextResponse.json({ saved: [] }, { status: 200 });
  }
}

// POST /api/saved — body: { uid, catId } — add a cat to wishlist
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, catId } = body;

    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }
    if (!catId || typeof catId !== "string") {
      return NextResponse.json({ error: "catId is required" }, { status: 400 });
    }

    // Require the caller to be authenticated as the uid they're modifying.
    const authedUid = await getAuthenticatedUid(req);
    if (!authedUid || authedUid !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await saveCatToWishlist(uid, catId);
    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Saved cats POST error:", error);
    return NextResponse.json({ error: "Failed to save cat" }, { status: 500 });
  }
}

// DELETE /api/saved — body: { uid, catId } — remove a cat from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, catId } = body;

    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }
    if (!catId || typeof catId !== "string") {
      return NextResponse.json({ error: "catId is required" }, { status: 400 });
    }

    const authedUid = await getAuthenticatedUid(req);
    if (!authedUid || authedUid !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await removeCatFromWishlist(uid, catId);
    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Saved cats DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove cat" }, { status: 500 });
  }
}
