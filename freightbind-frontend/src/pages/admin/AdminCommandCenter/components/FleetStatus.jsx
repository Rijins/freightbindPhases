import SectionHeader from "../../../../components/page/SectionHeader";
import VehicleCard from "../../../../components/widgets/VehicleCard";
import DashboardGrid from "../../../../components/widgets/DashboardGrid";

/**
 * FleetStatus — live fleet panel. Vehicles are derived server-side from the
 * active fleet scope (shipments carrying a vehicleNumber), so the grid only
 * ever shows real transport vehicles with their current assignment.
 */
const FleetStatus = ({ vehicles = [], loading = false }) => {
  const available = vehicles.filter((v) => v.status === "Available").length;

  return (
    <section aria-labelledby="fleet-status-title">
      <SectionHeader
        id="fleet-status-title"
        title="Fleet Status"
        subtitle={`${available} of ${vehicles.length} vehicles available right now.`}
      />
      <div className="mt-5">
        {vehicles.length === 0 && !loading ? (
          <p className="rounded-[20px] border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-zinc-800 dark:text-slate-400">
            No fleet vehicles detected yet — vehicles appear here once shipments
            are assigned a vehicle number.
          </p>
        ) : (
          <DashboardGrid columns={3}>
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} loading={loading} />
            ))}
          </DashboardGrid>
        )}
      </div>
    </section>
  );
};

export default FleetStatus;