import VideoStream from "./VideoStream";
import { Video, WifiOff } from "lucide-react";

export default function CameraCard({ id, name, status }) {
  return (
    <div className="glass rounded-xl overflow-hidden border border-white/10">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Video size={18} className="text-sky-400" />
          <span className="font-medium text-sm">{name}</span>
        </div>

        {status === "online" ? (
          <span className="text-xs text-emerald-400">● Online</span>
        ) : (
          <span className="text-xs text-rose-400 flex items-center gap-1">
            <WifiOff size={12} />
            Offline
          </span>
        )}
      </div>

      {/* Video */}
      <div className="aspect-video bg-black">
        {status === "online" ? (
          <VideoStream />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Camera offline
          </div>
        )}
      </div>
    </div>
  );
}
