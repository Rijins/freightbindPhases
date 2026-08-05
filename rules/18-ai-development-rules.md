# AI Development Rules

Version: 1.0

Status: Mandatory

---

# PURPOSE

FreightBind AI is developed using AI-assisted tools.

OpenCode CLI, Blackbox AI, ChatGPT, and any future AI assistant must follow identical standards.

AI is a development assistant.

AI is NEVER the architect.

The architecture is already defined.

---

# AI WORKFLOW

Before writing code the AI MUST

1. Read every file inside the /rules directory.

2. Read the files that will be modified.

3. Understand the existing architecture.

4. Understand the current phase.

5. Understand previous implementations.

Only then begin coding.

---

# NEVER

Never redesign architecture.

Never rename existing folders.

Never rename APIs.

Never rename Redux slices.

Never rename routes.

Never rename models.

Never move files.

Never delete files.

Never replace existing implementations.

Never regenerate completed modules.

Never rewrite unrelated files.

---

# CODE GENERATION

Generate only what is requested.

Generate production-ready code.

Generate readable code.

Generate modular code.

Generate reusable code.

Generate human-like code.

Avoid AI-looking code patterns.

---

# CODE STYLE

Prefer

Small functions

Reusable utilities

Meaningful variable names

Early returns

Clear structure

Consistent formatting

Avoid

Huge files

Nested conditions

Duplicate logic

Magic numbers

Cryptic names

---

# EXISTING FILES

When modifying existing files

Read the entire file first.

Understand why code exists.

Modify only necessary sections.

Preserve formatting.

Preserve architecture.

Preserve comments.

Never reorder unrelated code.

---

# NEW FILES

Every new file must include

Correct path

Correct filename

Correct imports

Correct exports

Documentation when needed

Error handling

Loading states

Responsive behavior

Animations where applicable

---

# UI

Every generated UI must follow

rules/05-ui-design-system.md

rules/06-role-design-guide.md

Never invent new colors.

Never invent new spacing systems.

Never invent new typography.

Never ignore role branding.

---

# BACKEND

Every backend change must

Follow service architecture.

Keep controllers thin.

Keep business logic inside services.

Use existing utilities.

Use existing middleware.

Reuse validators.

---

# API

Never invent endpoints.

Never invent request formats.

Never invent responses.

Use existing API conventions.

---

# DATABASE

Never change schema without explicit instruction.

Never remove fields.

Never rename fields.

Never break existing relationships.

---

# DEBUGGING

Never guess.

Always trace execution.

Always identify root cause.

Always explain

Problem

Cause

Fix

Impact

Files affected

---

# PERFORMANCE

Prefer

Reusable components

Memoization

Lazy loading

Efficient database queries

Minimal API requests

Optimized rendering

---

# SECURITY

Validate input.

Authorize actions.

Protect routes.

Never expose secrets.

Never trust frontend input.

---

# TESTING

Every generated feature must include

Loading state

Error state

Empty state

Responsive layout

Role validation

Business rule validation

---

# OUTPUT FORMAT

When creating files

Always show

Correct path

Filename

Complete file

When updating files

Always specify

File path

Section changed

Reason for change

---

# FINAL CHECK

Before completing a task the AI must verify

✔ Rules followed

✔ Architecture preserved

✔ UI consistent

✔ Backend consistent

✔ Readable code

✔ No duplicate logic

✔ No broken imports

✔ No unrelated changes

✔ Production quality

If any check fails,

the task is NOT complete.

---

# GOLDEN RULE

The AI must behave like a senior engineer who has been working on FreightBind AI since Phase 01.

It must understand the project before writing code.

It must improve the project without breaking existing work.