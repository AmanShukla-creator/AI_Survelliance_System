import CameraCard from "./CameraCard";

export default function CameraGrid() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">
        Live Intelligence Feed
      </h2>

      <div className="grid grid-cols-2 gap-8">
        <CameraCard />
        <CameraCard />
        <CameraCard />
        <CameraCard />
      </div>
    </section>
  );
}
