import { useEffect, useState } from "react";

export default function StatsOverview() {
  const [stats, setStats] = useState({
    total_detections: 0,
    active_alerts: 0,
    person_count: 0,
    cameras_online: 0,
    gesture_detected: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const r = await fetch("/api/stats");
        if (r.ok) {
          const payload = await r.json();
          const data = payload?.data || {};
          setStats((prev) => ({
            ...prev,
            total_detections: data.total_detections ?? prev.total_detections,
            active_alerts: data.active_alerts ?? prev.active_alerts,
            person_count: data.person_count ?? prev.person_count,
            cameras_online: data.cameras_online ?? prev.cameras_online,
            gesture_detected: data.gesture_detected ?? prev.gesture_detected,
          }));
        }
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
    { label: "People", value: stats.person_count },
    { label: "Cameras Online", value: stats.cameras_online },
  ];

  return (
    <div className="grid grid-cols-4 gap-8">
      {items.map((it, idx) => (
        <div key={idx} className="glass px-8 py-7">
          <p className="text-sm text-slate-400 uppercase tracking-wider">
            {it.label}
          </p>
          <p className="text-4xl font-semibold mt-3 text-sky-400">
            {loading ? "—" : it.value}
          </p>
        </div>
      ))}
    </div>
  );
}
