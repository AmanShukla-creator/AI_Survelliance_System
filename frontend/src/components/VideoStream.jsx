import { Video } from "lucide-react";
import { BACKEND_URL } from "../config/backend";

export default function VideoStream() {
  const isDemo = localStorage.getItem("demo-user");
  const isCloud = window.location.hostname.includes("vercel.app");

  if (isDemo || isCloud) {
    return (
      <div className="flex items-center justify-center h-full rounded-xl bg-black/60 border border-white/10">
        <Video size={40} className="text-slate-500" />
        <p className="ml-3 text-slate-400">Live feed unavailable</p>
      </div>
    );
  }

  return (
    <img
      src={`${BACKEND_URL}/video_feed`}
      className="w-full h-full rounded-xl object-cover"
    />
  );
}
