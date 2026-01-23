import { motion } from "framer-motion";
import { useState } from "react";

export default function CameraCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="glass overflow-hidden cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="relative aspect-video bg-black">
          <img
            src="http://localhost:5000/video_feed"
            className="w-full h-full object-cover"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center">
            <span className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur text-sm">
              Click to expand
            </span>
          </div>

          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-sky-400 text-black text-sm glow-blue">
            LIVE • AI ACTIVE
          </div>
        </div>
      </motion.div>

      {/* Fullscreen */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        >
          <img
            src="http://localhost:5000/video_feed"
            className="max-w-[90%] max-h-[90%] rounded-xl"
          />
        </div>
      )}
    </>
  );
}
