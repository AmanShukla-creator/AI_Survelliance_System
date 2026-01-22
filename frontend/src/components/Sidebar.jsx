import { LayoutDashboard, Video, Bell, Activity, ChevronLeft } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

const NavItem = ({ icon: Icon, label, active, collapsed, onClick }) => (
  <div
    onClick={onClick}
    className={clsx(
      "group flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer transition-all",
      active ? "bg-sky-400/15 glow-blue" : "hover:bg-white/5"
    )}
  >
    <Icon
      size={22}
      className={clsx(
        active ? "text-sky-400" : "text-slate-400 group-hover:text-white"
      )}
    />
    {!collapsed && (
      <span className="text-base font-medium text-slate-200">
        {label}
      </span>
    )}
  </div>
);

export default function Sidebar() {
  const [active, setActive] = useState("Dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 288 }}
      className="glass flex flex-col px-4 py-8 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        {!collapsed && (
          <h2 className="text-xl font-semibold text-sky-400">
            ⟁ AEGIS
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/5 transition"
        >
          <ChevronLeft
            className={clsx(
              "transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        <NavItem icon={LayoutDashboard} label="Dashboard" active={active==="Dashboard"} collapsed={collapsed} onClick={()=>setActive("Dashboard")} />
        <NavItem icon={Video} label="Live Cameras" active={active==="Live Cameras"} collapsed={collapsed} onClick={()=>setActive("Live Cameras")} />
        <NavItem icon={Bell} label="Threat Alerts" active={active==="Threat Alerts"} collapsed={collapsed} onClick={()=>setActive("Threat Alerts")} />
        <NavItem icon={Activity} label="System Activity" active={active==="System Activity"} collapsed={collapsed} onClick={()=>setActive("System Activity")} />
      </nav>
    </motion.aside>
  );
}
