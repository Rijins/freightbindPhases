// Notification targeting smoke test (dev) — Phase 4 notification fix.
//
// Usage:
//   1. Ensure MongoDB (MONGO_URI in freightbind-backend/.env) is reachable.
//   2. node scripts/notificationSmokeTest.js
//
// The script boots its own Express + Socket.IO server on an ephemeral port,
// creates temporary users (admin, dispatcher A, dispatcher B) + shipments
// (all cleaned up afterwards), then verifies:
//   - create WITHOUT a dispatcher produces no notification at all
//   - create WITH Dispatcher A produces exactly ONE "Shipment Assigned"
//     notification, recipient = Dispatcher A (+ the existing "Shipment
//     Created" notification, same recipient)
//   - Dispatcher B receives ZERO notifications (DB + socket) — recipient
//     isolation, never a role-wide broadcast
//   - the CREATOR/ADMIN receives ZERO notifications (DB, socket, and the
//     admin's GET /api/notifications list) for every flow — the admin's
//     notification list is scoped to the acting user, never a leak of
//     other users' notifications
//   - notifications are persisted in MongoDB
//   - `notification:new` targets Dispatcher A's user room only
//   - existing Timeline assignment flow (POST /timeline/dispatcher) still
//     notifies the newly assigned dispatcher (and nobody else)
//   - existing reassignment flow notifies the new dispatcher only
//   - AI alert pipeline still persists + delivers realtime (regression)
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

const request = async (baseUrl, url, { method = "POST", token = null, body = null } = {}) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json() };
};

const countNotifications = (query) => Notification.countDocuments(query);

let adminUser;
let dispatcherA;
let dispatcherB;

const run = async () => {
  console.log("=== FreightBind notification targeting smoke test ===\n");

  await connectDB();

  adminUser = await User.create({
    fullName: "Notif Smoke Admin",
    email: `notif-admin-${Date.now()}@freightbind.ai`,
    password: "Admin@123",
    role: ROLES.ADMIN,
    status: "active",
  });
  dispatcherA = await User.create({
    fullName: "Notif Smoke Dispatcher A",
    email: `notif-dispatcher-a-${Date.now()}@freightbind.ai`,
    password: "Dispatcher@123",
    role: ROLES.CARRIER_DISPATCHER,
    status: "active",
  });
  dispatcherB = await User.create({
    fullName: "Notif Smoke Dispatcher B",
    email: `notif-dispatcher-b-${Date.now()}@freightbind.ai`,
    password: "Dispatcher@123",
    role: ROLES.CARRIER_DISPATCHER,
    status: "active",
  });

  const server = http.createServer(app);
  const io = initSocket(server);
  const baseUrl = `http://127.0.0.1:${await listen(server)}`;
  console.log(`Test server listening on ${baseUrl}\n`);

  const adminToken = signToken(adminUser._id, adminUser.role);
  const tokenA = signToken(dispatcherA._id, dispatcherA.role);
  const tokenB = signToken(dispatcherB._id, dispatcherB.role);

  const socketAdmin = await connectClient(baseUrl, adminToken);
  const socketA = await connectClient(baseUrl, tokenA);
  const socketB = await connectClient(baseUrl, tokenB);
  const eventsAdmin = [];
  const eventsA = [];
  const eventsB = [];
  socketAdmin.on(SOCKET_EVENTS.NOTIFICATION, (payload) => eventsAdmin.push(payload));
  socketA.on(SOCKET_EVENTS.NOTIFICATION, (payload) => eventsA.push(payload));
  socketB.on(SOCKET_EVENTS.NOTIFICATION, (payload) => eventsB.push(payload));
  await settle();

  const baseShipment = {
    title: "Notif smoke shipment",
    cargoType: "Electronics",
    shipmentType: "Full Truckload",
    origin: "Chicago, IL",
    destination: "Dallas, TX",
    priority: "High",
  };

  // ------------------------------------------------------------------
  console.log("1. Create WITHOUT a dispatcher");
  const unassigned = await request(baseUrl, "/api/v1/shipments", {
    token: adminToken,
    body: { ...baseShipment, title: "Unassigned notif smoke shipment" },
  });
  report(unassigned.status === 201, "shipment created without a dispatcher (201)");
  const unassignedId = unassigned.body.data.shipment._id;
  report(
    (await countNotifications({ relatedShipment: unassignedId })) === 0,
    "no notifications at all for a dispatcher-less creation"
  );
  await settle();
  report(eventsA.length === 0 && eventsB.length === 0, "no notification:new reached any dispatcher");
  report(eventsAdmin.length === 0, "no notification:new reached the admin either");

  // ------------------------------------------------------------------
  console.log("\n2. Create WITH Dispatcher A");
  const createdA = await request(baseUrl, "/api/v1/shipments", {
    token: adminToken,
    body: { ...baseShipment, title: "Assigned notif smoke shipment", assignedDispatcher: dispatcherA._id },
  });
  report(createdA.status === 201, "shipment created with assignedDispatcher (201)");
  const assignedId = createdA.body.data.shipment._id;
  report(
    String(createdA.body.data.shipment.assignedDispatcher) === String(dispatcherA._id),
    "assignedDispatcher stored on the shipment"
  );

  const assignedCount = await countNotifications({
    type: NOTIFICATION_TYPES.SHIPMENT_ASSIGNED,
    relatedShipment: assignedId,
  });
  report(assignedCount === 1, "exactly ONE Shipment Assigned notification persisted");

  const assignedDocs = await Notification.find({
    type: NOTIFICATION_TYPES.SHIPMENT_ASSIGNED,
    relatedShipment: assignedId,
  }).lean();
  report(
    assignedDocs.length === 1 && String(assignedDocs[0].recipient) === String(dispatcherA._id),
    "Shipment Assigned recipient = Dispatcher A"
  );
  report(
    assignedDocs[0] &&
      assignedDocs[0].title === "Shipment Assigned" &&
      assignedDocs[0].message === `Shipment ${createdA.body.data.shipment.shipmentId} has been assigned to you.`,
    "Shipment Assigned uses the canonical wording"
  );

  const createdCount = await countNotifications({
    type: NOTIFICATION_TYPES.SHIPMENT_CREATED,
    relatedShipment: assignedId,
  });
  report(createdCount === 1, "existing Shipment Created notification also persisted (recipient = assigned dispatcher)");
  const createdDoc = await Notification.findOne({
    type: NOTIFICATION_TYPES.SHIPMENT_CREATED,
    relatedShipment: assignedId,
  }).lean();
  report(createdDoc && String(createdDoc.recipient) === String(dispatcherA._id), "Shipment Created recipient = Dispatcher A");

  await settle();
  const createdTitles = eventsA.map((event) => event.title);
  report(
    createdTitles.includes("Shipment Assigned") && createdTitles.includes("Shipment Created"),
    "notification:new delivered BOTH notifications to Dispatcher A's user room"
  );
  report(eventsB.length === 0, "notification:new did NOT reach Dispatcher B (isolation)");
  const assignedEvent = eventsA.find((event) => event.title === "Shipment Assigned");
  report(
    assignedEvent && assignedEvent.shipmentId === String(assignedId),
    "notification:new payload references the correct shipment"
  );
  report(
    assignedEvent && assignedEvent.id === String(assignedDocs[0]._id),
    "socket payload id matches the persisted notification id"
  );
  const unreadForA = await countNotifications({ recipient: dispatcherA._id, isRead: false });
  report(unreadForA === 2, "both new notifications are unread for Dispatcher A");

  // Creator/Admin isolation — the Admin must receive neither notification,
  // neither persisted, nor realtime, nor via the admin notification list.
  const adminCreatedCount = await countNotifications({
    type: NOTIFICATION_TYPES.SHIPMENT_CREATED,
    relatedShipment: assignedId,
    recipient: adminUser._id,
  });
  report(adminCreatedCount === 0, "Shipment Created is NOT persisted for the admin/creator");
  const adminAssignedCount = await countNotifications({
    type: NOTIFICATION_TYPES.SHIPMENT_ASSIGNED,
    relatedShipment: assignedId,
    recipient: adminUser._id,
  });
  report(adminAssignedCount === 0, "Shipment Assigned is NOT persisted for the admin/creator");
  await settle();
  report(eventsAdmin.length === 0, "notification:new did NOT reach the admin's user room");
  const adminList = await request(baseUrl, "/api/notifications", {
    method: "GET",
    token: adminToken,
  });
  const adminListTypes = adminList.body.data.notifications.map((notification) => notification.type);
  report(
    adminList.status === 200 &&
      !adminListTypes.includes(NOTIFICATION_TYPES.SHIPMENT_ASSIGNED) &&
      !adminListTypes.includes(NOTIFICATION_TYPES.SHIPMENT_CREATED),
    "admin's GET /api/notifications list contains none of the dispatcher's notifications"
  );
  const adminListWithRecipient = await request(baseUrl, `/api/notifications?recipient=${dispatcherA._id}`, {
    method: "GET",
    token: adminToken,
  });
  report(
    adminListWithRecipient.status === 200 &&
      adminListWithRecipient.body.data.notifications.some(
        (notification) =>
          notification.type === NOTIFICATION_TYPES.SHIPMENT_ASSIGNED &&
          String(notification.recipient._id || notification.recipient) === String(dispatcherA._id)
      ),
    "admin can still explicitly filter another user's notifications via ?recipient (capability kept)"
  );

  // ------------------------------------------------------------------
  console.log("\n3. Recipient isolation for Dispatcher B");
  report(
    (await countNotifications({ recipient: dispatcherB._id })) === 0,
    "Dispatcher B has ZERO notification documents in MongoDB"
  );
  report(
    (await countNotifications({ recipient: dispatcherB._id, type: NOTIFICATION_TYPES.SHIPMENT_ASSIGNED })) === 0,
    "Dispatcher B has zero Shipment Assigned notifications"
  );

  // ------------------------------------------------------------------
  console.log("\n4. Existing Timeline assignment flow (POST /timeline/dispatcher)");
  const beforeTimelineB = eventsB.length;
  const beforeTimelineAdmin = eventsAdmin.length;
  const timelineAssign = await request(baseUrl, "/api/timeline/dispatcher", {
    token: adminToken,
    body: { shipmentId: unassignedId, dispatcherId: dispatcherA._id },
  });
  report(timelineAssign.status === 200, "timeline dispatcher assignment succeeded (200)");
  const timelineNotif = await countNotifications({
    type: NOTIFICATION_TYPES.TIMELINE_EVENT,
    relatedShipment: unassignedId,
    recipient: dispatcherA._id,
  });
  report(timelineNotif === 1, "timeline assignment produced one notification for the new dispatcher");
  report(
    (await countNotifications({ relatedShipment: unassignedId, recipient: adminUser._id })) === 0,
    "timeline assignment created no notification for the admin"
  );
  await settle();
  report(eventsA.some((event) => event.title === "Timeline Event"), "notification:new delivered the timeline event to Dispatcher A");
  report(eventsB.length === beforeTimelineB, "timeline assignment did NOT reach Dispatcher B");
  report(eventsAdmin.length === beforeTimelineAdmin, "timeline assignment did NOT reach the admin");

  // ------------------------------------------------------------------
  console.log("\n5. Existing reassignment flow");
  const beforeReassignA = eventsA.length;
  const beforeReassignAdmin = eventsAdmin.length;
  const reassign = await request(baseUrl, "/api/timeline/dispatcher", {
    token: adminToken,
    body: { shipmentId: unassignedId, dispatcherId: dispatcherB._id },
  });
  report(reassign.status === 200, "timeline reassignment succeeded (200)");
  const reassignNotifB = await countNotifications({
    type: NOTIFICATION_TYPES.TIMELINE_EVENT,
    relatedShipment: unassignedId,
    recipient: dispatcherB._id,
  });
  report(reassignNotifB === 1, "reassignment notified the NEW dispatcher (B)");
  report(
    (await countNotifications({ type: NOTIFICATION_TYPES.TIMELINE_EVENT, relatedShipment: unassignedId, recipient: dispatcherA._id })) === 1,
    "previous dispatcher (A) received no additional notification"
  );
  report(
    (await countNotifications({ relatedShipment: unassignedId, recipient: adminUser._id })) === 0,
    "reassignment created no notification for the admin"
  );
  await settle();
  report(eventsB.some((event) => event.title === "Timeline Event"), "notification:new delivered the reassignment to Dispatcher B");
  report(eventsA.length === beforeReassignA, "reassignment did NOT notify the previous dispatcher (A)");
  report(eventsAdmin.length === beforeReassignAdmin, "reassignment did NOT notify the admin");

  // ------------------------------------------------------------------
  console.log("\n6. AI alert regression (Phase 9 Part 4 pipeline)");
  const beforeAiA = eventsA.length;
  const leanShipment = await Shipment.findById(assignedId).lean();
  const first = await aiAlertService.maybeRaiseHighRiskAlert({
    shipment: leanShipment,
    prediction: { risk: "High", confidence: 0.87 },
    actingUser: adminUser,
  });
  report(first.raised === true, "high-risk analysis raises an alert");
  report(
    Array.isArray(first.notifications) && first.notifications.length === 2,
    "one AI Alert per recipient (assigned dispatcher + creator)"
  );
  const aiCount = await countNotifications({ type: NOTIFICATION_TYPES.AI_ALERT, relatedShipment: assignedId });
  report(aiCount === 2, "AI Alert notifications persisted in MongoDB");
  const aiRecipients = (await Notification.find({ type: NOTIFICATION_TYPES.AI_ALERT, relatedShipment: assignedId }).lean())
    .map((notification) => String(notification.recipient))
    .sort();
  report(
    JSON.stringify(aiRecipients) === JSON.stringify([String(adminUser._id), String(dispatcherA._id)].sort()),
    "AI Alert recipient targeting unchanged (dispatcher + creator only)"
  );
  await settle();
  report(
    eventsA.length === beforeAiA + 1 && eventsA[eventsA.length - 1].type === "AI Alert",
    "notification:new delivered the AI Alert to the online dispatcher"
  );

  const second = await aiAlertService.maybeRaiseHighRiskAlert({
    shipment: leanShipment,
    prediction: { risk: "High", confidence: 0.91 },
    actingUser: adminUser,
  });
  report(second.raised === false, "duplicate high-risk alert is still deduped (persisted window)");
  report(
    (await countNotifications({ type: NOTIFICATION_TYPES.AI_ALERT, relatedShipment: assignedId })) === 2,
    "no duplicate AI Alert notifications created"
  );

  // Admin still receives its own legitimate notifications (AI Alert targets
  // the creator too) — the fix must not strip the admin notification system.
  const adminAiAlerts = eventsAdmin.filter((event) => event.type === "AI Alert");
  report(adminAiAlerts.length >= 1, "admin still receives its own legitimate AI Alert notification");

  // ------------------------------------------------------------------
  console.log("\n7. Cleanup");
  socketAdmin.disconnect();
  socketA.disconnect();
  socketB.disconnect();
  await Notification.deleteMany({
    relatedShipment: { $in: [unassignedId, assignedId] },
  });
  await Shipment.deleteMany({ _id: { $in: [unassignedId, assignedId] } });
  await User.deleteMany({ _id: { $in: [adminUser._id, dispatcherA._id, dispatcherB._id] } });
  await closeSocketServer();
  await closeHttpServer(server);
  await mongoose.disconnect();
  report(true, "temp users, shipments, notifications removed; socket server + DB closed");
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
