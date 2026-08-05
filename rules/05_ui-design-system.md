# FreightBind AI - UI Design System Rules
Version: 1.0
Priority: CRITICAL
These rules are mandatory for every frontend change.

---

# Goal

The UI must look like a premium SaaS product.

Think:

• Stripe
• Linear
• Notion
• Vercel
• Framer
• Raycast
• Monday.com

NOT

❌ Bootstrap Admin Panel
❌ School Project
❌ Generic Dashboard
❌ TemplateForest Theme

Everything should feel custom.

---

# Global Theme

Theme:

Dark First

Support Light Mode later.

Background

Primary Background

#0B1020

Secondary

#111827

Cards

#1A2236

Border

rgba(255,255,255,.06)

Text

Primary

#F9FAFB

Secondary

#9CA3AF

Muted

#6B7280

---

# Brand Color

FreightBind Blue

#2563EB

Hover

#1D4ED8

Light

#60A5FA

---

# Success

#10B981

Warning

#F59E0B

Danger

#EF4444

Info

#06B6D4

Purple

#8B5CF6

---

# Role Colors

Every role must have its own identity.

Admin

Primary

Red

Accent

#EF4444

Secondary

#FCA5A5

Icons

Shield

Security

Server

Lock

Analytics

---

Logistics Director

Blue

Primary

#2563EB

Icons

Ship

Map

Container

Globe

Route

---

Carrier Dispatcher

Orange

Primary

#F59E0B

Icons

Truck

Package

Road

Location

---

Hub Operator

Green

Primary

#10B981

Icons

Warehouse

Boxes

Forklift

Clipboard

---

Every dashboard should instantly feel different.

---

# Typography

Font

Inter

Fallback

system-ui

Weights

400

500

600

700

800

Never use

Times New Roman

Verdana

Tahoma

---

# Border Radius

Cards

20px

Buttons

14px

Inputs

14px

Dialogs

24px

Badges

999px

---

# Shadows

Never use ugly shadows.

Use soft shadows.

Example

shadow-xl

shadow-2xl

Blur backgrounds

Backdrop blur

Use glass effect only where appropriate.

---

# Cards

Every card should contain

Title

Subtitle

Icon

Actions

Spacing

24px

Padding

24px

Rounded

20px

Hover animation

Scale

Shadow

Border glow

---

# Tables

Professional only.

Features

Sticky Header

Sorting

Filtering

Pagination

Search

Status Chips

Hover Row

Rounded Container

Responsive

No ugly HTML tables.

---

# Forms

Every form must include

Labels

Placeholder

Helper Text

Validation

Icons

Proper spacing

Loading state

Success state

Error state

Disabled state

---

# Buttons

Primary

Filled

Secondary

Outlined

Ghost

Icon Button

Danger

Loading Button

Every button

Hover

Focus

Disabled

Loading Spinner

---

# Inputs

Rounded

Icons

Focus Ring

Smooth animation

Error border

Success border

Password toggle

Search input

Date picker

Select

Autocomplete

---

# Sidebar

Modern

Collapsed mode

Expanded mode

Role-specific accent color

Animated hover

Icons

Tooltips

Grouped navigation

User profile at bottom

Logout button

---

# Navbar

Glass effect

Blur

Notifications

User avatar

Breadcrumb

Search

Theme switch placeholder

Realtime status

---

# Dashboard Widgets

Widgets should include

Charts

Metrics

Progress

Maps

Activity

Recent Events

Quick Actions

AI Insights

Upcoming Tasks

---

# Empty States

Every page needs

Illustration

Helpful text

Action button

Never show blank pages.

---

# Loading States

Skeleton loaders

Shimmer animation

Progress bars

Animated placeholders

Never show empty white space.

---

# Error States

Beautiful error pages.

Include

Illustration

Retry

Helpful explanation

---

# Animations

Framer Motion

Required.

Use

Fade

Slide

Scale

Layout animations

Page transitions

Card hover

Button press

Accordion

Modal animation

Drawer animation

Avoid excessive animations.

---

# Icons

Only

Lucide React

No mixed icon packs.

---

# Charts

Recharts

Professional colors

Rounded bars

Animated loading

Tooltips

Legend

---

# Images

Use

Unsplash

Pexels

Generated logistics illustrations

Professional warehouse photos

Containers

Ports

Cargo

Fleet

AI

Maps

Never use blurry images.

---

# Videos

Landing page

Hero background

Warehouse footage

Cargo movement

Shipping

Fleet

Optimized MP4/WebM

Lazy loaded

Muted

Loop

---

# GIF Usage

Allowed only for

Loading

Empty state

Success animation

Onboarding

Never spam GIFs.

---

# Responsive Rules

Desktop

Laptop

Tablet

Mobile

Everything must work perfectly.

No horizontal scrolling.

---

# Accessibility

Keyboard Navigation

ARIA Labels

Focus states

Contrast

Screen reader friendly

---

# UI Quality Standard

Every page should score

★★★★★

Premium SaaS

No page should look unfinished.

Before finishing any component ask

"Would Stripe ship this?"

If answer is No

Improve it.
