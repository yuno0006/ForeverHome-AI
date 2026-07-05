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

  // Ensure the Firestore client picks up the fresh auth token before
  // attempting any reads/writes that depend on security rules.
  await user.getIdToken(true);
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Check if user doc already exists
  try {
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
  } catch (err) {
    // Firestore may be unreachable — the AuthContext will synthesize a doc,
    // so onboarding still triggers. Just log and continue.
    console.warn("Firestore unavailable during Google sign-in, user doc not persisted:", err);
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
 * Uses set with merge so it works even if the document doesn't exist yet
 * (e.g. race between Google sign-in and onboarding completion).
 */
export async function updateUserDocument(
  uid: string,
  data: Partial<Omit<UserDocument, "uid" | "createdAt">>
) {
  const docRef = doc(db, "users", uid);
  await setDoc(docRef, data, { merge: true });
}

/**
 * Update only the role field of a user document.
 */
export async function updateUserRole(uid: string, role: UserRole) {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { role });
}

/**
 * Get the current user's Firebase ID token, for attaching to API requests
 * as `Authorization: Bearer <token>` so server routes can verify identity.
 * Returns null if no user is signed in.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
