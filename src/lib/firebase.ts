// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// IMPORTANT: Replace these placeholder values with your actual Firebase project configuration.
// You can find this in your Firebase project settings under "General".
// You must create a .env.local file in the root of your project and add these keys.
// Example .env.local:
// NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
// ... and so on for the other keys.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Only initialize Firebase if the API key is provided
if (firebaseConfig.apiKey) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
     console.error("Firebase initialization failed:", error);
     // Keep auth and db as null if initialization fails
     app = null;
     auth = null;
     db = null;
  }
} else {
  // This warning is useful for developers running the app locally
  if (typeof window !== 'undefined') {
    console.warn("Firebase configuration is missing. Authentication and Firestore features are disabled. Please add your Firebase credentials to a .env.local file.");
  }
}

export { auth, db };
