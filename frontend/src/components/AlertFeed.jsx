import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);
  const isDemo = localStorage.getItem("demo-user");

  useEffect(() => {
    if (isDemo) {
      setAlerts([
        { class: "Unauthorized Access", confidence: 0.94, level: "high" },
        { class: "Suspicious Movement", confidence: 0.88, level: "medium" },
      ]);
      return;
    }

    const id = setInterval(async () => {
      try {
        const r = await fetch(`${BACKEND}/api/alerts?max_age=60`);
        const d = await r.json();
        setAlerts(d.alerts || []);
      } catch {}
    }, 3000);

    return () => clearInterval(id);
  }, [isDemo]);

  return (
    <aside className="glass px-6 py-7 h-full">
      <h3 className="text-xl font-semibold mb-6 text-rose-400">
        Active Threats
      </h3>

      <AnimatePresence>
        {alerts.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-rose-500/15"
          >
            <p className="text-rose-400 font-medium">{a.type}</p>
            <p className="text-sm text-slate-400">{a.description}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
}
