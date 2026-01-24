import { Home } from "lucide-react";

export default function Navbar({ onHome, onLogout, isDemo }) {
  return (
    <header className="h-16 glass flex items-center justify-between px-8">

      {/* HOME BUTTON */}
      <button
        onClick={onHome}
        className="flex items-center gap-2 text-sky-400 hover:text-white transition"
        title="Go to Landing Page"
      >
        <Home size={20} />
        <span className="font-semibold">Home</span>
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
