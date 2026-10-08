// Analytics service — derives dashboard analytics from REAL backend data
// (Shipment, Hub, health metrics). Nothing here is fabricated: fleet rows
// are computed from shipments that carry a vehicleNumber, hub metrics from
// the Hub collection + per-hub shipment counts, the volume trend is a
// createdAt bucket over the last 7 days, and system health reports live
// process / database / socket metrics.
//
// Roles are scoped identically to the rest of the app:
//   - Hub Operators: their own hub's shipments only
//   - Carrier Dispatchers: their assigned shipments only
//   - Admin / Logistics Director: the full dataset
// The pure derivation helpers are exported and unit-tested (zero-DB).

const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");
const Hub = require("../models/Hub");
const { ROLES } = require("../constants/roles");
const socketService = require("./socketService");

const TERMINAL_STATUSES = ["Delivered", "Cancelled"];

const isTerminal = (status) => TERMINAL_STATUSES.includes(status);

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// ---- scoping (mirrors shipmentService.applyHubVisibility + dispatcher scope)

const buildVisibleShipmentQuery = (user) => {
    const query = {};
    if (!user) return query;

    if (user.role === ROLES.HUB_OPERATOR) {
        if (!user.hub) {
            query._id = { $in: [] };
            return query;
        }
        query.hub = user.hub;
    } else if (user.role === ROLES.CARRIER_DISPATCHER && user._id) {
        query.assignedDispatcher = user._id;
    }
    return query;
};

// ---- volume trend

// Returns an array of { label, date, value } for the last `days` days,
// oldest first, counting shipments whose createdAt falls in that UTC day.
const buildVolumeTrend = (shipments, { days = 7, now = new Date(), startOfDay = defaultStartOfDay } = {}) => {
    const buckets = [];
    const today = startOfDay(now);

    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(today);
        date.setUTCDate(date.getUTCDate() - i);
        buckets.push({ label: formatTrendLabel(date), date, value: 0 });
    }

    if (Array.isArray(shipments)) {
        for (const shipment of shipments) {
            const createdAt = shipment.createdAt ? new Date(shipment.createdAt) : null;
            if (!createdAt || Number.isNaN(createdAt.getTime())) continue;
            const day = startOfDay(createdAt);
            const bucket = buckets.find((b) => b.date.getTime() === day.getTime());
            if (bucket) bucket.value += 1;
        }
    }

    return buckets.map(({ label, value }) => ({ label, value }));
};

const defaultStartOfDay = (date) => {
    const copy = new Date(date);
    copy.setUTCHours(0, 0, 0, 0);
    return copy;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatTrendLabel = (date) => {
    const day = DAY_LABELS[date.getUTCDay()] || "";
    return `${day} ${date.getUTCDate()}`;
};

// ---- fleet

// A vehicle is a distinct, non-empty vehicleNumber across visible shipments.
// Its state is derived from the shipments on that vehicle:
//   - completed (terminal) shipments never keep a vehicle busy;
//   - any remaining shipment counts as the active load (first by createdAt
//     when several are open), giving status In Transit / Assigned by the
//     shipment status, the driver name and the shipmentId.
const ACTIVE_FLEET_STATUSES = ["In Transit", "Delayed", "Scheduled", "Created", "Draft"];

const buildFleet = (shipmentRows) => {
    const rows = Array.isArray(shipmentRows) ? shipmentRows : [];
    const byVehicle = new Map();

    for (const shipment of rows) {
        const registration = shipment.vehicleNumber
            ? String(shipment.vehicleNumber).trim().replace(/\s+/g, " ").toUpperCase()
            : "";
        if (!registration) continue;

        if (!byVehicle.has(registration)) byVehicle.set(registration, []);
        byVehicle.get(registration).push(shipment);
    }

    const vehicles = [];
    for (const [registration, shipments] of byVehicle.entries()) {
        const sorted = [...shipments].sort(
            (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        const active = sorted.find((s) => ACTIVE_FLEET_STATUSES.includes(s.status));
        const status = active ? (["In Transit", "Delayed"].includes(active.status) ? "In Transit" : "Assigned") : "Available";
        const dispatcher = active && active.assignedDispatcher
            ? active.assignedDispatcher.fullName || active.assignedDispatcher.name || "Unassigned"
            : "Unassigned";

        vehicles.push({
            _id: `vehicle:${registration}`,
            registrationNumber: registration,
            driver: dispatcher,
            status,
            currentShipmentId: active ? active.shipmentId : null,
            currentLoad: active ? active.weight ?? null : null,
            currentShipment: active
                ? { id: active.shipmentId, weight: active.weight ?? null, title: active.title || null }
                : null,
        });
    }

    vehicles.sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));

    const totalVehicles = vehicles.length;
    const available = vehicles.filter((v) => v.status === "Available").length;
    const availabilityPct = totalVehicles ? Math.round((available / totalVehicles) * 100) : 0;

    return { vehicles, available, totalVehicles, availabilityPct };
};

// ---- hubs

// Real hubs joined with per-hub shipment counts. Utilization is only
// reported when an Admin has configured a capacity for the hub — it is never
// invented from the mock "capacity/currentLoad" pair.
const buildHubs = (hubRows, shipmentRows, { activeStatuses = ACTIVE_FLEET_STATUSES } = {}) => {
    const hubs = Array.isArray(hubRows) ? hubRows : [];
    const shipments = Array.isArray(shipmentRows) ? shipmentRows : [];

    const countsByHub = [];
    for (const hub of hubs) {
        const hubId = hub._id ? String(hub._id) : null;
        if (!hubId) continue;

        const hubShipments = shipments.filter((s) => s.hub && String(s.hub._id || s.hub) === hubId);
        const activeShipments = hubShipments.filter((s) => activeStatuses.includes(s.status)).length;

        let utilization = null;
        if (typeof hub.capacity === "number" && hub.capacity > 0) {
            utilization = Math.min(100, Math.round((activeShipments / hub.capacity) * 100));
        }

        countsByHub.push({
            _id: hub._id,
            name: hub.name,
            location: hub.location,
            type: hub.type,
            status: hub.status,
            capacity: hub.capacity ?? null,
            activeShipments,
            totalShipments: hubShipments.length,
            utilization,
        });
    }

    const withCapacity = countsByHub.filter((h) => h.utilization !== null);
    const overallUtilization = withCapacity.length
        ? Math.round(withCapacity.reduce((sum, h) => sum + h.utilization, 0) / withCapacity.length)
        : null;

    return { hubs: countsByHub, overallUtilization };
};

// ---- system health (live, real metrics only)

const DB_STATES = ["disconnected", "connected", "connecting", "disconnecting", "uninitialized"];

const buildSystemHealth = ({ uptime = process.uptime(), connection = null, socketServiceRef = socketService, nodeVersion = process.version } = {}) => {
    const readyState =
        connection && typeof connection.readyState === "number" ? connection.readyState : -1;
    const isConnected = readyState === 1;
    const dbStatus = isConnected ? "operational" : "down";
    const dbLabel = readyState >= 0 ? (DB_STATES[readyState] || "unknown") : "unknown";

    const services = [
        {
            id: "svc-api",
            name: "API Server",
            status: "operational",
            detail: `node ${nodeVersion}`,
        },
        {
            id: "svc-db",
            name: "Database",
            status: dbStatus,
            detail: isConnected
                ? `connected (${connection.name || "primary"})`
                : dbLabel,
        },
    ];

    const socketClients = socketServiceRef.getConnectedClients?.();
    if (socketClients !== null && socketClients !== undefined) {
        services.push({
            id: "svc-socket",
            name: "Real-time Server",
            status: "operational",
            detail: `${socketClients} connected client${socketClients === 1 ? "" : "s"}`,
        });
    }

    const overall = services.some((s) => s.status === "down")
        ? "down"
        : "operational";

    return {
        uptime,
        environment: process.env.NODE_ENV || "development",
        services: services.map((s) => ({ ...s, latency: null, uptime: null })),
        overall,
    };
};

// ---- top level

const getDashboardAnalytics = async (user) => {
    const query = buildVisibleShipmentQuery(user);

    const [shipmentRows, hubs, volumeRows] = await Promise.all([
        Shipment.find(query)
            .populate("assignedDispatcher", "fullName email role")
            .select("vehicleNumber status weight hub shipmentId title createdAt assignedDispatcher")
            .lean(),
        Hub.find({ status: "active" })
            .select("name location type status capacity")
            .lean(),
        Shipment.find({
            ...query,
            createdAt: { $gte: startOfSevenDaysAgo() },
        })
            .select("createdAt")
            .lean(),
    ]);

    const fleet = buildFleet(shipmentRows);
    const hubStats = buildHubs(hubs, shipmentRows);
    const volumeTrend = buildVolumeTrend(volumeRows);
    const system = buildSystemHealth({
        connection: mongoose.connection,
    });

    // Hub Operators and Carrier Dispatchers never receive hub network
    // analytics (they have no operational authority over it).
    const isOperatorPerspective =
        user &&
        (user.role === ROLES.HUB_OPERATOR || user.role === ROLES.CARRIER_DISPATCHER);

    return {
        fleet,
        hubs: isOperatorPerspective
            ? { hubs: [], overallUtilization: null }
            : hubStats,
        volumeTrend,
        system,
    };
};

const startOfSevenDaysAgo = (now = new Date()) => {
    const copy = new Date(now);
    copy.setUTCDate(copy.getUTCDate() - 6);
    copy.setUTCHours(0, 0, 0, 0);
    return copy;
};

module.exports = {
    getDashboardAnalytics,
    buildVisibleShipmentQuery,
    buildVolumeTrend,
    buildFleet,
    buildHubs,
    buildSystemHealth,
    ACTIVE_FLEET_STATUSES,
    TERMINAL_STATUSES,
};