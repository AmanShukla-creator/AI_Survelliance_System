import CameraCard from "./CameraCard";

export default function CameraGrid() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <CameraCard
        id="cam-1"
        name="Main Entrance"
        status="online"
      />
      <CameraCard
        id="cam-2"
        name="Parking Area"
        status="offline"
      />
    </div>
  );
}
