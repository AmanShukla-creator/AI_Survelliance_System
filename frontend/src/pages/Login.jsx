import { signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import { Chrome, Play } from "lucide-react";
import { useState } from "react";
import { auth, provider, firebaseStatus } from "../services/firebase";


export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("Google Sign-In clicked");

      if (!auth || !provider) {
        throw new Error("Firebase auth is not initialized");
      }

      const result = await signInWithPopup(auth, provider);
      console.log("Login successful:", result.user);

    } catch (e) {
      console.error("Google sign-in error:", e);

      let message = "Google sign-in failed.";

      if (e.code === "auth/popup-blocked") {
        message = "Popup blocked by browser. Please allow popups.";
      } else if (e.code === "auth/unauthorized-domain") {
        message = "This domain is not authorized in Firebase.";
      } else if (e.code === "auth/invalid-api-key") {
        message = "Invalid Firebase API key. Check .env file.";
      } else if (e.message) {
        message = e.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    localStorage.setItem("demo-user", "true");
    window.location.reload();
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <motion.div
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -top-48 left-1/2 -translate-x-1/2
                   w-[900px] h-[520px] bg-sky-500/20
                   blur-[220px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-0 right-0
                   w-[720px] h-[420px] bg-emerald-500/20
                   blur-[200px] pointer-events-none"
      />
      <div className="absolute inset-0 bg-[#020617]" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-[520px] glass px-14 py-16"
      >
        <div className="text-center">
          <h1 className="text-5xl font-semibold text-sky-400">AEGIS</h1>
          <p className="text-slate-400 mt-3 text-lg">
            AI Surveillance Command Platform
          </p>
        </div>

        <div className="my-12 h-px bg-white/10" />

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* BUTTONS */}
        <div className="space-y-6">
          {/* GOOGLE LOGIN */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={login}
            disabled={loading}
            className="
              w-full py-5 rounded-2xl
              text-lg font-semibold text-white
              bg-white/5
              border border-sky-400/50
              shadow-lg shadow-sky-400/25
              backdrop-blur
              hover:bg-sky-400/10
              hover:shadow-sky-400/40
              transition-all duration-300
              flex items-center justify-center gap-3
              disabled:opacity-60
            "
          >
            <Chrome size={20} />
            {loading ? "Signing in..." : "Sign in with Google"}
          </motion.button>

          {/* DEMO LOGIN */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={demoLogin}
            className="
              w-full py-5 rounded-2xl
              text-lg font-medium text-slate-200
              bg-white/5
              border border-white/20
              backdrop-blur
              hover:bg-white/10
              hover:border-white/30
              transition-all duration-300
              flex items-center justify-center gap-3
            "
          >
            <Play size={18} />
            Explore Demo Workspace
          </motion.button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-12">
          Secure authentication • Enterprise-grade access
        </p>
      </motion.div>
    </div>
  );
}
