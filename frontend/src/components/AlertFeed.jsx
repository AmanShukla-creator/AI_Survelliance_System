import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config/backend";

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);
  const isDemo = localStorage.getItem("demo-user");

  useEffect(() => {
    if (isDemo) {
      setAlerts([
        { class: "Unauthorized Access", confidence: 0.94, level: "high" },
        { class: "Suspicious Movement", confidence: 0.88, level: "medium" },
        { class: "Perimeter Breach", confidence: 0.91, level: "high" },
      ]);
      return;
    }

    const id = setInterval(async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/api/alerts?max_age=60`);
        if (!r.ok) return;
        const payload = await r.json();
        const list = payload.alerts || [];
        setAlerts(
          list.map((a) => ({
            class: a.type,
            confidence: Math.min(1, (a.severity || 1) / 5),
            level: a.severity >= 4 ? "high" : "medium",
          }))
        );
      } catch {}
    }, 3000);

    return () => clearInterval(id);
  }, [isDemo]);

  return (
    <aside className="glass px-6 py-7 h-full">
      <h3 className="text-xl font-semibold mb-6 text-rose-400">
        Active Threats
      </h3>

      <div className="space-y-5">
        <AnimatePresence>
          {alerts.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-5 py-4 rounded-xl ${
                a.level === "high"
                  ? "bg-rose-500/20"
                  : "bg-yellow-500/20"
              }`}
            >
              <p className="text-lg font-medium text-rose-400">{a.class}</p>
              <p className="text-sm text-slate-400 mt-1">
                Confidence {Math.round(a.confidence * 100)}%
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </aside>
  );
}
