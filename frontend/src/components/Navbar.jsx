import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Navbar({ onHome, onLogout, isDemo }) {
  return (
    <header className="h-16 glass flex items-center justify-between px-8">

      <button
        onClick={onHome}
        className="text-lg font-semibold text-sky-400 hover:opacity-80"
      >
        ⟁ AEGIS
      </button>

      <div className="flex items-center gap-4">
        {isDemo && (
          <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
            Demo Mode
          </span>
        )}

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
