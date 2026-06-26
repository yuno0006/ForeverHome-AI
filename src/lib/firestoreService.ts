import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { Cat } from "@/types/cat";
import { AdopterAnswers } from "@/types/adopter";
import { CompatibilityResult } from "@/types/match";
import { demoCats, getCatById } from "@/data/demoCats";

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
