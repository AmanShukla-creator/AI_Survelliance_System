import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/* 🔒 Detect missing env */
const requiredKeys = Object.entries(firebaseConfig)
  .filter(([_, v]) => !v || v.startsWith("REPLACE"))
  .map(([k]) => `VITE_FIREBASE_${k.toUpperCase()}`);

export const firebaseStatus = {
  configured: requiredKeys.length === 0,
  missingOrPlaceholder: requiredKeys,
};

let app = null;
let auth = null;
let provider = null;

if (firebaseStatus.configured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();

  // Analytics only in browser (prevents Vercel crash)
  if (typeof window !== "undefined") {
    isSupported().then((yes) => yes && getAnalytics(app));
  }
}

export { app, auth, provider };
