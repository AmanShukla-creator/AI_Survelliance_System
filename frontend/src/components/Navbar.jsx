import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Navbar({
  onHome,
  onLogout,
  isDemo,
  onResetDemo
}) {
  return (
    <header className="h-16 glass flex items-center justify-between px-8 shrink-0">

      {/* LEFT: LOGO + BREADCRUMB */}
      <div className="flex items-center gap-6">
        <button
          onClick={onHome}
          className="text-lg font-semibold text-sky-400 hover:opacity-80 transition"
        >
          ⟁ AEGIS
        </button>

        <span className="text-sm text-slate-400">
          / Dashboard
        </span>
      </div>

      {/* RIGHT: STATUS + ACTIONS */}
      <div className="flex items-center gap-4">

        {/* AI STATUS */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">AI Online</span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
        </div>

        {/* RESET DEMO (ONLY IN DEMO MODE) */}
        {isDemo && (
          <button
            onClick={onResetDemo}
            className="px-4 py-2 rounded-lg text-sm
                       border border-yellow-400/30 text-yellow-300
                       hover:bg-yellow-400/10 transition"
          >
            Reset Demo
          </button>
        )}

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-lg text-sm
                     border border-white/10
                     hover:bg-white/10 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
