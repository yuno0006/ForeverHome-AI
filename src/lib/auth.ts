import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserDocument, UserRole } from "@/types/user";

/**
 * Register a new user with email/password.
 * Creates both Firebase Auth account and Firestore user document.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  role: UserRole,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  // Update the Auth profile display name
  await updateProfile(user, { displayName });

  // Create Firestore user document
  await createUserDocument(user.uid, {
    uid: user.uid,
    email: user.email!,
    displayName,
    role,
    photoURL: user.photoURL || null,
    onboardingComplete: false,
    shelterId: null,
    profile: null,
  });

  return credential;
}

/**
 * Sign in with email and password.
 */
export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in with Google popup.
 * If no Firestore user doc exists, a placeholder doc is created with
 * onboardingComplete: false so the onboarding flow can let the user pick
 * their real role. The "adopter" role here is only a temporary default and
 * is overwritten once the user completes onboarding.
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const { user } = credential;

  // Check if user doc already exists
  const existingDoc = await fetchUserDocument(user.uid);
  if (!existingDoc) {
    await createUserDocument(user.uid, {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || "User",
      // Temporary default. Onboarding lets the user choose their real role.
      role: "adopter",
      photoURL: user.photoURL || null,
      onboardingComplete: false,
      shelterId: null,
      profile: null,
    });
  }

  return credential;
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Fetch a user document from Firestore by UID.
 */
export async function fetchUserDocument(
  uid: string
): Promise<UserDocument | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserDocument;
  }

  return null;
}

/**
 * Create a new user document in Firestore.
 */
export async function createUserDocument(
  uid: string,
  data: Omit<UserDocument, "createdAt">
) {
  const docRef = doc(db, "users", uid);
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Update an existing user document in Firestore.
 */
export async function updateUserDocument(
  uid: string,
  data: Partial<Omit<UserDocument, "uid" | "createdAt">>
) {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
}

/**
 * Update only the role field of a user document.
 */
export async function updateUserRole(uid: string, role: UserRole) {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { role });
}
