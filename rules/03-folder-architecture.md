# FreightBind AI - Folder Architecture Rules

Version: 1.0
Status: LOCKED

---

# Goal

Every file must have a predictable location.

No random folders.
No duplicate folders.
No duplicate utilities.
No duplicate components.

The project should look like it was written by one senior engineer.

---

# Backend Structure

backend/

```
src/
│
├── config/
│
├── constants/
│
├── controllers/
│
├── middleware/
│
├── models/
│
├── routes/
│
├── services/
│
├── helpers/
│
├── validators/
│
├── sockets/
│
├── utils/
│
├── jobs/
│
├── docs/
│
└── app.js
```

Rules

Controllers

Only request handling.

Never business logic.

Never database logic.

Never validation logic.

Services

Contains ALL business logic.

Controllers call Services only.

Database

Controllers NEVER touch models directly.

Only services access mongoose models.

Helpers

Reusable helper functions.

Never call database.

Never call express.

Utils

Pure utility functions.

Validators

Zod validation only.

Routes

Route definitions only.

Middleware

Authentication

Authorization

Error handling

Logging

Rate limiting

Nothing else.

Sockets

WebSocket events.

Realtime events.

Jobs

Future cron jobs.

Background tasks.

---

# Frontend Structure

frontend/

```
src/

├── app/

├── assets/

│   ├── images/
│   ├── icons/
│   ├── videos/
│   ├── gifs/
│   └── illustrations/

├── components/

│   ├── common/
│   ├── dashboard/
│   ├── shipment/
│   ├── timeline/
│   ├── notification/
│   ├── analytics/
│   ├── forms/
│   ├── charts/
│   ├── ui/

├── layouts/

├── pages/

│   ├── auth/
│   ├── admin/
│   ├── logisticsDirector/
│   ├── dispatcher/
│   ├── hubOperator/

├── hooks/

├── services/

├── redux/

│   ├── slices/
│   ├── store.js

├── routes/

├── utils/

├── constants/

├── styles/

├── animations/

└── main.jsx
```

---

# Components

Each component gets its own folder.

Example

```
components/common/UserAvatar/

UserAvatar.jsx

UserAvatar.css

index.js
```

Never place 20 unrelated components in one folder.

---

# Page Rule

Pages are containers.

Pages should never exceed

400 lines

Move repeated UI into components.

---

# API Rule

Every backend API gets its own service.

Example

services/

```
shipmentService.js

notificationService.js

analyticsService.js

timelineService.js

userService.js
```

Never mix API calls.

---

# Redux Rule

One slice per feature.

Example

```
shipmentSlice.js

notificationSlice.js

authSlice.js

dashboardSlice.js
```

---

# Assets Rule

Store assets by type.

```
assets/images/

assets/icons/

assets/videos/

assets/gifs/

assets/lottie/
```

Never place images inside components.

---

# Icons

Use

lucide-react

only.

Never mix

Heroicons

Material Icons

FontAwesome

Remix Icons

unless explicitly approved.

---

# Animations

Keep all reusable animations inside

```
animations/
```

Examples

```
fade.js

slide.js

stagger.js

pageTransition.js

cardHover.js
```

---

# Styling

Never inline huge Tailwind strings repeatedly.

Extract reusable classes into

styles/

or reusable components.

---

# File Size Limits

Component

<300 lines

Page

<400 lines

Service

<350 lines

Controller

<150 lines

Utility

<200 lines

If larger

Split.

---

# Naming Convention

Components

PascalCase

```
ShipmentCard.jsx
```

Hooks

camelCase

```
useShipment.js
```

Utilities

camelCase

```
formatDate.js
```

Redux

camelCase

```
shipmentSlice.js
```

Constants

UPPER_CASE

```
roles.js

shipmentStatus.js
```

---

# Imports

Order

React

Libraries

Components

Hooks

Redux

Services

Utilities

Styles

Example

```jsx
import React from "react";

import { motion } from "framer-motion";

import ShipmentCard from "../components/ShipmentCard";

import useShipment from "../hooks/useShipment";

import "./Dashboard.css";
```

---

# Absolute Imports

Prefer aliases.

Example

```
@/components

@/services

@/hooks

@/redux

@/utils
```

Avoid

```
../../../../
```

---

# AI Rule

When creating new files

Follow this structure exactly.

Never invent folders.

Never duplicate existing architecture.

Always place files in the correct directory.