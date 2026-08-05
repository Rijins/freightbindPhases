# Enterprise Architecture Rules

Version: 1.0

Status: Mandatory

---

# PURPOSE

FreightBind AI must always maintain an enterprise-grade architecture.

Every implementation must preserve scalability, maintainability, readability, and modularity.

Never introduce architectural debt.

---

# ARCHITECTURE

Always follow:

Presentation Layer

↓

Routing Layer

↓

Controller Layer

↓

Service Layer

↓

Repository / Model Layer

↓

Database

Business logic belongs ONLY inside services.

Controllers should remain thin.

Routes should only map endpoints.

Models should only define schemas.

Never place business logic inside controllers.

Never place business logic inside routes.

---

# SINGLE RESPONSIBILITY

Each file should have one responsibility.

Each function should perform one task.

Avoid giant files.

Avoid giant components.

---

# MODULARITY

Always reuse existing components.

Never duplicate logic.

Extract repeated logic into:

Helpers

Hooks

Utilities

Shared Components

Services

---

# FILE SIZE

Preferred limits

Component:
< 300 lines

Page:
< 500 lines

Service:
< 400 lines

Controller:
< 200 lines

Utility:
Small and focused

Split files before they become difficult to maintain.

---

# IMPORTS

Use absolute imports whenever configured.

Avoid deep relative imports.

Group imports in this order:

Node modules

Third-party libraries

Internal components

Hooks

Utilities

Styles

Assets

---

# DEPENDENCIES

Never introduce unnecessary dependencies.

Before installing a package:

Ask:

Can the existing stack solve this?

Prefer built-in browser APIs.

Prefer React ecosystem.

Avoid package bloat.

---

# STATE MANAGEMENT

Global State

↓

Redux Toolkit

Feature State

↓

Component State

Transient State

↓

useState

Derived State

↓

Memoized selectors

Never duplicate state.

Never keep server state in multiple places.

---

# API LAYER

UI must never directly contain business logic.

Every API request should pass through:

API Client

↓

Redux / Hooks

↓

UI

Never scatter fetch logic across components.

---

# ERROR HANDLING

Errors should propagate upward.

Handle errors at appropriate layers.

Never swallow errors silently.

Always provide meaningful messages.

---

# SCALABILITY

Every new feature should support future expansion.

Avoid hardcoded values.

Avoid magic numbers.

Avoid fixed role assumptions outside RBAC.

---

# MAINTAINABILITY

Future developers should understand the code without reading AI prompts.

Code should feel human-written.

Readable.

Predictable.

Consistent.

---

# ENTERPRISE STANDARD

Every implementation should be production-ready.

Never implement shortcuts that would need rewriting later.

Build once.

Build correctly.

Build to scale.
