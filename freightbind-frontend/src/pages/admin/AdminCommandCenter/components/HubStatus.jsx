import SectionHeader from "../../../../components/page/SectionHeader";
import HubCard from "../../../../components/widgets/HubCard";
import DashboardGrid from "../../../../components/widgets/DashboardGrid";

/**
 * HubStatus — live hub network panel. Hubs and their per-hub shipment loads
 * come from the real Hub collection; utilization is reported only for hubs
 * whose Admin has configured a capacity (otherwise the card shows "—").
 */
const HubStatus = ({ hubs = [], loading = false }) => (
  <section aria-labelledby="hub-status-title">
    <SectionHeader
      id="hub-status-title"
      title="Hub Network"
      subtitle="Capacity and live shipment load per facility."
    />
    <div className="mt-5">
      {hubs.length === 0 && !loading ? (
        <p className="rounded-[20px] border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-zinc-800 dark:text-slate-400">
          No active hubs on the network yet.
        </p>
      ) : (
        <DashboardGrid columns={3}>
          {hubs.map((hub) => (
            <HubCard key={hub._id} hub={hub} loading={loading} />
          ))}
        </DashboardGrid>
      )}
    </div>
  </section>
);

export default HubStatus;