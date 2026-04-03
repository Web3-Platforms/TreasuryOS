# Marketing Site Hardening & Pilot Launch Readiness

This plan outlines the final steps to "harden" the TreasuryOS landing page for the upcoming pilot launch, focusing on SEO excellence, premium aesthetics, and technical completeness.

## User Review Required

> [!IMPORTANT]
> - **Typography Upgrade**: I'm proposing adding the **Outfit** font from Google Fonts for headings while keeping **Inter** for body text to create a more "premium institutional" feel.
> - **SEO Baseline**: This plan adds a `robots.txt` and `sitemap.ts` which are critical for launch.
> - **Metadata Audit**: Some pages (like the home page) currently rely on the default layout metadata. We will add specific metadata to each route.

## Proposed Changes

### [Landing Page App](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/landing-page)

---

#### [MODIFY] [layout.tsx](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/landing-page/app/layout.tsx)
- Import and configure the **Outfit** font from `next/font/google`.
- Set up a CSS variable `--font-heading` for the new font.
- Apply `font-inter` and `font-outfit` variable classes to the body.

#### [MODIFY] [globals.css](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/landing-page/app/globals.css)
- Define the `--font-heading` variable and update `h1, h2, h3, h4` styles.
- Refine "glassmorphism" panels with smoother transitions and better backdrop-blurs.
- Fix button shimmer visibility and intensity for a more premium feel.

#### [MODIFY] [page.tsx](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/landing-page/app/page.tsx)
- Add explicit `Metadata` to the homepage.
- Refine `FadeIn` component delays and durations for more nuanced section entries.

#### [NEW] [robots.txt](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/landing-page/app/robots.txt)
- Standard configuration to allow search engines.

#### [NEW] [sitemap.ts](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/landing-page/app/sitemap.ts)
- Implement dynamic sitemap generation for `sitemap.xml`.

#### [MODIFY] [site-header.tsx](file:///Users/ekf/Downloads/Projects/TreasuryOS/apps/landing-page/components/marketing/site-header.tsx)
- Improve the sticky header backdrop blur behavior on scroll.
- Ensure all links correctly map to the new routes.

## Open Questions

- **Favicon & Social Assets**: Do we have OG images for all products, or should the default be used for now?
- **Contact Success Redirect**: Should the contact form redirect after success, or is the current in-page success message preferred? (Current: in-page message).

## Verification Plan

### Automated Tests
- Run `npm run typecheck` in `apps/landing-page`.
- Run `npm run build` to ensure production readiness.

### Manual Verification
- Visual inspection of the "shimmer" and "Outfit" font implementation.
- Check `robots.txt` and `/sitemap.xml` routes in development.
❓ Open Questions for You:
Favicon & Social Assets: Do we have custom open-graph (OG) images for each product, or should I stick with a default brand image for now?
Contact Form: Would you prefer a redirect to a "/success" page, or is the current in-page success message preferred?