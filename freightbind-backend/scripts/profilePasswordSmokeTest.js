// Profile + Change Password smoke test (dev) — Phase 9 Part 7.
//
// Usage:
//   1. Ensure MongoDB (MONGO_URI in freightbind-backend/.env) is reachable.
//   2. node scripts/profilePasswordSmokeTest.js
//
// The script boots its own Express server on an ephemeral port, creates
// temporary users (all cleaned up afterwards), then verifies:
//   - GET /api/auth/me returns the authenticated user's own profile
//     (fullName, email, phone, role, status, createdAt) with NO password
//   - PUT /api/auth/update-profile updates only whitelisted fields
//     (fullName, phone) and ignores role/status injection attempts
//   - profile updates are scoped to the caller — other users are untouched
//   - PUT /api/auth/change-password succeeds with the correct current
//     password and the NEW password works on the next login
//   - wrong current password -> 401
//   - short new password -> 422 with the standard validation envelope
//   - no token -> 401
//   - no response ever contains a password field or a bcrypt hash
//   - no other user can be modified through any of these endpoints
//     (the endpoints carry no target-user parameter at all)
//
// Note: "confirm password" matching is enforced by the frontend form
// (react-hook-form + zod refine); the backend deliberately does not receive
// a confirmation field. That rule is covered by the frontend review, not
// this script.
//
// Exit code 0 = all checks passed, 1 = failures.

const path = require("path");
const http = require("http");

const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../app");
const connectDB = require("../config/db");
const { ROLES } = require("../constants/roles");
const User = require("../models/User");

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

// A response must never leak a password — neither a field nor a bcrypt hash.
const assertNoPasswordLeak = (label, ...responses) => {
    report(
        responses.every(
            (response) =>
                !JSON.stringify(response.body).includes('"password"') &&
                !JSON.stringify(response.body).includes("$2a$") &&
                !JSON.stringify(response.body).includes("$2b$")
        ),
        `${label} (no password field or hash in response)`
    );
};

let userA;
let userB;

const run = async () => {
    console.log("=== FreightBind profile + password smoke test ===\n");

    await connectDB();

    userA = await User.create({
        fullName: "Profile Smoke A",
        email: `profile-a-${Date.now()}@freightbind.ai`,
        password: "Password@123",
        role: ROLES.CARRIER_DISPATCHER,
        status: "active",
        phone: "+1 555 111 2222",
    });
    userB = await User.create({
        fullName: "Profile Smoke B",
        email: `profile-b-${Date.now()}@freightbind.ai`,
        password: "Password@456",
        role: ROLES.HUB_OPERATOR,
        status: "active",
    });

    const server = http.createServer(app);
    const baseUrl = `http://127.0.0.1:${await listen(server)}`;
    console.log(`Test server listening on ${baseUrl}\n`);

    const tokenA = signToken(userA._id, userA.role);
    const tokenB = signToken(userB._id, userB.role);

    // ------------------------------------------------------------------
    console.log("1. Retrieve own profile");
    const me = await request(baseUrl, "/api/auth/me", { method: "GET", token: tokenA });
    report(me.status === 200, "GET /api/auth/me returns 200 for an authenticated user");
    const meUser = me.body.data.user;
    report(meUser && meUser.fullName === "Profile Smoke A", "profile includes fullName");
    report(meUser && meUser.email === userA.email, "profile includes email");
    report(meUser && meUser.phone === "+1 555 111 2222", "profile includes phone");
    report(meUser && meUser.role === ROLES.CARRIER_DISPATCHER, "profile includes role");
    report(meUser && meUser.status === "active", "profile includes account status");
    report(meUser && Boolean(meUser.createdAt), "profile includes account creation timestamp");
    report(meUser && meUser._id === String(userA._id), "profile belongs to the authenticated user");
    assertNoPasswordLeak("profile response", me);

    // ------------------------------------------------------------------
    console.log("\n2. Update own profile (whitelisted fields only)");
    const updated = await request(baseUrl, "/api/auth/update-profile", {
        method: "PUT",
        token: tokenA,
        body: { fullName: "Profile Smoke A2", phone: "+1 555 333 4444" },
    });
    report(updated.status === 200, "PUT /api/auth/update-profile returns 200");
    report(updated.body.data.user.fullName === "Profile Smoke A2", "fullName updated");
    report(updated.body.data.user.phone === "+1 555 333 4444", "phone updated");
    assertNoPasswordLeak("update-profile response", updated);

    // ------------------------------------------------------------------
    console.log("\n3. Role / status injection attempts are ignored");
    const injected = await request(baseUrl, "/api/auth/update-profile", {
        method: "PUT",
        token: tokenA,
        body: { fullName: "Profile Smoke A3", role: ROLES.ADMIN, status: "inactive", email: "hijack@freightbind.ai" },
    });
    report(injected.status === 200, "profile update with role/status/email payload still returns 200");
    report(injected.body.data.user.role === ROLES.CARRIER_DISPATCHER, "role was NOT changed through the profile endpoint");
    report(injected.body.data.user.status === "active", "status was NOT changed through the profile endpoint");
    report(injected.body.data.user.email === userA.email, "email was NOT changed through the profile endpoint");
    report(injected.body.data.user.fullName === "Profile Smoke A3", "whitelisted fullName still applied");

    // ------------------------------------------------------------------
    console.log("\n4. Profile updates are scoped to the caller");
    const untouched = await request(baseUrl, "/api/auth/me", { method: "GET", token: tokenB });
    report(
        untouched.status === 200 &&
            untouched.body.data.user.fullName === "Profile Smoke B" &&
            untouched.body.data.user.phone === null &&
            untouched.body.data.user.role === ROLES.HUB_OPERATOR,
        "user B is completely unaffected by user A's profile updates"
    );
    const wrongSelf = await request(baseUrl, "/api/auth/update-profile", {
        method: "PUT",
        token: tokenA,
        body: { fullName: "Someone Else" },
    });
    report(
        wrongSelf.status === 200 && wrongSelf.body.data.user._id === String(userA._id),
        "update-profile always targets the caller — no target-user parameter exists"
    );

    // ------------------------------------------------------------------
    console.log("\n5. Change password — correct current password");
    const changed = await request(baseUrl, "/api/auth/change-password", {
        method: "PUT",
        token: tokenA,
        body: { currentPassword: "Password@123", newPassword: "NewPass@456" },
    });
    report(changed.status === 200, "change-password returns 200 with the correct current password");
    assertNoPasswordLeak("change-password response", changed);

    const loginNew = await request(baseUrl, "/api/auth/login", {
        body: { email: userA.email, password: "NewPass@456" },
    });
    report(loginNew.status === 200, "login succeeds with the NEW password");
    const loginOld = await request(baseUrl, "/api/auth/login", {
        body: { email: userA.email, password: "Password@123" },
    });
    report(loginOld.status === 401, "login fails with the OLD password (hash really changed)");
    assertNoPasswordLeak("login responses", loginNew, loginOld);

    // ------------------------------------------------------------------
    console.log("\n6. Change password — wrong current password");
    const wrongCurrent = await request(baseUrl, "/api/auth/change-password", {
        method: "PUT",
        token: tokenA,
        body: { currentPassword: "Wrong@Current", newPassword: "Whatever@123" },
    });
    report(wrongCurrent.status === 401, "wrong current password -> 401");
    report(wrongCurrent.body.message === "Current password is incorrect", "401 carries the standard message");

    // ------------------------------------------------------------------
    console.log("\n7. Change password — short new password");
    const shortNew = await request(baseUrl, "/api/auth/change-password", {
        method: "PUT",
        token: tokenA,
        body: { currentPassword: "NewPass@456", newPassword: "123" },
    });
    report(shortNew.status === 422, "short new password -> 422 (validation envelope)");
    report(
        Array.isArray(shortNew.body.errors) && shortNew.body.errors.length > 0,
        "422 includes the errors array"
    );

    // ------------------------------------------------------------------
    console.log("\n8. Authentication is required");
    const noToken = await request(baseUrl, "/api/auth/me", { method: "GET" });
    report(noToken.status === 401, "GET /api/auth/me without a token -> 401");
    const noTokenPassword = await request(baseUrl, "/api/auth/change-password", {
        method: "PUT",
        body: { currentPassword: "x", newPassword: "y" },
    });
    report(noTokenPassword.status === 401, "change-password without a token -> 401");

    // ------------------------------------------------------------------
    console.log("\n9. Cleanup");
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    await closeHttpServer(server);
    await mongoose.disconnect();
    report(true, "temp users removed; HTTP server + DB closed");
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
