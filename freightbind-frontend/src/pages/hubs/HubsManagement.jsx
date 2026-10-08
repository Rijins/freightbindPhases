import { useEffect, useState } from "react";
import { FiMapPin, FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import ContentContainer from "../../components/page/ContentContainer";
import Card from "../../components/Card/Card";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import SearchBar from "../../components/SearchBar/SearchBar";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badges/Badge";
import Alert from "../../components/Alert/Alert";
import {
  fetchHubs,
  createHub,
  updateHub,
  updateHubStatus,
  fetchHubOperators,
  setQuery,
  clearActionStatus,
} from "../../features/hubs/hubsSlice";
import { updateUser } from "../../features/users/usersSlice";
import { HUB_TYPES, HUB_STATUSES } from "../../utils/constants";
import { HUB_STATUS_BADGE_TONES, formatDate } from "../../utils/helpers";
import HubFormModal from "./components/HubFormModal";
import HubStatusModal from "./components/HubStatusModal";
import HubOperatorsModal from "./components/HubOperatorsModal";

const selectClasses =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-harbor-400/40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-200";

const HubsManagement = () => {
  const dispatch = useDispatch();
  const {
    items,
    pagination,
    query,
    loading,
    actionLoading,
    actionError,
    actionSuccess,
    selectedHubOperators,
    operatorsLoading,
  } = useSelector((state) => state.hubs);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modalMode, setModalMode] = useState(null); // null | "create" | "edit"
  const [selectedHub, setSelectedHub] = useState(null);
  const [statusModalHub, setStatusModalHub] = useState(null);
  const [operatorsModalHub, setOperatorsModalHub] = useState(null);
  const [assignError, setAssignError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch !== query.search) {
      dispatch(setQuery({ page: 1, search: debouncedSearch }));
    }
  }, [debouncedSearch, query.search, dispatch]);

  useEffect(() => {
    dispatch(fetchHubs(query));
  }, [dispatch, query]);

  const handleSort = (sortBy, order) => {
    dispatch(setQuery({ sortBy, order, page: 1 }));
  };

  const handleTypeFilter = (type) => {
    dispatch(setQuery({ type, page: 1 }));
  };

  const handleStatusFilter = (status) => {
    dispatch(setQuery({ status, page: 1 }));
  };

  const openCreate = () => {
    setModalMode("create");
    setSelectedHub(null);
  };

  const handleCreateSubmit = async (data) => {
    const result = await dispatch(createHub(data));
    if (createHub.fulfilled.match(result)) {
      dispatch(setQuery({ page: 1 }));
      setModalMode(null);
      setSelectedHub(null);
    }
  };

  const handleEditSubmit = async (data) => {
    const result = await dispatch(updateHub({ id: selectedHub._id, payload: data }));
    if (updateHub.fulfilled.match(result)) {
      dispatch(setQuery({ page: 1 }));
      setModalMode(null);
      setSelectedHub(null);
    }
  };

  const handleStatusToggle = async (hub) => {
    const nextStatus = hub.status === "active" ? "inactive" : "active";
    const result = await dispatch(updateHubStatus({ id: hub._id, status: nextStatus }));
    if (updateHubStatus.fulfilled.match(result)) {
      dispatch(setQuery({ page: 1 }));
      setStatusModalHub(null);
    }
  };

  const handleAssignOperator = async ({ userId, hubId }) => {
    setAssignError(null);
    const result = await dispatch(updateUser({ id: userId, payload: { hub: hubId } }));
    if (updateUser.fulfilled.match(result)) {
      dispatch(fetchHubOperators(hubId));
    } else {
      setAssignError(result.payload?.message || "Failed to assign hub operator");
    }
  };

  const openOperatorsModal = (hub) => {
    setAssignError(null);
    dispatch(fetchHubOperators(hub._id));
    setOperatorsModalHub(hub);
  };

  const tableColumns = [
    {
      key: "name",
      header: "Hub",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-harbor-50 text-harbor-600 dark:bg-harbor-500/10 dark:text-harbor-400">
            <FiMapPin size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{row.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-zinc-400">{row.location}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (row) => <Badge tone="indigo">{row.type}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <Badge tone={HUB_STATUS_BADGE_TONES[row.status] || "slate"} dot>
          {row.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-zinc-300">
          {row.capacity == null ? "—" : row.capacity}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-zinc-300">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedHub(row);
              setModalMode("edit");
            }}
          >
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openOperatorsModal(row)}>
            Operators
          </Button>
          <Button
            variant={row.status === "active" ? "danger" : "success"}
            size="sm"
            onClick={() => setStatusModalHub(row)}
          >
            {row.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ContentContainer>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hub Management</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Create and manage operational hubs (Port, Yard, Warehouse, Distribution).
            </p>
          </div>
          <Button onClick={openCreate}>
            <FiPlus size={16} aria-hidden="true" /> Add Hub
          </Button>
        </div>

        <Card className="p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search hubs..."
              className="md:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="Filter by type"
                className={selectClasses}
                value={query.type}
                onChange={(e) => handleTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                {HUB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by status"
                className={selectClasses}
                value={query.status}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                {HUB_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === "active" ? "Active" : "Inactive"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Table
            columns={tableColumns}
            data={items}
            loading={loading}
            onSortChange={handleSort}
            sortBy={query.sortBy}
            order={query.order}
            emptyMessage="No hubs found."
          />

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={(page) => dispatch(setQuery({ page }))}
            itemLabel="hubs"
          />
        </Card>

        {actionError && (
          <Alert severity="error" dismissible onClose={() => dispatch(clearActionStatus())}>
            {actionError.message}
          </Alert>
        )}

        {actionSuccess && (
          <Alert severity="success" dismissible onClose={() => dispatch(clearActionStatus())}>
            {actionSuccess.message}
            {actionSuccess.detail && (
              <p className="mt-0.5 text-xs text-slate-600 dark:text-zinc-300">{actionSuccess.detail}</p>
            )}
          </Alert>
        )}
      </div>

      {modalMode && (
        <HubFormModal
          mode={modalMode}
          hub={selectedHub}
          submitting={actionLoading}
          error={actionError}
          onSubmit={async (data) => (modalMode === "create" ? handleCreateSubmit(data) : handleEditSubmit(data))}
          onClose={() => {
            setModalMode(null);
            setSelectedHub(null);
            dispatch(clearActionStatus());
          }}
        />
      )}

      {statusModalHub && (
        <HubStatusModal
          hub={statusModalHub}
          submitting={actionLoading}
          error={actionError}
          onConfirm={async () => handleStatusToggle(statusModalHub)}
          onClose={() => {
            setStatusModalHub(null);
            dispatch(clearActionStatus());
          }}
        />
      )}

      {operatorsModalHub && (
        <HubOperatorsModal
          hub={operatorsModalHub}
          operators={selectedHubOperators}
          loading={operatorsLoading}
          error={assignError}
          onAssign={handleAssignOperator}
          onClose={() => {
            setOperatorsModalHub(null);
            setAssignError(null);
          }}
        />
      )}
    </ContentContainer>
  );
};

export default HubsManagement;
