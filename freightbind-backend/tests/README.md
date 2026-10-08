# Backend unit tests (Jest)

Run with `npm test` (from `freightbind-backend/`). No MongoDB, no `.env`, no
network required — the suite deliberately covers pure logic and permission
rules only, so it is CI-safe out of the box.

## What is covered

- `socketRooms.test.js` — room-name builders (`helpers/socketRooms.js`).
- `shipmentRoomAccess.test.js` — the Socket.IO room-join authorization rule
  (`canJoinShipmentRoom` in `sockets/connection.js`): Admin/Director may join
  any shipment room, Dispatchers may join any shipment they can view, Hub
  Operators only their own hub.
- `timelinePermissions.test.js` — timeline read/location/note/status
  permission asserts (`services/timelineService.js`), including the hub
  scoping that restricts Hub Operators to their own hub's shipments.
- `shipmentUpdatePermissions.test.js` — `authorizeUpdate()`
  (`services/shipmentService.js`): role field matrix plus the Hub Operator
  location-only + hub-scoped rule.
- `analyticsService.test.js` — analytics derivation helpers
  (`services/analyticsService.js`): role scoping, the 7-day volume trend,
  fleet derivation, hub utilization and system health.

## Adding a test

Place the file in `tests/` with a `*.test.js` suffix. Keep DB-touching
services out unless they are mocked — `npm test` must never require a
running database.