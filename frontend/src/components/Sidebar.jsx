import { LayoutDashboard, Video, Bell } from "lucide-react";

const Item = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-3 rounded-xl flex items-center gap-3
               text-slate-300 hover:bg-white/5 transition"
  >
    <Icon size={20} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default function Sidebar({ scrollTo }) {
  return (
    <aside className="w-60 glass p-5 space-y-6">
      <div className="text-sky-400 font-bold text-xl px-2">
        Navigation
      </div>

      <nav className="space-y-3">
        <Item
          icon={LayoutDashboard}
          label="Dashboard"
          onClick={() => scrollTo("top")}
        />
        <Item
          icon={Video}
          label="Live Cameras"
          onClick={() => scrollTo("cameras")}
        />
        <Item
          icon={Bell}
          label="Threat Alerts"
          onClick={() => scrollTo("alerts")}
        />
      </nav>
    </aside>
  );
}
