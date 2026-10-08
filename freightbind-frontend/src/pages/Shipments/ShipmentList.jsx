import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiFilter, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Card from "../../components/Card/Card";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import SearchBar from "../../components/SearchBar/SearchBar";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import Modal from "../../components/Modal/Modal";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/StatusBadge/PriorityBadge";
import DispatcherSelect from "../../components/DispatcherSelect/DispatcherSelect";
import useAuth from "../../hooks/useAuth";
import {
  fetchShipments,
  deleteShipment,
  setQuery,
  resetQuery,
  clearActionStatus,
} from "../../features/shipments/shipmentSlice";
import { SHIPMENT_STATUSES, SHIPMENT_PRIORITIES, SORT_FIELDS } from "../../utils/constants";
import { canAssignDispatcher, canCreateShipment, canDeleteShipment, canEditShipment, formatDate } from "../../utils/helpers";

const ShipmentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, pagination, query, loading, error, actionLoading, actionError, actionSuccess } =
    useSelector((state) => state.shipments);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dispatcherFilterUser, setDispatcherFilterUser] = useState(null);
  const [localFilters, setLocalFilters] = useState({
    cargoType: query.cargoType,
    shipmentType: query.shipmentType,
    origin: query.origin,
    destination: query.destination,
    assignedDispatcher: query.assignedDispatcher,
    createdBy: query.createdBy,
  });

  const showCreate = canCreateShipment(user?.role);
  const showDelete = canDeleteShipment(user?.role);
  const showEdit = (row) => canEditShipment(user, row);

  useEffect(() => {
    dispatch(fetchShipments(query));
  }, [dispatch, query]);

  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => dispatch(clearActionStatus()), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [actionSuccess, dispatch]);

  const columns = useMemo(
    () => [
      { key: "shipmentId", label: "Shipment ID", render: (row) => (
        <span className="font-mono text-xs text-slate-600 dark:text-zinc-400">{row.shipmentId}</span>
      ) },
      { key: "title", label: "Title" },
      { key: "cargoType", label: "Cargo Type" },
      { key: "shipmentType", label: "Shipment Type" },
      { key: "origin", label: "Origin" },
      { key: "destination", label: "Destination" },
      { key: "priority", label: "Priority", sortable: true, render: (row) => <PriorityBadge priority={row.priority} /> },
      { key: "status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> },
      {
        key: "assignedDispatcher",
        label: "Assigned Dispatcher",
        render: (row) => row.assignedDispatcher?.fullName || "—",
      },
      {
        key: "estimatedArrival",
        label: "Estimated Arrival",
        sortable: true,
        render: (row) => formatDate(row.estimatedArrival),
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) => (
          <div className="flex items-center gap-3">
            <Link to={`/shipments/${row._id}`} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300" title="View">
              <FiEye size={16} />
            </Link>
            {showEdit(row) && (
              <Link
                to={`/shipments/edit/${row._id}`}
                className="text-slate-500 hover:text-navy-900 dark:text-zinc-400 dark:hover:text-white"
                title="Edit"
              >
                <FiEdit2 size={16} />
              </Link>
            )}
            {showDelete && (
              <button
                type="button"
                onClick={() => setDeleteTarget(row)}
                className="text-slate-400 hover:text-signal-rust dark:text-zinc-500 dark:hover:text-red-400"
                title="Delete"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [showDelete, user]
  );

  const handleSortChange = (sortBy, order) => {
    dispatch(setQuery({ sortBy, order, page: 1 }));
  };

  const handleSearchChange = (search) => {
    dispatch(setQuery({ search, page: 1 }));
  };

  const applyFilters = () => {
    dispatch(setQuery({ ...localFilters, page: 1 }));
  };

  const clearFilters = () => {
    setDispatcherFilterUser(null);
    setLocalFilters({
      cargoType: "",
      shipmentType: "",
      origin: "",
      destination: "",
      assignedDispatcher: "",
      createdBy: "",
    });
    dispatch(resetQuery());
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteShipment(deleteTarget._id));
    if (deleteShipment.fulfilled.match(result)) {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900 dark:text-white">Shipments</h1>
          <p className="text-sm text-slate-500 mt-1">Search, filter, and manage every shipment.</p>
        </div>
        {showCreate && (
          <Button variant="primary" icon={FiPlus} onClick={() => navigate("/shipments/create")}>
            Create Shipment
          </Button>
        )}
      </div>

      {actionSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-signal-rust dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {actionError.message}
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between mb-4">
          <SearchBar
            value={query.search}
            onChange={handleSearchChange}
            placeholder="Search by ID, title, origin, destination..."
          />
          <div className="flex items-center gap-3">
            <select
              value={query.status}
              onChange={(e) => dispatch(setQuery({ status: e.target.value, page: 1 }))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-harbor-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-200 dark:focus:ring-harbor-400/50"
            >
              <option value="">All Statuses</option>
              {SHIPMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={query.priority}
              onChange={(e) => dispatch(setQuery({ priority: e.target.value, page: 1 }))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-harbor-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-200 dark:focus:ring-harbor-400/50"
            >
              <option value="">All Priorities</option>
              {SHIPMENT_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={`${query.sortBy}:${query.order}`}
              onChange={(e) => {
                const [sortBy, order] = e.target.value.split(":");
                dispatch(setQuery({ sortBy, order, page: 1 }));
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-harbor-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-200 dark:focus:ring-harbor-400/50"
            >
              {SORT_FIELDS.map((f) => (
                <Fragment key={f.value}>
                  <option value={`${f.value}:desc`}>{f.label} (Newest first)</option>
                  <option value={`${f.value}:asc`}>{f.label} (Oldest first)</option>
                </Fragment>
              ))}
            </select>
            <Button variant="outline" icon={FiFilter} onClick={() => setFiltersOpen((v) => !v)}>
              Filters
            </Button>
          </div>
        </div>

        {filtersOpen && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Cargo Type"
                name="cargoType"
                placeholder="e.g. Electronics"
                value={localFilters.cargoType}
                onChange={(e) => setLocalFilters((f) => ({ ...f, cargoType: e.target.value }))}
              />
              <Input
                label="Shipment Type"
                name="shipmentType"
                placeholder="e.g. Freight"
                value={localFilters.shipmentType}
                onChange={(e) => setLocalFilters((f) => ({ ...f, shipmentType: e.target.value }))}
              />
              <Input
                label="Origin"
                name="origin"
                placeholder="City or port"
                value={localFilters.origin}
                onChange={(e) => setLocalFilters((f) => ({ ...f, origin: e.target.value }))}
              />
              <Input
                label="Destination"
                name="destination"
                placeholder="City or port"
                value={localFilters.destination}
                onChange={(e) => setLocalFilters((f) => ({ ...f, destination: e.target.value }))}
              />
              {canAssignDispatcher(user) && (
                <DispatcherSelect
                  label="Assigned Dispatcher"
                  value={localFilters.assignedDispatcher}
                  displayUser={dispatcherFilterUser}
                  onChange={(dispatcher) => {
                    setDispatcherFilterUser(dispatcher);
                    setLocalFilters((f) => ({ ...f, assignedDispatcher: dispatcher ? dispatcher._id : "" }));
                  }}
                />
              )}
              <Input
                label="Created By (User ID)"
                name="createdBy"
                placeholder="Mongo user ID"
                value={localFilters.createdBy}
                onChange={(e) => setLocalFilters((f) => ({ ...f, createdBy: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button size="sm" variant="ghost" icon={FiX} onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-signal-rust dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <Table
          columns={columns}
          data={items}
          loading={loading}
          sortBy={query.sortBy}
          order={query.order}
          onSortChange={handleSortChange}
          emptyMessage="No shipments found."
          emptyAction={showCreate ? { label: "Create Shipment", onClick: () => navigate("/shipments/create") } : undefined}
        />

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={(page) => dispatch(setQuery({ page }))}
          itemLabel="shipments"
        />
      </Card>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete shipment"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={actionLoading} onClick={handleConfirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          Are you sure you want to delete shipment{" "}
          <span className="font-medium text-navy-900 dark:text-white">{deleteTarget?.shipmentId}</span>? This
          action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ShipmentList;
