import { useEffect, useState } from "react";

export default function StatsOverview() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/stats")
      .then(r => r.json())
      .then(setStats);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-8">
      {Object.keys(stats).map(key => (
        <div key={key} className="glass px-8 py-7">
          <p className="text-sm text-slate-400 uppercase tracking-wider">
            {key}
          </p>
          <p className="text-4xl font-semibold mt-3 text-sky-400">
            {stats[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
