import { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function StatsOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const id = setInterval(async () => {
      const r = await fetch(`${BACKEND}/api/stats`);
      const d = await r.json();
      setStats(d.data);
    }, 5000);

    return () => clearInterval(id);
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-4 gap-8">
      {Object.entries(stats).map(([k, v]) => (
        <div key={k} className="glass px-8 py-7">
          <p className="text-sm text-slate-400">{k}</p>
          <p className="text-3xl text-sky-400">{v ?? 0}</p>
        </div>
      ))}
    </div>
  );
}
