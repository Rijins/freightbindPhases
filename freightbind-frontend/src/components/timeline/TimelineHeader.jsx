import Card, { CardHeader } from "../Card/Card";
import StatusBadge from "../StatusBadge/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/helpers";

const Field = ({ label, value }) => (
    <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">{label}</p>
        <p className="mt-1 text-sm text-slate-800 dark:text-zinc-200">{value ?? "—"}</p>
    </div>
);

/** Top summary section of the shipment timeline page. */
const TimelineHeader = ({ shipment, latestEvent }) => {
    if (!shipment) return null;

    return (
        <Card>
            <CardHeader
                title={
                    <span className="flex items-center gap-3 flex-wrap">
                        {shipment.title}
                        <StatusBadge status={shipment.status} />
                    </span>
                }
                subtitle={shipment.shipmentId}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
                <Field label="Current Location" value={shipment.currentLocation} />
                <Field label="Dispatcher" value={shipment.assignedDispatcher?.fullName} />
                <Field label="Created Date" value={formatDate(shipment.createdAt)} />
                <Field
                    label="Latest Update"
                    value={latestEvent ? formatDateTime(latestEvent.createdAt) : formatDateTime(shipment.updatedAt)}
                />
            </div>
        </Card>
    );
};

export default TimelineHeader;