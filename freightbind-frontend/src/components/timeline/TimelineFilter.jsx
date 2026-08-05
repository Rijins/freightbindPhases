import SearchBar from "../SearchBar/SearchBar";
import Input from "../Input/Input";

const EVENT_TYPE_OPTIONS = [
    { value: "Shipment Created", label: "Shipment Created" },
    { value: "Status Updated", label: "Status Updated" },
    { value: "Location Updated", label: "Location Updated" },
    { value: "Dispatcher Assigned", label: "Dispatcher Assigned" },
    { value: "Dispatcher Changed", label: "Dispatcher Changed" },
    { value: "Shipment Cancelled", label: "Shipment Cancelled" },
    { value: "Shipment Delivered", label: "Shipment Delivered" },
    { value: "Note Added", label: "Note Added" },
];

const ORDER_OPTIONS = [
    { value: "desc", label: "Newest First" },
    { value: "asc", label: "Oldest First" },
];

/**
 * Frontend-only timeline filtering. Never triggers an API call — the parent
 * page already holds the full timeline in memory and applies these filters
 * locally.
 */
const TimelineFilter = ({ filters, onChange }) => {
    const update = (patch) => onChange({ ...filters, ...patch });

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <SearchBar
                value={filters.search}
                onChange={(search) => update({ search })}
                placeholder="Search description, note, or user..."
            />
            <div className="w-full sm:w-56">
                <Input
                    type="select"
                    name="eventType"
                    placeholder="All event types"
                    options={EVENT_TYPE_OPTIONS}
                    value={filters.eventType}
                    onChange={(e) => update({ eventType: e.target.value })}
                />
            </div>
            <div className="w-full sm:w-48">
                <Input
                    type="select"
                    name="order"
                    placeholder="Sort order"
                    options={ORDER_OPTIONS}
                    value={filters.order}
                    onChange={(e) => update({ order: e.target.value })}
                />
            </div>
        </div>
    );
};

export default TimelineFilter;