# FreightBind AI — Component Architecture Rules

Version: 1.0
Priority: CRITICAL

---

# PURPOSE

Every React component must be modular, reusable, readable, and scalable.

Never create giant JSX files.

The UI should look like it belongs to a real SaaS product.

---

# DIRECTORY STRUCTURE

Each page must own its own components.

Example:

pages/
    Dashboard/
        Dashboard.jsx
        components/
            DashboardHeader.jsx
            DashboardStats.jsx
            DashboardCharts.jsx
            DashboardTable.jsx

NOT

components/
    DashboardHeader.jsx
    DashboardStats.jsx
    DashboardCharts.jsx

unless those components are shared.

---

# SHARED COMPONENTS

Only reusable components belong here.

components/

Buttons/

Cards/

Charts/

Dialogs/

Drawers/

Forms/

Inputs/

Layouts/

Loaders/

Maps/

Modals/

Navbar/

Notifications/

Sidebar/

Skeletons/

Tables/

Timeline/

Widgets/

EmptyState/

Avatars/

Badges/

Status/

Icons/

---

# COMPONENT SIZE

Maximum:

250 lines

Ideal:

80-180 lines

If larger:

Split.

---

# JSX RULES

Never write huge JSX.

Bad

return (
<div>
...
500 lines...
</div>
)

Good

<DashboardHeader />

<ShipmentStats />

<ShipmentChart />

<ShipmentTable />

<PageFooter />

---

# LOGIC RULES

Business logic

↓

Hooks

↓

Components

Never place huge logic blocks inside JSX.

Instead

hooks/

useShipments.js

useDashboard.js

useNotifications.js

---

# CUSTOM HOOKS

Anything reused twice

↓

Create hook.

Example

usePagination()

useSearch()

useFilter()

useShipmentStats()

useNotification()

---

# API RULES

Never call axios directly inside components.

Wrong

Dashboard.jsx

axios.get()

Correct

services/

shipmentService.js

notificationService.js

dashboardService.js

AIService.js

Component

↓

Service

↓

API

---

# CONSTANTS

Never hardcode.

Bad

if(role==="Admin")

Good

ROLES.ADMIN

---

# COLORS

Never

className="bg-red-500"

Instead

theme

role colors

status colors

priority colors

---

# STATUS COMPONENTS

Never hardcode badges.

Always use

<StatusBadge />

---

# BUTTONS

Never duplicate button styles.

Always

<AppButton />

Variants

Primary

Secondary

Danger

Success

Ghost

Outline

Loading

Icon

---

# INPUTS

Shared

TextInput

PasswordInput

DateInput

SearchInput

SelectInput

TextArea

PhoneInput

FileUpload

---

# TABLES

Never duplicate.

Shared table component.

Supports

Sorting

Filtering

Pagination

Loading

Selection

Actions

Sticky header

Responsive

---

# EMPTY STATES

Every page must support

No Data

No Search Result

No Permission

Offline

Server Error

Loading

---

# LOADING

Never show blank page.

Always

Skeletons

Spinners

Progress bars

---

# ICONS

Use

Heroicons

Lucide

Never random icon packs.

---

# ANIMATIONS

Always

Fade

Slide

Hover

Scale

Loading

Skeleton shimmer

Page transitions

Micro interactions

Never excessive.

---

# RESPONSIVENESS

Desktop First

Must support

1920

1600

1440

1366

1280

1024

768

480

375

320

---

# ACCESSIBILITY

Buttons

aria-label

Forms

labels

Keyboard support

Visible focus

Contrast

---

# FILE NAMING

PascalCase

ShipmentCard.jsx

ShipmentTable.jsx

NotificationDrawer.jsx

Not

shipment.jsx

card.jsx

test.jsx

---

# EXPORTS

Default export

One component per file

---

# COMMENTS

Explain WHY

Never WHAT.

Bad

// increment i

Good

// Prevent duplicate timeline events caused by websocket reconnects

---

# CLEAN CODE

Avoid

Nested ternary

Nested map

Nested if

Instead

Extract component

Extract helper

Extract hook

---

# REUSABILITY SCORE

Every new component should answer

Can another page reuse this?

If yes

Move to shared components.

---

# PREMIUM UI RULE

Every screen should look production-ready without requiring redesign.

If a screen looks like a college project,
it must be redesigned before implementation is considered complete.