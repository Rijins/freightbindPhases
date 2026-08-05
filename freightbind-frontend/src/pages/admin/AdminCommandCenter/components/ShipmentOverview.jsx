import { Link } from "react-router-dom";
import { FiArrowRight, FiEye } from "react-icons/fi";
import SectionHeader from "../../../../components/page/SectionHeader";
import Table from "../../../../components/Table/Table";
import StatusBadge from "../../../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../../../components/StatusBadge/PriorityBadge";
import { formatDateTime } from "../../../../utils/helpers";

/**
 * ShipmentOverview — real-time snapshot of the six most recently created
 * shipments in the network. All values come from GET /api/v1/shipments.
 */
const ShipmentOverview = ({ shipments = [], loading = false }) => {
  const columns = [
    {
      key: "shipmentId",
      label: "Shipment",
      render: (row) => (
        <Link
          to={`/shipments/${row._id}`}
          className="font-mono text-xs font-medium text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
        >
          {row.shipmentId}
        </Link>
      ),
    },
    { key: "title", label: "Title", render: (row) => <span className="font-medium">{row.title}</span> },
    { key: "origin", label: "Origin", render: (row) => row.origin },
    { key: "destination", label: "Destination", render: (row) => row.destination },
    {
      key: "priority",
      label: "Priority",
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDateTime(row.updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Link
          to={`/shipments/${row._id}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <FiEye size={13} aria-hidden="true" />
          View
        </Link>
      ),
    },
  ];

  return (
    <section aria-labelledby="shipment-overview-title">
      <SectionHeader
        title="Shipment Overview"
        subtitle="The latest shipments created across the network."
        action={
          <Link
            to="/shipments"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            View all
            <FiArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      />
      <div className="mt-5">
        <Table
          columns={columns}
          data={shipments}
          loading={loading}
          emptyMessage="No shipments have been created yet."
        />
      </div>
    </section>
  );
};

export default ShipmentOverview;
