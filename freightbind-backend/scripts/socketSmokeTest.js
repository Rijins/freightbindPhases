// Socket.IO smoke test — dev verification for Phase 7 Part 1.
//
// Usage:
//   1. Ensure MongoDB (MONGO_URI in freightbind-backend/.env) is reachable.
//   2. Ensure the 4 dev accounts exist (scripts/updateDevAccounts.js).
//   3. node scripts/socketSmokeTest.js
//
// The script boots its own Express + Socket.IO server on an ephemeral port,
// logs in with real dev accounts over REST, then verifies:
//   - single Socket.IO instance (singleton guard)
//   - valid token connects; missing / invalid / expired tokens rejected
//   - presence: user:online / user:offline with duplicate connections
//   - rooms: shipment join/leave (client) and service-level joins/leaves
//   - socketService: emitToUser / emitToRole / emitToRoles / emitToShipment
//     / broadcast, including cross-role isolation
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
const { SOCKET_EVENTS } = require("../constants/socketEvents");
const { ROLES } = require("../constants/roles");

const ACCOUNTS = {
    admin: { role: ROLES.ADMIN, email: "admin@freightbind.ai", password: "Admin@123" },
    dispatcher: { role: ROLES.CARRIER_DISPATCHER, email: "dispatcher@freightbind.ai", password: "Dispatcher@123" },
    hub: { role: ROLES.HUB_OPERATOR, email: "hub@freightbind.ai", password: "Hub@123" },
};

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

const waitFor = async (predicate, timeoutMs = 2000, intervalMs = 50) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        if (predicate()) return true;
        await sleep(intervalMs);
    }
    return predicate();
};

const listen = (server) =>
    new Promise((resolve) => {
        server.listen(0, "127.0.0.1", () => resolve(server.address().port));
    });

const closeHttpServer = (server) =>
    new Promise((resolve) => {
        server.close(resolve);
    });

const login = async (baseUrl, { email, password }) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const body = await response.json();
    if (!body.success) {
        throw new Error(`Login failed for ${email}: ${body.message}`);
    }
    return { user: body.data.user, token: body.data.token };
};

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

const attemptConnection = (baseUrl, token) =>
    new Promise((resolve) => {
        const socket = createClient(baseUrl, {
            auth: token ? { token } : undefined,
            transports: ["websocket", "polling"],
            reconnection: false,
            timeout: 5000,
        });
        const done = (result) => {
            socket.close();
            resolve(result);
        };
        socket.on("connect", () => done({ connected: true }));
        socket.on("connect_error", (error) =>
            done({ connected: false, message: error.message, code: error.data && error.data.code })
        );
    });

const createEventCollector = (socket) => {
    const collected = {
        online: [],
        offline: [],
        shipmentUpdated: [],
        shipmentAssigned: [],
        systemAlert: [],
        notification: [],
        timelineUpdated: [],
        roomError: [],
    };
    socket.on(SOCKET_EVENTS.USER_ONLINE, (payload) => collected.online.push(payload));
    socket.on(SOCKET_EVENTS.USER_OFFLINE, (payload) => collected.offline.push(payload));
    socket.on(SOCKET_EVENTS.SHIPMENT_UPDATED, (payload) => collected.shipmentUpdated.push(payload));
    socket.on(SOCKET_EVENTS.SHIPMENT_ASSIGNED, (payload) => collected.shipmentAssigned.push(payload));
    socket.on(SOCKET_EVENTS.SYSTEM_ALERT, (payload) => collected.systemAlert.push(payload));
    socket.on(SOCKET_EVENTS.NOTIFICATION, (payload) => collected.notification.push(payload));
    socket.on(SOCKET_EVENTS.TIMELINE_UPDATED, (payload) => collected.timelineUpdated.push(payload));
    socket.on(SOCKET_EVENTS.ROOM_ERROR, (payload) => collected.roomError.push(payload));
    return collected;
};

const hasSequence = (events, sequence) =>
    events.some((event) => event && event.sequence === sequence);

const run = async () => {
    console.log("=== FreightBind AI Socket.IO smoke test ===\n");

    await connectDB();

    const server = http.createServer(app);
    const io = initSocket(server);
    const baseUrl = `http://127.0.0.1:${await listen(server)}`;
    console.log(`Test server listening on ${baseUrl}\n`);

    // ------------------------------------------------------------------
    // 1. Single instance
    // ------------------------------------------------------------------
    console.log("1. Singleton guard");
    report(initSocket(server) === io, "initSocket returns the same instance on second call");
    report(io !== null, "Socket.IO instance exists");

    // ------------------------------------------------------------------
    // 2. Login
    // ------------------------------------------------------------------
    console.log("\n2. REST login (dev accounts)");
    const admin = await login(baseUrl, ACCOUNTS.admin);
    const dispatcher = await login(baseUrl, ACCOUNTS.dispatcher);
    const hub = await login(baseUrl, ACCOUNTS.hub);
    report(true, "admin / dispatcher / hub logged in");

    const dispatcherId = String(dispatcher.user._id);
    const hubId = String(hub.user._id);

    // ------------------------------------------------------------------
    // 3. Handshake authentication
    // ------------------------------------------------------------------
    console.log("\n3. Handshake authentication");
    const missing = await attemptConnection(baseUrl, null);
    report(!missing.connected && missing.code === "MISSING_TOKEN", "missing token rejected (connect_error)");

    const invalid = await attemptConnection(baseUrl, "not-a-real-token");
    report(!invalid.connected && invalid.code === "INVALID_TOKEN", "invalid token rejected (connect_error)");

    const expiredToken = jwt.sign(
        { id: admin.user._id, role: admin.user.role },
        process.env.JWT_SECRET,
        { expiresIn: -10 }
    );
    const expired = await attemptConnection(baseUrl, expiredToken);
    report(!expired.connected && expired.code === "EXPIRED_TOKEN", "expired token rejected (connect_error)");

    // ------------------------------------------------------------------
    // 4. Connect clients + presence
    // ------------------------------------------------------------------
    console.log("\n4. Connections and presence");
    const adminSocket = await connectClient(baseUrl, admin.token);
    const adminEvents = createEventCollector(adminSocket);

    const dispatcherSocketA = await connectClient(baseUrl, dispatcher.token);
    const dispatcherEventsA = createEventCollector(dispatcherSocketA);

    const dispatcherSocketB = await connectClient(baseUrl, dispatcher.token);
    const dispatcherEventsB = createEventCollector(dispatcherSocketB);

    const hubSocket = await connectClient(baseUrl, hub.token);
    const hubEvents = createEventCollector(hubSocket);

    await settle();
    report(true, "admin + dispatcher (x2) + hub connected");

    const dispatcherOnlineEvents = adminEvents.online.filter((e) => e.userId === dispatcherId);
    const hubOnlineEvents = adminEvents.online.filter((e) => e.userId === hubId);
    report(dispatcherOnlineEvents.length === 1, "user:online fired once for dispatcher despite 2 sockets");
    report(hubOnlineEvents.length === 1, "user:online fired once for hub");

    // ------------------------------------------------------------------
    // 5. Client room requests (shipment rooms only)
    // ------------------------------------------------------------------
    console.log("\n5. Client room requests");
    const shipmentRoom = `shipment:${dispatcherId}`;

    dispatcherSocketA.emit(SOCKET_EVENTS.ROOM_JOIN, shipmentRoom);
    hubSocket.emit(SOCKET_EVENTS.ROOM_JOIN, shipmentRoom);
    adminSocket.emit(SOCKET_EVENTS.ROOM_JOIN, `user:${dispatcherId}`);
    adminSocket.emit(SOCKET_EVENTS.ROOM_JOIN, "shipment:not-a-valid-id");
    await settle();
    report(adminEvents.roomError.length === 2, "client cannot join user rooms or malformed shipment rooms (room:error x2)");

    // ------------------------------------------------------------------
    // 6. socketService emits + cross-role isolation
    // ------------------------------------------------------------------
    console.log("\n6. socketService emits");
    socketService.emitToShipment(dispatcherId, SOCKET_EVENTS.SHIPMENT_UPDATED, { sequence: 1 });
    await settle();
    report(hasSequence(dispatcherEventsA.shipmentUpdated, 1), "emitToShipment reached dispatcher socket A");
    report(hasSequence(hubEvents.shipmentUpdated, 1), "emitToShipment reached hub (joined room)");
    report(!hasSequence(adminEvents.shipmentUpdated, 1), "emitToShipment did NOT reach non-member admin");

    socketService.emitToUser(hubId, SOCKET_EVENTS.NOTIFICATION, { sequence: 2 });
    await settle();
    report(hasSequence(hubEvents.notification, 2), "emitToUser reached hub");
    report(!hasSequence(dispatcherEventsA.notification, 2), "emitToUser did NOT reach other users");

    socketService.emitToRole(ROLES.CARRIER_DISPATCHER, SOCKET_EVENTS.SHIPMENT_ASSIGNED, { sequence: 3 });
    await settle();
    report(hasSequence(dispatcherEventsA.shipmentAssigned, 3), "emitToRole reached dispatcher A");
    report(hasSequence(dispatcherEventsB.shipmentAssigned, 3), "emitToRole reached dispatcher B (duplicate socket)");
    report(!hasSequence(hubEvents.shipmentAssigned, 3), "emitToRole did NOT reach hub");
    report(!hasSequence(adminEvents.shipmentAssigned, 3), "emitToRole did NOT reach admin");

    socketService.emitToRoles([ROLES.ADMIN, ROLES.HUB_OPERATOR], SOCKET_EVENTS.SYSTEM_ALERT, { sequence: 4 });
    await settle();
    report(hasSequence(adminEvents.systemAlert, 4), "emitToRoles reached admin");
    report(hasSequence(hubEvents.systemAlert, 4), "emitToRoles reached hub");
    report(!hasSequence(dispatcherEventsA.systemAlert, 4), "emitToRoles did NOT reach dispatcher");

    socketService.broadcast(SOCKET_EVENTS.TIMELINE_UPDATED, { sequence: 5 });
    await settle();
    report(
        [adminEvents, dispatcherEventsA, dispatcherEventsB, hubEvents].every((events) =>
            hasSequence(events.timelineUpdated, 5)
        ),
        "broadcast reached all connected clients"
    );

    // ------------------------------------------------------------------
    // 7. Service-level room management
    // ------------------------------------------------------------------
    console.log("\n7. Service-level room management");
    socketService.leaveAllRooms(dispatcherId);
    socketService.emitToShipment(dispatcherId, SOCKET_EVENTS.SHIPMENT_UPDATED, { sequence: 6 });
    await settle();
    report(hasSequence(hubEvents.shipmentUpdated, 6), "shipment emit still reached hub after dispatcher left all rooms");
    report(!hasSequence(dispatcherEventsA.shipmentUpdated, 6), "leaveAllRooms removed dispatcher from shipment room");

    socketService.joinRoom(dispatcherId, shipmentRoom);
    socketService.emitToShipment(dispatcherId, SOCKET_EVENTS.SHIPMENT_UPDATED, { sequence: 7 });
    await settle();
    report(hasSequence(dispatcherEventsA.shipmentUpdated, 7), "joinRoom re-added dispatcher; emit reached socket A again");

    socketService.leaveRoom(dispatcherId, shipmentRoom);
    socketService.emitToShipment(dispatcherId, SOCKET_EVENTS.SHIPMENT_UPDATED, { sequence: 8 });
    await settle();
    report(!hasSequence(dispatcherEventsA.shipmentUpdated, 8), "leaveRoom removed dispatcher from shipment room");

    // ------------------------------------------------------------------
    // 8. Presence on disconnect (duplicate connections)
    // ------------------------------------------------------------------
    console.log("\n8. Presence on disconnect");
    dispatcherSocketA.disconnect();
    await settle();
    report(
        adminEvents.offline.filter((e) => e.userId === dispatcherId).length === 0,
        "no user:offline while a dispatcher socket remains"
    );

    dispatcherSocketB.disconnect();
    await settle();
    report(
        adminEvents.offline.filter((e) => e.userId === dispatcherId).length === 1,
        "user:offline fired once after last dispatcher socket disconnected"
    );
    report(socketService.isUserOnline(dispatcherId) === false, "presence map no longer tracks dispatcher");

    hubSocket.disconnect();
    await settle();
    report(adminEvents.offline.filter((e) => e.userId === hubId).length === 1, "user:offline fired for hub");
    report(socketService.isUserOnline(hubId) === false, "presence map no longer tracks hub");
    report(socketService.isUserOnline(admin.user._id) === true, "admin still tracked as online");

    // ------------------------------------------------------------------
    // 9. Cleanup
    // ------------------------------------------------------------------
    console.log("\n9. Cleanup");
    adminSocket.disconnect();
    await settle();
    await closeSocketServer();
    await closeHttpServer(server);
    await mongoose.disconnect();
    report(true, "socket server closed and DB disconnected");
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
