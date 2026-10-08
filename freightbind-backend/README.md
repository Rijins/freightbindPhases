# FreightBind AI — Backend

Express 5 + Mongoose (CommonJS, plain JavaScript) REST + Socket.IO API for the FreightBind AI logistics platform. Frontend: see `freightbind-frontend/README.md`.

## Prerequisites

- Node.js 20+
- npm
- A reachable MongoDB (local or Atlas). The connection string lives in `.env` and is **never committed**.

## Setup

1. `npm install`
2. Create `.env` from `.env.example`:

   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=<mongodb connection string>
   JWT_SECRET=<long random string>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```

   AI is optional but enabled by default when `AI_PROVIDER` is set (see the
   `AI_*` variables in `.env.example`). With no provider configured the AI
   endpoints fall back to deterministic, rule-based results so the rest of the
   app never breaks.
3. Ensure MongoDB is reachable, then `npm run dev` (or `npm start`).

> The `MONGO_URI` / `JWT_SECRET` in the distributed `.env` point at a live
> Atlas cluster and should be rotated — treat them as leaked credentials.

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Runs `node server.js` (waits for MongoDB then listens). |
| Dev | `npm run dev` | Runs with nodemon. |
| Tests | `npm test` | Jest unit tests — **zero-DB** (no MongoDB or `.env` needed). |
| Dev accounts | `npm run update-dev-accounts` | Creates/updates the four role accounts used by the smoke tests. |
| Verify | `npm run verify` | 4-role API verification (RBAC, analytics scoping, hub capacity, timeline/chat access, Swagger). **Requires MongoDB** + the dev accounts. |

## Smoke tests (`scripts/`)

Each `*SmokeTest.js` boots its own server on an ephemeral port and asserts an
end-to-end flow against the real API. They **require MongoDB** and, for most,
the dev accounts:

```bash
npm run update-dev-accounts
node scripts/socketSmokeTest.js
node scripts/notificationSmokeTest.js
node scripts/chatSmokeTest.js
node scripts/announcementSmokeTest.js
node scripts/aiAlertSmokeTest.js
node scripts/profilePasswordSmokeTest.js
npm run verify
```

Pure-logic smoke tests (no DB, use Node's `assert`):

```bash
node scripts/aiServiceSmokeTest.js
node scripts/delayRiskSmokeTest.js
node scripts/recommendationsSmokeTest.js
```

Exit code `0` = pass. Each DB smoke test cleans up the documents it creates.

## Architecture

- `server.js` — bootstraps HTTP + Socket.IO on one shared server with graceful shutdown.
- `app.js` — Express app: CORS, JSON, cookie, Morgan (`dev` when `NODE_ENV=development`), route mounting, API docs at `/api-docs`, 404 + error handler.
- `routes/` → `controllers/` → `services/` — business rules live in **services** (never controllers), e.g. `authorizeUpdate()` in `shipmentService.js`, status/permission checks in `timelineService.js`, role-scoped analytics in `analyticsService.js`.
- `middleware/auth.js` — `protect` (Bearer token or cookie) + `authorize(...roles)`.
- `middleware/validateRequest.js` — runs the `express-validator` chains from `validations/`.
- `sockets/` — Socket.IO: handshake auth (`sockets/auth.js`, shared JWT verification via `utils/verifyToken.js`), connection/presence (`sockets/connection.js`), **authorized** shipment room joins.
- `services/socketService.js` — the only way controllers/services emit realtime events (`emitToUser`, `emitToRole`, `emitToShipment`, …). Nothing else imports Socket.IO.
- `docs/openapi.js` — the OpenAPI 3.0 spec (route-table driven) served by Swagger UI at `/api-docs`.
- `tests/` — zero-DB Jest unit tests for the pure permission/derivation logic (`npm test`).

### Roles

`Admin`, `Logistics Director`, `Carrier Dispatcher`, `Hub Operator` — source of truth is `constants/roles.js`. RBAC is enforced at the route level (`authorize`) plus service-level scope checks (hub-scoping for Hub Operators, assigned-scoping for Dispatchers).

### Response envelope

Every response is `{ success, message, data, errors }` (`helpers/apiResponse.js`).

### Realtime event names & rooms

Event names live in `constants/socketEvents.js`; room-name builders in `helpers/socketRooms.js` (`user:<id>`, `role:<role>`, `shipment:<id>`, `admin:global`).

## Development notes

- Express 5 + Mongoose 9 are used — consult their docs for route/query semantics before upgrading.
- Never log or commit secrets. The `.env` is git-ignored.
- After changing any role/status/permission rule here, update the mirrored constants in `freightbind-frontend/src/utils/` (they must not drift).