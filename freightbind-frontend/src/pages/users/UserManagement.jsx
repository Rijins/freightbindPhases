import { Fragment, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FiEdit2, FiPlus, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Card from "../../components/Card/Card";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import SearchBar from "../../components/SearchBar/SearchBar";
import Button from "../../components/Button/Button";
import Avatar from "../../components/Avatar/Avatar";
import Badge from "../../components/Badges/Badge";
import ErrorState from "../../components/ErrorState/ErrorState";
import Alert from "../../components/Alert/Alert";
import useAuth from "../../hooks/useAuth";
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserStatus,
  setQuery,
  clearActionStatus,
} from "../../features/users/usersSlice";
import { ROLES_LIST } from "../../utils/constants";
import { USER_STATUS_BADGE_TONES, formatDate } from "../../utils/helpers";
import UserFormModal from "./components/UserFormModal";
import UserStatusModal from "./components/UserStatusModal";
import UserRoleBadge from "./components/UserRoleBadge";

const selectClasses =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-harbor-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-200 dark:focus:ring-harbor-400/50";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { items, pagination, query, loading, error, actionLoading, actionError, actionSuccess } =
    useSelector((state) => state.users);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formUser, setFormUser] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [formApiError, setFormApiError] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers(query));
  }, [dispatch, query]);

  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => dispatch(clearActionStatus()), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [actionSuccess, dispatch]);

  const openCreate = () => {
    setFormApiError(null);
    setFormMode("create");
    setFormUser(null);
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setFormApiError(null);
    setFormMode("edit");
    setFormUser(row);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (actionLoading) return;
    setFormOpen(false);
    setFormUser(null);
    setFormApiError(null);
  };

  const handleSubmit = async (payload) => {
    if (actionLoading) return;
    setFormApiError(null);
    const isCreate = formMode === "create";
    const action = isCreate
      ? createUser(payload)
      : updateUser({ id: formUser._id, payload });
    const result = await dispatch(action);
    const isFulfilled = isCreate
      ? createUser.fulfilled.match(result)
      : updateUser.fulfilled.match(result);
    if (isFulfilled) {
      setFormOpen(false);
      setFormUser(null);
      if (isCreate) {
        dispatch(setQuery({ page: 1 }));
      }
    } else {
      dispatch(clearActionStatus());
      setFormApiError(result.payload || { message: "Something went wrong. Please try again." });
    }
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget) return;
    const targetStatus = statusTarget.status === "active" ? "inactive" : "active";
    const result = await dispatch(
      updateUserStatus({ id: statusTarget._id, status: targetStatus })
    );
    if (updateUserStatus.fulfilled.match(result)) {
      setStatusTarget(null);
    }
  };

  const handleSearchChange = (search) => {
    dispatch(setQuery({ search, page: 1 }));
  };

  const hasActiveFilters = Boolean(query.search || query.role || query.status);

  const columns = useMemo(
    () => [
      {
        key: "fullName",
        label: "Name",
        render: (row) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.fullName} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-slate-900 dark:text-white">
                  {row.fullName}
                </span>
                {currentUser && row._id === currentUser._id && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    You
                  </span>
                )}
              </div>
            </div>
          </div>
        ),
      },
      { key: "email", label: "Email" },
      {
        key: "role",
        label: "Role",
        render: (row) => <UserRoleBadge role={row.role} />,
      },
      {
        key: "phone",
        label: "Phone",
        render: (row) => row.phone || "—",
      },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <Badge tone={USER_STATUS_BADGE_TONES[row.status] || "slate"} dot>
            {row.status === "active"
              ? "Active"
              : row.status === "inactive"
              ? "Inactive"
              : "Suspended"}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: "Created",
        render: (row) => formatDate(row.createdAt),
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) => {
          const isSelf = currentUser && row._id === currentUser._id;
          const isActive = row.status === "active";
          return (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="text-slate-500 transition-colors hover:text-navy-900 dark:text-zinc-400 dark:hover:text-white"
                title="Edit user"
                aria-label={`Edit ${row.fullName}`}
              >
                <FiEdit2 size={16} />
              </button>
              {!isSelf && (
                <button
                  type="button"
                  onClick={() => setStatusTarget(row)}
                  className={
                    isActive
                      ? "text-slate-400 transition-colors hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                      : "text-slate-400 transition-colors hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-400"
                  }
                  title={isActive ? "Deactivate user" : "Activate user"}
                  aria-label={`${isActive ? "Deactivate" : "Activate"} ${row.fullName}`}
                >
                  {isActive ? (
                    <FiToggleLeft size={18} />
                  ) : (
                    <FiToggleRight size={18} />
                  )}
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [currentUser]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage the accounts that operate FreightBind.
          </p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={openCreate}>
          Add User
        </Button>
      </div>

      <AnimatePresence>
        {actionSuccess && (
          <Alert severity="success" title={actionSuccess.message} dismissible onClose={() => dispatch(clearActionStatus())}>
            {actionSuccess.detail}
          </Alert>
        )}
        {actionError && (
          <Alert severity="error" title="Something went wrong" dismissible onClose={() => dispatch(clearActionStatus())}>
            {actionError.message}
          </Alert>
        )}
      </AnimatePresence>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={query.search}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
            loading={loading}
          />
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={query.role}
              onChange={(e) => dispatch(setQuery({ role: e.target.value, page: 1 }))}
              className={selectClasses}
              aria-label="Filter by role"
            >
              <option value="">All Roles</option>
              {ROLES_LIST.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              value={query.status}
              onChange={(e) => dispatch(setQuery({ status: e.target.value, page: 1 }))}
              className={selectClasses}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={`${query.sortBy}:${query.order}`}
              onChange={(e) => {
                const [sortBy, order] = e.target.value.split(":");
                dispatch(setQuery({ sortBy, order, page: 1 }));
              }}
              className={selectClasses}
              aria-label="Sort users"
            >
              {[
                { value: "createdAt", label: "Created Date" },
                { value: "fullName", label: "Name" },
                { value: "email", label: "Email" },
                { value: "role", label: "Role" },
                { value: "status", label: "Status" },
              ].map((field) => (
                <Fragment key={field.value}>
                  <option value={`${field.value}:desc`}>{field.label} (Newest first)</option>
                  <option value={`${field.value}:asc`}>{field.label} (Oldest first)</option>
                </Fragment>
              ))}
            </select>
          </div>
        </div>

        {error && !loading ? (
          <ErrorState
            title="Couldn't load users"
            description="Something went wrong while fetching the user list."
            onRetry={() => dispatch(fetchUsers(query))}
          />
        ) : (
          <Table
            columns={columns}
            data={items}
            loading={loading}
            emptyMessage={
              hasActiveFilters
                ? "No users match your search or filters."
                : "No users found yet. Add your first user to get started."
            }
            emptyAction={
              !hasActiveFilters ? { label: "Add User", onClick: openCreate } : undefined
            }
          />
        )}

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={(page) => dispatch(setQuery({ page }))}
          itemLabel="users"
        />
      </Card>

      <UserFormModal
        open={formOpen}
        mode={formMode}
        user={formUser}
        isSelf={Boolean(formUser && currentUser && formUser._id === currentUser._id)}
        submitting={actionLoading}
        apiError={formApiError}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <UserStatusModal
        open={Boolean(statusTarget)}
        user={statusTarget}
        submitting={actionLoading}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusConfirm}
      />
    </div>
  );
};

export default UserManagement;
