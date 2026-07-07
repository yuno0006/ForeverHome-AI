import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { Cat } from "@/types/cat";
import { AdopterAnswers } from "@/types/adopter";
import { CompatibilityResult } from "@/types/match";
import { demoCats, getCatById } from "@/data/demoCats";
import {
  AdopterProfile,
  REQUIRED_PROFILE_FIELDS,
} from "@/types/adopterProfile";
import {
  AssessmentRecord,
  ScenarioAnswer,
} from "@/types/assessment";

// Use demo data by default; switch to Firestore when env vars are set
const USE_FIRESTORE = process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== undefined;

// ─── Cats ──────────────────────────────────────────────
export async function fetchCats(): Promise<Cat[]> {
  if (!USE_FIRESTORE) return demoCats;
  const snapshot = await getDocs(collection(db, "cats"));
  return snapshot.docs.map((d) => d.data() as Cat);
}

export async function fetchCatById(id: string): Promise<Cat | undefined> {
  if (!USE_FIRESTORE) return getCatById(id);
  const ref = doc(db, "cats", id);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Cat) : undefined;
}

export async function addCat(cat: Cat): Promise<string> {
  if (!USE_FIRESTORE) throw new Error("Firestore not configured");
  const ref = await addDoc(collection(db, "cats"), cat);
  return ref.id;
}

export async function updateCatStatus(id: string, status: Cat["status"]) {
  if (!USE_FIRESTORE) return;
  await updateDoc(doc(db, "cats", id), { status });
}

// ─── Matches ───────────────────────────────────────────
export interface MatchRecord {
  id?: string;
  catId: string;
  adopterName: string;
  result: CompatibilityResult;
  createdAt: string;
}

export async function saveMatch(match: Omit<MatchRecord, "id">): Promise<string> {
  if (!USE_FIRESTORE) {
    // Store in sessionStorage as fallback
    const id = `match-${Date.now()}`;
    const stored = JSON.parse(sessionStorage.getItem("matches") || "[]");
    stored.push({ ...match, id });
    sessionStorage.setItem("matches", JSON.stringify(stored));
    return id;
  }
  const ref = await addDoc(collection(db, "matches"), match);
  return ref.id;
}

export async function fetchMatches(): Promise<MatchRecord[]> {
  if (!USE_FIRESTORE) {
    return JSON.parse(sessionStorage.getItem("matches") || "[]");
  }
  const snapshot = await getDocs(collection(db, "matches"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as MatchRecord);
}

// ─── Adoptions / Check-ins ─────────────────────────────
export interface AdoptionRecord {
  id?: string;
  catId: string;
  adopterName: string;
  adoptedAt: string;
  day: number;
  checkIns: DayCheckIn[];
}

export interface DayCheckIn {
  day: number;
  eating: boolean;
  drinking: boolean;
  usingLitter: boolean;
  playful: boolean;
  notes: string;
  timestamp: string;
}

export async function saveAdoption(adoption: Omit<AdoptionRecord, "id">): Promise<string> {
  if (!USE_FIRESTORE) {
    const id = `adoption-${Date.now()}`;
    const stored = JSON.parse(sessionStorage.getItem("adoptions") || "[]");
    stored.push({ ...adoption, id });
    sessionStorage.setItem("adoptions", JSON.stringify(stored));
    return id;
  }
  const ref = await addDoc(collection(db, "adoptions"), adoption);
  return ref.id;
}

export async function fetchAdoption(id: string): Promise<AdoptionRecord | undefined> {
  if (!USE_FIRESTORE) {
    const stored: AdoptionRecord[] = JSON.parse(sessionStorage.getItem("adoptions") || "[]");
    return stored.find((a) => a.id === id);
  }
  const ref = doc(db, "adoptions", id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as AdoptionRecord) : undefined;
}

export async function updateAdoption(id: string, data: Partial<AdoptionRecord>) {
  if (!USE_FIRESTORE) {
    const stored: AdoptionRecord[] = JSON.parse(sessionStorage.getItem("adoptions") || "[]");
    const idx = stored.findIndex((a) => a.id === id);
    if (idx >= 0) {
      stored[idx] = { ...stored[idx], ...data };
      sessionStorage.setItem("adoptions", JSON.stringify(stored));
    }
    return;
  }
  await updateDoc(doc(db, "adoptions", id), data);
}

// ─── Adopter Profile ───────────────────────────────────

/**
 * Calculate profile completeness based on required fields.
 * A profile is complete when all required fields (name, email, homeType, catExperience) are populated.
 */
function calculateCompleteness(profile: Partial<AdopterProfile>): boolean {
  return REQUIRED_PROFILE_FIELDS.every((field) => {
    const value = profile[field];
    if (value === null || value === undefined) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  });
}

/**
 * Create or update adopter profile.
 * Uses the user's UID as the document ID for simplicity (one profile per user).
 * Firestore Path: users/{uid}/adopterProfile/{uid}
 *
 * @param uid - User's unique ID
 * @param profile - Profile data without auto-managed fields
 * @returns The profile ID (same as uid)
 */
export async function saveAdopterProfile(
  uid: string,
  profile: Omit<AdopterProfile, "id" | "uid" | "createdAt" | "updatedAt" | "isComplete">
): Promise<string> {
  if (!uid || uid.trim() === "") {
    throw new Error("Invalid UID: UID cannot be empty");
  }

  const isComplete = calculateCompleteness(profile as Partial<AdopterProfile>);
  const now = serverTimestamp();

  const profileData: Omit<AdopterProfile, "createdAt" | "updatedAt"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    id: uid,
    uid,
    ...profile,
    isComplete,
    createdAt: now,
    updatedAt: now,
  };

  if (!USE_FIRESTORE) {
    // Store in sessionStorage as fallback for demo mode
    const stored = JSON.parse(sessionStorage.getItem("adopterProfiles") || "{}");
    stored[uid] = {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem("adopterProfiles", JSON.stringify(stored));
    return uid;
  }

  // Use setDoc with merge to create or update
  const profileRef = doc(db, "users", uid, "adopterProfile", uid);
  await setDoc(profileRef, profileData, { merge: true });
  return uid;
}

/**
 * Fetch adopter profile by user UID.
 *
 * @param uid - User's unique ID
 * @returns The adopter profile or null if not found
 */
export async function fetchAdopterProfile(uid: string): Promise<AdopterProfile | null> {
  if (!uid || uid.trim() === "") {
    return null;
  }

  // sessionStorage only exists in the browser. This function is also called
  // from server-side API routes (e.g. /api/coach), where it's undefined —
  // guard against that instead of throwing.
  if (!USE_FIRESTORE || typeof sessionStorage === "undefined") {
    if (typeof sessionStorage === "undefined") return null;
    const stored = JSON.parse(sessionStorage.getItem("adopterProfiles") || "{}");
    const profile = stored[uid];
    if (!profile) return null;
    // Convert ISO strings back to Timestamp-like objects for consistency
    return {
      ...profile,
      createdAt: Timestamp.fromDate(new Date(profile.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(profile.updatedAt)),
    } as AdopterProfile;
  }

  try {
    const profileRef = doc(db, "users", uid, "adopterProfile", uid);
    const snap = await getDoc(profileRef);

    if (!snap.exists()) return null;

    return { id: snap.id, ...snap.data() } as AdopterProfile;
  } catch (err) {
    // Server-side Firestore reads have no authenticated session, so
    // security rules will reject them. Don't let that crash the caller —
    // treat it the same as "profile not found" so API routes can fall
    // back gracefully instead of 500ing.
    console.error("fetchAdopterProfile failed (likely no server auth session):", err);
    return null;
  }
}

/**
 * Update specific fields of adopter profile.
 * Merges the provided data with existing profile and updates the updatedAt timestamp.
 *
 * @param uid - User's unique ID
 * @param data - Partial profile data to update
 */
export async function updateAdopterProfile(
  uid: string,
  data: Partial<AdopterProfile>
): Promise<void> {
  if (!uid || uid.trim() === "") {
    throw new Error("Invalid UID: UID cannot be empty");
  }

  if (!USE_FIRESTORE) {
    const stored = JSON.parse(sessionStorage.getItem("adopterProfiles") || "{}");
    if (stored[uid]) {
      const existing = stored[uid];
      const merged = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      // Recalculate completeness if relevant fields changed
      if (REQUIRED_PROFILE_FIELDS.some((f) => f in data)) {
        merged.isComplete = calculateCompleteness(merged);
      }
      stored[uid] = merged;
      sessionStorage.setItem("adopterProfiles", JSON.stringify(stored));
    }
    return;
  }

  const profileRef = doc(db, "users", uid, "adopterProfile", uid);

  // Check if profile exists
  const snap = await getDoc(profileRef);
  if (!snap.exists()) {
    throw new Error("Profile not found");
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Recalculate completeness if relevant fields changed
  if (REQUIRED_PROFILE_FIELDS.some((f) => f in data)) {
    const existing = snap.data() as AdopterProfile;
    const merged = { ...existing, ...data };
    updateData.isComplete = calculateCompleteness(merged);
  }

  await updateDoc(profileRef, updateData);
}

/**
 * Delete adopter profile (for account deletion).
 *
 * @param uid - User's unique ID
 */
export async function deleteAdopterProfile(uid: string): Promise<void> {
  if (!uid || uid.trim() === "") {
    throw new Error("Invalid UID: UID cannot be empty");
  }

  if (!USE_FIRESTORE) {
    const stored = JSON.parse(sessionStorage.getItem("adopterProfiles") || "{}");
    delete stored[uid];
    sessionStorage.setItem("adopterProfiles", JSON.stringify(stored));
    return;
  }

  const profileRef = doc(db, "users", uid, "adopterProfile", uid);
  await deleteDoc(profileRef);
}

/**
 * Check if profile exists and is complete.
 *
 * @param uid - User's unique ID
 * @returns True if profile exists and all required fields are populated
 */
export async function hasCompleteProfile(uid: string): Promise<boolean> {
  const profile = await fetchAdopterProfile(uid);
  if (!profile) return false;
  return profile.isComplete === true;
}

// ─── Assessment Storage ─────────────────────────────────

/**
 * Save assessment result to Firestore.
 * Stores the compatibility calculation results with a reference to the adopter profile.
 * Assessment records auto-expire after 30 days.
 *
 * @param assessment - Assessment data without auto-managed fields
 * @returns The generated assessment ID
 */
export async function saveAssessment(
  assessment: Omit<AssessmentRecord, "id" | "createdAt" | "expiresAt">
): Promise<string> {
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  );

  if (!USE_FIRESTORE) {
    // Store in sessionStorage as fallback for demo mode
    const id = doc(collection(db, "assessments")).id; // Generate ID locally
    const record: AssessmentRecord = {
      id,
      ...assessment,
      createdAt: now,
      expiresAt,
    };
    const stored = JSON.parse(sessionStorage.getItem("assessments") || "[]");
    stored.push(record);
    sessionStorage.setItem("assessments", JSON.stringify(stored));
    return id;
  }

  const collectionRef = collection(db, "assessments");
  const docRef = doc(collectionRef); // Auto-generate ID
  const id = docRef.id;

  const record: Omit<AssessmentRecord, "createdAt"> & {
    createdAt: Timestamp;
  } = {
    id,
    ...assessment,
    createdAt: now,
    expiresAt,
  };

  await setDoc(docRef, record);
  return id;
}

/**
 * Fetch assessment by ID.
 *
 * @param id - Assessment ID
 * @returns The assessment record or null if not found
 */
export async function fetchAssessment(
  id: string
): Promise<AssessmentRecord | null> {
  if (!id || id.trim() === "") {
    return null;
  }

  if (!USE_FIRESTORE) {
    const stored: AssessmentRecord[] = JSON.parse(
      sessionStorage.getItem("assessments") || "[]"
    );
    const assessment = stored.find((a) => a.id === id);
    return assessment || null;
  }

  const ref = doc(db, "assessments", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() } as AssessmentRecord;
}

/**
 * Fetch all assessments for a user.
 * Returns assessments sorted by creation date (newest first).
 *
 * @param uid - User's unique ID (adopterUid)
 * @returns Array of assessment records for the user
 */
export async function fetchUserAssessments(
  uid: string
): Promise<AssessmentRecord[]> {
  if (!uid || uid.trim() === "") {
    return [];
  }

  if (!USE_FIRESTORE) {
    const stored: AssessmentRecord[] = JSON.parse(
      sessionStorage.getItem("assessments") || "[]"
    );
    // Filter by adopterUid and sort by createdAt (newest first)
    return stored
      .filter((a) => a.adopterUid === uid)
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
  }

  const q = query(
    collection(db, "assessments"),
    where("adopterUid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as AssessmentRecord);
}

// ─── Saved Cats (Wishlist) ─────────────────────────────

/**
 * Fetch the list of cat IDs a user has saved to their wishlist.
 *
 * @param uid - User's unique ID
 * @returns Array of saved cat IDs
 */
export async function fetchSavedCatIds(uid: string): Promise<string[]> {
  if (!uid || uid.trim() === "") return [];

  if (!USE_FIRESTORE) {
    const stored = JSON.parse(localStorage.getItem("savedCats") || "{}");
    return stored[uid] || [];
  }

  const ref = doc(db, "users", uid, "meta", "savedCats");
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  return (snap.data().catIds as string[]) || [];
}

/**
 * Add a cat to the user's wishlist.
 *
 * @param uid - User's unique ID
 * @param catId - Cat ID to save
 */
export async function saveCatToWishlist(uid: string, catId: string): Promise<string[]> {
  if (!uid || uid.trim() === "") throw new Error("Invalid UID: UID cannot be empty");

  if (!USE_FIRESTORE) {
    const stored = JSON.parse(localStorage.getItem("savedCats") || "{}");
    const current: string[] = stored[uid] || [];
    if (!current.includes(catId)) current.push(catId);
    stored[uid] = current;
    localStorage.setItem("savedCats", JSON.stringify(stored));
    return current;
  }

  const ref = doc(db, "users", uid, "meta", "savedCats");
  const existing = await fetchSavedCatIds(uid);
  const updated = existing.includes(catId) ? existing : [...existing, catId];
  await setDoc(ref, { catIds: updated }, { merge: true });
  return updated;
}

/**
 * Remove a cat from the user's wishlist.
 *
 * @param uid - User's unique ID
 * @param catId - Cat ID to remove
 */
// ─── Coach Chat Persistence ────────────────────────────

export interface CoachMessageRecord {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isEmergency?: boolean;
  imagePreview?: string;
}

/**
 * Save a single coach chat message to Firestore.
 * Path: users/{uid}/coachChats/{adoptionId}/messages/{msgId}
 */
export async function saveCoachMessage(
  uid: string,
  adoptionId: string,
  message: CoachMessageRecord
): Promise<void> {
  if (!uid || uid.trim() === "" || uid === "guest") {
    // Guest: store in sessionStorage
    try {
      const key = `fh_coach_${adoptionId}`;
      const stored = JSON.parse(sessionStorage.getItem(key) || "[]");
      stored.push(message);
      sessionStorage.setItem(key, JSON.stringify(stored));
    } catch { /* noop */ }
    return;
  }

  if (!USE_FIRESTORE) {
    try {
      const key = `fh_coach_${adoptionId}`;
      const stored = JSON.parse(sessionStorage.getItem(key) || "[]");
      stored.push(message);
      sessionStorage.setItem(key, JSON.stringify(stored));
    } catch { /* noop */ }
    return;
  }

  try {
    const msgRef = doc(db, "users", uid, "coachChats", adoptionId, "messages", message.id);
    await setDoc(msgRef, message);
  } catch (err) {
    console.error("Failed to save coach message:", err);
  }
}

/**
 * Fetch all coach chat messages for an adoption from Firestore.
 */
export async function fetchCoachMessages(
  uid: string,
  adoptionId: string
): Promise<CoachMessageRecord[]> {
  if (!uid || uid.trim() === "" || uid === "guest") {
    try {
      const key = `fh_coach_${adoptionId}`;
      return JSON.parse(sessionStorage.getItem(key) || "[]");
    } catch { return []; }
  }

  if (!USE_FIRESTORE) {
    try {
      const key = `fh_coach_${adoptionId}`;
      return JSON.parse(sessionStorage.getItem(key) || "[]");
    } catch { return []; }
  }

  try {
    const colRef = collection(db, "users", uid, "coachChats", adoptionId, "messages");
    const q = query(colRef, orderBy("timestamp", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as CoachMessageRecord);
  } catch (err) {
    console.error("Failed to fetch coach messages:", err);
    return [];
  }
}

// ─── AI Counselor Report (Compatibility Report) ──────────
// Path: users/{uid}/compatibilityReports/{matchId}
// Authenticated users → Firestore; guests → localStorage (handled in page)

export interface AICounselorReport {
  explanation: string;
  explanationIsAI: boolean;
  explanationSource: string;
  aiProtectiveFactors: string[];
  resultLevel: "low" | "moderate" | "high";
  concerns: Array<{ ruleId: string; severity: "significant" | "moderate"; description: string; triggeredBy: string }>;
  strengths: Array<{ description: string }>;
  updatedAt: string; // ISO timestamp
}

/**
 * Save AI counselor report to Firestore for an authenticated user.
 */
export async function saveAICounselorReport(
  uid: string,
  matchId: string,
  report: Omit<AICounselorReport, "updatedAt">
): Promise<void> {
  if (!uid || uid.trim() === "" || uid === "guest") return;

  if (!USE_FIRESTORE) return;

  try {
    const reportRef = doc(db, "users", uid, "compatibilityReports", matchId);
    await setDoc(reportRef, {
      ...report,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error("Failed to save AI counselor report to Firestore:", err);
  }
}

/**
 * Fetch AI counselor report from Firestore for an authenticated user.
 * Returns null if not found.
 */
export async function fetchAICounselorReport(
  uid: string,
  matchId: string
): Promise<AICounselorReport | null> {
  if (!uid || uid.trim() === "" || uid === "guest") return null;

  if (!USE_FIRESTORE) return null;

  try {
    const reportRef = doc(db, "users", uid, "compatibilityReports", matchId);
    const snap = await getDoc(reportRef);
    if (!snap.exists()) return null;
    return snap.data() as AICounselorReport;
  } catch (err) {
    console.error("Failed to fetch AI counselor report from Firestore:", err);
    return null;
  }
}

export async function removeCatFromWishlist(uid: string, catId: string): Promise<string[]> {
  if (!uid || uid.trim() === "") throw new Error("Invalid UID: UID cannot be empty");

  if (!USE_FIRESTORE) {
    const stored = JSON.parse(localStorage.getItem("savedCats") || "{}");
    const current: string[] = (stored[uid] || []).filter((id: string) => id !== catId);
    stored[uid] = current;
    localStorage.setItem("savedCats", JSON.stringify(stored));
    return current;
  }

  const ref = doc(db, "users", uid, "meta", "savedCats");
  const existing = await fetchSavedCatIds(uid);
  const updated = existing.filter((id) => id !== catId);
  await setDoc(ref, { catIds: updated }, { merge: true });
  return updated;
}
