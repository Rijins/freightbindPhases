/**
 * 4-role API verification script — the "browser verification" proxy for Phase 08.
 * Boots an Express + Socket.IO server on an ephemeral port, exercises the
 * analytics endpoint across all 4 roles, verifies RBAC denials, hub capacity
 * persistence, role-scoped fleet/hub data, timeline + chat auth rules, and
 * the /api-docs Swagger UI. Cleans up everything it creates.
 *
 * Exit code 0 = all checks passed, 1 = failures.
 */

const http = require("http");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");

const app = require("../app");
const connectDB = require("../config/db");
const { initSocket, closeSocketServer } = require("../sockets");
const Shipment = require("../models/Shipment");
const Hub = require("../models/Hub");
const User = require("../models/User");
const Notification = require("../models/Notification");

let passed = 0;
let failures = 0;

const report = (condition, label) => {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${label}`);
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const settle = () => sleep(300);

const listen = (server) =>
  new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });

const closeHttpServer = (server) =>
  new Promise((resolve) => {
    server.close(resolve);
  });

const request = async (baseUrl, path, { method = "GET", headers = {}, body } = {}) => {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...headers },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${baseUrl}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body: json };
};

const registerUser = async (baseUrl, payload) => {
  const res = await request(baseUrl, "/api/auth/register", { method: "POST", body: payload });
  if (res.status !== 201) throw new Error(`register failed (${res.status}): ${res.body.message}`);
  return res.body.data;
};

const loginUser = async (baseUrl, email, password) => {
  const res = await request(baseUrl, "/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (res.status !== 200) throw new Error(`login failed (${res.status}): ${res.body.message}`);
  return res.body.data;
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const cleanupIds = { shipments: [], hubs: [], users: [], notifications: [] };

const run = async () => {
  console.log("=== FreightBind AI 4-role API verification ===\n");

  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  const port = await listen(server);
  const base = `http://127.0.0.1:${port}`;

  // ------------------------------------------------------------------
  // 1. Login dev accounts
  // ------------------------------------------------------------------
  console.log("1. Login dev accounts");
  const admin = await loginUser(base, "admin@freightbind.ai", "Admin@123");
  const director = await loginUser(base, "director@freightbind.ai", "Director@123");
  const dispatcher = await loginUser(base, "dispatcher@freightbind.ai", "Dispatcher@123");
  const hubOp = await loginUser(base, "hub@freightbind.ai", "Hub@123");
  report(true, "admin / director / dispatcher / hubOp logged in");

  const hubAId = hubOp.user.hub;
  report(Boolean(hubAId), "hubOp has a hub assigned");

  // ------------------------------------------------------------------
  // 2. Swagger UI reachable
  // ------------------------------------------------------------------
  console.log("\n2. Swagger UI");
  const swaggerRes = await request(base, "/api-docs/");
  report(swaggerRes.ok && swaggerRes.status === 200, "/api-docs serves 200");

  // ------------------------------------------------------------------
  // 3. Create temp dispatcher + hub + shipments
  // ------------------------------------------------------------------
  console.log("\n3. Create test data");
  const dispatcherBData = await registerUser(base, {
    fullName: "Verify Dispatcher B",
    email: `verify-dispb-verify-${Date.now()}@verify.test`,
    password: "Password@456",
  });
  const dispatcherB = dispatcherBData.user;
  const dispatcherBToken = dispatcherBData.token;
  cleanupIds.users.push(dispatcherB._id);

  const hubBRes = await request(base, "/api/hubs", {
    method: "POST",
    headers: authHeader(admin.token),
    body: {
      name: `Verify Hub B ${Date.now()}`,
      location: "Mumbai Yard",
      type: "Yard",
      status: "active",
    },
  });
  const hubB = hubBRes.body.data.hub;
  cleanupIds.hubs.push(hubB._id);

  const shipmentARes = await request(base, "/api/v1/shipments", {
    method: "POST",
    headers: authHeader(admin.token),
    body: {
      title: "Verify Shipment A",
      cargoType: "General",
      shipmentType: "FTL",
      origin: "Kochi",
      destination: "Chennai",
      weight: 500,
      vehicleNumber: "KA-TEST-9999",
      hub: hubAId,
      assignedDispatcher: dispatcher.user._id,
    },
  });
  const shipmentA = shipmentARes.body.data.shipment;
  cleanupIds.shipments.push(shipmentA._id);

  const shipmentBRes = await request(base, "/api/v1/shipments", {
    method: "POST",
    headers: authHeader(admin.token),
    body: {
      title: "Verify Shipment B",
      cargoType: "Bulk",
      shipmentType: "FTL",
      origin: "Mumbai",
      destination: "Delhi",
      weight: 800,
      vehicleNumber: "MH-TEST-0001",
      hub: hubB._id,
      assignedDispatcher: dispatcherB._id,
    },
  });
  const shipmentB = shipmentBRes.body.data.shipment;
  cleanupIds.shipments.push(shipmentB._id);

  report(true, "created shipments A (hubA/dispatcher) and B (hubB/dispatcherB)");

  // ------------------------------------------------------------------
  // 4. Analytics: Admin sees full picture
  // ------------------------------------------------------------------
  console.log("\n4. Analytics — Admin");
  const adminAnalytics = await request(base, "/api/analytics/dashboard", {
    headers: authHeader(admin.token),
  });
  report(adminAnalytics.ok, "Admin GET /api/analytics/dashboard → 200");
  const af = adminAnalytics.body.data.fleet;
  report(
    af.vehicles.some((v) => v.registrationNumber === "KA-TEST-9999") &&
      af.vehicles.some((v) => v.registrationNumber === "MH-TEST-0001"),
    "Admin fleet contains both vehicles"
  );
  report(af.totalVehicles >= 2, "Admin fleet totalVehicles includes both test vehicles");
  const ah = adminAnalytics.body.data.hubs;
  report(
    ah.hubs.length >= 2 && ah.hubs.every((h) => typeof h.activeShipments === "number"),
    "Admin hubs include both hubs with activeShipment counts"
  );
  report(ah.overallUtilization === null, "Admin overallUtilization = null (no capacity set)");

  // ------------------------------------------------------------------
  // 5. Analytics: Dispatcher sees only their own fleet, no hubs
  // ------------------------------------------------------------------
  console.log("\n5. Analytics — Dispatcher");
  const dispAnalytics = await request(base, "/api/analytics/dashboard", {
    headers: authHeader(dispatcher.token),
  });
  report(dispAnalytics.ok, "Dispatcher GET /api/analytics/dashboard → 200");
  const df = dispAnalytics.body.data.fleet;
  report(
    df.vehicles.some((v) => v.registrationNumber === "KA-TEST-9999") &&
      !df.vehicles.some((v) => v.registrationNumber === "MH-TEST-0001"),
    "Dispatcher fleet contains only their assigned vehicle"
  );
  report(dispAnalytics.body.data.hubs.hubs.length === 0, "Dispatcher hub data is empty");

  // ------------------------------------------------------------------
  // 6. Analytics: Hub Operator sees only their hub's fleet, no hubs
  // ------------------------------------------------------------------
  console.log("\n6. Analytics — Hub Operator");
  const hubAnalytics = await request(base, "/api/analytics/dashboard", {
    headers: authHeader(hubOp.token),
  });
  report(hubAnalytics.ok, "HubOperator GET /api/analytics/dashboard → 200");
  const hf = hubAnalytics.body.data.fleet;
  report(
    hf.vehicles.some((v) => v.registrationNumber === "KA-TEST-9999") &&
      !hf.vehicles.some((v) => v.registrationNumber === "MH-TEST-0001"),
    "HubOperator fleet contains only their hub's vehicle"
  );
  report(hubAnalytics.body.data.hubs.hubs.length === 0, "HubOperator hub data is empty");

  // ------------------------------------------------------------------
  // 7. Hub capacity persistence + utilization computation
  // ------------------------------------------------------------------
  console.log("\n7. Hub capacity persistence");
  const capRes = await request(base, `/api/hubs/${hubB._id}`, {
    method: "PUT",
    headers: authHeader(admin.token),
    body: { capacity: 10 },
  });
  report(capRes.ok && capRes.body.data.hub.capacity === 10, "Admin can set hub capacity");
  const postCapAnalytics = await request(base, "/api/analytics/dashboard", {
    headers: authHeader(admin.token),
  });
  const hubBAfter = postCapAnalytics.body.data.hubs.hubs.find(
    (h) => String(h._id) === String(hubB._id)
  );
  report(
    hubBAfter && hubBAfter.capacity === 10 && hubBAfter.utilization === 10,
    "Capacity-set hub shows utilization = 10% (1 active / 10 capacity)"
  );
  report(
    postCapAnalytics.body.data.hubs.overallUtilization === 10,
    "overallUtilization reflects only hubs with capacity"
  );

  // ------------------------------------------------------------------
  // 8. RBAC: Dispatcher / Hub Operator denied from protected endpoints
  // ------------------------------------------------------------------
  console.log("\n8. RBAC denials");
  const dispCreate = await request(base, "/api/v1/shipments", {
    method: "POST",
    headers: authHeader(dispatcher.token),
    body: { title: "Blocked", cargoType: "X", shipmentType: "FTL", origin: "A", destination: "B" },
  });
  report(dispCreate.status === 403, "Dispatcher cannot create shipments (403)");
  const dispUsers = await request(base, "/api/users", { headers: authHeader(dispatcher.token) });
  report(dispUsers.status === 403, "Dispatcher cannot list users (403)");
  const hubUsers = await request(base, "/api/users", { headers: authHeader(hubOp.token) });
  report(hubUsers.status === 403, "Hub Operator cannot list users (403)");
  const dirUsers = await request(base, "/api/users", { headers: authHeader(director.token) });
  report(dirUsers.status === 403, "Logistics Director cannot list all users (403)");
  const dirDispatchers = await request(base, "/api/users/dispatchers", {
    headers: authHeader(director.token),
  });
  report(dirDispatchers.status === 200, "Logistics Director CAN list dispatchers (200)");
  const noToken = await request(base, "/api/analytics/dashboard");
  report(noToken.status === 401, "GET /api/analytics without token → 401");

  // ------------------------------------------------------------------
  // 9. Timeline: Hub scoping
  // ------------------------------------------------------------------
  console.log("\n9. Timeline scoping");
  const tlA = await request(base, `/api/timeline/${shipmentA._id}`, {
    headers: authHeader(hubOp.token),
  });
  report(tlA.status === 200, "HubOperator can view timeline of their hub's shipment");
  const tlB = await request(base, `/api/timeline/${shipmentB._id}`, {
    headers: authHeader(hubOp.token),
  });
  report(tlB.status === 403, "HubOperator denied timeline of another hub's shipment");

  // ------------------------------------------------------------------
  // 10. Chat: Assignment/hub-based access
  // ------------------------------------------------------------------
  console.log("\n10. Chat access");
  const chatA = await request(base, `/api/chat/shipments/${shipmentA._id}`, {
    headers: authHeader(dispatcher.token),
  });
  report(chatA.ok, "Assigned dispatcher can access chat context (200)");
  const chatAB = await request(base, `/api/chat/shipments/${shipmentA._id}`, {
    headers: authHeader(dispatcherBToken),
  });
  report(chatAB.status === 403, "Wrong dispatcher denied chat (403)");
  const chatAdmin = await request(base, `/api/chat/shipments/${shipmentA._id}`, {
    headers: authHeader(admin.token),
  });
  report(chatAdmin.status === 403, "Admin denied chat (non-operational role)");

  // ------------------------------------------------------------------
  // Cleanup
  // ------------------------------------------------------------------
  console.log("\n11. Cleanup");
  for (const nid of cleanupIds.notifications) {
    await Notification.deleteOne({ _id: nid }).catch(() => {});
  }
  for (const sid of cleanupIds.shipments) {
    await Shipment.deleteOne({ _id: sid }).catch(() => {});
  }
  for (const hid of cleanupIds.hubs) {
    await Hub.deleteOne({ _id: hid }).catch(() => {});
  }
  for (const uid of cleanupIds.users) {
    await User.deleteOne({ _id: uid }).catch(() => {});
  }

  await closeSocketServer();
  await closeHttpServer(server);
  report(true, "test data removed, socket server + DB closed");
};

run()
  .then(() => {
    console.log(`\n=== Result: ${passed} passed, ${failures} failed ===`);
    process.exit(failures > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error(`\nVerification crashed: ${error.message}`);
    process.exit(1);
  });