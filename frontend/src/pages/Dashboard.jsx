import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CameraGrid from "../components/CameraGrid";
import AlertFeed from "../components/AlertFeed";
import StatsOverview from "../components/StatsOverview";

export default function Dashboard({ onHome, onLogout, isDemo, onResetDemo }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* Sidebar */}
      <div className="shrink-0">
        <Sidebar />
      </div>

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0">

        <Navbar
          onHome={onHome}
          onLogout={onLogout}
          isDemo={isDemo}
          onResetDemo={onResetDemo}
        />

        <main className="flex-1 overflow-y-auto px-10 py-8 space-y-10 bg-[#020617]">
          
          {/* STATS */}
          <StatsOverview />

          {/* CONTENT GRID */}
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-8">
              <CameraGrid />
            </div>

            <div className="col-span-4">
              <AlertFeed />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
