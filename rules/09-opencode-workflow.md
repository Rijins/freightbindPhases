# OpenCode CLI Workflow Rules

Version: 1.0
Status: Mandatory

---

# PURPOSE

These rules exist because this project is generated incrementally using OpenCode CLI.

Every generation MUST preserve architecture, readability, naming consistency, and UI quality.

OpenCode must NEVER behave like a code generator that rewrites random files.

It must behave like a senior software engineer working inside an existing production repository.

---

# BEFORE WRITING CODE

Before generating ANYTHING, OpenCode MUST read:

rules/01-project-rules.md

rules/02-folder-structure.md

rules/03-backend-rules.md

rules/04-frontend-rules.md

rules/05-ui-design-system.md

rules/06-role-design-guide.md

rules/07-code-style.md

rules/08-component-patterns.md

rules/09-opencode-workflow.md

If any rule conflicts with generated code,

THE RULES WIN.

---

# NEVER

Never rewrite unrelated files.

Never rename files.

Never move folders.

Never replace existing architecture.

Never generate placeholders.

Never generate TODOs.

Never generate fake APIs.

Never remove existing features.

Never remove animations.

Never remove loading states.

Never remove error states.

Never remove empty states.

Never downgrade UI quality.

---

# WHEN MODIFYING A FILE

Modify ONLY what is necessary.

Keep existing formatting.

Keep existing imports if still used.

Never reorder unrelated code.

Never change variable names without reason.

Never reformat the whole file.

Only touch the required section.

---

# WHEN CREATING FILES

Always provide

Correct path

Correct filename

Correct imports

Correct exports

Correct routing

Correct styling

Correct hooks

Correct error handling

Correct loading states

Correct responsive layout

Never leave incomplete files.

---

# COMPONENT CREATION

Every new component must

be reusable

be typed consistently

be modular

be documented

have loading state

have empty state

have error state

be responsive

be animated

follow design system

---

# PAGE CREATION

Every page must contain

Hero/Header

Breadcrumb

Page title

Action buttons

Search

Filter

Cards

Tables

Pagination

Loading

Skeleton

Empty state

Error state

Responsive layout

Animations

---

# API WORKFLOW

Every API integration must include

Loading

Success

Failure

Toast

Retry

Abort

Empty response

Unauthorized response

Forbidden response

Validation response

Server error response

---

# FORMS

Every form must include

Validation

Live validation

Disabled button while submitting

Loading spinner

Success toast

Failure toast

Reset support

Responsive layout

Keyboard accessibility

---

# TABLES

Every table must support

Search

Pagination

Sorting

Filtering

Hover effects

Row animation

Loading skeleton

Empty state

Responsive mode

---

# CARDS

Every card should include

Elevation

Hover animation

Status indicator

Action buttons

Icon

Spacing

Consistent padding

---

# MODALS

Every modal must

Animate

Close correctly

Trap focus

Support ESC

Support overlay click

Be responsive

Have cancel button

Have confirm button

---

# DRAWERS

Use animated drawers whenever suitable.

Avoid fullscreen pages if a drawer improves UX.

---

# DASHBOARDS

Every dashboard should have

Summary cards

Charts

Recent activity

Quick actions

Notifications

Responsive grid

Animated widgets

---

# CHARTS

Every chart should include

Loading state

Empty state

Responsive resizing

Theme colors

Proper legends

Tooltips

---

# SEARCH

Debounced search.

Highlight matching text.

Maintain search state.

---

# FILTERS

Persistent.

Reset button.

Animated opening.

Responsive.

---

# PAGINATION

Animated.

Page size selector.

Total records.

Current page.

---

# ANIMATIONS

Use Framer Motion.

Do not over animate.

Animations should feel premium.

Keep animation duration between

150ms

350ms

Use stagger effects where appropriate.

---

# ICONS

Use Lucide icons.

Never mix icon libraries.

---

# COLORS

Use only theme tokens.

Never hardcode random colors.

---

# TYPOGRAPHY

Consistent hierarchy.

Proper spacing.

Readable sizes.

---

# IMAGES

Use optimized images.

Avoid stretched images.

Rounded corners.

Lazy load.

---

# GIFS

Only when meaningful.

Never distracting.

---

# VIDEOS

Muted

Loop

Autoplay when appropriate

Lazy loaded

---

# PERFORMANCE

Avoid unnecessary re-renders.

Memoize expensive components.

Use lazy loading.

Split large pages.

---

# ACCESSIBILITY

ARIA labels

Keyboard navigation

Visible focus

Contrast compliance

Semantic HTML

---

# CODE QUALITY

Readable

Maintainable

Professional

Self-explanatory

Senior-level

No hacks

No duplicated logic

No dead code

---

# OUTPUT FORMAT

When generating code, always return:

1. File Path

2. Whether it is

NEW FILE

or

UPDATE FILE

3. Complete code only.

Never omit sections.

Never shorten.

Never use placeholders.

---

# DEBUGGING

When debugging:

Find the root cause.

Do not patch symptoms.

Explain the issue.

Fix the architecture if needed.

Never introduce technical debt.

---

# FINAL GOAL

Every generated feature should look and feel like it belongs in a premium SaaS product comparable to:

Stripe

Linear

Notion

Vercel

Framer

Clerk

Render

GitHub

The project should consistently maintain a 10/10 production-ready quality across backend, frontend, UX, performance, maintainability, and
# ANIMATIONS

Animations are mandatory.

Every interaction should feel smooth.

Use Framer Motion wherever appropriate.

Use Motion for:

- Page transitions
- Route transitions
- Card entrance
- Card hover
- Buttons
- Tables
- Modals
- Drawers
- Dropdowns
- Notifications
- Skeleton replacement
- Hero sections
- Dashboard widgets

Animation duration should generally remain between

150ms–350ms

Avoid slow animations.

Never animate everything simultaneously.

Use stagger animations for lists.

Use fade + slide for entrances.

Use scale for hover.

Use spring animations for cards.

Respect reduced motion accessibility.

---

# LOADING EXPERIENCE

Never use plain text loading.

Always use Skeletons.

Loading should match final layout.

Dashboard:

Skeleton cards

Skeleton charts

Skeleton tables

Forms:

Disabled inputs

Loading buttons

Animated placeholders

Tables:

Skeleton rows

Cards:

Skeleton cards

---

# EMPTY STATES

Never leave blank pages.

Every empty state should include

Illustration

Helpful message

Action button

Example content when appropriate

Animation

---

# ERROR STATES

Every error should include

Friendly explanation

Retry button

Error illustration

Support message if needed

Never expose stack traces.

Never expose backend messages directly.

---

# RESPONSIVENESS

Desktop First

Then Tablet

Then Mobile

Support

1920px

1440px

1280px

1024px

768px

480px

360px

Never allow overflow.

Avoid horizontal scrolling.

---

# ACCESSIBILITY

Every UI must support

Keyboard navigation

Focus states

Screen readers

ARIA labels

Proper button types

Contrast ratio compliance

Semantic HTML

---

# ICONS

Use Lucide React only.

Do not mix icon libraries.

Icons should have consistent sizes.

16

18

20

24

32

Only.

---

# IMAGES

Images must be optimized.

Lazy load images.

Use placeholders while loading.

Never stretch images.

Maintain aspect ratio.

---

# GIFS

Use GIFs only when they improve UX.

Examples

Empty state

Success

Onboarding

Never distract users.

---

# VIDEOS

Background videos must

Be muted

Loop

Autoplay

Be lightweight

Have image fallback

Pause on reduced motion

Never reduce performance.

---

# PERFORMANCE

Avoid unnecessary re-renders.

Memoize expensive components.

Lazy load pages.

Lazy load charts.

Lazy load heavy components.

Split routes.

Optimize images.

Avoid large bundle sizes.

---

# FILE OUTPUT FORMAT

When creating files always provide

Path:
<exact path>

File:
<exact filename>

Then output the COMPLETE file.

Never output partial files.

Never truncate code.

Never omit imports.

Never omit exports.

Never use placeholders.

---

# MODIFICATION FORMAT

When updating existing files always provide

Updated File:
<exact path>

Then provide ONLY the modified file.

Do not explain.

Do not summarize.

Do not include unrelated files.

---

# QUALITY STANDARD

Every generated feature must feel like

Stripe

Linear

Notion

Vercel

Raycast

GitHub

Modern SaaS quality.

No beginner-looking UI.

No generic CRUD appearance.

Every screen should feel production-ready.

Every interaction should feel premium.

Every component should be reusable.

Every page should look polished enough to ship to production.

---

# FINAL RULE

OpenCode CLI must always behave like a senior software engineer working on an enterprise production codebase.

Code quality is more important than speed.

Readability is more important than cleverness.

Consistency is more important than personal preference.

If uncertain, preserve the existing architecture and follow every rule inside the `/rules` directory before generating or modifying any code.