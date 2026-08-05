import SectionHeader from "../../../../components/page/SectionHeader";
import HubCard from "../../../../components/widgets/HubCard";
import DashboardGrid from "../../../../components/widgets/DashboardGrid";
import PreviewBadge from "../../../../components/widgets/PreviewBadge";

/**
 * HubStatus — preview hub network panel. The backend has no hub module yet,
 * so hubs come from sample data and the panel is marked as a preview.
 */
const HubStatus = ({ hubs = [], loading = false }) => (
  <section aria-labelledby="hub-status-title">
    <SectionHeader
      title="Hub Network"
      subtitle="Capacity and live shipment load per facility."
      action={<PreviewBadge />}
    />
    <div className="mt-5">
      <DashboardGrid columns={3}>
        {hubs.map((hub) => (
          <HubCard key={hub._id} hub={hub} loading={loading} />
        ))}
      </DashboardGrid>
    </div>
  </section>
);

export default HubStatus;
