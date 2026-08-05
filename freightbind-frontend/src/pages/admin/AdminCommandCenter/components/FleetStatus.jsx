import SectionHeader from "../../../../components/page/SectionHeader";
import VehicleCard from "../../../../components/widgets/VehicleCard";
import DashboardGrid from "../../../../components/widgets/DashboardGrid";
import PreviewBadge from "../../../../components/widgets/PreviewBadge";

/**
 * FleetStatus — preview fleet panel. The backend has no fleet module yet, so
 * vehicles come from sample data and the panel is marked as a preview.
 */
const FleetStatus = ({ vehicles = [], loading = false }) => {
  const available = vehicles.filter((v) => v.status === "Available").length;

  return (
    <section aria-labelledby="fleet-status-title">
      <SectionHeader
        title="Fleet Status"
        subtitle={`${available} of ${vehicles.length} vehicles available right now.`}
        action={<PreviewBadge />}
      />
      <div className="mt-5">
        <DashboardGrid columns={3}>
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} loading={loading} />
          ))}
        </DashboardGrid>
      </div>
    </section>
  );
};

export default FleetStatus;
