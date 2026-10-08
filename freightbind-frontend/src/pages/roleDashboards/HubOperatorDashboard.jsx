import HubOperationsWorkspace from "../hubOperations/HubOperationsWorkspace";

/**
 * HubOperatorDashboard — the Hub Operations workspace. Hub Operators get a
 * dedicated operational view of THEIR hub: hub identity, hub-scoped
 * shipments, operational issues and dispatcher chat entry points. The
 * backend scopes the shipment list to the operator's hub, so no unrelated
 * shipment ever appears here.
 */
const HubOperatorDashboard = () => {
  return <HubOperationsWorkspace />;
};

export default HubOperatorDashboard;
