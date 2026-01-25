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

  const BACKEND = import.meta.env.VITE_BACKEND_URL;
  const isDemo = localStorage.getItem("demo-user");

  useEffect(() => {
    // 🔹 DEMO MODE (judge friendly fallback)
    if (isDemo) {
      setStats({
        total_detections: 27,
        active_alerts: 2,
        person_count: 3,
        cameras_online: 1,
        gesture_detected: "SOS",
      });
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        if (!BACKEND) return;

        const r = await fetch(`${BACKEND}/api/stats`);
        if (!r.ok) return;

        const payload = await r.json();
        const data = payload?.data ?? payload ?? {};

        setStats((prev) => ({
          ...prev,
          total_detections: data.total_detections ?? prev.total_detections,
          active_alerts: data.active_alerts ?? prev.active_alerts,
          person_count: data.person_count ?? prev.person_count,
          cameras_online: data.cameras_online ?? prev.cameras_online,
          gesture_detected: data.gesture_detected ?? prev.gesture_detected,
        }));
      } catch (err) {
        console.error("Stats fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const id = setInterval(fetchStats, 10000);
    return () => clearInterval(id);
  }, [BACKEND, isDemo]);

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
