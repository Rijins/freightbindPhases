# Quality Checklist

Version: 1.0
Status: Mandatory

---

# PURPOSE

Before OpenCode CLI finishes ANY task, it must verify that the generated code satisfies every quality requirement.

If any checklist item fails, the task is NOT complete.

---

# GENERAL CHECKLIST

Before finishing verify:

✅ Project builds successfully

✅ No TypeScript errors (if applicable)

✅ No ESLint errors

✅ No unused imports

✅ No unused variables

✅ No duplicate code

✅ No duplicated components

✅ No console.log left in production code

✅ No commented dead code

✅ No TODO comments

✅ No fake data

✅ No placeholder text

---

# BACKEND CHECKLIST

Verify:

✅ Controllers stay thin

✅ Business logic remains inside services

✅ Validation exists

✅ Proper HTTP status codes

✅ Consistent API responses

✅ Error handling exists

✅ Async functions wrapped correctly

✅ Database queries optimized

✅ No duplicated queries

✅ Proper indexes considered

✅ Authorization enforced

✅ RBAC enforced

✅ No security regression

---

# DATABASE CHECKLIST

Verify:

✅ Schema valid

✅ References valid

✅ Populate only when necessary

✅ No unnecessary database queries

✅ Transactions used when required

✅ Proper indexes

---

# API CHECKLIST

Every endpoint must have

✅ Validation

✅ Success response

✅ Error response

✅ Authentication

✅ Authorization

✅ Proper status code

✅ Pagination if required

✅ Filtering if required

✅ Sorting if required

---

# FRONTEND CHECKLIST

Verify:

✅ Responsive

✅ Mobile friendly

✅ Tablet friendly

✅ Desktop friendly

✅ Accessibility

✅ Keyboard navigation

✅ Loading state

✅ Error state

✅ Empty state

✅ Skeleton loader

✅ Animations

✅ Proper spacing

---

# COMPONENT CHECKLIST

Every component must

✅ Be reusable

✅ Be modular

✅ Have props documented

✅ Avoid duplicated logic

✅ Follow naming rules

✅ Follow design system

---

# PAGE CHECKLIST

Every page must include

✅ Proper title

✅ Breadcrumb

✅ Search

✅ Filter

✅ Actions

✅ Content

✅ Loading

✅ Error

✅ Empty

✅ Pagination

---

# FORM CHECKLIST

Every form must include

✅ Validation

✅ Inline validation

✅ Submit loading

✅ Disabled submit

✅ Reset

✅ Success toast

✅ Error toast

---

# TABLE CHECKLIST

Every table must include

✅ Search

✅ Sort

✅ Pagination

✅ Responsive mode

✅ Loading

✅ Empty state

✅ Hover effects

---

# MODAL CHECKLIST

Every modal must

✅ Animate

✅ Close correctly

✅ Trap focus

✅ ESC support

✅ Overlay click

✅ Responsive

---

# DRAWER CHECKLIST

Every drawer must

✅ Animate

✅ Responsive

✅ Accessible

✅ Proper close behavior

---

# UI CHECKLIST

Verify

✅ Color consistency

✅ Shadows

✅ Border radius

✅ Typography

✅ Icons

✅ Illustrations

✅ Motion

✅ Premium appearance

---

# PERFORMANCE CHECKLIST

Verify

✅ Lazy loading

✅ Code splitting

✅ Memoization where required

✅ Optimized renders

✅ No unnecessary re-renders

✅ Optimized API requests

---

# ANIMATION CHECKLIST

Verify

✅ Smooth transitions

✅ Hover animations

✅ Page transitions

✅ Card animations

✅ Button animations

✅ Modal animations

✅ Drawer animations

✅ Loading animations

Animations should enhance UX and must never reduce usability.

---

# BEFORE COMPLETING A TASK

OpenCode CLI must ask itself:

1. Does this match every rule inside the /rules folder?

2. Would a senior engineer approve this implementation?

3. Does the UI look premium?

4. Is the code readable?

5. Is the architecture preserved?

6. Did I avoid touching unrelated files?

7. Did I improve the project rather than just making it work?

If the answer to any question is NO,

the task is NOT complete.

Only after every checklist passes may the task be considered complete.