import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/* -----------------------------
   Environment validation
-------------------------------- */

const env = import.meta.env;

const requiredKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
];

const missingOrPlaceholder = requiredKeys.filter(
  (key) => !env[key] || String(env[key]).toLowerCase().includes("your_"),
);

export const firebaseStatus = {
  configured: missingOrPlaceholder.length === 0,
  missingOrPlaceholder,
};

/* -----------------------------
   Firebase initialization
-------------------------------- */

let app = null;
let auth = null;
let provider = null;

if (firebaseStatus.configured) {
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  // Optional (safe to include)
  if (env.VITE_FIREBASE_STORAGE_BUCKET) {
    firebaseConfig.storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET;
  }

  if (env.VITE_FIREBASE_MESSAGING_SENDER_ID) {
    firebaseConfig.messagingSenderId =
      env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
  } catch (err) {
    console.error("Firebase init failed:", err);
    firebaseStatus.configured = false;
  }
}

export { auth, provider };
