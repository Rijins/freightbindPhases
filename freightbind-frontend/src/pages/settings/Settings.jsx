import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { FiShield, FiSun, FiUser, FiUserCheck } from "react-icons/fi";
import PageContainer from "../../components/page/PageContainer";
import PageHeader from "../../components/page/PageHeader";
import Card from "../../components/Card/Card";
import Avatar from "../../components/Avatar/Avatar";
import Badge from "../../components/Badges/Badge";
import Button from "../../components/Button/Button";
import Alert from "../../components/Alert/Alert";
import useAuth from "../../hooks/useAuth";
import { useRoleTheme } from "../../contexts/RoleThemeContext";
import { USER_STATUS_BADGE_TONES, formatDate } from "../../utils/helpers";
import { cn } from "../../utils/cn";
import UserRoleBadge from "../users/components/UserRoleBadge";
import ProfileEditModal from "../profile/components/ProfileEditModal";
import SecurityTab from "./components/SecurityTab";
import AppearanceTab from "./components/AppearanceTab";

const TABS = [
  { id: "profile", label: "Profile", icon: FiUser },
  { id: "security", label: "Security", icon: FiShield },
  { id: "appearance", label: "Appearance", icon: FiSun },
  { id: "account", label: "Account", icon: FiUserCheck },
];

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{value}</p>
  </div>
);

/**
 * Account Settings — a clean tabbed layout (Profile / Security / Appearance /
 * Account) instead of one giant form. Tabs follow the `?tab=` query param so
 * links like /settings?tab=security work from anywhere.
 */
const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const roleTheme = useRoleTheme();

  const activeTab = useMemo(() => {
    const requested = searchParams.get("tab");
    return TABS.some((tab) => tab.id === requested) ? requested : "profile";
  }, [searchParams]);

  const setTab = (tab) => setSearchParams(tab === "profile" ? {} : { tab });

  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const selectClasses =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";

  return (
    <PageContainer className="space-y-6 pt-2">
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences, security and appearance."
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tab navigation — vertical rail on desktop, horizontal scroll on mobile */}
        <nav
          aria-label="Settings sections"
          className="shrink-0 lg:w-56"
        >
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    selectClasses,
                    "shrink-0 whitespace-nowrap",
                    isActive
                      ? cn(roleTheme.primary.activePill, "shadow-sm")
                      : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-slate-200"
                  )}
                >
                  <Icon size={16} className={isActive ? roleTheme.primary.text : "text-slate-400 dark:text-zinc-500"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Tab content */}
        <div className="min-w-0 flex-1 space-y-6">
          <AnimatePresence>
            {profileSaved && (
              <Alert
                severity="success"
                title="Profile updated"
                dismissible
                onClose={() => setProfileSaved(false)}
              >
                Your profile information has been saved successfully.
              </Alert>
            )}
          </AnimatePresence>

          {activeTab === "profile" && (
            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={user?.fullName} size="lg" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                        {user?.fullName}
                      </h3>
                      <UserRoleBadge role={user?.role} />
                      <Badge tone={USER_STATUS_BADGE_TONES[user?.status] || "slate"} dot>
                        {user?.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditError(null);
                    setEditOpen(true);
                  }}
                  className="shrink-0"
                >
                  Edit Profile
                </Button>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-zinc-800">
                <DetailRow label="Phone" value={user?.phone || "Not provided"} />
                <DetailRow label="Member since" value={formatDate(user?.createdAt)} />
              </div>
            </Card>
          )}

          {activeTab === "security" && <SecurityTab />}
          {activeTab === "appearance" && <AppearanceTab />}

          {activeTab === "account" && (
            <Card>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Account Details
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    Read-only — role, status and identifiers are controlled by administrators.
                  </p>
                </div>
                <UserRoleBadge role={user?.role} />
              </div>
              <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100 pt-4 dark:divide-zinc-800 dark:border-zinc-800">
                <DetailRow label="Full name" value={user?.fullName} />
                <DetailRow label="Email" value={user?.email} />
                <DetailRow label="Role" value={user?.role} />
                <DetailRow
                  label="Account status"
                  value={user?.status === "active" ? "Active" : "Inactive"}
                />
                <DetailRow label="Member since" value={formatDate(user?.createdAt)} />
                <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Account ID</p>
                  <p className="truncate font-mono text-xs text-slate-700 dark:text-zinc-300">
                    {user?._id}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <ProfileEditModal
        open={editOpen}
        user={user}
        apiError={editError}
        onClose={() => {
          setEditOpen(false);
          setEditError(null);
        }}
        onSuccess={() => {
          setProfileSaved(true);
          setEditOpen(false);
          setEditError(null);
        }}
        onError={(error) => setEditError(error)}
      />
    </PageContainer>
  );
};

export default Settings;
