// System Announcements smoke test (dev) — Phase 9 Part 7.
//
// Usage:
//   1. Ensure MongoDB (MONGO_URI in freightbind-backend/.env) is reachable.
//   2. node scripts/announcementSmokeTest.js
//
// The script boots its own Express + Socket.IO server on an ephemeral port,
// creates temporary users (admin, director, dispatcher — all cleaned up
// afterwards), then verifies:
//   - Admin can create (201), update (200), activate/deactivate, list,
//     and delete announcements
//   - Non-admins (Logistics Director) get 403 on every management operation
//   - Activating an announcement fans out one per-recipient Notification row
//     (type "System Announcement") to every active user through the existing
//     notification service, and `notification:new` reaches online users'
//     user rooms through the existing Socket.IO pipeline
//   - Creating an announcement with status "active" publishes immediately
//   - Authenticated users only ever see active announcements inside their
//     date window — inactive, expired (endDate in the past), and future
//     (startDate ahead) announcements are never exposed as active
//   - GET /:id hides non-visible announcements from non-admins (404)
//   - Invalid announcement IDs return the standard 422 validation envelope
//   - Authentication is required (401 without a token)
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
const Notification = require("../models/Notification");
const Announcement = require("../models/Announcement");

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

const countFanOutNotifications = (recipientIds) =>
    Notification.countDocuments({
        type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
        recipient: { $in: recipientIds },
    });

let adminUser;
let directorUser;
let dispatcherUser;

const run = async () => {
    console.log("=== FreightBind system announcements smoke test ===\n");

    await connectDB();

    adminUser = await User.create({
        fullName: "Announce Smoke Admin",
        email: `announce-admin-${Date.now()}@freightbind.ai`,
        password: "Admin@123",
        role: ROLES.ADMIN,
        status: "active",
    });
    directorUser = await User.create({
        fullName: "Announce Smoke Director",
        email: `announce-director-${Date.now()}@freightbind.ai`,
        password: "Director@123",
        role: ROLES.LOGISTICS_DIRECTOR,
        status: "active",
    });
    dispatcherUser = await User.create({
        fullName: "Announce Smoke Dispatcher",
        email: `announce-dispatcher-${Date.now()}@freightbind.ai`,
        password: "Dispatcher@123",
        role: ROLES.CARRIER_DISPATCHER,
        status: "active",
    });
    const recipientIds = [adminUser._id, directorUser._id, dispatcherUser._id];

    const server = http.createServer(app);
    const io = initSocket(server);
    const baseUrl = `http://127.0.0.1:${await listen(server)}`;
    console.log(`Test server listening on ${baseUrl}\n`);

    const adminToken = signToken(adminUser._id, adminUser.role);
    const directorToken = signToken(directorUser._id, directorUser.role);
    const dispatcherToken = signToken(dispatcherUser._id, dispatcherUser.role);

    const socketAdmin = await connectClient(baseUrl, adminToken);
    const socketDispatcher = await connectClient(baseUrl, dispatcherToken);
    const eventsAdmin = [];
    const eventsDispatcher = [];
    socketAdmin.on(SOCKET_EVENTS.NOTIFICATION, (payload) => eventsAdmin.push(payload));
    socketDispatcher.on(SOCKET_EVENTS.NOTIFICATION, (payload) => eventsDispatcher.push(payload));
    await settle();

    // ------------------------------------------------------------------
    console.log("1. Admin creates an announcement (inactive draft)");
    const created = await request(baseUrl, "/api/announcements", {
        token: adminToken,
        body: {
            title: "Scheduled maintenance",
            message: "Planned maintenance on Saturday 02:00–04:00 UTC.",
            priority: "High",
            status: "inactive",
        },
    });
    report(created.status === 201, "admin POST /api/announcements -> 201");
    const draftId = created.body.data.announcement._id;
    report(created.body.data.announcement.status === "inactive", "draft created as inactive");
    report(
        created.body.data.announcement.priority === "High",
        "priority persisted from the shared priority enum"
    );
    report(
        (await countFanOutNotifications(recipientIds)) === 0,
        "inactive draft fans out NO notifications"
    );

    // ------------------------------------------------------------------
    console.log("\n2. Non-admin cannot create");
    const forbiddenCreate = await request(baseUrl, "/api/announcements", {
        token: directorToken,
        body: { title: "Rogue", message: "Rogue announcement" },
    });
    report(forbiddenCreate.status === 403, "Logistics Director POST -> 403");
    report(
        forbiddenCreate.body.message === "Forbidden: insufficient role permissions",
        "403 carries the standard RBAC message"
    );

    // ------------------------------------------------------------------
    console.log("\n3. Admin updates; non-admin cannot");
    const updated = await request(baseUrl, `/api/announcements/${draftId}`, {
        method: "PUT",
        token: adminToken,
        body: { message: "Rescheduled maintenance on Sunday 02:00–04:00 UTC." },
    });
    report(updated.status === 200, "admin PUT -> 200");
    report(updated.body.data.announcement.message.startsWith("Rescheduled"), "message updated");
    const forbiddenUpdate = await request(baseUrl, `/api/announcements/${draftId}`, {
        method: "PUT",
        token: directorToken,
        body: { title: "Rogue" },
    });
    report(forbiddenUpdate.status === 403, "Logistics Director PUT -> 403");

    // ------------------------------------------------------------------
    console.log("\n4. Activate -> fan-out + realtime delivery");
    const beforeActivate = eventsAdmin.length + eventsDispatcher.length;
    const activated = await request(baseUrl, `/api/announcements/${draftId}/status`, {
        method: "PATCH",
        token: adminToken,
        body: { status: "active" },
    });
    report(activated.status === 200, "admin PATCH /:id/status -> 200");
    report(activated.body.data.announcement.status === "active", "announcement is now active");
    report(
        (await countFanOutNotifications(recipientIds)) === 3,
        "activation fans out exactly ONE notification per active user (3 recipients)"
    );
    const fanOutDocs = await Notification.find({
        type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
        recipient: { $in: recipientIds },
    }).lean();
    report(
        fanOutDocs.every(
            (doc) => doc.title === "Scheduled maintenance" && doc.priority === "High"
        ),
        "fan-out notifications reuse the announcement title and priority"
    );
    await settle();
    report(
        eventsAdmin.length + eventsDispatcher.length === beforeActivate + 2,
        "notification:new reached the two online users' user rooms"
    );
    report(
        eventsAdmin.some((event) => event.type === "System Announcement") &&
            eventsDispatcher.some((event) => event.type === "System Announcement"),
        "socket payload type is \"System Announcement\""
    );

    const deactivated = await request(baseUrl, `/api/announcements/${draftId}/status`, {
        method: "PATCH",
        token: adminToken,
        body: { status: "inactive" },
    });
    report(deactivated.status === 200 && deactivated.body.data.announcement.status === "inactive", "admin can deactivate");
    report(
        (await countFanOutNotifications(recipientIds)) === 3,
        "deactivating does NOT fan out again"
    );

    // ------------------------------------------------------------------
    console.log("\n5. Creating as active publishes immediately");
    const createdActive = await request(baseUrl, "/api/announcements", {
        token: adminToken,
        body: { title: "Immediate notice", message: "Immediate notice message.", status: "active" },
    });
    report(createdActive.status === 201, "admin creates an active announcement -> 201");
    const activeId = createdActive.body.data.announcement._id;
    report(
        (await countFanOutNotifications(recipientIds)) === 6,
        "creating with status active fans out immediately (3 more notifications)"
    );

    // ------------------------------------------------------------------
    console.log("\n6. Expired and future announcements");
    const expired = await request(baseUrl, "/api/announcements", {
        token: adminToken,
        body: {
            title: "Expired notice",
            message: "This one ended yesterday.",
            endDate: new Date(Date.now() - 86400000).toISOString(),
        },
    });
    report(expired.status === 201, "admin creates an expired-scheduled announcement (201)");
    const expiredId = expired.body.data.announcement._id;

    const future = await request(baseUrl, "/api/announcements", {
        token: adminToken,
        body: {
            title: "Future notice",
            message: "This one starts tomorrow.",
            status: "active",
            startDate: new Date(Date.now() + 86400000).toISOString(),
        },
    });
    report(future.status === 201, "admin creates a future-scheduled announcement (201)");
    const futureId = future.body.data.announcement._id;

    // ------------------------------------------------------------------
    console.log("\n7. Visibility — authenticated users see only active, in-window announcements");
    const userList = await request(baseUrl, "/api/announcements", {
        method: "GET",
        token: dispatcherToken,
    });
    const userListIds = userList.body.data.announcements.map((announcement) => announcement._id);
    report(userList.status === 200, "authenticated user GET /api/announcements -> 200");
    report(
        userListIds.includes(activeId) && !userListIds.includes(draftId),
        "active in-window announcement visible; deactivated announcement hidden"
    );
    report(
        !userListIds.includes(expiredId),
        "expired announcement is NOT exposed to users"
    );
    report(
        !userListIds.includes(futureId),
        "future-scheduled announcement is NOT exposed to users (startDate ahead)"
    );
    report(
        (await request(baseUrl, "/api/announcements", { method: "GET", token: dispatcherToken, })).status === 200,
        "user list still returns 200 while hidden items exist"
    );

    // ------------------------------------------------------------------
    console.log("\n8. Admin sees everything; status filter works");
    const adminList = await request(baseUrl, "/api/announcements", {
        method: "GET",
        token: adminToken,
    });
    const adminListIds = adminList.body.data.announcements.map((announcement) => announcement._id);
    report(adminList.status === 200, "admin GET /api/announcements -> 200");
    report(
        [draftId, activeId, expiredId, futureId].every((id) => adminListIds.includes(id)),
        "admin sees all announcements including inactive/expired/future"
    );
    const adminActiveFilter = await request(baseUrl, "/api/announcements?status=active", {
        method: "GET",
        token: adminToken,
    });
    const adminActiveIds = adminActiveFilter.body.data.announcements.map((announcement) => announcement._id);
    report(
        adminActiveIds.includes(activeId) && adminActiveIds.includes(futureId) && !adminActiveIds.includes(draftId),
        "admin ?status=active filter returns only active announcements"
    );

    // ------------------------------------------------------------------
    console.log("\n9. Detail endpoint respects visibility");
    const detailActive = await request(baseUrl, `/api/announcements/${activeId}`, {
        method: "GET",
        token: dispatcherToken,
    });
    report(detailActive.status === 200, "user can read an active announcement detail (200)");
    const detailInactive = await request(baseUrl, `/api/announcements/${draftId}`, {
        method: "GET",
        token: dispatcherToken,
    });
    report(detailInactive.status === 404, "inactive announcement detail hidden from users (404)");
    const detailExpired = await request(baseUrl, `/api/announcements/${expiredId}`, {
        method: "GET",
        token: dispatcherToken,
    });
    report(detailExpired.status === 404, "expired announcement detail hidden from users (404)");
    const detailAdmin = await request(baseUrl, `/api/announcements/${draftId}`, {
        method: "GET",
        token: adminToken,
    });
    report(detailAdmin.status === 200, "admin can still read the inactive detail (200)");
    const detailBadId = await request(baseUrl, "/api/announcements/not-a-mongo-id", {
        method: "GET",
        token: adminToken,
    });
    report(detailBadId.status === 422, "invalid announcement ID -> 422 (standard validation envelope)");
    report(
        Array.isArray(detailBadId.body.errors) && detailBadId.body.errors.length > 0,
        "422 includes the errors array"
    );

    // ------------------------------------------------------------------
    console.log("\n10. Delete — admin only");
    const forbiddenDelete = await request(baseUrl, `/api/announcements/${activeId}`, {
        method: "DELETE",
        token: directorToken,
    });
    report(forbiddenDelete.status === 403, "Logistics Director DELETE -> 403");
    const deleted = await request(baseUrl, `/api/announcements/${activeId}`, {
        method: "DELETE",
        token: adminToken,
    });
    report(deleted.status === 200, "admin DELETE -> 200");
    const afterDelete = await request(baseUrl, `/api/announcements/${activeId}`, {
        method: "GET",
        token: adminToken,
    });
    report(afterDelete.status === 404, "deleted announcement detail -> 404");
    report(
        (await Announcement.countDocuments({ _id: activeId })) === 0,
        "announcement record removed from MongoDB"
    );

    // ------------------------------------------------------------------
    console.log("\n11. Authentication is required");
    const noToken = await request(baseUrl, "/api/announcements", { method: "GET" });
    report(noToken.status === 401, "GET /api/announcements without a token -> 401");

    // ------------------------------------------------------------------
    console.log("\n12. Cleanup");
    socketAdmin.disconnect();
    socketDispatcher.disconnect();
    await Notification.deleteMany({
        type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
        recipient: { $in: recipientIds },
    });
    await Announcement.deleteMany({
        createdBy: { $in: [adminUser._id] },
    });
    await User.deleteMany({ _id: { $in: recipientIds } });
    await closeSocketServer();
    await closeHttpServer(server);
    await mongoose.disconnect();
    report(true, "temp users, announcements, notifications removed; socket server + DB closed");
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
