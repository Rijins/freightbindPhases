# Git & Commit Rules

Version: 1.0
Status: Mandatory

---

# PURPOSE

FreightBind AI is developed incrementally.

Every change must be traceable.

Every commit should represent one logical unit of work.

The Git history should read like the development history of a real SaaS company.

---

# GENERAL RULES

Never make massive commits.

One feature = one commit.

One bug fix = one commit.

One refactor = one commit.

One UI improvement = one commit.

Never mix unrelated changes.

---

# BRANCH STRATEGY

main

Production-ready code only.

develop

Integration branch.

feature/<feature-name>

Every new feature.

bugfix/<bug-name>

Every bug fix.

hotfix/<issue-name>

Production emergency fixes.

refactor/<module-name>

Architecture improvements.

---

# COMMIT MESSAGE FORMAT

Use Conventional Commits.

Examples

feat(auth): add JWT refresh flow

feat(ui): build shipment dashboard

feat(notification): realtime socket updates

fix(notification): store notifications correctly

fix(auth): resolve token expiration issue

refactor(shipment): simplify service logic

style(ui): improve spacing consistency

docs(rules): update animation guidelines

test(api): add shipment service tests

---

# NEVER

Never commit generated files accidentally.

Never commit

node_modules

dist

build

coverage

.env

.env.local

logs

temporary files

OS files

---

# COMMIT QUALITY

Every commit should

Compile successfully

Pass linting

Pass tests (if available)

Contain only related changes

Be readable

Be reversible

---

# PULL REQUEST QUALITY

Every PR should include

Purpose

Files changed

Testing completed

Screenshots (if UI)

Known limitations

---

# BEFORE COMMIT

Verify

No console logs

No TODO comments

No dead code

No commented code

No duplicate files

No merge conflicts

No broken imports

No unused imports

No unused variables

No formatting issues

---

# VERSION CONTROL

Never rewrite Git history unnecessarily.

Never force push without reason.

Never delete branches prematurely.

Merge only after verification.

---

# RELEASES

Tag important milestones.

Example

v0.1.0

Backend Foundation

v0.2.0

Shipment Management

v0.3.0

Notifications

v0.4.0

Dashboard UI

v1.0.0

Production Release

---

# AI GENERATED CODE

Every AI-generated change must be reviewed.

AI output is never considered correct automatically.

Always verify

Architecture

Security

Performance

Readability

Business logic

Before committing.

---

# PROJECT HISTORY

The commit history should clearly show

Backend setup

Authentication

Shipment management

Timeline

Notifications

Dashboards

Analytics

AI integration

Real-time updates

UI polish

Testing

Deployment

Anyone reading the history should understand how FreightBind AI evolved from start to production.