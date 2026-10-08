import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiClock,
  FiMapPin,
  FiMessageSquare,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import ContentContainer from "../../components/page/ContentContainer";
import Card, { CardHeader } from "../../components/Card/Card";
import Badge from "../../components/Badges/Badge";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/StatusBadge/PriorityBadge";
import Button from "../../components/Button/Button";
import Skeleton from "../../components/Skeleton/Skeleton";
import { fetchShipments } from "../../features/shipments/shipmentSlice";
import { fetchMyHub } from "../../features/hubs/hubsSlice";
import useAuth from "../../hooks/useAuth";
import { canChatOnShipment, formatDateTime, HUB_STATUS_BADGE_TONES } from "../../utils/helpers";
import { cn } from "../../utils/cn";

const ACTIVE_STATUSES = ["Created", "Scheduled", "In Transit", "Delayed"];

const HubOperationsWorkspace = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myHub, myHubLoading } = useSelector((state) => state.hubs);
  const { items: shipments, loading: shipmentsLoading } = useSelector((state) => state.shipments);

  useEffect(() => {
    dispatch(fetchMyHub());
    dispatch(fetchShipments({ page: 1, limit: 100 }));
  }, [dispatch]);

  const hubShipments = useMemo(() => {
    if (!myHub || !shipments.length) return [];
    return shipments.filter((shipment) => String(shipment.hub?._id || shipment.hub) === String(myHub._id));
  }, [myHub, shipments]);

  const stats = useMemo(() => {
    const active = hubShipments.filter((s) => ACTIVE_STATUSES.includes(s.status)).length;
    const inTransit = hubShipments.filter((s) => s.status === "In Transit").length;
    const delayed = hubShipments.filter((s) => s.status === "Delayed").length;
    const atHub = myHub
      ? hubShipments.filter((s) => {
          const location = (s.currentLocation || "").trim().toLowerCase();
          return location && location === myHub.name.trim().toLowerCase();
        }).length
      : 0;
    return { active, inTransit, delayed, atHub };
  }, [hubShipments, myHub]);

  const issues = useMemo(
    () => hubShipments.filter((s) => s.status === "Delayed" || s.status === "Cancelled"),
    [hubShipments]
  );

  const recentActivity = useMemo(
    () =>
      [...hubShipments]
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
        .slice(0, 6),
    [hubShipments]
  );

  if (myHubLoading && !myHub) {
    return (
      <ContentContainer>
        <Skeleton className="h-40 rounded-[20px]" />
        <Skeleton className="mt-6 h-64 rounded-[20px]" />
      </ContentContainer>
    );
  }

  // Professional setup / empty state: a Hub Operator with no assigned hub
  // must never see unrelated shipments.
  if (!myHub) {
    return (
      <ContentContainer>
        <Card className="p-10">
          <div className="mx-auto max-w-md text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-harbor-50 text-harbor-600 dark:bg-harbor-500/10 dark:text-harbor-400">
              <FiMapPin size={28} aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">No hub assigned yet</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
              You are registered as a Hub Operator, but no operational hub has been assigned to your account.
              Contact an administrator to connect you to a hub. Shipments for other hubs are not shown to you.
            </p>
            <Button className="mt-6" variant="outline" onClick={() => navigate("/profile")}>
              Go to profile
            </Button>
          </div>
        </Card>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <div className="space-y-6">
        {/* Hub identity header — "this is my hub" */}
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-harbor-500/10 via-transparent to-transparent" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-harbor-600 text-white dark:bg-harbor-500">
                <FiMapPin size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-harbor-600 dark:text-harbor-400">
                  My Hub
                </p>
                <h1 className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{myHub.name}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                  <span>{myHub.location}</span>
                  <span aria-hidden="true">•</span>
                  <Badge tone="indigo">{myHub.type}</Badge>
                  <Badge tone={HUB_STATUS_BADGE_TONES[myHub.status] || "slate"} dot>
                    {myHub.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <Button variant="outline" onClick={() => navigate("/shipments")}>
                All shipments <FiArrowRight size={14} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Operational stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Active at hub", value: stats.active, icon: FiPackage },
            { label: "In transit", value: stats.inTransit, icon: FiTruck },
            { label: "Arrived at hub", value: stats.atHub, icon: FiMapPin },
            { label: "Operational issues", value: stats.delayed, icon: FiAlertTriangle },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <stat.icon size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Shipments requiring this hub's attention */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Shipments requiring this hub"
              subtitle="Shipments that hand through your hub. Open a chat to coordinate with the dispatcher."
            />
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {shipmentsLoading ? (
                <div className="space-y-3 p-4">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </div>
              ) : hubShipments.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500 dark:text-zinc-400">
                  No shipments require your hub right now.
                </p>
              ) : (
                hubShipments.map((shipment) => (
                  <div key={shipment._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/shipments/${shipment._id}`)}
                        className="block truncate text-left text-sm font-semibold text-slate-900 hover:text-harbor-600 dark:text-white dark:hover:text-harbor-400"
                      >
                        {shipment.shipmentId}
                      </button>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-400">{shipment.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={shipment.status} />
                        <PriorityBadge priority={shipment.priority} />
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                          <FiMapPin size={12} aria-hidden="true" />
                          {shipment.currentLocation || shipment.origin || "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/shipments/${shipment._id}/timeline`)}>
                        <FiClock size={14} aria-hidden="true" /> Timeline
                      </Button>
                      {canChatOnShipment(user, shipment) && (
                        <Button
                          variant={shipment.status === "Delayed" ? "primary" : "outline"}
                          size="sm"
                          onClick={() => navigate(`/shipments/${shipment._id}/chat`)}
                        >
                          <FiMessageSquare size={14} aria-hidden="true" /> Chat
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <div className="space-y-6">
            {/* Operational issues */}
            <Card>
              <CardHeader title="Operational issues" subtitle="Delayed or cancelled shipments needing attention." />
              {issues.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-500 dark:text-zinc-400">No issues. All clear.</p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {issues.map((shipment) => (
                    <li key={shipment._id} className="flex items-center gap-3 p-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          shipment.status === "Delayed"
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                            : "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                        )}
                      >
                        <FiAlertTriangle size={14} aria-hidden="true" />
                      </span>
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => navigate(`/shipments/${shipment._id}`)}
                      >
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {shipment.shipmentId}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                          {shipment.title} — {shipment.status}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Recent hub activity */}
            <Card>
              <CardHeader title="Recent hub activity" subtitle="Latest updates across hub shipments." />
              {recentActivity.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-500 dark:text-zinc-400">No activity yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {recentActivity.map((shipment) => (
                    <li key={shipment._id} className="p-3">
                      <button
                        type="button"
                        className="block w-full text-left"
                        onClick={() => navigate(`/shipments/${shipment._id}`)}
                      >
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {shipment.shipmentId}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                          {shipment.title} · {formatDateTime(shipment.updatedAt)}
                        </p>
                        <span className="mt-1 inline-flex">
                          <StatusBadge status={shipment.status} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
};

export default HubOperationsWorkspace;
