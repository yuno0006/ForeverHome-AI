import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  Firestore,
} from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth first so Firestore can pick up the auth state
const auth: Auth = getAuth(app);

// Use getFirestore which is safe to call multiple times (HMR-friendly).
// If you need custom settings (e.g. cache), switch to initializeFirestore
// but guard with a try/catch for HMR re-initialization.
let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: false,
  });
} catch {
  // Already initialized (HMR in dev) — just get the existing instance
  db = getFirestore(app);
}

const storage: FirebaseStorage = getStorage(app);

export { app, db, auth, storage };
