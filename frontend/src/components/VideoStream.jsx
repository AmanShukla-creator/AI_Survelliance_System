import { useEffect, useRef, useState } from "react";
import { apiUrl } from "../config/api";

export default function VideoStream() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [frame, setFrame] = useState(null);
  const [status, setStatus] = useState("Initializing camera...");
  const [error, setError] = useState("");

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera not supported");
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        const video = videoRef.current;
        if (!video) throw new Error("Video ref missing");

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        await video.play();
        setStatus("Camera active • AI processing");

        intervalRef.current = setInterval(captureFrame, 700);
      } catch (e) {
        console.error(e);
        setError("Camera access failed");
      }
    };

    const captureFrame = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      if (video.videoWidth === 0) return;

      canvas.width = 640;
      canvas.height = 480;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const image = canvas.toDataURL("image/jpeg", 0.7);

      try {
        const res = await fetch(apiUrl("/api/process_frame"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
        });

        if (!res.ok) throw new Error("Backend error");

        const data = await res.json();
        if (data?.annotated_image) {
          setFrame(data.annotated_image);
          setError("");
        }
      } catch (e) {
        console.error(e);
        setError("Backend not responding");
      }
    };

    startCamera();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {frame ? (
        <img src={frame} className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400">
          {error || status}
        </div>
      )}
    </div>
  );
}
