import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Shelter } from "@/types/shelter";

// Create a new shelter
export async function createShelter(
  data: Omit<Shelter, "id" | "createdAt">,
  shelterId: string,
): Promise<void> {
  await setDoc(doc(db, "shelters", shelterId), {
    ...data,
    id: shelterId,
    createdAt: serverTimestamp(),
  });
}

// Fetch a shelter by ID
export async function fetchShelter(shelterId: string): Promise<Shelter | null> {
  const docSnap = await getDoc(doc(db, "shelters", shelterId));
  if (docSnap.exists()) {
    return docSnap.data() as Shelter;
  }
  return null;
}

// Update shelter details
export async function updateShelter(
  shelterId: string,
  data: Partial<Omit<Shelter, "id" | "createdAt" | "adminUid">>,
): Promise<void> {
  await updateDoc(doc(db, "shelters", shelterId), data);
}
