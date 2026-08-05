import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import Card, { CardHeader } from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Loader from "../../components/Loader/Loader";
import Input from "../../components/Input/Input";
import TimelineHeader from "../../components/timeline/TimelineHeader";
import TimelineFilter from "../../components/timeline/TimelineFilter";
import TimelineEvent from "../../components/timeline/TimelineEvent";
import TimelineLoading from "../../components/timeline/TimelineLoading";
import TimelineEmptyState from "../../components/timeline/TimelineEmptyState";
import useTimeline from "../../hooks/useTimeline";
import useAuth from "../../hooks/useAuth";
import useShipmentRoom from "../../hooks/useShipmentRoom";
import { fetchShipmentById, clearSelectedShipment } from "../../features/shipments/shipmentSlice";
import {
    canUpdateShipmentStatus,
    canUpdateShipmentLocation,
    canAssignDispatcher,
    canAddTimelineNote,
    getAllowedNextStatuses,
    formatDateTime,
} from "../../utils/helpers";

const ShipmentTimeline = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useAuth();

    const { selected: shipment, detailLoading, detailError } = useSelector((state) => state.shipments);
    const {
        timeline,
        latestEvent,
        loading,
        refreshing,
        error,
        actionLoading,
        actionError,
        actionSuccess,
        refresh,
        loadLatest,
        updateStatus,
        updateLocation,
        assignDispatcher,
        addNote,
        clearActions,
    } = useTimeline(id);

    // Join this shipment's realtime room so status/assignment/timeline
    // changes made by other users appear instantly. Leaves on unmount.
    useShipmentRoom(id);

    const [filters, setFilters] = useState({ search: "", eventType: "", order: "desc" });
    const [activeAction, setActiveAction] = useState(null); // 'status' | 'location' | 'dispatcher' | 'note' | null
    const [statusValue, setStatusValue] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [locationValue, setLocationValue] = useState("");
    const [dispatcherId, setDispatcherId] = useState("");
    const [noteValue, setNoteValue] = useState("");

    // Load the parent shipment document (existing shipmentSlice — never duplicate
    // shipment state inside the timeline slice) and the latest event summary.
    useEffect(() => {
        dispatch(fetchShipmentById(id));
        loadLatest();
        return () => dispatch(clearSelectedShipment());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, id]);

    useEffect(() => {
        if (actionSuccess) {
            const timer = setTimeout(clearActions, 3000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [actionSuccess, clearActions]);

    const filteredTimeline = useMemo(() => {
        let events = [...timeline];

        if (filters.eventType) {
            events = events.filter((event) => event.eventType === filters.eventType);
        }

        if (filters.search.trim()) {
            const term = filters.search.trim().toLowerCase();
            events = events.filter(
                (event) =>
                    event.description?.toLowerCase().includes(term) ||
                    event.performedBy?.fullName?.toLowerCase().includes(term) ||
                    event.eventType?.toLowerCase().includes(term)
            );
        }

        events.sort((a, b) => {
            const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return filters.order === "asc" ? diff : -diff;
        });

        return events;
    }, [timeline, filters]);

    const showStatusControl = canUpdateShipmentStatus(user, shipment);
    const showLocationControl = canUpdateShipmentLocation(user, shipment);
    const showDispatcherControl = canAssignDispatcher(user);
    const showNoteControl = canAddTimelineNote(user, shipment);
    const hasAnyControl = showStatusControl || showLocationControl || showDispatcherControl || showNoteControl;
    const allowedNextStatuses = shipment ? getAllowedNextStatuses(shipment.status) : [];

    const closeAction = () => {
        setActiveAction(null);
        setStatusValue("");
        setStatusNote("");
        setLocationValue("");
        setDispatcherId("");
        setNoteValue("");
    };

    const handleRefresh = () => {
        refresh();
        loadLatest();
    };

    const handleStatusSubmit = async (e) => {
        e.preventDefault();
        if (!statusValue) return;
        const result = await updateStatus(statusValue, statusNote.trim() || undefined);
        if (result?.meta?.requestStatus === "fulfilled") closeAction();
    };

    const handleLocationSubmit = async (e) => {
        e.preventDefault();
        if (!locationValue.trim()) return;
        const result = await updateLocation(locationValue.trim());
        if (result?.meta?.requestStatus === "fulfilled") closeAction();
    };

    const handleDispatcherSubmit = async (e) => {
        e.preventDefault();
        if (!dispatcherId.trim()) return;
        const result = await assignDispatcher(dispatcherId.trim());
        if (result?.meta?.requestStatus === "fulfilled") closeAction();
    };

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        if (!noteValue.trim()) return;
        const result = await addNote(noteValue.trim());
        if (result?.meta?.requestStatus === "fulfilled") closeAction();
    };

    if (detailLoading) return <Loader fullPage label="Loading shipment..." />;

    if (detailError) {
        return (
            <Card>
                <p className="text-sm text-signal-rust dark:text-red-400">{detailError}</p>
            </Card>
        );
    }

    if (!shipment) return null;

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={() => navigate(`/shipments/${id}`)}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900 dark:text-zinc-400 dark:hover:text-white"
            >
                <FiArrowLeft size={14} /> Back to Shipment
            </button>

            <TimelineHeader shipment={shipment} latestEvent={latestEvent} />

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

            {hasAnyControl && (
                <Card>
                    <CardHeader title="Timeline Actions" subtitle="Every change here is automatically logged to the timeline" />
                    <div className="flex flex-wrap gap-2">
                        {showStatusControl && (
                            <Button
                                variant={activeAction === "status" ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setActiveAction(activeAction === "status" ? null : "status")}
                            >
                                Update Status
                            </Button>
                        )}
                        {showLocationControl && (
                            <Button
                                variant={activeAction === "location" ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setActiveAction(activeAction === "location" ? null : "location")}
                            >
                                Update Location
                            </Button>
                        )}
                        {showDispatcherControl && (
                            <Button
                                variant={activeAction === "dispatcher" ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setActiveAction(activeAction === "dispatcher" ? null : "dispatcher")}
                            >
                                Assign Dispatcher
                            </Button>
                        )}
                        {showNoteControl && (
                            <Button
                                variant={activeAction === "note" ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setActiveAction(activeAction === "note" ? null : "note")}
                            >
                                Add Note
                            </Button>
                        )}
                    </div>

                    {activeAction === "status" && (
                        <form onSubmit={handleStatusSubmit} className="mt-4 space-y-3 max-w-md">
                            <Input
                                type="select"
                                name="status"
                                label="New Status"
                                required
                                placeholder={allowedNextStatuses.length ? "Select a status" : "No transitions available"}
                                options={allowedNextStatuses.map((s) => ({ value: s, label: s }))}
                                value={statusValue}
                                onChange={(e) => setStatusValue(e.target.value)}
                                disabled={!allowedNextStatuses.length}
                            />
                            <Input
                                type="textarea"
                                name="statusNote"
                                label="Note (optional)"
                                rows={2}
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button type="submit" size="sm" loading={actionLoading} disabled={!statusValue}>
                                    Save
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={closeAction}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    {activeAction === "location" && (
                        <form onSubmit={handleLocationSubmit} className="mt-4 space-y-3 max-w-md">
                            <Input
                                name="location"
                                label="New Location"
                                required
                                placeholder="e.g. Port of Long Beach, CA"
                                value={locationValue}
                                onChange={(e) => setLocationValue(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button type="submit" size="sm" loading={actionLoading} disabled={!locationValue.trim()}>
                                    Save
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={closeAction}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    {activeAction === "dispatcher" && (
                        <form onSubmit={handleDispatcherSubmit} className="mt-4 space-y-3 max-w-md">
                            <Input
                                name="dispatcherId"
                                label="Dispatcher User ID"
                                required
                                placeholder="Carrier Dispatcher's user ID"
                                value={dispatcherId}
                                onChange={(e) => setDispatcherId(e.target.value)}
                            />
                            <p className="text-xs text-slate-400">
                                A dispatcher picker requires a "list users" API that doesn't exist yet — enter the
                                Carrier Dispatcher's user ID directly for now.
                            </p>
                            <div className="flex gap-2">
                                <Button type="submit" size="sm" loading={actionLoading} disabled={!dispatcherId.trim()}>
                                    Save
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={closeAction}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    {activeAction === "note" && (
                        <form onSubmit={handleNoteSubmit} className="mt-4 space-y-3 max-w-md">
                            <Input
                                type="textarea"
                                name="note"
                                label="Note"
                                required
                                rows={3}
                                placeholder="Add context for this shipment..."
                                value={noteValue}
                                onChange={(e) => setNoteValue(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button type="submit" size="sm" loading={actionLoading} disabled={!noteValue.trim()}>
                                    Save
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={closeAction}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            )}

            <Card>
                <CardHeader
                    title="Event History"
                    action={
                        <Button variant="outline" size="sm" icon={FiRefreshCw} loading={refreshing} onClick={handleRefresh}>
                            Refresh
                        </Button>
                    }
                />

                <div className="mb-4">
                    <TimelineFilter filters={filters} onChange={setFilters} />
                </div>

                {loading ? (
                    <TimelineLoading />
                ) : error ? (
                    <TimelineEmptyState message={error} onRefresh={handleRefresh} refreshing={refreshing} />
                ) : filteredTimeline.length === 0 ? (
                    <TimelineEmptyState
                        message={
                            timeline.length === 0
                                ? "No timeline events yet."
                                : "No events match your current filters."
                        }
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredTimeline.map((event) => (
                            <TimelineEvent key={event._id} event={event} />
                        ))}
                    </div>
                )}
            </Card>

            {latestEvent && (
                <Card>
                    <CardHeader title="Latest Event Summary" />
                    <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
                        <div>
                            <p className="font-medium text-navy-900 dark:text-white">{latestEvent.eventType}</p>
                            <p className="text-slate-500 mt-0.5 dark:text-zinc-400">{latestEvent.description}</p>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0 dark:text-zinc-500">{formatDateTime(latestEvent.createdAt)}</span>
                    </div>
                </Card>
            )}

            {/* Pagination placeholder — the timeline API does not paginate yet;
          this is layout preparation only for a future phase. */}
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-2.5 text-center text-xs text-slate-400 dark:border-zinc-700 dark:text-zinc-500">
                Pagination will be available in a future phase.
            </div>
        </div>
    );
};

export default ShipmentTimeline;