// Server-side Firebase ID token verification for Next.js API routes.
//
// We don't use the firebase-admin SDK here because it requires a service
// account credential (a secret we don't want to manage for a hackathon
// deployment). Instead we verify the ID token's signature directly against
// Google's public JWKS for Firebase Auth, which is enough to confirm the
// token was issued by our Firebase project and belongs to the claimed uid.
//
// This closes the IDOR in /api/saved and /api/coach: without this check,
// any caller could pass an arbitrary `uid` and read/write another user's
// wishlist or ask the AI coach questions using someone else's adopter
// profile as context.
import { NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

/**
 * Verify the Firebase ID token sent in the `Authorization: Bearer <token>`
 * header and return the authenticated uid, or null if missing/invalid.
 */
export async function getAuthenticatedUid(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || !PROJECT_ID) return null;

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
