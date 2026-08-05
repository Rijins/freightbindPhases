// ============================================================
// PREVIEW DATA — simulated sample values.
// The backend has no fleet, hub, AI, analytics or health APIs
// yet, so every panel that consumes this file is clearly marked
// with <PreviewBadge />. Shipment KPIs, the table, notifications
// and activity feed are real and never come from here.
// ============================================================

export const AI_INSIGHTS = [
  {
    _id: "ai-preview-01",
    title: "Re-route 3 delayed shipments via Terminal 4",
    summary: "Weather at the Port of Antwerp is expected to extend delays by ~9h over the next 48h.",
    recommendation: "Re-route via Terminal 4 to save an estimated 6h per shipment.",
    severity: "high",
    confidence: 84,
  },
  {
    _id: "ai-preview-02",
    title: "Consolidate 2 partial loads to the Midlands",
    summary: "Two trucks leave Birmingham at 62% and 58% load — same corridor, similar window.",
    recommendation: "Merge into one trip and free one driver for the Manchester run.",
    severity: "medium",
    confidence: 91,
  },
  {
    _id: "ai-preview-03",
    title: "Maintenance risk on TRK-2218",
    summary: "Brake sensor telemetry shows wear beyond the usual service interval threshold.",
    recommendation: "Schedule inspection before the next long-haul assignment.",
    severity: "critical",
    confidence: 77,
  },
  {
    _id: "ai-preview-04",
    title: "Hub overflow forecast — Rotterdam",
    summary: "Inbound volumes at Rotterdam exceed forecast capacity by 14% next Tuesday.",
    recommendation: "Temporarily shift 20% of outbound staging to the Antwerp hub.",
    severity: "low",
    confidence: 88,
  },
];

export const FLEET_VEHICLES = [
  {
    _id: "veh-preview-01",
    registrationNumber: "TRK-2218",
    make: "Volvo",
    model: "FH16 500",
    driver: "Mark Hansen",
    capacity: 20000,
    currentLoad: 14200,
    currentShipmentId: "SHIP-1024",
    status: "In Transit",
  },
  {
    _id: "veh-preview-02",
    registrationNumber: "TRK-2219",
    make: "Scania",
    model: "R450",
    driver: "Lena Vogel",
    capacity: 20000,
    currentLoad: 0,
    currentShipmentId: null,
    status: "Available",
  },
  {
    _id: "veh-preview-03",
    registrationNumber: "TRK-2220",
    make: "Mercedes-Benz",
    model: "Actros 2545",
    driver: "Omar Farouk",
    capacity: 24000,
    currentLoad: 9800,
    currentShipmentId: "SHIP-1031",
    status: "Assigned",
  },
  {
    _id: "veh-preview-04",
    registrationNumber: "TRK-2221",
    make: "DAF",
    model: "XF 480",
    driver: "Nina Rossi",
    capacity: 20000,
    currentLoad: 18600,
    currentShipmentId: "SHIP-1040",
    status: "In Transit",
  },
  {
    _id: "veh-preview-05",
    registrationNumber: "TRK-2222",
    make: "MAN",
    model: "TGX 26.510",
    driver: "Pieter Janssen",
    capacity: 24000,
    currentLoad: 0,
    currentShipmentId: null,
    status: "Maintenance",
  },
  {
    _id: "veh-preview-06",
    registrationNumber: "TRK-2223",
    make: "Volvo",
    model: "FH16 500",
    driver: "Ana Kowalski",
    capacity: 20000,
    currentLoad: 5200,
    currentShipmentId: null,
    status: "Offline",
  },
];

export const HUBS = [
  {
    _id: "hub-preview-01",
    name: "Rotterdam Gateway",
    location: "Rotterdam, NL",
    capacity: 120,
    currentLoad: 98,
    activeShipments: 34,
    status: "At Capacity",
  },
  {
    _id: "hub-preview-02",
    name: "Antwerp South",
    location: "Antwerp, BE",
    capacity: 140,
    currentLoad: 74,
    activeShipments: 22,
    status: "Active",
  },
  {
    _id: "hub-preview-03",
    name: "Duisburg Central",
    location: "Duisburg, DE",
    capacity: 160,
    currentLoad: 61,
    activeShipments: 18,
    status: "Active",
  },
];

export const SYSTEM_SERVICES = [
  { id: "svc-api", name: "API Gateway", status: "operational", latency: "42ms", uptime: "99.98%" },
  { id: "svc-db", name: "Core Database", status: "operational", latency: "18ms", uptime: "99.99%" },
  { id: "svc-notify", name: "Notification Service", status: "degraded", latency: "310ms", uptime: "99.82%" },
  { id: "svc-ai", name: "AI Recommendation Engine", status: "operational", latency: "860ms", uptime: "99.90%" },
  { id: "svc-sync", name: "Telemetry Sync", status: "down", latency: "—", uptime: "97.40%" },
];

export const ANALYTICS_TRENDS = {
  shipmentVolume: [
    { label: "Mon", value: 24 },
    { label: "Tue", value: 31 },
    { label: "Wed", value: 28 },
    { label: "Thu", value: 36 },
    { label: "Fri", value: 42 },
    { label: "Sat", value: 19 },
    { label: "Sun", value: 27 },
  ],
  hubUtilization: [
    { label: "Jan", value: 58 },
    { label: "Feb", value: 61 },
    { label: "Mar", value: 66 },
    { label: "Apr", value: 64 },
    { label: "May", value: 71 },
    { label: "Jun", value: 78 },
    { label: "Jul", value: 74 },
  ],
};

export const PENDING_APPROVALS_COUNT = 3;
