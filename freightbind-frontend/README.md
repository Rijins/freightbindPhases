# FreightBind AI — Shipment Management Frontend (Phase 03)

A React 19 + Vite frontend for the existing FreightBind AI backend. This phase
covers authentication, the dashboard, and full shipment CRUD with search,
filters, sorting, pagination, and role-based UI. It consumes the backend
exactly as specified — no endpoints, models, or business rules were changed.

## 1. Setup

This sandbox has no network access, so dependencies could not be installed or
the dev server test-run here. On your machine:

```bash
cd freightbind-frontend
npm install
cp .env.example .env
# edit .env if your backend runs somewhere other than http://localhost:5000
npm run dev
```

The app expects the backend running at the URL in `VITE_API_BASE_URL`
(default `http://localhost:5000/api`), and the backend's `CLIENT_URL` should
be `http://localhost:3000` to match this app's dev port (already the case in
your uploaded `.env`).

⚠️ **Before you push this anywhere:** the backend `.env` you uploaded contains
a live MongoDB Atlas connection string and a JWT secret in plaintext. Rotate
both — anyone with this zip currently has your database password.

## 2. Files created

Everything under `src/`, plus root config: `package.json`, `vite.config.js`,
`tailwind.config.js`, `postcss.config.js`, `index.html`, `.env.example`,
`.gitignore`.

No backend files were touched.

## 3. Libraries installed

`react-router-dom`, `axios`, `@reduxjs/toolkit`, `react-redux`,
`react-hook-form`, `zod`, `@hookform/resolvers`, `react-icons` — nothing
beyond what the spec allowed. No Bootstrap/MUI/Ant Design.

## 4. Folder structure

Matches the spec's required structure exactly, with one deliberate deviation:
slices live in `src/features/auth/authSlice.js` and
`src/features/shipments/shipmentSlice.js` (feature-based, so each slice sits
next to the domain it manages) rather than also duplicating them under
`redux/slices/`. `redux/store.js` imports both and is the single store
configuration. This avoids the "never duplicate state" rule the spec itself
sets — creating an empty parallel `redux/slices/` folder would invite copies
drifting out of sync.

## 5. Features implemented

- **Auth**: login (JWT via Bearer header, persisted client-side), session
  restore on reload via `GET /api/auth/me`, logout, 401 auto-redirect.
- **Dashboard**: total + per-status shipment counts (derived from real
  `pagination.totalItems` on `GET /api/v1/shipments`, since the backend has no
  dedicated stats endpoint — nothing is hardcoded), plus the 5 most recent
  shipments.
- **Shipment List**: debounced search, status/priority dropdowns, an
  expandable filter panel (cargo type, shipment type, origin, destination,
  dispatcher ID, created-by ID), backend-driven sorting and pagination,
  role-gated action buttons.
- **Create Shipment**: full form (React Hook Form + Zod), redirects to the
  new shipment's details page on success.
- **Edit Shipment**: loads the shipment, and — critically — only shows as
  *editable* the fields your role is actually allowed to change (mirroring
  `authorizeUpdate()` in the backend service): Admin/Logistics Director get
  every field, Carrier Dispatchers get everything except reassignment and
  only on shipments assigned to them, Hub Operators get `currentLocation`
  only. Status changes are limited to the backend's allowed transitions.
- **Shipment Details**: full read view, edit/delete actions gated by role.
- **Delete**: always via the shared confirmation `Modal`, never immediate.
- **404**: friendly Not Found page with a return-to-dashboard button.
- Loading states, empty states, and readable error messages (backend
  `message`/`errors` surfaced as-is) throughout.

## 6. Known limitations

- **No user directory endpoint exists in the backend.** "Assigned
  Dispatcher" and "Created By" (in filters, and Assigned Dispatcher in the
  create/edit forms) are plain text inputs for a Mongo user ID rather than a
  searchable dropdown of names — there's no `/api/users` list endpoint to
  populate one from. A future phase adding that endpoint would let this
  become a proper picker.
- Dashboard stat cards require 8 sequential list requests (total + 7
  statuses) since there's no aggregate stats endpoint. Fine at this data
  scale; would want a real aggregation endpoint if shipment volume grows.
- Not built, per the spec's explicit "Do Not Build" list: timeline,
  notifications, sockets, chat, analytics, AI, activity logs, reports,
  import/export, dark mode, settings, user management.
- **Not tested against a live backend or `npm install`** — this sandbox has
  no network access, so please run through the checklist below yourself
  after `npm install && npm run dev`.

## 7. Manual testing checklist

- [ ] Login with valid credentials → redirected to `/dashboard`
- [ ] Login with invalid credentials → backend error message shown
- [ ] Refresh the page while logged in → session restored, no re-login
  needed
- [ ] Log out → redirected to `/login`, protected routes redirect back
- [ ] Visit a protected route while logged out → redirected to `/login`
- [ ] Dashboard cards match actual counts in the database
- [ ] Recent Shipments table shows the 5 newest shipments
- [ ] Shipment list loads, paginates, and total count matches the DB
- [ ] Search returns matching results after you stop typing (debounced,
  not per keystroke)
- [ ] Status and priority filters narrow results correctly
- [ ] Additional filters (cargo type, shipment type, origin, destination,
  dispatcher/created-by ID) narrow results correctly
- [ ] Column sort (priority, status, estimated arrival) and the sort
  dropdown both work, ascending and descending
- [ ] Create Shipment (as Admin/Logistics Director) succeeds and redirects
  to the new shipment's detail page
- [ ] Create Shipment is not reachable/visible as Carrier Dispatcher or Hub
  Operator
- [ ] Edit Shipment shows only the fields your logged-in role can change
- [ ] Edit Shipment save succeeds and reflects instantly on the details page
- [ ] Invalid status transition is rejected with the backend's message
- [ ] Delete requires confirmation modal; Delivered shipments can't be
  deleted; Cancelled shipments can't be edited
- [ ] 404 page appears for an unknown URL and returns to dashboard
- [ ] Sidebar collapses on tablet widths and opens as a drawer on mobile
- [ ] Table scrolls horizontally on narrow screens instead of breaking
  layout
- [ ] Every request shows a loading state (button spinners, table loader,
  full-page loader on first load)
