# FreightBind AI - Coding Standards

Version: 1.0
Priority: CRITICAL
Status: Locked

---

# Objective

Every line of code should look like it was written by an experienced software engineer.

Readable.

Maintainable.

Scalable.

Consistent.

---

# Golden Rules

Write code for humans.

Computers come second.

The next developer should understand the code immediately.

---

# Clean Code

Prefer

Simple

Readable

Explicit

Avoid

Magic

Complexity

Shortcuts

---

# Naming

Variables

camelCase

Functions

camelCase

Components

PascalCase

Constants

UPPER_CASE

Folders

lowercase

---

# Variable Names

Bad

data

temp

obj

arr

list

abc

test

Good

shipmentHistory

assignedDispatcher

notificationRecipient

timelineEvents

activeShipments

---

# Function Names

Must describe action.

Good

createShipment()

updateShipment()

markNotificationAsRead()

generateTrackingNumber()

calculateDelayRisk()

Bad

run()

execute()

process()

handle()

test()

---

# Function Size

Ideal

20-50 lines

Maximum

80 lines

Split larger functions.

---

# Nesting

Maximum

3 levels

If deeper

Refactor.

Use early returns.

---

# Early Return

Good

if (!shipment) return;

Continue...

Bad

if (shipment) {
    if (...) {
        if (...) {
            ...
        }
    }
}

---

# One Responsibility

One function.

One job.

---

# DRY

Don't Repeat Yourself.

If copied twice

Extract.

---

# Comments

Only explain WHY.

Never explain obvious code.

Bad

// increment i

Good

// Prevent duplicate notifications during websocket reconnect

---

# Imports

Order

React

Libraries

Constants

Hooks

Components

Services

Utils

Styles

---

# Magic Numbers

Never hardcode.

Bad

if(priority>3)

Good

if(priority>MAX_PRIORITY)

---

# Constants

Everything reusable belongs in constants.

Roles

Status

Priority

Colors

Permissions

Routes

Endpoints

---

# Strings

Avoid repeated strings.

Extract constants.

---

# Async Code

Always

async/await

Avoid long promise chains.

Always wrap async operations with proper error handling.

---

# Error Messages

Human readable.

Specific.

Helpful.

Bad

Something went wrong.

Good

Shipment cannot be approved because no dispatcher has been assigned.

---

# Console Logs

Allowed

Temporary debugging

Remove before completion.

Never commit debug logs.

---

# Dead Code

Delete unused imports.

Delete unused variables.

Delete commented code.

Delete abandoned functions.

---

# Boolean Names

Start with

is

has

can

should

Examples

isDelivered

hasPermission

canEdit

shouldNotify

---

# Files

One primary export per file.

---

# JSX

Avoid deeply nested JSX.

Split components.

---

# Props

Avoid passing huge objects.

Pass only required values.

---

# Hooks

Custom hooks

Begin with

use

Example

useShipment()

useDashboard()

---

# API Calls

Never duplicate.

Centralize.

---

# Validation

Validate inputs immediately.

Fail early.

---

# Optional Chaining

Prefer

user?.name

instead of nested checks.

---

# Destructuring

Use when it improves readability.

Avoid unnecessary destructuring.

---

# Performance

Memoize only when beneficial.

Avoid premature optimization.

---

# Security

Never trust client input.

Always validate.

Always sanitize.

---

# Formatting

Use consistent indentation.

Keep blank lines meaningful.

Avoid giant blocks.

---

# Code Review Checklist

Before finishing

✓ Names are meaningful

✓ Functions are small

✓ No duplicate logic

✓ No unused code

✓ Imports cleaned

✓ Readable

✓ Business logic in services

✓ Controllers remain thin

✓ Error handling present

✓ Validation complete

✓ Production quality maintained

Only then is the implementation considered complete.