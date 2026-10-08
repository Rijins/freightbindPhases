/**
 * Zero-DB unit tests for the analytics derivation helpers. These assert the
 * pure derive-from-rows logic — the top-level getDashboardAnalytics() makes
 * Mongoose calls and is intentionally NOT tested here.
 */

const { ObjectId } = require("mongoose").Types;
const { ROLES } = require("../constants/roles");
const {
  buildVisibleShipmentQuery,
  buildVolumeTrend,
  buildFleet,
  buildHubs,
  buildSystemHealth,
} = require("../services/analyticsService");

describe("buildVisibleShipmentQuery", () => {
  it("returns an empty query for null/undefined users", () => {
    expect(buildVisibleShipmentQuery(null)).toEqual({});
    expect(buildVisibleShipmentQuery(undefined)).toEqual({});
  });

  it("returns an empty query for unknown roles", () => {
    expect(buildVisibleShipmentQuery({ role: "Nope", _id: "abc" })).toEqual({});
  });

  it("scopes Admin and Logistics Director to the full dataset", () => {
    expect(buildVisibleShipmentQuery({ role: ROLES.ADMIN, _id: "a" })).toEqual({});
    expect(buildVisibleShipmentQuery({ role: ROLES.LOGISTICS_DIRECTOR, _id: "b" })).toEqual({});
  });

  it("scopes Carrier Dispatchers to their own assignments", () => {
    const userId = new ObjectId().toString();
    expect(buildVisibleShipmentQuery({ role: ROLES.CARRIER_DISPATCHER, _id: userId })).toEqual({
      assignedDispatcher: userId,
    });
  });

  it("scopes Hub Operators to their own hub", () => {
    const hubId = new ObjectId();
    expect(buildVisibleShipmentQuery({ role: ROLES.HUB_OPERATOR, hub: hubId })).toEqual({
      hub: hubId,
    });
  });

  it("returns an impossible query when a Hub Operator has no hub", () => {
    const query = buildVisibleShipmentQuery({ role: ROLES.HUB_OPERATOR });
    expect(query._id).toEqual({ $in: [] });
  });
});

describe("buildVolumeTrend", () => {
  const startOfDay = (d) => {
    const c = new Date(d);
    c.setUTCHours(0, 0, 0, 0);
    return c;
  };

  it("returns 7 zero buckets when there are no shipments", () => {
    const trend = buildVolumeTrend([], { now: new Date("2024-01-10T12:00:00Z") });
    expect(trend).toHaveLength(7);
    expect(trend.every((b) => b.value === 0)).toBe(true);
  });

  it("counts shipments into their UTC day bucket, oldest first", () => {
    const trend = buildVolumeTrend(
      [
        { createdAt: "2024-01-08T10:00:00Z" },
        { createdAt: "2024-01-08T23:59:00Z" },
        { createdAt: "2024-01-07T00:00:00Z" },
        { createdAt: "2024-01-11T00:00:00Z" }, // outside the window
        { createdAt: "not-a-date" },
        {},
      ],
      { now: new Date("2024-01-10T12:00:00Z") }
    );

    expect(trend[3].label).toBe("Sun 7"); // Jan 7 2024 was a Sunday
    expect(trend[3].value).toBe(1);
    expect(trend[4].label).toBe("Mon 8"); // Jan 8 2024 was a Monday
    expect(trend[4].value).toBe(2);
    const total = trend.reduce((sum, b) => sum + b.value, 0);
    expect(total).toBe(3);
  });

  it("respects an injected startOfDay implementation", () => {
    const trend = buildVolumeTrend([{ createdAt: "2024-01-10T00:30:00Z" }], {
      now: new Date("2024-01-10T12:00:00Z"),
      startOfDay: (d) => {
        const c = new Date(d);
        c.setHours(0, 0, 0, 0); // local midnight
        return c;
      },
    });
    expect(trend.some((b) => b.value === 1)).toBe(true);
  });
});

describe("buildFleet", () => {
  const row = (overrides) => ({
    _id: new ObjectId(),
    shipmentId: "SHP-001",
    vehicleNumber: "KA-01-AB-1234",
    status: "In Transit",
    weight: 120,
    title: "Cargo",
    createdAt: "2024-01-01T00:00:00Z",
    assignedDispatcher: { fullName: "Ravi Kumar" },
    ...overrides,
  });

  it("returns an empty fleet for no shipment rows", () => {
    expect(buildFleet([])).toEqual({ vehicles: [], available: 0, totalVehicles: 0, availabilityPct: 0 });
  });

  it("ignores shipments without a vehicle number", () => {
    const result = buildFleet([row({ vehicleNumber: "" }), row({ vehicleNumber: "   " })]);
    expect(result.vehicles).toHaveLength(0);
  });

  it("derives one vehicle per distinct registration and marks its state from open shipments", () => {
    const result = buildFleet([
      row({ shipmentId: "SHP-1", vehicleNumber: "KA-01-AB-1234", status: "Delivered", createdAt: "2024-01-01T00:00:00Z" }),
      row({ shipmentId: "SHP-2", vehicleNumber: "KA-01-AB-1234", status: "In Transit", createdAt: "2024-01-02T00:00:00Z" }),
      row({ shipmentId: "SHP-3", vehicleNumber: "MH-12-CD-5678", status: "Scheduled", createdAt: "2024-01-03T00:00:00Z" }),
    ]);

    expect(result.totalVehicles).toBe(2);
    const truck = result.vehicles.find((v) => v.registrationNumber === "KA-01-AB-1234");
    expect(truck.status).toBe("In Transit");
    expect(truck.currentShipmentId).toBe("SHP-2");
    expect(truck.driver).toBe("Ravi Kumar");
    expect(truck.currentLoad).toBe(120);

    const van = result.vehicles.find((v) => v.registrationNumber === "MH-12-CD-5678");
    expect(van.status).toBe("Assigned");
    expect(result.available).toBe(0);
  });

  it("marks a vehicle Available when every shipment on it is terminal", () => {
    const result = buildFleet([
      row({ vehicleNumber: "TN-01-EF-9012", status: "Delivered" }),
      row({ vehicleNumber: "TN-01-EF-9012", status: "Cancelled" }),
    ]);
    expect(result.vehicles[0].status).toBe("Available");
    expect(result.available).toBe(1);
    expect(result.availabilityPct).toBe(100);
  });

  it("normalizes registration numbers and sorts ascending", () => {
    const result = buildFleet([
      row({ vehicleNumber: "  ka-01-ab-1234 ", status: "In Transit" }),
      row({ vehicleNumber: "AP-09-GH-0001", status: "Scheduled" }),
    ]);
    expect(result.vehicles[0].registrationNumber).toBe("AP-09-GH-0001");
    expect(result.vehicles[1].registrationNumber).toBe("KA-01-AB-1234");
  });

  it("handles missing/unstructured drivers gracefully", () => {
    const result = buildFleet([
      row({ status: "Scheduled", assignedDispatcher: null, weight: null }),
    ]);
    expect(result.vehicles[0].driver).toBe("Unassigned");
    expect(result.vehicles[0].currentLoad).toBeNull();
  });
});

describe("buildHubs", () => {
  const hubRow = (overrides) => ({
    _id: new ObjectId(),
    name: "Kochi Port Hub",
    location: "Willingdon Island",
    type: "Port",
    status: "active",
    capacity: 100,
    ...overrides,
  });

  const shipment = (hubId, status) => ({
    _id: new ObjectId(),
    hub: hubId,
    status,
    vehicleNumber: "KA-01-AB-1234",
  });

  it("returns no hubs and null utilization for no rows", () => {
    const { hubs, overallUtilization } = buildHubs([], []);
    expect(hubs).toEqual([]);
    expect(overallUtilization).toBeNull();
  });

  it("counts active and total shipments per hub", () => {
    const hubId = new ObjectId();
    const { hubs, overallUtilization } = buildHubs(
      [hubRow({ _id: hubId })],
      [
        shipment(hubId, "In Transit"),
        shipment(hubId, "Delivered"),
        shipment(hubId, "In Transit"),
      ]
    );
    expect(hubs[0].activeShipments).toBe(2);
    expect(hubs[0].totalShipments).toBe(3);
    expect(hubs[0].utilization).toBe(2); // 2 / 100
    expect(overallUtilization).toBe(2);
  });

  it("reports null utilization when a hub has no capacity", () => {
    const { hubs, overallUtilization } = buildHubs(
      [hubRow({ capacity: null })],
      [shipment(new ObjectId(), "In Transit")]
    );
    expect(hubs[0].utilization).toBeNull();
    expect(overallUtilization).toBeNull();
  });

  it("caps utilization at 100%", () => {
    const hubId = new ObjectId();
    const { hubs } = buildHubs(
      [hubRow({ _id: hubId, capacity: 1 })],
      [shipment(hubId, "In Transit"), shipment(hubId, "In Transit")]
    );
    expect(hubs[0].utilization).toBe(100);
  });

  it("averages utilization only across hubs that have a capacity", () => {
    const hubId = new ObjectId();
    const { overallUtilization } = buildHubs(
      [
        hubRow({ _id: hubId, capacity: 100 }),
        hubRow({ capacity: null }),
      ],
      [shipment(hubId, "In Transit")]
    );
    expect(overallUtilization).toBe(1); // only the measured hub counts
  });

  it("matches hub shipment rows by string id as well as populated ids", () => {
    const hubId = new ObjectId();
    const { hubs } = buildHubs([hubRow({ _id: hubId })], [
      { _id: new ObjectId(), hub: hubId.toString(), status: "In Transit" },
      { _id: new ObjectId(), hub: { _id: hubId }, status: "In Transit" },
    ]);
    expect(hubs[0].totalShipments).toBe(2);
    expect(hubs[0].activeShipments).toBe(2);
  });
});

describe("buildSystemHealth", () => {
  const noSockets = { socketServiceRef: { getConnectedClients: () => null } };

  it("reports a down database when no connection is provided", () => {
    const { services, overall } = buildSystemHealth({ connection: null, ...noSockets });
    const db = services.find((s) => s.id === "svc-db");
    expect(db.status).toBe("down");
    expect(overall).toBe("down");
  });

  it("reports operational when the connection is readyState 1", () => {
    const { services, overall } = buildSystemHealth({
      connection: { readyState: 1, name: "freightbind" },
      ...noSockets,
    });
    const db = services.find((s) => s.id === "svc-db");
    expect(db.status).toBe("operational");
    expect(db.detail).toContain("freightbind");
    expect(overall).toBe("operational");
  });

  it("adds a realtime row when the socket service reports a client count", () => {
    const { services } = buildSystemHealth({
      connection: { readyState: 1 },
      socketServiceRef: { getConnectedClients: () => 3 },
    });
    expect(services.find((s) => s.id === "svc-socket").detail).toBe("3 connected clients");
  });

  it("omits the realtime row when the socket service exposes no count", () => {
    const { services } = buildSystemHealth({
      connection: { readyState: 1 },
      socketServiceRef: { getConnectedClients: () => null },
    });
    expect(services.find((s) => s.id === "svc-socket")).toBeUndefined();
  });

  it("rewrites latency/uptime to the visible detail fields", () => {
    const { services } = buildSystemHealth({ connection: { readyState: 1 }, ...noSockets });
    expect(services.every((s) => "latency" in s && "uptime" in s)).toBe(true);
    expect(services.every((s) => typeof s.detail === "string")).toBe(true);
  });
});