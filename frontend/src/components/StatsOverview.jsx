import { useEffect, useState } from "react";
import { apiUrl } from "../config/api";

export default function StatsOverview() {
  const [stats, setStats] = useState({
    total_detections: 0,
    active_alerts: 0,
    person_count: 0,
    cameras_online: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(apiUrl("/api/stats"));
        if (!res.ok) return;

        const payload = await res.json();
        const data = payload?.data || {};

        setStats({
          total_detections: data.total_detections ?? 0,
          active_alerts: data.active_alerts ?? 0,
          person_count: data.person_count ?? 0,
          cameras_online: data.cameras_online ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const id = setInterval(fetchStats, 10000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { label: "Detections", value: stats.total_detections },
    { label: "Active Alerts", value: stats.active_alerts },
    { label: "People Detected", value: stats.person_count },
    { label: "Cameras Online", value: stats.cameras_online },
  ];

  return (
    <div className="grid grid-cols-4 gap-8">
      {items.map((item) => (
        <div key={item.label} className="glass px-8 py-7">
          <p className="text-sm text-slate-400 uppercase tracking-wider">
            {item.label}
          </p>
          <p className="text-4xl font-semibold mt-3 text-sky-400">
            {loading ? "—" : item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
