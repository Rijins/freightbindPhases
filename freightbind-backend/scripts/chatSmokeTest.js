// Chat realtime + notification smoke test (dev) — Phase 9.
//
// Usage:
//   1. Ensure MongoDB (MONGO_URI in freightbind-backend/.env) is reachable.
//   2. node scripts/chatSmokeTest.js
//
// The script boots its own Express + Socket.IO server on an ephemeral port,
// creates temporary users (admin, dispatchers A/B, hub operators A/B), two
// temp hubs and a shipment (assigned to Dispatcher A, hub = Hub A), all
// cleaned up afterwards, then verifies:
//   - Dispatcher A -> Hub Operator A: chat:message delivered to Hub A's
//     operator only (exactly once), and a "Chat Message" notification
//     persisted + delivered (notification:new) to that operator only, with
//     an authoritative notification:count update
//   - Hub Operator A -> Dispatcher A: the reverse direction, dispatcher only
//   - recipient isolation: unrelated Dispatcher B / Hub Operator B / Admin
//     receive NO chat:message, NO notification:new, and have ZERO chat
//     notification documents (never a role/broadcast emit)
//   - authorization regression: unassigned dispatcher / foreign-hub operator
//     / admin all get 403 on POST /api/chat
//   - duplicate protection: one send => exactly one chat message, exactly
//     one notification (DB + socket)
//   - persistence: messages and notifications survive in MongoDB; marking a
//     chat notification read decrements the unread count realtime
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
const { SOCKET_EVENTS } = require("../constants/socketEvents");
const { NOTIFICATION_TYPES } = require("../constants/notificationTypes");
const { ROLES } = require("../constants/roles");
const User = require("../models/User");
const Hub = require("../models/Hub");
const Shipment = require("../models/Shipment");
const ChatMessage = require("../models/ChatMessage");
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

const createCollector = (socket) => {
    const chatMessages = [];
    const notifications = [];
    const counts = [];
    const reads = [];
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (payload) => chatMessages.push(payload));
    socket.on(SOCKET_EVENTS.NOTIFICATION, (payload) => notifications.push(payload));
    socket.on(SOCKET_EVENTS.NOTIFICATION_COUNT, (payload) => counts.push(payload));
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, (payload) => reads.push(payload));
    return { chatMessages, notifications, counts, reads };
};

const chatNotifications = (events) => events.filter((event) => event.type === NOTIFICATION_TYPES.CHAT_MESSAGE);

const lastCount = (collector) => {
    const entry = collector.counts[collector.counts.length - 1];
    return entry && typeof entry.count === "number" ? entry.count : null;
};

const run = async () => {
    console.log("=== FreightBind chat realtime + notification smoke test ===\n");

    await connectDB();

    const admin = await User.create({
        fullName: "Chat Smoke Admin",
        email: `chat-admin-${Date.now()}@freightbind.ai`,
        password: "Admin@123",
        role: ROLES.ADMIN,
        status: "active",
    });
    const dispatcherA = await User.create({
        fullName: "Chat Smoke Dispatcher A",
        email: `chat-dispatcher-a-${Date.now()}@freightbind.ai`,
        password: "Dispatcher@123",
        role: ROLES.CARRIER_DISPATCHER,
        status: "active",
    });
    const dispatcherB = await User.create({
        fullName: "Chat Smoke Dispatcher B",
        email: `chat-dispatcher-b-${Date.now()}@freightbind.ai`,
        password: "Dispatcher@123",
        role: ROLES.CARRIER_DISPATCHER,
        status: "active",
    });

    const hubA = await Hub.create({
        name: `Chat Smoke Hub A ${Date.now()}`,
        location: "Hub A City",
        type: "Port",
        status: "active",
    });
    const hubB = await Hub.create({
        name: `Chat Smoke Hub B ${Date.now()}`,
        location: "Hub B City",
        type: "Warehouse",
        status: "active",
    });
    const hubOpA = await User.create({
        fullName: "Chat Smoke Hub Operator A",
        email: `chat-hub-op-a-${Date.now()}@freightbind.ai`,
        password: "Hub@123",
        role: ROLES.HUB_OPERATOR,
        status: "active",
        hub: hubA._id,
    });
    const hubOpB = await User.create({
        fullName: "Chat Smoke Hub Operator B",
        email: `chat-hub-op-b-${Date.now()}@freightbind.ai`,
        password: "Hub@123",
        role: ROLES.HUB_OPERATOR,
        status: "active",
        hub: hubB._id,
    });

    const server = http.createServer(app);
    const io = initSocket(server);
    const baseUrl = `http://127.0.0.1:${await listen(server)}`;
    console.log(`Test server listening on ${baseUrl}\n`);

    const adminToken = signToken(admin._id, admin.role);
    const tokenA = signToken(dispatcherA._id, dispatcherA.role);
    const tokenB = signToken(dispatcherB._id, dispatcherB.role);
    const tokenHubA = signToken(hubOpA._id, hubOpA.role);
    const tokenHubB = signToken(hubOpB._id, hubOpB.role);

    // ------------------------------------------------------------------
    console.log("1. Shipment setup (assigned Dispatcher A, hub = Hub A)");
    const created = await request(baseUrl, "/api/v1/shipments", {
        token: adminToken,
        body: {
            title: "Chat smoke shipment",
            cargoType: "Electronics",
            shipmentType: "Full Truckload",
            origin: "Chicago, IL",
            destination: "Dallas, TX",
            priority: "High",
            assignedDispatcher: dispatcherA._id,
            hub: hubA._id,
        },
    });
    report(created.status === 201, "shipment created with dispatcher + hub (201)");
    const shipmentId = String(created.body.data.shipment._id);
    const shipmentHumanId = created.body.data.shipment.shipmentId;

    // ------------------------------------------------------------------
    console.log("\n2. Connect all sockets");
    const socketAdmin = await connectClient(baseUrl, adminToken);
    const socketA = await connectClient(baseUrl, tokenA);
    const socketB = await connectClient(baseUrl, tokenB);
    const socketHubA = await connectClient(baseUrl, tokenHubA);
    const socketHubB = await connectClient(baseUrl, tokenHubB);
    const adminEvents = createCollector(socketAdmin);
    const eventsA = createCollector(socketA);
    const eventsB = createCollector(socketB);
    const eventsHubA = createCollector(socketHubA);
    const eventsHubB = createCollector(socketHubB);
    await settle();
    report(true, "admin / dispatcher A+B / hub operators A+B connected");

    // ------------------------------------------------------------------
    console.log("\n3. Dispatcher A -> Hub Operator A (chat + notification)");
    const fromDispatcher = "Realtime check from Dispatcher A";
    const sent1 = await request(baseUrl, `/api/chat/shipments/${shipmentId}/messages`, {
        token: tokenA,
        body: { message: fromDispatcher },
    });
    report(sent1.status === 201, "dispatcher A sent a chat message (201)");
    await settle();

    report(
        eventsHubA.chatMessages.length === 1 &&
            String(eventsHubA.chatMessages[0].shipmentId) === shipmentId &&
            String(eventsHubA.chatMessages[0].message.sender._id) === String(dispatcherA._id) &&
            eventsHubA.chatMessages[0].message.message === fromDispatcher,
        "chat:message delivered to Hub Operator A exactly once (correct payload)"
    );
    report(eventsHubA.chatMessages.length === 1, "chat:message NOT duplicated for Hub Operator A");
    report(eventsHubB.chatMessages.length === 0, "chat:message did NOT reach Hub Operator B (foreign hub)");
    report(eventsB.chatMessages.length === 0, "chat:message did NOT reach unrelated Dispatcher B");
    report(adminEvents.chatMessages.length === 0, "chat:message did NOT reach Admin");
    report(
        eventsA.chatMessages.length === 1 &&
            String(eventsA.chatMessages[0].message.sender._id) === String(dispatcherA._id),
        "sender Dispatcher A received their own echo once (existing behavior, deduped by the UI)"
    );

    const chatNotifsHubA = chatNotifications(eventsHubA.notifications);
    report(
        chatNotifsHubA.length === 1 &&
            chatNotifsHubA[0].title === "New Chat Message" &&
            chatNotifsHubA[0].message === `Carrier Dispatcher sent you a message on shipment ${shipmentHumanId}.`,
        "notification:new (Chat Message) delivered to Hub Operator A with canonical wording"
    );
    report(chatNotifications(eventsHubB.notifications).length === 0, "chat notification did NOT reach Hub Operator B");
    report(chatNotifications(eventsB.notifications).length === 0, "chat notification did NOT reach Dispatcher B");
    report(chatNotifications(adminEvents.notifications).length === 0, "chat notification did NOT reach Admin");

    const hubAChatDocs = await Notification.find({
        type: NOTIFICATION_TYPES.CHAT_MESSAGE,
        relatedShipment: shipmentId,
    }).lean();
    report(
        hubAChatDocs.length === 1 &&
            String(hubAChatDocs[0].recipient) === String(hubOpA._id) &&
            String(hubAChatDocs[0].sender) === String(dispatcherA._id) &&
            hubAChatDocs[0].isRead === false,
        "exactly ONE Chat Message notification persisted for Hub Operator A (unread)"
    );

    const unreadHubA = await Notification.countDocuments({ recipient: hubOpA._id, isRead: false });
    report(lastCount(eventsHubA) === unreadHubA, `notification:count reached Hub Operator A (count = ${unreadHubA})`);

    // ------------------------------------------------------------------
    console.log("\n4. Hub Operator A -> Dispatcher A (reverse direction)");
    const fromHubA = "Realtime reply from Hub Operator A";
    const beforeChatA = eventsA.chatMessages.length;
    const sent2 = await request(baseUrl, `/api/chat/shipments/${shipmentId}/messages`, {
        token: tokenHubA,
        body: { message: fromHubA },
    });
    report(sent2.status === 201, "hub operator A sent a chat message (201)");
    await settle();

    const lastChatA = eventsA.chatMessages[eventsA.chatMessages.length - 1];
    report(
        eventsA.chatMessages.length === beforeChatA + 1 &&
            String(lastChatA.shipmentId) === shipmentId &&
            String(lastChatA.message.sender._id) === String(hubOpA._id) &&
            lastChatA.message.message === fromHubA,
        "chat:message delivered to Dispatcher A exactly once (correct payload)"
    );
    report(eventsA.chatMessages.length === beforeChatA + 1, "chat:message NOT duplicated for Dispatcher A");
    report(eventsHubA.chatMessages.length === 1, "sender (Hub Operator A) received no extra chat echo");

    const chatNotifsA = chatNotifications(eventsA.notifications);
    report(
        chatNotifsA.length === 1 &&
            chatNotifsA[0].message === `Hub Operator sent you a message on shipment ${shipmentHumanId}.`,
        "notification:new (Chat Message) delivered to Dispatcher A with canonical wording"
    );
    report(chatNotifications(eventsB.notifications).length === 0, "chat notification did NOT reach Dispatcher B");
    report(chatNotifications(adminEvents.notifications).length === 0, "chat notification did NOT reach Admin");

    const dispatcherChatDocs = await Notification.find({
        type: NOTIFICATION_TYPES.CHAT_MESSAGE,
        relatedShipment: shipmentId,
        recipient: dispatcherA._id,
    }).lean();
    report(
        dispatcherChatDocs.length === 1 &&
            String(dispatcherChatDocs[0].sender) === String(hubOpA._id) &&
            dispatcherChatDocs[0].isRead === false,
        "exactly ONE Chat Message notification persisted for Dispatcher A (unread)"
    );

    const unreadA = await Notification.countDocuments({ recipient: dispatcherA._id, isRead: false });
    report(lastCount(eventsA) === unreadA, `notification:count reached Dispatcher A (count = ${unreadA})`);

    // ------------------------------------------------------------------
    console.log("\n5. Unauthorized senders (authorization regression)");
    const foreignHub = await request(baseUrl, `/api/chat/shipments/${shipmentId}/messages`, {
        token: tokenHubB,
        body: { message: "should be rejected" },
    });
    const unassigned = await request(baseUrl, `/api/chat/shipments/${shipmentId}/messages`, {
        token: tokenB,
        body: { message: "should be rejected" },
    });
    const adminSend = await request(baseUrl, `/api/chat/shipments/${shipmentId}/messages`, {
        token: adminToken,
        body: { message: "should be rejected" },
    });
    report(foreignHub.status === 403, "Hub Operator B (foreign hub) blocked with 403");
    report(unassigned.status === 403, "unassigned Dispatcher B blocked with 403");
    report(adminSend.status === 403, "Admin blocked with 403");
    await settle();

    report(eventsHubB.chatMessages.length === 0, "rejected senders received no chat:message");
    report(chatNotifications(eventsHubB.notifications).length === 0, "rejected senders received no chat notification");
    report(eventsB.chatMessages.length === 0, "dispatcher B received no chat:message");
    report(chatNotifications(eventsB.notifications).length === 0, "dispatcher B received no chat notification");
    report(adminEvents.chatMessages.length === 0, "admin received no chat:message");
    report(chatNotifications(adminEvents.notifications).length === 0, "admin received no chat notification");
    report(
        (await Notification.countDocuments({
            type: NOTIFICATION_TYPES.CHAT_MESSAGE,
            recipient: { $in: [hubOpB._id, dispatcherB._id, admin._id] },
        })) === 0,
        "no Chat Message notification persisted for ANY unauthorized user"
    );

    // ------------------------------------------------------------------
    console.log("\n6. Persistence + duplicate protection");
    const messageCount = await ChatMessage.countDocuments({ shipment: shipmentId });
    report(messageCount === 2, "exactly 2 chat messages persisted in MongoDB (one per send)");
    const totalChatNotifs = await Notification.countDocuments({
        type: NOTIFICATION_TYPES.CHAT_MESSAGE,
        relatedShipment: shipmentId,
    });
    report(totalChatNotifs === 2, "exactly 2 chat notifications persisted (one per recipient send)");
    const fetched = await request(baseUrl, `/api/chat/shipments/${shipmentId}/messages`, {
        method: "GET",
        token: tokenA,
    });
    report(
        fetched.status === 200 && fetched.body.data.messages.length === 2,
        "GET messages returns both persisted messages (history unchanged)"
    );

    // ------------------------------------------------------------------
    console.log("\n7. Unread state: mark chat notification read");
    const markRead = await request(baseUrl, `/api/notifications/${dispatcherChatDocs[0]._id}/read`, {
        method: "PATCH",
        token: tokenA,
    });
    report(markRead.status === 200, "dispatcher A marked the chat notification read (200)");
    await settle();
    report(
        eventsA.reads.some((event) => String(event.id) === String(dispatcherChatDocs[0]._id)),
        "notification:read acknowledged on Dispatcher A's socket"
    );
    const unreadAAfter = await Notification.countDocuments({ recipient: dispatcherA._id, isRead: false });
    report(
        lastCount(eventsA) === unreadAAfter && unreadAAfter === unreadA - 1,
        `unread count decremented realtime (${unreadA} -> ${unreadAAfter})`
    );
    const readDoc = await Notification.findById(dispatcherChatDocs[0]._id).lean();
    report(readDoc.isRead === true && readDoc.deliveryStatus === "Read", "chat notification persisted as Read");

    // ------------------------------------------------------------------
    console.log("\n8. Cleanup");
    socketAdmin.disconnect();
    socketA.disconnect();
    socketB.disconnect();
    socketHubA.disconnect();
    socketHubB.disconnect();
    await ChatMessage.deleteMany({ shipment: shipmentId });
    await Notification.deleteMany({ relatedShipment: shipmentId });
    await Shipment.deleteMany({ _id: shipmentId });
    await Hub.deleteMany({ _id: { $in: [hubA._id, hubB._id] } });
    await User.deleteMany({
        _id: { $in: [admin._id, dispatcherA._id, dispatcherB._id, hubOpA._id, hubOpB._id] },
    });
    await closeSocketServer();
    await closeHttpServer(server);
    await mongoose.disconnect();
    report(true, "temp users, hubs, shipment, messages, notifications removed; socket server + DB closed");
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
