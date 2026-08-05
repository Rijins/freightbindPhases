# FreightBind AI API Architecture Rules

Version: 1.0
Status: Mandatory

---

# Objective

Every API endpoint must feel like it belongs to one professional SaaS application.

No random endpoints.
No inconsistent naming.
No duplicated logic.

---

# Backend Structure

controllers/
services/
routes/
middleware/
models/
validators/
constants/
helpers/
utils/
config/

Never violate this structure.

---

# Route Naming

Use nouns.

Good

/api/auth
/api/users
/api/shipments
/api/timeline
/api/notifications
/api/analytics
/api/dashboard
/api/feedback

Bad

/createShipment
/getShipments
/deleteShipment

---

# REST Standards

GET

Read

POST

Create

PUT

Replace

PATCH

Partial Update

DELETE

Delete

Never mix them.

---

# Response Structure

Every response must use

success

message

data

Example

{
    "success": true,
    "message": "Shipment created successfully.",
    "data": {}
}

Errors

{
    "success": false,
    "message": "Shipment not found."
}

---

# Status Codes

200 OK

201 Created

400 Validation Error

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Business Rule Error

500 Internal Server Error

---

# Controllers

Controllers must only

Read Request

Call Service

Return Response

Nothing else.

Business logic belongs inside services.

---

# Services

Services perform

Business rules

Validation

Database interaction

Notification calls

Timeline creation

AI calls

Analytics updates

Controllers must never contain business logic.

---

# Validation

Every POST

PUT

PATCH

must validate data before reaching service.

Never trust frontend.

---

# Error Handling

Throw errors.

Never return random objects.

Use centralized error middleware.

---

# Authentication

JWT only.

No endpoint should manually decode JWT.

Always use auth middleware.

---

# Authorization

Role checks belong in middleware or service.

Never inside controllers.

---

# Database

Always use Mongoose Models.

Never use raw Mongo queries everywhere.

---

# Population

Populate only required fields.

Never populate entire user documents.

---

# Pagination

Every list endpoint must support

page

limit

search

sortBy

order

filters

---

# Search

Search should be case insensitive.

Should support partial matching.

---

# Sorting

Every list endpoint should support

Ascending

Descending

Multiple sort fields when required

---

# Filtering

Filtering must happen inside database query.

Never fetch everything then filter in memory.

---

# Notifications

Business events trigger notifications.

Controllers never call Notification model directly.

Always

Controller

↓

Service

↓

Notification Service

↓

Notification Model

---

# Timeline

Every shipment action updates timeline.

Never forget timeline creation.

---

# Analytics

Business events update analytics.

Never compute everything on every request if avoidable.

---

# AI

AI features belong inside

services/ai/

Never inside controllers.

---

# Logging

Log

Errors

Warnings

Important business events

Never log passwords

Tokens

Secrets

---

# Environment Variables

No secrets inside code.

Everything configurable through .env

---

# Code Quality

Small functions

Reusable helpers

Readable names

No duplicated logic

---

# API Consistency

Every endpoint should behave similarly.

A developer joining later should predict endpoint behavior without reading implementation.

Consistency is mandatory.