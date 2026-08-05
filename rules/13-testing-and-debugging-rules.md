# Testing & Debugging Rules

Version: 1.0
Status: Mandatory

---

# PURPOSE

FreightBind AI must be developed like production software.

Every feature must be verified before it is considered complete.

Code that is not tested is considered incomplete.

---

# DEVELOPMENT FLOW

Always follow this order

1. Understand the requirement

2. Read the affected files

3. Read project rules

4. Implement the solution

5. Verify functionality

6. Test edge cases

7. Verify UI

8. Verify responsiveness

9. Verify permissions

10. Finish

Never skip steps.

---

# DEBUGGING PROCESS

Never guess.

Always trace execution.

Debug in this order

Request

↓

Route

↓

Middleware

↓

Controller

↓

Service

↓

Database

↓

Response

Never apply random fixes.

Always identify the real root cause.

---

# ROOT CAUSE ANALYSIS

Every bug investigation should answer

What failed?

Where did it fail?

Why did it fail?

What caused it?

What files are affected?

What is the smallest safe fix?

Could this affect other modules?

---

# LOGGING

Temporary logs are allowed.

Before finishing

Remove all debug logs.

Never leave

console.log

debugger

temporary comments

inside production code.

---

# BACKEND TEST CHECKLIST

Verify

Authentication

Authorization

Validation

Business rules

Database writes

Database updates

Database deletes

Database reads

Pagination

Filtering

Sorting

Search

Error handling

---

# FRONTEND TEST CHECKLIST

Verify

Loading states

Empty states

Error states

Responsive layout

Animations

Forms

Tables

Cards

Charts

Navigation

Protected routes

Dark mode (if supported)

---

# API TESTING

Every endpoint should be tested for

200

201

204

400

401

403

404

409

422

429

500

Timeout

Network failure

---

# ROLE TESTING

Verify every feature using

Admin

Logistics Director

Carrier Dispatcher

Hub Operator

Ensure RBAC remains correct.

---

# UI TESTING

Verify

Buttons

Hover states

Forms

Dropdowns

Modals

Drawers

Pagination

Search

Filters

Tables

Charts

Animations

Toast messages

Loading skeletons

---

# RESPONSIVENESS TESTING

Verify

1920px

1440px

1280px

1024px

768px

480px

360px

No overflow.

No broken layouts.

---

# DATABASE TESTING

Verify

Data saved correctly

Relationships preserved

References valid

Indexes still usable

No duplicate records

No orphan records

---

# SOCKET TESTING

Verify

Realtime updates

Reconnect

Disconnect

Multiple users

Role restrictions

Duplicate listeners

---

# PERFORMANCE TESTING

Verify

No unnecessary renders

No duplicate API calls

Fast page load

Lazy loading works

No memory leaks

No blocking animations

---

# REGRESSION TESTING

Every new feature must not break

Authentication

Authorization

Notifications

Timeline

Shipment Management

Dashboard

Analytics

Existing UI

---

# BEFORE MARKING COMPLETE

Confirm

✔ Feature works

✔ Existing features still work

✔ UI matches design system

✔ Rules folder followed

✔ No console errors

✔ No build errors

✔ No lint errors

✔ No security regressions

✔ No performance regressions

Only then is the task considered complete.