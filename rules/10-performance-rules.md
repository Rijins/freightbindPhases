# 10-performance-rules.md

# Performance & Optimization Rules

Version: 1.0

Status: Mandatory

---

# PURPOSE

This project must feel like a premium SaaS product.

Beautiful UI means nothing if interactions are slow.

Every feature must be built with performance in mind.

Performance is a requirement.

Not an improvement.

---

# GENERAL RULES

Never sacrifice readability for micro optimizations.

Optimize only where needed.

Avoid premature optimization.

Prefer maintainable optimizations.

---

# REACT COMPONENTS

Use memoization only where beneficial.

Use React.memo for reusable heavy components.

Use useMemo for expensive calculations.

Use useCallback for callbacks passed to children.

Avoid unnecessary re-renders.

Never create inline objects repeatedly inside JSX.

Never create inline functions inside mapped lists unless necessary.

---

# STATE MANAGEMENT

Keep state local whenever possible.

Do not put temporary UI state inside Redux.

Redux is only for shared application state.

Avoid deeply nested state.

Normalize large collections.

---

# API CALLS

Never duplicate API requests.

Cache when appropriate.

Cancel stale requests.

Use AbortController.

Prevent race conditions.

Prevent duplicate submissions.

Never request the same data repeatedly.

---

# LAZY LOADING

Use lazy loading for

Pages

Large dialogs

Charts

Heavy components

Image galleries

Analytics

Maps

AI modules

---

# IMAGE OPTIMIZATION

Lazy load images.

Compress images.

Prefer WebP.

Use AVIF when supported.

Provide fallback.

Never load full-size images unnecessarily.

---

# ICONS

Import icons individually.

Never import entire icon libraries.

---

# GIFS

Only load GIFs when visible.

Replace large GIFs with MP4 whenever possible.

Loop only when necessary.

---

# VIDEOS

Use preload="metadata".

Lazy load videos.

Pause when hidden.

Stop playback when leaving page.

---

# ANIMATIONS

Animations must never block interaction.

Prefer GPU accelerated animations.

Animate only

opacity

transform

Avoid animating

width

height

left

top

margin

when alternatives exist.

---

# TABLE PERFORMANCE

Virtualize large tables.

Paginate server-side when needed.

Avoid rendering hundreds of rows.

---

# LIST PERFORMANCE

Never render massive lists directly.

Use virtualization.

Lazy load sections.

---

# CHART PERFORMANCE

Load charts only when visible.

Destroy unused charts.

Avoid unnecessary redraws.

---

# SEARCH

Debounce input.

Minimum delay

300ms

Cancel previous requests.

---

# FILTERS

Compute efficiently.

Avoid repeated filtering.

Memoize expensive operations.

---

# ROUTING

Lazy load routes.

Show skeleton while loading.

Prefetch important routes.

---

# BUNDLE SIZE

Avoid huge dependencies.

Prefer lightweight libraries.

Remove unused packages.

Tree shake whenever possible.

---

# CSS

Avoid duplicated styles.

Prefer reusable utility classes.

Avoid deeply nested selectors.

---

# MEMORY

Remove listeners.

Remove timers.

Remove subscriptions.

Disconnect observers.

Prevent memory leaks.

---

# SOCKET.IO

Disconnect on logout.

Reconnect automatically.

Prevent duplicate listeners.

Prevent duplicate events.

---

# FORMS

Avoid unnecessary validation loops.

Validate efficiently.

Disable repeated submits.

---

# PAGINATION

Never download everything.

Prefer server pagination.

Load incrementally.

---

# MOBILE PERFORMANCE

Target smooth 60 FPS interactions.

Avoid layout shifts.

Optimize touch interactions.

Minimize network requests.

---

# LOADING EXPERIENCE

Show skeletons immediately.

Avoid blank screens.

Keep transitions smooth.

Never freeze UI.

---

# ERROR HANDLING

Fail gracefully.

Recover automatically when possible.

Provide retry options.

Never leave UI stuck.

---

# ACCESSIBILITY PERFORMANCE

Performance optimizations must never reduce accessibility.

Keyboard navigation must remain functional.

Screen readers must continue working.

---

# CODE SPLITTING

Split features by route.

Split admin tools.

Split analytics.

Split AI features.

Split charts.

---

# BUILD QUALITY

No unused imports.

No dead code.

No duplicate logic.

No unnecessary dependencies.

No console logs in production.

---

# FINAL REQUIREMENT

Every feature added to FreightBind AI must be

Fast

Responsive

Optimized

Scalable

Maintainable

Production Ready

Premium Quality

No exceptions.