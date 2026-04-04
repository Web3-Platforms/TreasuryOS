# Landing Page — Image Fix & Form Visibility Report

**Date:** 2026-04-04  
**Commit:** `18e8fa0`  
**Status:** ✅ Deployed

---

## Problem Statement

Two issues remained after the mobile-responsive sprint:

1. **Logo and images not displayed** — `logo.png` and `architecture.png` existed locally
   but were excluded from git by the global `*.png` rule in `.gitignore`. Vercel never
   had the files; every deploy served broken image references.

2. **Contact form hard to find** — The form was buried at the bottom of the page after
   five full-screen sections. Visitors who didn't read to the end never saw it.

---

## Root Causes

### Images
`.gitignore` line 46 contained `*.png` with no exceptions. Files were present in
`apps/landing-page/public/` locally but not tracked by git and therefore never
included in any Vercel deployment.

### Form visibility
The `#request-access` section used a 50/50 two-column layout where the left side
contained institutional copy and the right side held the form. Visitors scanning the
page saw the copy column first; the form was secondary. There was also no persistent
navigation CTA or scroll-triggered affordance to guide users to the form.

---

## Fixes Implemented

### 1 — Git exceptions for `public/` assets

Added allow-list entries to `.gitignore`:

```
!apps/*/public/*.png
!apps/*/public/*.jpg
!apps/*/public/*.jpeg
!apps/*/public/*.svg
!apps/*/public/*.ico
!apps/*/public/*.gif
!apps/*/public/*.webp
```

Both `logo.png` (2816×1536, 1.2 MB) and `architecture.png` (826 KB) are now committed
and included in every Vercel production build.

### 2 — Logo aspect ratio correction

The logo image is landscape (11:6 ratio). The previous `width={36} height={36}`
forced it into a square container, leaving the image nearly invisible.

**Before:** `h-9 w-9` container, `width={36} height={36}`  
**After:** `h-9 w-[66px]` container, `width={140} height={49}` — matches the 11:6 ratio.

### 3 — Contact form visibility strategy (multi-touchpoint)

Four touch-points ensure visitors always have a visible, low-friction path to the form:

| Touch-point | Implementation | When visible |
|---|---|---|
| **Hero CTA** | "Request Early Access" → `#request-access` | Always (above fold) |
| **Sticky nav** | "Request Access" anchor in header | Entire page scroll |
| **Form section** | Centred, full-width, accent-bordered | Mid-page |
| **Floating CTA** | Fixed bottom-right button | After hero off-screen, before form in viewport |

#### Sticky navigation CTA
Added `href="#request-access"` anchor link labelled **Request Access** as the first
action in both the desktop header bar and the mobile drawer. It appears before "Book
intro" and "Open platform" to maximise prominence.

#### `#request-access` section redesign
Removed the 2-column text+form split. The section is now:
- Full-page-width with gradient accent lines (top and bottom border) using `primary/40`
- Subtle `primary/5` radial background so the section is visually distinct from adjacent sections
- **Centred headline** ("Ready to govern your assets?") and subtext in `max-w-2xl`
- **Centred form** (`max-w-2xl`, `ContactForm` with empty title/description)
- **Trust signals row** (MiCA, Squads V4, ISO20022) in compact 3-column cards below the form

#### Floating access CTA (`floating-access-cta.tsx`)
New `'use client'` component using a `scroll` event listener:
- **Shows** when the hero section has scrolled off the top of the viewport
- **Hides** when the `#request-access` section enters the viewport (within 85% window height)
- Fixed `bottom-8 right-6 z-50`, `button-primary` style with a downward arrow icon
- `animate-in fade-in slide-in-from-bottom-4` entry animation

#### ContactForm — empty header support
Updated the component to skip its internal eyebrow/title/description block when those
props are empty strings, allowing it to be used as a bare form (section heading lives
outside the component).

---

## Files Changed

| File | Change |
|---|---|
| `.gitignore` | Added `!apps/*/public/*.{png,jpg,jpeg,svg,ico,gif,webp}` exceptions |
| `apps/landing-page/public/logo.png` | Added to git tracking |
| `apps/landing-page/public/architecture.png` | Added to git tracking |
| `apps/landing-page/components/marketing/site-header.tsx` | Logo container 36×36 → 66×36; added "Request Access" to desktop + mobile nav |
| `apps/landing-page/components/marketing/contact-form.tsx` | Skip internal header when `title`/`description` are empty |
| `apps/landing-page/components/marketing/floating-access-cta.tsx` | **New** — floating sticky CTA button |
| `apps/landing-page/app/page.tsx` | Redesigned `#request-access` section; imported `FloatingAccessCta` |

---

## Deployment

- **CI:** ✅ Pass (typecheck clean, `18e8fa0`)
- **CD:** ✅ Pass — Vercel deploy hook triggered; landing page deployed to production
- **API gateway:** No changes to backend in this commit

---

## Verification Checklist

- [ ] `treasuryos.xyz` — logo visible in header and footer
- [ ] `treasuryos.xyz` — architecture diagram visible in mid-page section
- [ ] "Request Access" button visible in sticky nav at all scroll depths
- [ ] Floating button appears after scrolling past hero
- [ ] Floating button disappears when form scrolls into view
- [ ] Form submission succeeds (201 from `/api/leads`) — fixed in `644ee00`
