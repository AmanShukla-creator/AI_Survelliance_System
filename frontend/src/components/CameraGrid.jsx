import VideoStream from "./VideoStream";

export default function CameraGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 h-[500px]">
      <VideoStream />
    </div>
  );
}
