import { AlertTriangle, BarChart3, Camera, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { apiUrl } from "../config/api";

export default function StatsCards() {
  const [stats, setStats] = useState({
    total_detections: 0,
    active_alerts: 0,
    people_detected: 0,
    uptime: "99.9%",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(apiUrl("/api/stats"));
        if (!response.ok) return;

        const payload = await response.json();
        const data = payload?.data || {};

        setStats((prev) => ({
          ...prev,
          total_detections: data.total_detections ?? prev.total_detections,
          active_alerts: data.active_alerts ?? prev.active_alerts,
          people_detected: data.person_count ?? prev.people_detected,
        }));
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Detections",
      value: stats.total_detections,
      icon: Camera,
      styles:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "Active Alerts",
      value: stats.active_alerts,
      icon: AlertTriangle,
      styles: "border-red-500/30 bg-red-500/10 text-red-400",
    },
    {
      title: "People Detected",
      value: stats.people_detected,
      icon: Users,
      styles: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    },
    {
      title: "Uptime",
      value: stats.uptime,
      icon: BarChart3,
      styles: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className={`glass-panel p-4 border ${card.styles} hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  {card.title}
                </p>
                <p className="text-3xl font-bold mt-2">
                  {loading ? "—" : card.value}
                </p>
              </div>
              <Icon className="w-8 h-8 opacity-90" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
