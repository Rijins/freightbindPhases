# Documentation Rules

Version: 1.0

Status: Mandatory

---

# PURPOSE

FreightBind AI must remain understandable years from now.

Documentation should explain WHY something exists.

The code itself should explain HOW.

---

# GENERAL RULES

Never over-comment obvious code.

Never leave outdated comments.

Never document incorrect behavior.

Keep documentation synchronized with implementation.

---

# FILE HEADER

Every major file should begin with a short description.

Example

Purpose

Responsibilities

Dependencies

Related modules

---

# FUNCTION DOCUMENTATION

Complex functions should explain

Purpose

Parameters

Return value

Possible errors

Side effects

Business rules

Do not document trivial getters or setters.

---

# BUSINESS RULES

Whenever business logic exists

Document

Why it exists

Who requested it

What it protects

Examples

Example

Maximum approved leave per year

Shipment lifecycle restrictions

Notification permissions

RBAC decisions

---

# API DOCUMENTATION

Every endpoint should clearly document

HTTP Method

Route

Authentication

Authorization

Purpose

Request body

Query parameters

Path parameters

Success response

Error responses

Business rules

---

# DATABASE DOCUMENTATION

Document

Collections

Relationships

Indexes

References

Lifecycle

Cascade behavior

Validation

---

# COMPONENT DOCUMENTATION

Large reusable components should document

Purpose

Props

Events

Dependencies

Usage examples

---

# HOOK DOCUMENTATION

Custom hooks should explain

Purpose

Arguments

Return values

Expected usage

---

# REDUX DOCUMENTATION

Every slice should describe

State

Actions

Async thunks

Selectors

Business logic

---

# SERVICE DOCUMENTATION

Every service should explain

Responsibilities

Used by

External dependencies

Possible failures

---

# AI FEATURES

Every AI module must document

Prompt purpose

Expected input

Expected output

Fallback behavior

Failure handling

Rate limiting

---

# SOCKET DOCUMENTATION

Document

Events emitted

Events received

Payload structure

Authentication

Permissions

---

# SECURITY NOTES

Document

Authentication flow

Authorization rules

Protected resources

Sensitive operations

Token lifecycle

---

# UI DOCUMENTATION

Document

Theme usage

Role colors

Animation rules

Responsive behavior

Accessibility considerations

---

# CHANGE DOCUMENTATION

When changing an existing feature

Update related documentation.

Never leave documentation outdated.

---

# README RULES

Each major module may contain its own README.

Frontend

Backend

AI

Socket

Deployment

Analytics

Admin

These READMEs should explain

Purpose

Architecture

Important files

How to extend

---

# DOCUMENTATION QUALITY

Documentation should be

Clear

Short

Accurate

Maintainable

Professional

Never verbose.

Never repetitive.

---

# FINAL RULE

Documentation is part of the project.

A feature without proper documentation is considered incomplete.