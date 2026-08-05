import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiPackage,
  FiFileText,
  FiCalendar,
  FiTruck,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiEye,
} from "react-icons/fi";
import Card from "../../components/Card/Card";
import Loader from "../../components/Loader/Loader";
import StatCard from "../../components/Card/StatCard";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/StatusBadge/PriorityBadge";
import shipmentService from "../../services/shipmentService";
import { parseApiError } from "../../utils/helpers";
import { SHIPMENT_STATUSES } from "../../utils/constants";

const STATUS_META = {
  Draft: { icon: FiFileText },
  Created: { icon: FiPackage },
  Scheduled: { icon: FiCalendar },
  "In Transit": { icon: FiTruck },
  Delayed: { icon: FiAlertTriangle },
  Delivered: { icon: FiCheckCircle },
  Cancelled: { icon: FiXCircle },
};

/**
 * The backend has no dedicated stats endpoint, so counts are derived from
 * real pagination totals returned by GET /api/v1/shipments — never hardcoded.
 */
const Dashboard = () => {
  const [counts, setCounts] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [totalRes, ...statusResults] = await Promise.all([
          shipmentService.getShipments({ limit: 1 }),
          ...SHIPMENT_STATUSES.map((status) => shipmentService.getShipments({ status, limit: 1 })),
        ]);
        const recentRes = await shipmentService.getShipments({
          limit: 5,
          sortBy: "createdAt",
          order: "desc",
        });

        if (!isMounted) return;

        const statusCounts = {};
        SHIPMENT_STATUSES.forEach((status, idx) => {
          statusCounts[status] = statusResults[idx].pagination.totalItems;
        });

        setCounts({ total: totalRes.pagination.totalItems, ...statusCounts });
        setRecent(recentRes.shipments);
      } catch (err) {
        if (isMounted) setError(parseApiError(err).message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <Loader fullPage label="Loading dashboard..." />;

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          A live overview of every shipment across your network.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={FiPackage} title="Total Shipments" value={counts.total} />

        {SHIPMENT_STATUSES.map((status) => {
          const meta = STATUS_META[status];
          return (
            <StatCard key={status} icon={meta.icon} title={status} value={counts[status]} />
          );
        })}
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Shipments</h2>
            <p className="text-sm text-slate-500 mt-0.5">The latest five shipments created.</p>
          </div>
          <Link to="/shipments" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-5 py-10 text-sm text-slate-500 text-center">No shipments found.</p>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-zinc-800/50">
                  <th className="px-5 py-3">Shipment ID</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Origin</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((shipment) => (
                  <tr key={shipment._id} className="border-t border-slate-100 hover:bg-slate-50/60 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
                    <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-zinc-400">
                      {shipment.shipmentId}
                    </td>
                    <td className="px-5 py-3 text-slate-800 dark:text-zinc-200">{shipment.title}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{shipment.origin}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{shipment.destination}</td>
                    <td className="px-5 py-3">
                      <PriorityBadge priority={shipment.priority} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/shipments/${shipment._id}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400"
                      >
                        <FiEye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
