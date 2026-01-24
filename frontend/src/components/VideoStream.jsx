import { useEffect, useState } from 'react'
import { Video, AlertTriangle } from 'lucide-react'

export default function VideoStream() {
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black border border-white/10">
      {!error ? (
        <img
          src="http://localhost:5000/video_feed"
          alt="Live Camera Feed"
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400">
          Camera feed unavailable
        </div>
      )}
    </div>
  );
}