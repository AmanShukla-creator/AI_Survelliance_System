import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiUrl } from "../config/api";

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);
  const isDemo = localStorage.getItem("demo-user");

  useEffect(() => {
    // DEMO MODE (judge friendly)
    if (isDemo) {
      setAlerts([
        {
          title: "Unauthorized Access",
          description: "Restricted area breach detected",
          level: "high",
          confidence: 0.94,
        },
        {
          title: "Suspicious Movement",
          description: "Unusual movement pattern detected",
          level: "medium",
          confidence: 0.88,
        },
      ]);
      return;
    }

    // REAL BACKEND MODE
    const id = setInterval(async () => {
      try {
        const r = await fetch(apiUrl("/api/alerts?max_age=60"));
        if (!r.ok) return;

        const payload = await r.json();
        const list = Array.isArray(payload?.alerts) ? payload.alerts : [];

        setAlerts(
          list.map((a) => {
            const severity = Number(a?.severity ?? 0);
            const level =
              severity >= 4 ? "high" : severity >= 2 ? "medium" : "low";

            return {
              title: a?.type ?? "Alert",
              description: a?.description ?? "Security event detected",
              confidence: Math.max(0, Math.min(1, severity / 5)),
              level,
              timestamp: a?.timestamp,
            };
          })
        );
      } catch {
        // silent fail (network / backend down)
      }
    }, 3000);

    return () => clearInterval(id);
  }, [isDemo]);

  return (
    <aside className="glass px-6 py-7 h-full">
      <h3 className="text-xl font-semibold mb-6 text-rose-400">
        Active Threats
      </h3>

      <div className="space-y-4">
        <AnimatePresence>
          {alerts.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-xl p-4 border
                ${
                  a.level === "high"
                    ? "bg-rose-500/15 border-rose-500/40"
                    : "bg-yellow-500/10 border-yellow-500/30"
                }`}
            >
              <p className="font-medium text-rose-400">{a.title}</p>

              <p className="text-sm text-slate-400 mt-1">
                {a.description}
              </p>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-500">
                  Confidence {Math.round(a.confidence * 100)}%
                </span>
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
