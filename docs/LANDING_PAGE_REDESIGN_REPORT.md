# Landing Page Redesign Report

## Scope

This document records the redesign of `apps/landing-page` from a mostly single-page marketing site into a more structured TreasuryOS web presence with dedicated product and company routes.

## Objectives

- improve the visual quality and premium feel of the landing experience
- present TreasuryOS more clearly for institutional buyers
- create dedicated product and company pages instead of forcing all storytelling into the homepage
- preserve the working contact flow and keep the redesign isolated to the landing app

## What changed

### 1. Rebuilt the homepage structure

The homepage was rewritten around a clearer narrative:

- institutional treasury positioning in the hero
- stronger CTA hierarchy for product exploration and contact
- dedicated sections for buyer segments, product surfaces, architecture posture, rollout model, and conversion

The visual system now leans on a more consistent shell, stronger spacing, reusable section framing, and a cleaner premium dark aesthetic.

### 2. Added reusable marketing components

New shared components were introduced under `apps/landing-page/components/marketing/`:

- `site-shell.tsx`
- `site-header.tsx`
- `site-footer.tsx`
- `section-header.tsx`
- `page-hero.tsx`
- `cta-band.tsx`
- `contact-form.tsx`

This keeps the homepage, product pages, and company pages visually aligned without duplicating layout or CTA logic.

### 3. Added dedicated product pages

The landing app now exposes:

- `/products`
- `/products/treasury-control`
- `/products/compliance-command`
- `/products/reporting-studio`

Content for these pages is centralized in `apps/landing-page/lib/marketing-content.tsx`, which defines the shared summaries, product capabilities, workflows, and target teams.

### 4. Added dedicated company pages

The landing app now exposes:

- `/company`
- `/company/about`
- `/company/approach`
- `/company/contact`

These routes provide space for the company narrative, delivery posture, and a more focused contact experience instead of keeping all company context on the homepage.

### 5. Preserved and refined the contact flow

The existing server action path in `apps/landing-page/app/actions/contact.ts` was preserved so lead submissions still use the existing Supabase-backed flow.

The redesign tightened basic request handling by trimming field values and applying simple email validation before submission.

### 6. Added a safe build configuration tweak

`apps/landing-page/next.config.mjs` now sets `turbopack.root` to the monorepo root.

This keeps Next.js aligned with the actual workspace and avoids the misleading root-inference warning caused by a higher-level lockfile outside the repository.

## Files added

- `apps/landing-page/app/products/page.tsx`
- `apps/landing-page/app/products/[slug]/page.tsx`
- `apps/landing-page/app/company/page.tsx`
- `apps/landing-page/app/company/[slug]/page.tsx`
- `apps/landing-page/components/marketing/contact-form.tsx`
- `apps/landing-page/components/marketing/cta-band.tsx`
- `apps/landing-page/components/marketing/page-hero.tsx`
- `apps/landing-page/components/marketing/section-header.tsx`
- `apps/landing-page/components/marketing/site-footer.tsx`
- `apps/landing-page/components/marketing/site-header.tsx`
- `apps/landing-page/components/marketing/site-shell.tsx`
- `apps/landing-page/lib/marketing-content.tsx`
- `apps/landing-page/vercel.json`

## Files updated

- `apps/landing-page/app/actions/contact.ts`
- `apps/landing-page/app/globals.css`
- `apps/landing-page/app/layout.tsx`
- `apps/landing-page/app/page.tsx`
- `apps/landing-page/next.config.mjs`

## Validation

The redesign was validated with both landing-specific and repo-wide checks:

- `npm run typecheck -w @treasuryos/landing-page`
- `npm run build -w @treasuryos/landing-page`
- `npm run typecheck`
- `npm test`
- `API_BASE_URL=http://localhost:3001/api npm run build`

## Deployment follow-up

After the redesign commit was pushed, the `landing-page` Vercel project failed because it inherited the repository-root `vercel.json`, which is intentionally configured for the dashboard deployment.

The fix was to add `apps/landing-page/vercel.json` with landing-specific install and build commands:

- `cd ../.. && npm ci --include=dev`
- `npm run build`

This keeps the install step rooted at the monorepo while letting the actual Next.js build run from the landing app directory, which matches Vercel's expected `.next` output location for the project.

## Smoke checks

The production build was started locally and these routes responded with `HTTP 200`:

- `/`
- `/products`
- `/products/treasury-control`
- `/company`
- `/company/contact`

## Outcome

The landing page now behaves like a proper marketing site instead of a single long brochure page. It presents TreasuryOS more credibly for institutional buyers, gives the product suite and company narrative their own surfaces, and keeps the implementation isolated to `apps/landing-page` plus this report.
