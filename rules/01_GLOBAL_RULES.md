# FreightBind AI
# Global Engineering Rules

Version: 1.0

---

# Purpose

This document defines the mandatory engineering standards for the FreightBind AI project.

Every AI assistant, developer, or contributor MUST read and follow every rule in this document before making any modification.

These rules are mandatory.

Ignoring them is considered a project violation.

---

# General Principles

Always build production-quality software.

Never build demonstration-quality software.

Every feature must feel like it belongs inside an enterprise SaaS application.

---

# Understanding the Project

Before making ANY modification:

Read every file inside the /rules directory.

Understand:

- project architecture
- current implementation
- current phase
- user roles
- existing features
- UI system
- coding conventions

Never begin coding before understanding the project.

---

# Existing Code

Existing working code is valuable.

Never replace working code unless explicitly instructed.

Always improve existing code whenever possible.

Never rewrite large modules unnecessarily.

Never introduce breaking changes.

---

# Preserve Functionality

Never remove an existing feature.

Never disable an existing feature.

Never delete routes.

Never remove APIs.

Never remove database fields.

Never remove validations.

Never remove permissions.

Unless explicitly instructed.

---

# Feature Integration

Every new feature must integrate with:

Authentication

Authorization

Role Based Access

Notifications

Timeline

Analytics

Dashboard

Logging

Search

Filtering

Pagination

Whenever applicable.

Never create isolated features.

---

# Code Quality

Write readable code.

Write maintainable code.

Write scalable code.

Avoid clever code.

Avoid unnecessary abstractions.

Avoid code duplication.

Prefer clarity over brevity.

---

# Readability

Variable names must explain purpose.

Function names must explain action.

Folder names must be meaningful.

Component names must be descriptive.

Avoid abbreviations.

Avoid cryptic names.

Bad

x

temp

abc

Good

shipmentHistory

activeDispatcher

notificationRecipient

shipmentStatistics

---

# Functions

Every function should solve one problem.

Avoid giant functions.

Split responsibilities logically.

Avoid nested logic whenever possible.

Use early returns.

---

# Components

Components must be reusable.

Never duplicate components.

Always check whether a similar component already exists.

If one exists

reuse it

extend it

improve it

Never create duplicates.

---

# File Updates

If a file already exists

update it.

Do not create

NewFile2

HeaderNew

DashboardLatest

ShipmentFinal

ShipmentFinal2

ShipmentWorking

etc.

---

# Folder Structure

Never invent folder structures.

Always follow

rules/13_PROJECT_STRUCTURE.md

If unsure

reuse existing structure.

---

# APIs

Never change existing API routes without updating frontend usage.

Never rename endpoints unnecessarily.

Never introduce inconsistent route naming.

---

# Database

Never rename collections.

Never rename schemas.

Never rename models.

Never rename database fields.

Unless specifically instructed.

---

# MongoDB

Always use Mongoose.

Always validate incoming data.

Always sanitize user input.

Always validate ObjectIds.

Never trust request payloads.

---

# Error Handling

Never ignore errors.

Never swallow exceptions silently.

Every caught error should provide meaningful logs.

User-facing errors should be clean.

Developer logs should contain detailed information.

---

# Logging

Logs should help debugging.

Do not spam logs.

Remove temporary debug logs before considering work complete.

---

# Security

Security comes before convenience.

Never bypass RBAC.

Never bypass JWT verification.

Never expose sensitive data.

Never expose passwords.

Never expose tokens.

Never expose secrets.

---

# Permissions

Always verify user permissions.

Never trust frontend permissions.

Every sensitive action must be verified in backend.

---

# Validation

Validate everything.

Frontend validation.

Backend validation.

Database validation.

Never rely on only one layer.

---

# Business Rules

Business rules belong inside services.

Not controllers.

Not routes.

Not frontend.

---

# Controllers

Controllers should remain thin.

Responsibilities

Receive request

Call service

Return response

Nothing else.

---

# Services

Services contain business logic.

Complex logic belongs here.

---

# Models

Models should only define schemas.

Avoid business logic inside models.

---

# Middleware

Middleware should perform

authentication

authorization

validation

logging

Never implement business logic inside middleware.

---

# Routes

Routes should remain clean.

Avoid logic inside routes.

---

# Notifications

Notifications are mandatory.

Every important business event should trigger notifications.

Notification failures should never crash the application.

Notification failures should always be logged.

---

# Timeline

Every shipment action should be reflected in the timeline.

Timeline integrity is critical.

Never break shipment history.

---

# Analytics

Analytics should always use real data.

Never hardcode dashboard numbers.

---

# Dashboard

Dashboards should update dynamically.

Avoid hardcoded statistics.

---

# UI

Never create placeholder UI.

Every screen must look complete.

Every screen should feel production ready.

---

# Responsiveness

Everything must work on

Desktop

Laptop

Tablet

Mobile

No exceptions.

---

# Accessibility

Buttons must be accessible.

Inputs must be labeled.

Keyboard navigation should work.

Contrast should remain readable.

---

# Loading States

Never leave blank screens.

Every asynchronous operation must display

Loading

Skeleton

Progress

Spinner

depending on context.

---

# Empty States

Every empty page needs a proper empty state.

Never leave blank tables.

Never leave blank cards.

---

# Error States

Every API failure should display

Friendly message

Retry option

Meaningful explanation

---

# Animations

Animations should improve UX.

Never distract users.

Keep transitions smooth.

Avoid excessive motion.

---

# Images

Never use low-quality images.

Never stretch images.

Use professional illustrations where appropriate.

---

# Icons

Icons must remain consistent throughout the project.

Avoid mixing multiple icon styles.

---

# Colors

Never randomly introduce colors.

Always follow

rules/05_DESIGN_SYSTEM.md

---

# Styling

Avoid inline styles.

Prefer reusable styling.

Keep spacing consistent.

---

# State Management

Global state belongs in Redux.

Component state belongs in React.

Avoid unnecessary global state.

---

# API Calls

Never duplicate API logic.

Centralize API services.

---

# Reusability

Whenever writing code ask

Can this be reused?

If yes

Make it reusable.

---

# Performance

Avoid unnecessary renders.

Avoid unnecessary database queries.

Avoid unnecessary API requests.

Optimize before problems become visible.

---

# Dependencies

Do not install unnecessary packages.

Prefer existing libraries already used by the project.

---

# Comments

Write comments only when they improve understanding.

Do not explain obvious code.

---

# TODO

Never leave TODO comments.

Complete the implementation.

---

# Mock Data

Never leave mock data.

Never leave fake statistics.

Never leave placeholder values.

---

# Hardcoded Values

Avoid hardcoding.

Prefer constants.

Environment variables.

Configuration files.

---

# AI Generated Code

Generated code must not look AI generated.

Code should resemble work written by experienced developers.

---

# Code Completion

Never leave incomplete implementations.

Never leave half-built components.

Never leave unfinished services.

---

# Testing

Before considering a task complete verify

No syntax errors

No import errors

No missing exports

No duplicate routes

No broken navigation

No undefined variables

---

# Debugging

Never guess.

Trace execution.

Identify root cause.

Fix the cause.

Not the symptom.

---

# Documentation

Whenever architecture changes

update documentation.

---

# Git

One feature per change.

Avoid unrelated modifications.

Keep commits focused.

---

# Professional Standard

Every screen

Every API

Every model

Every service

Every component

must look like it belongs inside a commercial enterprise software product.

---

# Absolute Rules

Never violate RBAC.

Never remove existing functionality.

Never generate placeholder code.

Never invent architecture.

Never ignore existing project conventions.

Never duplicate components.

Never duplicate services.

Never duplicate APIs.

Never duplicate business logic.

Never sacrifice readability.

Never sacrifice maintainability.

Never sacrifice scalability.

---

# Completion Checklist

Before finishing any task confirm:

✓ No existing feature was broken.

✓ Code follows project architecture.

✓ UI follows design system.

✓ Feature integrates with existing modules.

✓ Imports are correct.

✓ Exports are correct.

✓ Role permissions remain intact.

✓ Notifications still work.

✓ Timeline still works.

✓ Analytics remain functional.

✓ No placeholder code exists.

✓ Code is production-ready.

Only after every item above is satisfied should a task be considered complete.