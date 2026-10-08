# AGENTS.md

MERN freight-logistics app. Two independent npm packages (no root workspace, no shared scripts):

- `freightbind-backend/` — Express 5 + Mongoose, **CommonJS**, plain JS. Port 5000.
- `freightbind-frontend/` — React 19 + Vite + Tailwind, **ESM**. Port 3000. React Router v7, Redux Toolkit, React Hook Form + Zod.
- `rule/` — scratch/notes only (currently empty `ui-rule.md`).

## Commands

- Backend: `npm run dev` (nodemon), `npm start`. Requires `.env` in `freightbind-backend/` (PORT, NODE_ENV, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL) and a reachable MongoDB.
- Backend tests: `npm test` (Jest) in `freightbind-backend/` — 62 unit tests covering pure permission logic (room join access, timeline hub scoping, `authorizeUpdate`, socket room builders, analytics service). Zero-DB: no MongoDB or `.env` needed. See `freightbind-backend/tests/README.md`.
- Backend 4-role API verification: `npm run verify` in `freightbind-backend/` — boots its own server on an ephemeral port, logs in all 4 dev accounts and verifies analytics RBAC/scoping, hub capacity persistence, timeline/chat access rules, and `/api-docs`; needs MongoDB + dev accounts. Cleans up temp data.
- Socket.IO smoke test (dev): `node scripts/socketSmokeTest.js` in `freightbind-backend/` — boots its own server on an ephemeral port, needs MongoDB + the dev accounts from `npm run update-dev-accounts`.
- Frontend: `npm run dev`, `npm run build`, `npm run preview`.
- No frontend tests exist. `npm run lint` (frontend) is broken by default — eslint is not installed and no config file exists; don't run or rely on it. Verification is manual (checklist in `freightbind-frontend/README.md`).

## Security

`freightbind-backend/.env` holds a live MongoDB Atlas connection string and JWT secret. Never print its values, commit it, or add secrets to any code. Per the frontend README, these credentials were distributed in a zip and should be rotated.

## API / backend architecture

- Mounted routes (`app.js`): `/api/auth`, `/api/users`, `/api/v1/shipments`, `/api/timeline`, `/api/notifications`, `/api/announcements`, `/api/ai`, `/api/hubs`, `/api/chat`, `/api/analytics`, plus `/api/health` and `/api-docs` (Swagger UI). Note the asymmetric versioning — only shipments are under `/v1`.
- All responses use the envelope `{ success, message, data, errors }`.
- Layering: `routes/` (express-validator checks + `middleware/validateRequest.js`) → `controllers/` → `services/`. Business rules live in services, e.g. role-gated field updates (`authorizeUpdate()` in `services/shipmentService.js`) and status-transition/role checks in `services/timelineService.js` — not in controllers.
- Auth (`middleware/auth.js`): `protect` accepts a Bearer token or cookie; `authorize(...roles)` gates routes (create/delete shipments are Admin + Logistics Director only).
- Roles: `Admin`, `Logistics Director`, `Carrier Dispatcher`, `Hub Operator` — source of truth is `backend/constants/roles.js`. Backend uses CommonJS; frontend must be ESM.

## Realtime (Socket.IO) architecture

- `server.js` creates one shared HTTP server (`http.createServer(app)`) and attaches Socket.IO via `initSocket(server)` (singleton in `sockets/index.js`). Express `app.js` is untouched. Graceful shutdown on SIGINT/SIGTERM closes io → http server → mongoose.
- Socket connections authenticate through the same shared util as Express: `utils/verifyToken.js` (`verifyAndLoadUser`) is used by both `middleware/auth.js` `protect` and the handshake middleware `sockets/auth.js`. Do not duplicate JWT verification elsewhere.
- Event names live only in `constants/socketEvents.js` (e.g. `notification:new`, `shipment:updated`, `user:online`). Room name builders live in `helpers/socketRooms.js` (`user:<id>`, `role:<role>`, `shipment:<id>`, `admin:global`).
- **Never call Socket.IO directly from controllers/services/routes** — use `services/socketService.js` (`emitToUser`, `emitToUsers`, `emitToRole`, `emitToRoles`, `emitToShipment`, `broadcast`, `joinRoom`, `leaveRoom`, `joinRooms`, `leaveAllRooms`, `isUserOnline`).
- Rooms: user/role/global-admin rooms are server-managed (auto-joined on connect); clients may only join/leave `shipment:<id>` rooms via `room:join`/`room:leave`.
- Presence: multiple sockets per user allowed; `user:online` fires on first socket, `user:offline` on last disconnect (tracked in `sockets/connection.js`).

## Frontend conventions

- One axios instance in `src/api/axiosInstance.js` (adds Bearer header; on 401 clears storage and redirects to `/login`). All requests go through `src/services/*` — never call axios directly in components.
- Redux slices live in `src/features/<domain>/<domain>Slice.js`; store in `src/redux/store.js`. Do not create a parallel `redux/slices/` copy.
- `src/utils/constants.js` and `src/utils/helpers.js` mirror backend constants and rules (`getEditableFields`, `STATUS_TRANSITIONS`, role checks). If you change a role/status value or permission rule in the backend, update these mirrors too — they must not drift.
- The frontend was built strictly against the existing backend API (no endpoints/models were changed). Prefer extending the backend API over bending the frontend to work around it.

## Gotchas

- `VITE_API_BASE_URL` must end in `/api` — services append `/auth/...` and `/v1/shipments`. `.env.example` is correct; the fallback default in `src/utils/constants.js` ends in `/api/v1` and would produce a doubled `/v1/v1/...` prefix if `.env` is missing.
- Backend is Express 5: async route errors propagate to the error handler automatically, and route patterns follow Express 5's path-to-regexp semantics (e.g. no `:param?` syntax changes — verify against v5 docs).
