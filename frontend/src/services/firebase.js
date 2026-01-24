import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const isPlaceholder = (value) => {
  if (!value) return true;
  const normalized = String(value).trim().toLowerCase();
  if (normalized.length === 0) return true;

  return (
    normalized.includes("your-api-key-here") ||
    normalized.includes("your-project-id") ||
    normalized.includes("your-sender-id") ||
    normalized.includes("your-app-id") ||
    normalized.startsWith("demo-")
  );
};

const env = import.meta.env;
const requiredKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missingOrPlaceholder = requiredKeys.filter((key) =>
  isPlaceholder(env[key]),
);

const firebaseStatus = {
  configured: missingOrPlaceholder.length === 0,
  missingOrPlaceholder,
};

let app = null;
let auth = null;
let provider = null;

if (firebaseStatus.configured) {
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
  } catch (error) {
    console.warn("Firebase initialization failed:", error?.message || error);
    firebaseStatus.configured = false;
    firebaseStatus.initError = String(error?.message || error);
  }
}

export { auth, firebaseStatus, provider };
