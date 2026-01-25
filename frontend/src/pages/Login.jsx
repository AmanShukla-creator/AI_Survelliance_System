import { signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import { Chrome, Play } from "lucide-react";
import { useState } from "react";
import { auth, provider, firebaseStatus } from "../services/firebase";

export default function Login() {
  const [error, setError] = useState("");

  const formatAuthError = (e) => {
    const code = String(e?.code || "");
    const msg = String(e?.message || "").trim();

    if (code === "auth/unauthorized-domain") {
      return (
        "Unauthorized domain. Go to Firebase Console → Authentication → Settings → Authorized domains and add your site (localhost / Vercel URL)."
      );
    }

    if (code === "auth/operation-not-allowed") {
      return (
        "Google sign-in is disabled. Enable Google provider in Firebase Console → Authentication → Sign-in method."
      );
    }

    if (code === "auth/popup-blocked") {
      return "Popup blocked by browser. Please allow popups and try again.";
    }

    if (code === "auth/popup-closed-by-user") {
      return "Popup closed before sign-in completed.";
    }

    if (code === "auth/cancelled-popup-request") {
      return "Another sign-in popup is already open.";
    }

    if (code === "auth/invalid-api-key") {
      return "Invalid Firebase API key. Check your VITE_FIREBASE_API_KEY.";
    }

    return `Google sign-in failed${code ? ` (${code})` : ""}. ${msg}`;
  };

  const login = async () => {
    setError("");

    if (!firebaseStatus.configured || !auth || !provider) {
      const missing =
        firebaseStatus.missingOrPlaceholder?.length > 0
          ? `Missing env vars: ${firebaseStatus.missingOrPlaceholder.join(", ")}.`
          : "";

      setError(
        `${missing} Firebase is not properly configured. Restart dev server after fixing .env.`,
      );
      return;
    }

    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError(formatAuthError(e));
    }
  };

  const demoLogin = () => {
    localStorage.setItem("demo-user", "true");
    window.location.href = "/";
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass p-12 w-[520px]"
      >
        <h1 className="text-5xl text-sky-400 text-center font-semibold">
          AEGIS
        </h1>

        <p className="text-slate-400 text-center mt-3">
          AI Surveillance Command Platform
        </p>

        {error && (
          <div className="mt-6 text-sm text-red-400 bg-white/5 p-3 rounded">
            {error}
          </div>
        )}

        <div className="mt-10 space-y-6">
          <button
            onClick={login}
            className="w-full py-4 rounded-xl bg-sky-400 text-black font-semibold flex items-center justify-center gap-3 hover:scale-[1.02] transition"
          >
            <Chrome size={20} />
            Sign in with Google
          </button>

          <button
            onClick={demoLogin}
            className="w-full py-4 rounded-xl border border-white/20 text-white flex items-center justify-center gap-3 hover:bg-white/5 transition"
          >
            <Play size={18} />
            Demo Mode
          </button>
        </div>
      </motion.div>
    </div>
  );
}
