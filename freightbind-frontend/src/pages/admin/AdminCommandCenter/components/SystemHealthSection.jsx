import SystemHealthWidget from "../../../../components/widgets/SystemHealthWidget";

/**
 * SystemHealthSection — preview infrastructure status. No health API exists
 * yet, so service rows are sample values and the panel is marked as a
 * preview.
 */
const SystemHealthSection = ({ services = [], loading = false }) => {
  const overall = services.some((s) => s.status === "down")
    ? "down"
    : services.some((s) => s.status === "degraded")
      ? "degraded"
      : "operational";

  return (
    <SystemHealthWidget
      title="System Health"
      subtitle="Live status of platform services."
      services={services}
      loading={loading}
      preview
      overall={overall}
    />
  );
};

export default SystemHealthSection;
