# Enterprise Business Components (`src/components/widgets/`)

Reusable dashboards-and-operations components for FreightBind AI. These are
unbound to any page, dataset or API — every visual/domain component here takes
its data through props so callers can wire them straight to Redux, services or
demo data. No component imports a Redux slice, a service or a hardcoded record.

## Conventions

- All cards use the design-system surface: `rounded-[20px]`, `bg-white
  dark:bg-zinc-900`, `border-slate-200/80 dark:border-zinc-800`, `shadow-panel`.
- Reuses existing primitives (`Card`, `Badge`, `Avatar`, `ProgressBar`,
  `ProgressCircular`, `Chip`, `Skeleton`, `EmptyState`) — nothing here rebuilds
  them.
- Role theming via `useRoleTheme()`; module accents via `MODULE_ACCENTS`.
- Icons are `react-icons/fi` only.
- Loading uses skeletons, empty uses `EmptyState`; no placeholder text, no
  dummy data.
- Animations are Framer Motion (150–350ms, transform/opacity only) via `animations`.
- No TypeScript, no comments beyond the JSDoc header — matches the repo.

## Components

| Component | Purpose | Key props |
|---|---|---|
| `DashboardGrid` | Responsive grid shell with staggered entrance; `sizes` array controls column spans | `columns`, `sizes`, `gap` |
| `AlertBanner` | Page-level system banner (slides in/out, dismissible) | `severity`, `title`, `message`, `action`, `onDismiss` |
| `FilterBar` | Debounced search + select/chip filters with active count and reset | `filters`, `onFilterChange`, `onReset` |
| `QuickActionsWidget` | Grid of shortcut actions, gated by user role via `useAuth` | `actions[{label, icon, onClick, roles}]` |
| `RecentActivityWidget` | Staggered event feed (shipment/fleet/notification/AI rows) | `items[{title, user, timestamp, type, status}]` |
| `NotificationWidget` | Notification list with priority dot + unread emphasis | `items[{title, message, type, priority, unread}]` |
| `ShipmentStatusCard` | At-a-glance shipment: ID, origin→destination, status, dispatcher, ETA | `shipment` |
| `TimelineCard` | Vertical timeline with connectors + current-step highlight | `steps`, `currentStepId` |
| `VehicleCard` | Fleet: registration, driver, capacity progress, active shipment | `vehicle` |
| `DriverCard` | Driver: avatar/status, availability, shipment, location | `driver` |
| `HubCard` | Facility: location, utilization, active shipments | `hub` |
| `AiInsightCard` | AI recommendation: severity, summary, action, confidence ring | `insight`, `onApply` |

## Theming

Each component reads the active role theme via `useRoleTheme()` (soft tiles,
icon colors, accent bars, progress fills). Callers can override a single
accent with `MODULE_ACCENTS[module].text` / `.dot` where a component accepts
an `accent`-style prop; no component recolours a whole screen.

## Usage sketch

```jsx
import {
  DashboardGrid,
  RecentActivityWidget,
  ShipmentStatusCard,
} from "../../components/widgets";
import StatCard from "../../components/Card/StatCard";

<DashboardGrid columns={3} sizes={["sm:col-span-2", "", ""]}>
  <StatCard title="Active shipments" value={12} animateValue />
  <ShipmentStatusCard loading={loading} onClick={open} />
  <RecentActivityWidget items={activities} loading={loading} />
</DashboardGrid>
```

## Gotchas

- `DashboardGrid` wraps each child in its own grid cell; use `sizes` for
  spanning, not `className` on the child.
- `QuickActionsWidget` filters out actions whose `roles` don't include the
  current user's role — mirror the backend route gating, don't re-implement it
  in pages.
- `Table` footer slot replaces the old `Pagination` placement; pass
  `<Pagination …/>` as `footer` instead of rendering it after the table.