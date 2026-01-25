import { useCamera } from "../hooks/useCamera";

export default function CameraPreview() {
  const videoRef = useCamera();

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full rounded-xl object-cover"
    />
  );
}
