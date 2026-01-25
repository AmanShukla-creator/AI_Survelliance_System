import { useState } from "react";
import { Video, AlertTriangle } from "lucide-react";

export default function VideoStream() {
  const [error, setError] = useState(false);

  const BACKEND = import.meta.env.VITE_BACKEND_URL;
  const isDemo = localStorage.getItem("demo-user");

  // Demo mode OR backend missing
  if (isDemo || !BACKEND) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/60 border border-white/10 flex flex-col items-center justify-center">
        <Video className="text-slate-500 mb-3" size={40} />
        <p className="text-slate-400 text-sm">
          Live camera disabled in demo mode
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black border border-white/10">
      {!error ? (
        <img
          src={`${BACKEND}/video_feed`}
          alt="Live Camera Feed"
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
          <AlertTriangle size={28} />
          <p className="text-sm">Camera feed unavailable</p>
        </div>
      )}
    </div>
  );
}
