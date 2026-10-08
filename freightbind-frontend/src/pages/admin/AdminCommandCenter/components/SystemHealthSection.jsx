import SystemHealthWidget from "../../../../components/widgets/SystemHealthWidget";

/**
 * SystemHealthSection — live infrastructure status served by the analytics
 * endpoint: API server, database connection and realtime socket client count.
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
      overall={overall}
    />
  );
};

export default SystemHealthSection;