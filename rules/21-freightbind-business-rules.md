# FreightBind Business Rules

Version: 1.0

Status: Mandatory

---

# PURPOSE

This file defines every business rule of FreightBind AI.

These rules override implementation decisions.

If generated code conflicts with these rules,

THESE RULES WIN.

---

# USER ROLES

Exactly four roles exist.

Admin

Logistics Director

Carrier Dispatcher

Hub Operator

Never create additional roles.

Never rename roles.

---

# SHIPMENT LIFECYCLE

A shipment progresses through:

Draft

Created

Scheduled

In Transit

Delayed

Delivered

Cancelled

Never invent new statuses.

Never skip business validation.

---

# SHIPMENT RULES

Shipment ID must be unique.

Creator is always stored.

Timeline must always be maintained.

Every important action creates timeline history.

Shipment history must never be deleted.

Cancelled shipments are immutable.

Delivered shipments cannot be deleted.

---

# DISPATCHER RULES

Dispatcher assignment is optional.

A shipment may exist without a dispatcher.

Once assigned,

future notifications target dispatcher.

If no dispatcher exists,

notifications target shipment creator.

---

# TIMELINE RULES

Every important action creates timeline history.

Timeline is append-only.

Timeline events are never edited.

Timeline events are never deleted.

---

# NOTIFICATION RULES

Notifications are stored permanently.

Unread count must stay accurate.

Read status must persist.

Notification creation failures must never break shipment creation.

Notification failures must be logged.

---

# DASHBOARD RULES

Every dashboard shows only relevant data.

Never expose another role's private information.

Dashboard widgets differ per role.

---

# SECURITY

Every protected API validates JWT.

Every action validates RBAC.

Frontend checks are convenience only.

Backend remains the source of truth.

---

# AI FEATURES

AI never modifies business data.

AI only suggests.

Human approval is required where appropriate.

---

# AUDITABILITY

Important actions must remain traceable.

Never remove audit history.

Never remove timeline history.

Never remove notification history.