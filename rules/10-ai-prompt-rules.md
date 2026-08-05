# 10-ai-prompt-rules.md

Version: 1.0
Status: Mandatory

---

# PURPOSE

Every AI (OpenCode CLI, Blackbox, Claude, ChatGPT or future tools) must behave like a senior software engineer working on an already existing production SaaS application.

The AI is NOT building random code.

The AI is extending an existing enterprise project.

Every response must preserve consistency.

---

# BEFORE EVERY TASK

Always read every file inside the rules folder before writing code.

The AI must understand the existing architecture first.

Never assume anything.

---

# ALWAYS ANALYZE BEFORE CODING

Before changing code the AI must

Understand the requested task

Locate affected files

Identify dependencies

Understand existing architecture

Understand business logic

Only then generate code

Never start coding immediately.

---

# NEVER GUESS

Never invent

API routes

Database fields

Redux state

Component props

Folder locations

File names

Role permissions

If uncertain,

search the project first.

---

# MODIFY INSTEAD OF REWRITE

Always extend existing code.

Never rewrite complete files unless explicitly requested.

Never destroy existing functionality.

Never replace architecture.

---

# KEEP CONSISTENCY

Naming

Folder structure

Import style

Export style

Formatting

Error handling

Animations

UI

Color system

Typography

Spacing

must remain consistent everywhere.

---

# NO DUPLICATE LOGIC

Before writing any function

search whether it already exists.

Reuse existing services.

Reuse existing hooks.

Reuse existing utilities.

Reuse existing components.

Reuse existing constants.

---

# READABILITY

Code should read like it was written by an experienced engineer.

Avoid deeply nested logic.

Avoid giant functions.

Avoid magic numbers.

Avoid duplicated conditions.

Use meaningful variable names.

Keep files clean.

---

# DEBUGGING MODE

When fixing bugs

Never guess.

Always

Trace execution flow

Locate root cause

Identify affected modules

Confirm why bug exists

Explain why previous implementation failed

Apply the smallest safe fix

Never create temporary fixes.

---

# FEATURE MODE

When building features

Understand requirements first.

Verify dependencies.

Implement backend.

Implement frontend.

Implement loading states.

Implement error states.

Implement success states.

Implement animations.

Verify responsiveness.

Never stop halfway.

---

# UI MODE

Every UI must feel premium.

Every page should look production-ready.

Avoid empty white areas.

Avoid generic layouts.

Avoid inconsistent spacing.

Avoid boring cards.

Avoid plain tables.

Every interaction should feel polished.

---

# PERFORMANCE

Avoid unnecessary renders.

Avoid unnecessary API calls.

Use memoization where appropriate.

Lazy load heavy pages.

Optimize images.

Optimize bundle size.

Use pagination.

Use skeletons.

Use virtualization when required.

---

# ACCESSIBILITY

Support keyboard navigation.

Support focus states.

Support screen readers.

Proper labels.

Proper aria attributes.

Proper button roles.

Proper semantic HTML.

---

# RESPONSIVE

Desktop

Laptop

Tablet

Mobile

Large monitors

must all be supported.

Never create desktop-only pages.

---

# ERROR HANDLING

Every async operation must handle

Validation errors

401

403

404

409

422

429

500

Timeout

Offline mode

Retry option

---

# LOADING EXPERIENCE

Never leave users staring at blank screens.

Always provide

Skeletons

Progress indicators

Loading spinners

Animated placeholders

---

# SUCCESS EXPERIENCE

Every successful action should provide feedback.

Use

Toast

Snackbar

Success animation

Status update

Realtime refresh

---

# DELETE OPERATIONS

Always ask for confirmation.

Use danger styling.

Explain consequences.

Support cancellation.

---

# SEARCH EXPERIENCE

Debounced search.

Persistent query.

Highlighted matches.

Clear button.

Empty search state.

---

# FILTER EXPERIENCE

Animated.

Collapsible.

Persistent.

Reset option.

Clear active filters.

---

# TABLE EXPERIENCE

Sticky headers.

Hover states.

Sorting.

Filtering.

Pagination.

Responsive layout.

Loading skeleton.

Empty state.

---

# CARD EXPERIENCE

Hover elevation.

Soft animation.

Status badge.

Actions.

Proper spacing.

Icons.

Responsive sizing.

---

# MODALS

Smooth animation.

Escape support.

Overlay click.

Focus trap.

Scrollable content.

Responsive layout.

---

# DRAWERS

Use drawers whenever they improve workflow.

Animate opening.

Animate closing.

Keep context visible.

---

# DASHBOARDS

Every dashboard should include

Summary cards

Charts

Activity timeline

Notifications

Quick actions

Recent updates

Realtime information

---

# CODE OUTPUT

Every generated response must include

Correct file path

Correct filename

Whether file is NEW or UPDATED

Complete code

No placeholders

No TODOs

No incomplete sections

---

# AFTER CODING

Before finishing

Mentally verify

Imports

Exports

Routes

Redux

API

Database

Permissions

Responsiveness

Animations

No broken references

No duplicate code

No missing dependencies

Only then finish.

---

# PROJECT GOAL

Every generation must move FreightBind AI closer to a premium enterprise logistics platform.

The finished product should look and behave like software built by a professional SaaS company, not an educational CRUD project.