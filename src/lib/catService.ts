import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export interface CatDocument {
  id: string;
  name: string;
  age: number;
  sex: "male" | "female";
  lifeStage: "kitten" | "young" | "adult" | "senior";
  neutered: boolean;
  photo: string;
  shelterId: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: "available" | "adopted" | "pending" | "archived";
  behavior: {
    energy: string;
    sociability: string;
    stressSensitivity: string;
    handlingTolerance: string;
    playNeeds: string;
    comfortableWithChildren: string;
    comfortableWithCats: string;
    comfortableWithDogs: string;
    noiseTolerance: string;
    needsVerticalSpace: string;
    indoorOnlyRequired: boolean;
  };
  care: {
    knownMedicalNeeds: string;
    medicationNeeds: string;
    fivStatus: string;
    specialNotes: string;
  };
}

// Fetch all cats for a shelter
export async function fetchCatsByShelter(shelterId: string): Promise<CatDocument[]> {
  const q = query(
    collection(db, "cats"),
    where("shelterId", "==", shelterId),
    where("status", "!=", "archived"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CatDocument));
}

// Fetch all available cats (public listing)
export async function fetchAvailableCats(): Promise<CatDocument[]> {
  const q = query(
    collection(db, "cats"),
    where("status", "==", "available"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CatDocument));
}

// Get a single cat by ID
export async function fetchCatById(catId: string): Promise<CatDocument | null> {
  const docRef = doc(db, "cats", catId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as CatDocument;
  }
  return null;
}

// Create a new cat
export async function createCat(
  data: Omit<CatDocument, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const docRef = await addDoc(collection(db, "cats"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update a cat
export async function updateCat(
  catId: string,
  data: Partial<Omit<CatDocument, "id" | "createdAt">>,
): Promise<void> {
  const docRef = doc(db, "cats", catId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Archive a cat (soft delete)
export async function archiveCat(catId: string): Promise<void> {
  const docRef = doc(db, "cats", catId);
  await updateDoc(docRef, {
    status: "archived",
    updatedAt: serverTimestamp(),
  });
}

// Upload cat photo to Firebase Storage
export async function uploadCatPhoto(
  shelterId: string,
  catId: string,
  file: File,
): Promise<string> {
  const storageRef = ref(storage, `shelters/${shelterId}/cats/${catId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
