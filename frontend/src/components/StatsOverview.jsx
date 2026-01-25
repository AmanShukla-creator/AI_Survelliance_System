import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config/backend";

export default function StatsOverview() {
  const [stats, setStats] = useState({
    total_detections: 0,
    active_alerts: 0,
    person_count: 0,
    cameras_online: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/api/stats`);
        if (!r.ok) return;
        const res = await r.json();
        setStats(res.data || {});
      } catch {}
    };

    fetchStats();
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-8">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="glass px-8 py-7">
          <p className="text-sm text-slate-400 uppercase">
            {key.replace("_", " ")}
          </p>
          <p className="text-4xl font-semibold mt-3 text-sky-400">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
