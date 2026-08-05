# FreightBind AI — API & Service Layer Rules

Version: 1.0

---

# Goal

Every API should feel like it belongs to one enterprise system.

No random endpoints.
No inconsistent responses.

---

# Folder Structure

Backend

controllers/
services/
routes/
middleware/
validators/
helpers/
models/

Business logic NEVER inside routes.

Routes only:

→ validate

→ authenticate

→ authorize

→ call controller

---

Controller Rules

Controllers must be thin.

Controller responsibilities:

Read req

Call service

Return response

Nothing else.

Never place business logic inside controllers.

---

Service Rules

Services contain ALL business logic.

Examples:

ShipmentService

TimelineService

NotificationService

AnalyticsService

AIService

AuthService

DashboardService

etc.

Services may call other services.

Services should NOT know about Express.

---

Database Rules

Never write raw Mongo queries inside controllers.

Only services communicate with models.

Bad

Controller
↓

Model

Good

Controller
↓

Service
↓

Model

---

Response Structure

Every API returns

{
success,
message,
data,
meta
}

Errors

{
success:false,
message,
error,
stack (development only)
}

---

Pagination Standard

{
page,
limit,
totalItems,
totalPages
}

Always identical.

---

Sorting

Support

sortBy

order

Example

?sortBy=createdAt&order=desc

---

Filtering

Every listing endpoint should support filtering.

Never create separate endpoints for each filter.

Example

status

priority

date

carrier

dispatcher

etc.

---

Searching

Search should be fuzzy.

Case insensitive.

Partial matches.

---

Validation

Never trust frontend.

Everything validated again.

Use centralized validators.

---

Authorization

Controllers should never contain role logic.

Middleware handles access.

Example

protect

authorize(Admin)

authorize(Logistics Director)

---

Transactions

If multiple collections change

Use Mongo Transactions.

Examples

Shipment

Timeline

Notification

Analytics

All succeed

OR

All rollback

---

Logging

Log

Errors

Warnings

Critical events

Never spam console.log.

---

API Version

All APIs

/api/v1/

Future

/api/v2/

without breaking existing frontend.

---

Performance

Always use

lean()

when documents won't be modified.

Populate only required fields.

Never populate entire documents.

---

Security

Never expose

password

refresh tokens

internal IDs

private notes

server paths

---

Caching

Analytics

Dashboard

Reports

AI summaries

may be cached.

CRUD endpoints should never cache.

---

Socket Events

Every socket event has matching REST fallback.

Realtime

+

Reliable.

---

Naming

Routes

/api/v1/shipments

/api/v1/timeline

/api/v1/notifications

NOT

/getShipmentData

/updateData

---

HTTP Methods

GET

Read

POST

Create

PUT

Replace

PATCH

Update

DELETE

Delete

Never misuse methods.

---

File Uploads

Future uploads

Documents

Images

Invoices

POD

must go through upload service.

Never mix upload logic with shipment logic.

---

API Documentation

Every endpoint documented.

Method

URL

Body

Params

Response

Errors

Permissions

Examples

---

Code Quality

One responsibility per function.

Maximum readability.

No duplicated logic.

Extract helpers when repeated.

Enterprise quality only.