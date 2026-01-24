import { useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CameraGrid from "../components/CameraGrid";
import AlertFeed from "../components/AlertFeed";
import StatsOverview from "../components/StatsOverview";

export default function Dashboard({ onHome, onLogout, isDemo }) {
  const topRef = useRef(null);
  const camerasRef = useRef(null);
  const alertsRef = useRef(null);

  const scrollTo = (section) => {
    const map = {
      top: topRef,
      cameras: camerasRef,
      alerts: alertsRef
    };

    map[section]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      <Sidebar scrollTo={scrollTo} />

      <div className="flex flex-col flex-1 min-w-0">
        <Navbar onHome={onHome} onLogout={onLogout} isDemo={isDemo} />

        <main className="flex-1 overflow-y-auto px-10 py-8 space-y-16 bg-[#020617]">

          {/* TOP / DASHBOARD */}
          <section ref={topRef}>
            <StatsOverview />
          </section>

          {/* LIVE CAMERAS */}
          <section ref={camerasRef}>
            <h2 className="text-2xl font-semibold text-white mb-6">
              Live Cameras
            </h2>
            <CameraGrid />
          </section>

          {/* THREAT ALERTS */}
          <section ref={alertsRef}>
            <h2 className="text-2xl font-semibold text-white mb-6">
              Threat Alerts
            </h2>
            <AlertFeed />
          </section>

        </main>
      </div>
    </div>
  );
}
