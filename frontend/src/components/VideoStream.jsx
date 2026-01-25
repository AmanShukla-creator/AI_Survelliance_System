import { useState } from "react";

export default function VideoStream() {
  const [error, setError] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      {!error ? (
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}/video_feed`}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="p-6 text-slate-400 text-center">
          Camera feed unavailable
        </div>
      )}
    </div>
  );
}
