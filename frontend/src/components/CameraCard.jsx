import { motion } from "framer-motion";
import { useState } from "react";
import VideoStream from "./VideoStream";

export default function CameraCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Camera Card */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="glass rounded-xl overflow-hidden cursor-pointer border border-white/10"
        onClick={() => setOpen(true)}
      >
        <div className="relative aspect-video bg-black">
          <VideoStream />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center">
            <span className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur text-sm">
              Click to expand
            </span>
          </div>

          {/* Live Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-sky-400 text-black text-xs font-semibold glow-blue">
            LIVE • AI ACTIVE
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        >
          <div
            className="w-[90%] max-w-[1200px] aspect-video rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <VideoStream />
          </div>
        </div>
      )}
    </>
  );
}
