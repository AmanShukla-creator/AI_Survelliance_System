import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);
  const isDemo = localStorage.getItem("demo-user");

  const BACKEND = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // 🔹 DEMO MODE (judge friendly)
    if (isDemo) {
      setAlerts([
        { class: "Unauthorized Access", confidence: 0.94, level: "high" },
        { class: "Suspicious Movement", confidence: 0.88, level: "medium" },
        { class: "Perimeter Breach", confidence: 0.91, level: "high" },
      ]);
      return;
    }

    // 🔹 REAL BACKEND MODE
    const id = setInterval(async () => {
      try {
        if (!BACKEND) return;

        const r = await fetch(`${BACKEND}/api/alerts?max_age=60`);
        if (!r.ok) return;

        const payload = await r.json();
        const list = Array.isArray(payload?.alerts) ? payload.alerts : [];

        setAlerts(
          list.map((a) => {
            const severity = Number(a?.severity ?? 0);
            const level =
              severity >= 4 ? "high" : severity >= 2 ? "medium" : "low";

            return {
              class: a?.type ?? "Alert",
              confidence: Math.max(0, Math.min(1, severity / 5)),
              level,
              description: a?.description,
              timestamp: a?.timestamp,
            };
          })
        );
      } catch (err) {
        console.error("Alert fetch failed", err);
      }
    }, 2000);

    return () => clearInterval(id);
  }, [isDemo, BACKEND]);

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
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className={`px-5 py-4 rounded-xl cursor-pointer transition-all
                ${
                  a.level === "high"
                    ? "bg-rose-500/15 glow-red"
                    : "bg-yellow-500/10"
                }`}
            >
              <p className="text-lg font-medium text-rose-400">
                {a.class}
              </p>

              {a.description && (
                <p className="text-sm text-slate-400 mt-1">
                  {a.description}
                </p>
              )}

              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-slate-400">
                  Confidence {Math.round(a.confidence * 100)}%
                </p>
                <span className="text-xs text-slate-500">
                  just now
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </aside>
  );
}
