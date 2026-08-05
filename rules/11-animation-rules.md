# Animation Rules

Version: 1.0
Status: Mandatory

---

# PURPOSE

Animations must make the application feel premium.

Animations should improve UX.

Animations must never distract users.

Everything should feel smooth.

---

# GLOBAL RULES

Never use abrupt appearance.

Everything enters smoothly.

Everything exits smoothly.

Everything reacts to hover.

Everything reacts to focus.

Everything reacts to click.

Animations should be hardware accelerated.

Always animate transform and opacity whenever possible.

Avoid animating width and height unless necessary.

Never create laggy animations.

---

# PAGE TRANSITIONS

Every page must have

Fade

Small upward movement

150-300ms duration

Never instant switch.

---

# CARD ANIMATIONS

Cards should

Fade in

Move upward slightly

Scale on hover

Shadow transition

Border transition

Cursor transition

Hover duration

150ms

---

# BUTTON ANIMATIONS

Buttons must

Scale slightly

Animate shadow

Animate background

Animate border

Animate icon

Disabled buttons must animate correctly.

Loading buttons must animate spinner.

---

# TABLE ANIMATIONS

Rows fade in.

Rows slide upward.

Hover animation.

Selected rows animate.

Expandable rows animate height.

---

# MODALS

Scale animation.

Fade animation.

Overlay fade.

Close animation.

Focus animation.

---

# DRAWERS

Slide animation.

Overlay fade.

Smooth close.

Responsive.

---

# SIDEBAR

Animated collapse.

Animated expand.

Animated active indicator.

Animated submenu.

---

# DASHBOARD

Cards appear staggered.

Charts animate.

Numbers count up.

Recent activity animates.

Notifications slide in.

---

# LISTS

Animate insertion.

Animate removal.

Animate sorting.

Animate filtering.

---

# SEARCH

Search results fade.

Highlight matched text.

Search suggestions animate.

---

# FILTERS

Dropdown animation.

Chip animation.

Reset animation.

---

# TOASTS

Slide from top-right.

Fade.

Progress bar.

Auto dismiss.

Pause on hover.

---

# LOADING

Skeleton shimmer.

Spinner.

Progress bars.

Never blank screens.

---

# EMPTY STATES

Fade illustration.

Fade message.

Fade CTA.

---

# ICONS

Rotate when appropriate.

Hover scale.

Smooth color transition.

---

# MICRO INTERACTIONS

Checkbox

Radio

Switch

Dropdown

Tabs

Accordion

Tooltip

Menu

Avatar

Notification badge

All should animate.

---

# SCROLL

Smooth scrolling.

Reveal sections.

Lazy animation.

Never animate everything simultaneously.

---

# STAGGER

Lists should appear sequentially.

Delay

30ms–60ms

Never more than 100ms.

---

# TIMING

Fast

100-150ms

Normal

180-250ms

Large

250-350ms

Never exceed 500ms.

---

# EASING

Prefer

ease-out

ease-in-out

Avoid linear.

---

# PERFORMANCE

60 FPS.

Avoid layout thrashing.

Avoid expensive repaint.

Avoid unnecessary animation loops.

---

# ACCESSIBILITY

Respect prefers-reduced-motion.

Disable non-essential animations.

Never rely on animation alone to convey meaning.

---

# LIBRARIES

Preferred

Framer Motion

Motion

GSAP (only when absolutely necessary)

CSS transitions

Tailwind animations

Do not introduce unnecessary animation libraries.

---

# REQUIRED

Every new component

Every page

Every modal

Every drawer

Every table

Every card

Every form

Every dashboard

must include thoughtful animations that match these rules.

These rules are mandatory.