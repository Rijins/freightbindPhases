import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiKey,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import PageContainer from "../../components/page/PageContainer";
import PageHeader from "../../components/page/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badges/Badge";
import Avatar from "../../components/Avatar/Avatar";
import Alert from "../../components/Alert/Alert";
import ErrorState from "../../components/ErrorState/ErrorState";
import Skeleton from "../../components/Skeleton/Skeleton";
import useAuth from "../../hooks/useAuth";
import { fetchCurrentUser } from "../../features/auth/authSlice";
import { USER_STATUS_BADGE_TONES, formatDate } from "../../utils/helpers";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import UserRoleBadge from "../users/components/UserRoleBadge";
import ProfileEditModal from "./components/ProfileEditModal";

const DetailRow = ({ icon: Icon, label, value, muted = false }) => (
  <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400">
      <Icon size={15} aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm text-slate-700 dark:text-slate-200">
        {value || (muted ? "—" : "Not provided")}
      </p>
    </div>
  </div>
);

/**
 * Premium profile experience: header card with avatar + role/status badges,
 * personal information and account details sections, and an Edit Profile
 * modal. Reads the authenticated user from Redux (refreshed on mount).
 */
const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const roleTheme = useRoleTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    setRefreshing(true);
    dispatch(fetchCurrentUser())
      .unwrap()
      .catch((error) => {
        if (mounted) setLoadError(error?.message || "Failed to load your profile.");
      })
      .finally(() => {
        if (mounted) setRefreshing(false);
      });
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  const openEdit = () => {
    setEditError(null);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditError(null);
  };

  if (refreshing && !user) {
    return (
      <PageContainer className="space-y-6 pt-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-44 w-full rounded-[20px]" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-[20px]" />
          <Skeleton className="h-64 rounded-[20px]" />
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer className="pt-2">
        <ErrorState
          title="Couldn't load your profile"
          description={loadError || "Something went wrong while fetching your profile."}
          onRetry={() => window.location.reload()}
        />
      </PageContainer>
    );
  }

  const statusLabel =
    user.status === "active" ? "Active" : user.status === "inactive" ? "Inactive" : "Suspended";

  return (
    <PageContainer className="space-y-6 pt-2">
      <PageHeader
        title="Profile"
        subtitle="Your personal information and account details."
        icon={FiUser}
        actions={
          <Button variant="primary" icon={FiEdit2} onClick={openEdit}>
            Edit Profile
          </Button>
        }
      />

      <AnimatePresence>
        {saved && (
          <Alert
            severity="success"
            title="Profile updated"
            dismissible
            onClose={() => setSaved(false)}
          >
            Your profile information has been saved successfully.
          </Alert>
        )}
      </AnimatePresence>

      {/* Header card */}
      <Card className="overflow-hidden p-0">
        <div
          className={`h-24 bg-gradient-to-r ${roleTheme.primary.gradient} sm:h-28`}
          aria-hidden="true"
        />
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <Avatar
                name={user.fullName}
                src={user.profileImage || undefined}
                size="xl"
                className="rounded-full ring-4 ring-white dark:ring-zinc-900"
              />
              <div className="pb-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                    {user.fullName}
                  </h2>
                  <UserRoleBadge role={user.role} />
                  <Badge tone={USER_STATUS_BADGE_TONES[user.status] || "slate"} dot>
                    {statusLabel}
                  </Badge>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <FiMail size={13} aria-hidden="true" />
                  {user.email}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Account ID <span className="font-mono text-slate-500 dark:text-zinc-400">{user._id}</span>
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal information */}
        <Card>
          <CardHeader
            title="Personal Information"
            subtitle="Information visible to other operators."
            action={
              <button
                type="button"
                onClick={openEdit}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Edit
              </button>
            }
          />
          <CardBody>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              <DetailRow icon={FiUser} label="Full name" value={user.fullName} />
              <DetailRow icon={FiMail} label="Email" value={user.email} />
              <DetailRow icon={FiPhone} label="Phone" value={user.phone || "Not provided"} muted={!user.phone} />
            </div>
          </CardBody>
        </Card>

        {/* Account details */}
        <Card>
          <CardHeader
            title="Account Details"
            subtitle="Controlled by administrators — contact an admin to change these."
          />
          <CardBody>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400">
                  <FiShield size={15} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                    Role
                  </p>
                  <div className="mt-1">
                    <UserRoleBadge role={user.role} />
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400">
                  <FiCheckCircle size={15} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                    Account Status
                  </p>
                  <div className="mt-1">
                    <Badge tone={USER_STATUS_BADGE_TONES[user.status] || "slate"} dot>
                      {statusLabel}
                    </Badge>
                  </div>
                </div>
              </div>
              <DetailRow icon={FiCalendar} label="Member since" value={formatDate(user.createdAt)} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Security shortcut */}
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400">
            <FiKey size={16} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Password &amp; Security</h3>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Update your password and review security options in Settings.
            </p>
          </div>
        </div>
        <Link
          to="/settings?tab=security"
          className="shrink-0 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          Open security settings →
        </Link>
      </Card>

      <ProfileEditModal
        open={editOpen}
        user={user}
        apiError={editError}
        onClose={closeEdit}
        onSuccess={() => {
          setSaved(true);
          setEditOpen(false);
          setEditError(null);
        }}
        onError={(error) => setEditError(error)}
      />
    </PageContainer>
  );
};

export default Profile;
