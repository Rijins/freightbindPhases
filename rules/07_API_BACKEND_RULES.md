# FreightBind AI — API & Backend Rules

Version: 1.0
Priority: CRITICAL

---

# PURPOSE

The backend must be production-ready.

Every API should be predictable, secure, scalable, and easy to maintain.

---

# ARCHITECTURE

Always follow

Route

↓

Middleware

↓

Controller

↓

Service

↓

Model

↓

MongoDB

Never skip layers.

---

# CONTROLLER RULES

Controllers should only

- Receive request
- Validate request
- Call service
- Return response

Controllers must NEVER

- Query MongoDB
- Perform business logic
- Build notifications
- Build timeline events
- Calculate analytics

---

# SERVICE RULES

All business logic belongs here.

Examples

Shipment lifecycle

Notification triggers

Timeline generation

Role permissions

Validation

Analytics

AI logic

---

# ROUTE RULES

One resource per route.

Example

/api/auth

/api/users

/api/shipments

/api/timeline

/api/notifications

/api/dashboard

/api/analytics

Never create inconsistent routes.

---

# HTTP METHODS

GET

Read

POST

Create

PUT

Full update

PATCH

Partial update

DELETE

Delete

Never misuse methods.

---

# RESPONSE FORMAT

Every API must return

{
    success,
    message,
    data
}

Errors

{
    success:false,
    message,
    error
}

Maintain consistency.

---

# STATUS CODES

200

OK

201

Created

204

Deleted

400

Bad Request

401

Unauthorized

403

Forbidden

404

Not Found

409

Conflict

422

Validation Error

500

Internal Server Error

Never return incorrect status codes.

---

# DATABASE ACCESS

Only services communicate with models.

Controllers never access models directly.

---

# VALIDATION

Validate

Body

Params

Query

Headers

Never trust frontend.

---

# OBJECT IDS

Always validate Mongo ObjectIds.

Reject invalid IDs immediately.

---

# DATABASE QUERIES

Select only required fields.

Avoid returning unnecessary data.

Always paginate large collections.

---

# PAGINATION

Required for

Users

Shipments

Notifications

Timeline

Analytics

Reports

Default

page=1

limit=10

Maximum

limit=100

---

# SEARCH

Search should support

Partial match

Case insensitive

Indexes

---

# FILTERING

Use query parameters.

Never hardcode filters.

---

# SORTING

Support

createdAt

updatedAt

priority

status

title

shipmentId

---

# ERROR HANDLING

Never expose stack traces.

Never expose database internals.

Log detailed errors internally.

Return friendly messages externally.

---

# AUTHENTICATION

JWT only.

Every protected route must verify token.

---

# AUTHORIZATION

RBAC is mandatory.

Never trust frontend roles.

Verify permissions inside backend.

---

# ADMIN

Admin bypasses role restrictions where appropriate.

Never bypass authentication.

---

# TRANSACTIONS

When multiple operations depend on each other

Use MongoDB transactions when appropriate.

---

# NOTIFICATIONS

Important events must trigger notifications.

Notification failures should not crash requests.

Always log failures.

---

# TIMELINE

Every shipment event should create a timeline entry.

Timeline is immutable history.

Never silently delete history.

---

# LOGGING

Log

Errors

Warnings

Critical events

Authentication failures

AI failures

Socket failures

Do not spam logs.

---

# SOCKET EVENTS

Realtime events should be emitted after successful database operations.

Never emit before persistence succeeds.

---

# PERFORMANCE

Avoid N+1 queries.

Use indexes.

Populate only required fields.

Avoid unnecessary database calls.

---

# SECURITY

Never expose

Passwords

JWT Secret

Environment variables

Internal IDs unnecessarily

Sensitive AI prompts

---

# FILE UPLOADS

Validate

Type

Size

Extension

Reject dangerous files.

---

# ENVIRONMENT VARIABLES

Never hardcode

Database URI

JWT Secret

API Keys

Gemini Keys

SMTP credentials

Everything belongs in .env

---

# CONSISTENCY

Every endpoint should behave similarly.

Developers should not have to guess API behavior.

---

# BACKWARD COMPATIBILITY

Never break existing frontend APIs unless explicitly instructed.

---

# DOCUMENTATION

Every new endpoint should be documented.

Include

Purpose

Authentication

Permissions

Request

Response

Errors

---

# TEST CHECKLIST

Before considering an API complete

✓ Validation works

✓ Authentication works

✓ Authorization works

✓ Success response correct

✓ Error response correct

✓ Notifications work

✓ Timeline works

✓ Database updated correctly

✓ No duplicate queries

✓ No console errors

✓ No unhandled promise rejections

Only after every item passes should the backend feature be considered complete.