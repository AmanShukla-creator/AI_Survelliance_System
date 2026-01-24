import { useEffect, useRef, useState } from "react";

const DEFAULT_FPS = 6;

export default function VideoStream() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const inFlightRef = useRef(false);

  const [annotatedSrc, setAnnotatedSrc] = useState(null);
  const [status, setStatus] = useState("Requesting camera permission...");
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream;
    let cancelled = false;

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not support camera access.");
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (cancelled) return;

        const videoEl = videoRef.current;
        if (!videoEl) return;

        videoEl.srcObject = stream;
        await videoEl.play();

        setStatus("Camera active. Processing...");

        const fps = DEFAULT_FPS;
        const periodMs = Math.max(1000 / fps, 120);

        intervalRef.current = window.setInterval(async () => {
          if (inFlightRef.current) return;

          const v = videoRef.current;
          const c = canvasRef.current;
          if (!v || !c) return;

          const w = v.videoWidth;
          const h = v.videoHeight;
          if (!w || !h) return;

          // Resize capture to reduce bandwidth/CPU
          const targetW = 640;
          const scale = targetW / w;
          const targetH = Math.round(h * scale);

          c.width = targetW;
          c.height = targetH;

          const ctx = c.getContext("2d", { willReadFrequently: false });
          if (!ctx) return;

          ctx.drawImage(v, 0, 0, targetW, targetH);
          const dataUrl = c.toDataURL("image/jpeg", 0.7);

          inFlightRef.current = true;
          try {
            const r = await fetch("/api/process_frame", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: dataUrl, return_annotated: true }),
            });

            if (!r.ok) {
              const text = await r.text();
              throw new Error(text || "Backend processing failed.");
            }

            const payload = await r.json();
            if (payload?.annotated_image) {
              setAnnotatedSrc(payload.annotated_image);
              setError(null);
            }
          } catch (e) {
            setError(e?.message || "Failed to process frames.");
          } finally {
            inFlightRef.current = false;
          }
        }, periodMs);
      } catch (e) {
        setError(e?.message || "Camera permission denied.");
        setStatus("Camera unavailable");
      }
    };

    start();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black border border-white/10">
      {/* Hidden elements used for capture */}
      <video ref={videoRef} playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {annotatedSrc ? (
        <img
          src={annotatedSrc}
          alt="Live Camera Feed"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400">
          {error ? error : status}
        </div>
      )}
    </div>
  );
}
