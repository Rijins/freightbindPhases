// AI Alert pipeline smoke test (dev) — Phase 9 Part 4.
//
// Usage:
//   1. Ensure MongoDB (MONGO_URI in freightbind-backend/.env) is reachable.
//   2. node scripts/aiAlertSmokeTest.js
//
// The script boots its own Express + Socket.IO server on an ephemeral port,
// creates temporary users + shipment (cleaned up afterwards), then verifies:
//   - high-risk analysis produces a persisted AI Alert notification
//   - notification is persisted BEFORE realtime delivery (DB row + socket
//     events both observed)
//   - correct recipient targeting (assigned dispatcher + creator)
//   - ai:alert emitted through the existing socket service (shipment room)
//   - duplicate alert generation is prevented (persisted dedupe window)
//   - Low-risk analysis produces no alert
//   - endpoint routing: 401 unauthenticated / 404 missing shipment /
//     403 dispatcher on unassigned shipment / 200 dispatcher on assigned
//
// Exit code 0 = all checks passed, 1 = failures.

const path = require("path");
const http = require("http");

const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { io: createClient } = require("socket.io-client");

const app = require("../app");
const connectDB = require("../config/db");
const { initSocket, closeSocketServer } = require("../sockets");
const socketService = require("../services/socketService");
const aiAlertService = require("../services/aiAlertService");
const { SOCKET_EVENTS } = require("../constants/socketEvents");
const { NOTIFICATION_TYPES } = require("../constants/notificationTypes");
const { ROLES } = require("../constants/roles");
const User = require("../models/User");
const Shipment = require("../models/Shipment");
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

const signToken = (userId, role) =>
  jwt.sign({ id: String(userId), role }, process.env.JWT_SECRET, { expiresIn: "1h" });

const connectClient = (baseUrl, token) =>
  new Promise((resolve, reject) => {
    const socket = createClient(baseUrl, {
      auth: token ? { token } : undefined,
      transports: ["websocket", "polling"],
      reconnection: false,
      timeout: 5000,
    });
    socket.on("connect", () => resolve(socket));
    socket.on("connect_error", (error) => reject(new Error(error.message)));
  });

const post = async (baseUrl, url, token) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return { status: response.status, body: await response.json() };
};

let adminUser;
let dispatcherUser;
let shipment;
let unassignedShipment;

const run = async () => {
  console.log("=== FreightBind AI Alert pipeline smoke test ===\n");

  await connectDB();

  adminUser = await User.create({
    fullName: "Alert Smoke Admin",
    email: `alert-admin-${Date.now()}@freightbind.ai`,
    password: "Admin@123",
    role: ROLES.ADMIN,
    status: "active",
  });
  dispatcherUser = await User.create({
    fullName: "Alert Smoke Dispatcher",
    email: `alert-dispatcher-${Date.now()}@freightbind.ai`,
    password: "Dispatcher@123",
    role: ROLES.CARRIER_DISPATCHER,
    status: "active",
  });
  shipment = await Shipment.create({
    title: "Alert smoke shipment",
    cargoType: "Electronics",
    shipmentType: "Full Truckload",
    origin: "Chicago, IL",
    destination: "Dallas, TX",
    priority: "High",
    status: "In Transit",
    createdBy: adminUser._id,
    assignedDispatcher: dispatcherUser._id,
  });
  unassignedShipment = await Shipment.create({
    title: "Unassigned alert smoke shipment",
    cargoType: "Machinery",
    shipmentType: "Full Truckload",
    origin: "Austin, TX",
    destination: "Memphis, TN",
    priority: "Medium",
    status: "Scheduled",
    createdBy: adminUser._id,
  });

  const server = http.createServer(app);
  const io = initSocket(server);
  const baseUrl = `http://127.0.0.1:${await listen(server)}`;
  console.log(`Test server listening on ${baseUrl}\n`);

  const adminToken = signToken(adminUser._id, adminUser.role);
  const dispatcherToken = signToken(dispatcherUser._id, dispatcherUser.role);

  const dispatcherSocket = await connectClient(baseUrl, dispatcherToken);
  const received = { alerts: [], notifications: [] };
  dispatcherSocket.on(SOCKET_EVENTS.AI_ALERT, (payload) => received.alerts.push(payload));
  dispatcherSocket.on(SOCKET_EVENTS.NOTIFICATION, (payload) => received.notifications.push(payload));
  socketService.joinRoom(dispatcherUser._id, `shipment:${shipment._id}`);
  await settle();

  // ------------------------------------------------------------------
  console.log("1. High-risk analysis produces a persisted AI Alert");
  const leanShipment = await Shipment.findById(shipment._id).lean();
  const first = await aiAlertService.maybeRaiseHighRiskAlert({
    shipment: leanShipment,
    prediction: { risk: "High", confidence: 0.87 },
    actingUser: adminUser,
  });
  report(first.raised === true, "High risk raises an alert");
  report(Array.isArray(first.notifications) && first.notifications.length === 2, "one alert per recipient (dispatcher + creator)");

  const persisted = await Notification.find({
    type: NOTIFICATION_TYPES.AI_ALERT,
    relatedShipment: shipment._id,
  }).lean();
  report(persisted.length === 2, "AI Alert notifications persisted in MongoDB");
  const recipientIds = persisted.map((n) => String(n.recipient)).sort();
  const expectedRecipients = [String(dispatcherUser._id), String(adminUser._id)].sort();
  report(
    JSON.stringify(recipientIds) === JSON.stringify(expectedRecipients),
    "recipient targeting: assigned dispatcher + creator only"
  );
  report(
    persisted.every((n) => String(n.relatedShipment) === String(shipment._id)),
    "notifications linked to the correct shipment"
  );

  // ------------------------------------------------------------------
  console.log("\n2. Persistence before realtime delivery");
  report(persisted.every((n) => n.notificationId), "DB rows exist before/independently of socket delivery");
  await settle();
  report(received.notifications.length === 1, "notification:new delivered to the online recipient (dispatcher) user room");
  report(
    received.notifications[0]?.type === "AI Alert" &&
      String(received.notifications[0]?.shipmentId) === String(shipment._id),
    "notification:new payload is the persisted AI Alert for the right shipment"
  );
  report(received.alerts.length === 1, "ai:alert emitted once through socketService (shipment room)");
  report(
    received.alerts[0] && String(received.alerts[0].shipmentId) === String(shipment._id),
    "ai:alert carries the affected shipmentId"
  );

  // ------------------------------------------------------------------
  console.log("\n3. Duplicate prevention");
  const second = await aiAlertService.maybeRaiseHighRiskAlert({
    shipment: leanShipment,
    prediction: { risk: "High", confidence: 0.91 },
    actingUser: adminUser,
  });
  report(second.raised === false, "second high-risk analysis for the same shipment is deduped");
  const countAfterDedupe = await Notification.countDocuments({
    type: NOTIFICATION_TYPES.AI_ALERT,
    relatedShipment: shipment._id,
  });
  report(countAfterDedupe === 2, "no duplicate notifications created");

  // ------------------------------------------------------------------
  console.log("\n4. Low-risk analysis produces no alert");
  const low = await aiAlertService.maybeRaiseHighRiskAlert({
    shipment: leanShipment,
    prediction: { risk: "Low", confidence: 0.2 },
    actingUser: adminUser,
  });
  report(low.raised === false, "Low risk never raises an alert");
  const countAfterLow = await Notification.countDocuments({
    type: NOTIFICATION_TYPES.AI_ALERT,
    relatedShipment: shipment._id,
  });
  report(countAfterLow === 2, "Low-risk analysis created nothing new");

  // ------------------------------------------------------------------
  console.log("\n5. Endpoint routing");
  const noToken = await post(baseUrl, `/api/ai/recommendations/${shipment._id}`, null);
  report(noToken.status === 401, "unauthenticated request rejected (401)");

  const missingShipment = await post(
    baseUrl,
    `/api/ai/recommendations/${new mongoose.Types.ObjectId()}`,
    adminToken
  );
  report(missingShipment.status === 404, "missing shipment returns 404");

  const invalidId = await post(baseUrl, "/api/ai/recommendations/not-an-id", adminToken);
  report(invalidId.status === 422, "invalid shipment id rejected by validation (422)");

  const unassigned = await post(
    baseUrl,
    `/api/ai/recommendations/${unassignedShipment._id}`,
    dispatcherToken
  );
  report(unassigned.status === 403, "dispatcher blocked from unassigned shipment AI (403)");

  const assigned = await post(baseUrl, `/api/ai/recommendations/${shipment._id}`, dispatcherToken);
  report(assigned.status === 200, "dispatcher can read AI for assigned shipment (200)");
  report(
    assigned.body?.success === true && Array.isArray(assigned.body?.data?.recommendations),
    "response envelope carries a normalized recommendations array"
  );

  // ------------------------------------------------------------------
  console.log("\n6. Cleanup");
  dispatcherSocket.disconnect();
  await Notification.deleteMany({ relatedShipment: { $in: [shipment._id, unassignedShipment._id] } });
  await Shipment.deleteMany({ _id: { $in: [shipment._id, unassignedShipment._id] } });
  await User.deleteMany({ _id: { $in: [adminUser._id, dispatcherUser._id] } });
  await closeSocketServer();
  await closeHttpServer(server);
  await mongoose.disconnect();
  report(true, "temp data removed, socket server + DB closed");
};

run()
  .then(() => {
    console.log(`\n=== Result: ${passed} passed, ${failures} failed ===`);
    process.exit(failures > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error(`\nSmoke test crashed: ${error.message}`);
    process.exit(1);
  });
