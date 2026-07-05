// One-time script to create the demo user in Firebase Auth + Firestore
// Usage: node scripts/create-demo-user.mjs

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

// Read API key from .env.local
const envContent = readFileSync(envPath, "utf8");
const apiKeyMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_API_KEY=(\S+)/);
const projectIdMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_PROJECT_ID=(\S+)/);

if (!apiKeyMatch || !projectIdMatch) {
  console.error("Could not find Firebase API key or Project ID in .env.local");
  process.exit(1);
}

const API_KEY = apiKeyMatch[1];
const PROJECT_ID = projectIdMatch[1];

const demoEmail = "demo@foreverhome.ai";
const demoPassword = "demo123456";
const demoName = "Demo User";

async function createDemoUser() {
  console.log(`Creating demo user: ${demoEmail}...`);

  // Step 1: Create user in Firebase Auth via REST API
  const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
  console.log("Calling Firebase Auth signUp...");

  const signUpRes = await fetch(signUpUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: demoEmail,
      password: demoPassword,
      returnSecureToken: true,
    }),
  });

  const signUpData = await signUpRes.json();

  if (signUpData.error) {
    if (signUpData.error.message === "EMAIL_EXISTS") {
      console.log("User already exists in Firebase Auth, proceeding with Firestore update...");
      // Sign in to get the token
      const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
      const signInRes = await fetch(signInUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: demoEmail,
          password: demoPassword,
          returnSecureToken: true,
        }),
      });
      const signInData = await signInRes.json();
      if (signInData.error) {
        console.error("Failed to sign in existing user:", signInData.error);
        process.exit(1);
      }
      await upsertFirestoreDoc(signInData.localId, signInData.idToken);
      return;
    }
    console.error("Failed to create Firebase Auth user:", signUpData.error);
    process.exit(1);
  }

  const uid = signUpData.localId;
  const idToken = signUpData.idToken;
  console.log(`User created with UID: ${uid}`);

  // Step 2: Create Firestore user document
  await upsertFirestoreDoc(uid, idToken);
}

async function upsertFirestoreDoc(uid, idToken) {
  console.log("Creating Firestore user document...");

  // Firestore REST API: write to users/{uid}
  const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/%28default%29/documents/users/${uid}`;

  const docBody = {
    fields: {
      uid: { stringValue: uid },
      email: { stringValue: demoEmail },
      displayName: { stringValue: demoName },
      role: { stringValue: "adopter" },
      photoURL: { nullValue: null },
      onboardingComplete: { booleanValue: false },
      shelterId: { nullValue: null },
      profile: { nullValue: null },
    },
  };

  const docRes = await fetch(docUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(docBody),
  });

  const docData = await docRes.json();

  if (docData.error) {
    console.error("Failed to create Firestore document:", docData.error);
    process.exit(1);
  }

  console.log("Firestore user document created successfully!");
  console.log(`\nDemo account ready:`);
  console.log(`  Email:    ${demoEmail}`);
  console.log(`  Password: ${demoPassword}`);
}

createDemoUser().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
