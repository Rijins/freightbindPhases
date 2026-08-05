# FreightBind AI - Folder Structure Rules

Version: 1.0
Status: Mandatory

---

# Purpose

Every file must live in the correct location.

Never create random folders.

Never duplicate logic.

Never mix responsibilities.

Follow Feature Based Architecture.

---

# Root Structure

```
FreightBind-AI/

backend/
frontend/
rules/
README.md
```

---

# Backend Structure

```
backend/

config/

constants/

controllers/

middleware/

models/

routes/

services/

helpers/

utils/

validators/

socket/

jobs/

uploads/

tests/

server.js
```

---

# Controller Rules

Controllers should ONLY

- Read request
- Validate request
- Call service
- Return response

Nothing else.

Controllers must NEVER

- Query MongoDB
- Build notifications
- Create timelines
- Calculate analytics
- Write business logic

Everything belongs inside services.

---

# Service Rules

Every business rule belongs here.

Example

Shipment Service

Responsible for

Create Shipment

Update Shipment

Delete Shipment

Assignment

Notification Trigger

Timeline Trigger

Validation

etc

---

Notification Service

Responsible for

Creating notification

Sending websocket event

Mark read

Delete

Announcement

etc

---

Timeline Service

Responsible for

Timeline events

Shipment history

Movement

Status events

---

AI Service

Responsible for

Gemini

Predictions

Risk analysis

Summary generation

Nothing else.

---

# Models

Models contain ONLY schema.

No business logic.

No API calls.

No helper functions.

Only

```
Schema

Indexes

Statics

Methods
```

---

# Routes

Routes should ONLY contain

```
router.get()

router.post()

router.put()

router.delete()
```

Nothing else.

---

# Middleware

Authentication

Authorization

Validation

Error handling

Logging

Request timing

Rate limiting

Nothing else.

---

# Helpers

Reusable helper functions.

Examples

```
notificationBuilder

responseBuilder

shipmentFormatter

dateFormatter

```

---

# Utils

Pure utilities.

No database.

No models.

No services.

Examples

```
slugify

generateTrackingNumber

uuid

timeDifference

```

---

# Validators

Every request must have validation.

One validator per feature.

Example

```
shipmentValidation.js

notificationValidation.js

timelineValidation.js

authValidation.js

```

---

# Socket Folder

Only socket logic.

```
socket/

socket.js

notificationSocket.js

shipmentSocket.js

```

Never put socket logic inside services.

---

# Jobs Folder

Background tasks.

Examples

```
AI prediction

Daily cleanup

Notification retry

Cron jobs

```

---

# Upload Folder

Images

Documents

Reports

Exports

Never commit uploaded files.

---

# Tests

Mirror production structure.

```
tests/

controllers/

services/

routes/

```

---

# Frontend Structure

```
frontend/

src/

assets/

components/

layouts/

pages/

features/

hooks/

contexts/

redux/

services/

utils/

constants/

routes/

styles/

animations/

icons/

types/

```

---

# Assets

```
assets/

images/

videos/

gifs/

illustrations/

logos/

icons/

animations/

```

Never place assets elsewhere.

---

# Components

Shared reusable UI.

Example

```
Button

Card

Input

Modal

Sidebar

Navbar

Table

Badge

Avatar

Charts

```

---

# Layouts

Only layouts.

```
AdminLayout

DirectorLayout

DispatcherLayout

OperatorLayout

AuthLayout

```

---

# Pages

Only page containers.

No heavy logic.

No API.

Pages assemble components.

---

# Features

Every major module gets its own folder.

Example

```
features/

shipments/

notifications/

timeline/

analytics/

ai/

dashboard/

users/

settings/

```

Each feature contains

```
components/

hooks/

pages/

services/

utils/

```

---

# Redux

```
redux/

store.js

auth/

shipment/

notification/

timeline/

dashboard/

```

One slice per feature.

---

# Services

API layer only.

```
shipmentApi.js

notificationApi.js

authApi.js

timelineApi.js

```

Never place axios inside components.

---

# Hooks

Reusable hooks.

```
useAuth

usePagination

useNotifications

useSocket

usePermissions

```

---

# Utils

Formatting.

Conversions.

Calculations.

No React.

---

# Styles

Global styles only.

```
tailwind.css

variables.css

theme.css

```

---

# Animations

Framer Motion variants.

Page transitions.

Loading animations.

Card animations.

Nothing else.

---

# Naming Convention

Folders

```
lowercase

```

Files

```
PascalCase.jsx

camelCase.js

```

Examples

```
ShipmentCard.jsx

NotificationPanel.jsx

useNotifications.js

shipmentApi.js

```

---

# Import Rules

Correct

```
Page

↓

Feature

↓

Component

↓

Hook

↓

Service

↓

Utility

```

Never import backwards.

---

# Maximum File Size

React Component

<300 lines

Service

<350 lines

Controller

<120 lines

Route

<100 lines

Utility

<150 lines

If exceeded

Split the file.

---

# No Duplicate Code

If identical code appears twice

Extract it.

---

# One Responsibility Rule

Every file should answer ONE question.

Examples

ShipmentCard

Displays shipment.

NOT

Displays shipment

Fetches shipment

Updates shipment

Deletes shipment

Handles socket

Those belong elsewhere.

---

# Final Rule

A new contributor should understand the project structure within five minutes.

If not,

the structure is wrong.