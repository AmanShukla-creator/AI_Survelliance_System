import { signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import { Chrome, Play } from "lucide-react";
import { useState } from "react";
import { auth, provider, firebaseStatus } from "../services/firebase";

export default function Login() {
  const [error, setError] = useState("");

  const login = async () => {
    setError("");

    if (!firebaseStatus.configured) {
      setError(
        `Missing Firebase env variables. Please configure .env and Vercel env.`
      );
      return;
    }

    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError(e.message);
    }
  };

  const demoLogin = () => {
    localStorage.setItem("demo-user", "true");
    window.location.href = "/";
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <motion.div className="glass p-12 w-[520px]">
        <h1 className="text-5xl text-sky-400 text-center">AEGIS</h1>

        {error && (
          <div className="mt-6 text-sm text-red-400 bg-white/5 p-3 rounded">
            {error}
          </div>
        )}

        <div className="mt-10 space-y-6">
          <button
            onClick={login}
            className="w-full py-4 rounded-xl bg-sky-400 text-black font-semibold flex justify-center gap-3"
          >
            <Chrome /> Sign in with Google
          </button>

          <button
            onClick={demoLogin}
            className="w-full py-4 rounded-xl border border-white/20"
          >
            <Play /> Demo Mode
          </button>
        </div>
      </motion.div>
    </div>
  );
}
