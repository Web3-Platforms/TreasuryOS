# Landing Page GitHub Push Deploy Report

Task:
- `deploy-landing-page-via-github`

Code push:
- Commit `2bfda45fd40c99b4e0eeaf0981b52f99c0debd8d`
- Commit message: `feat(landing-page): harden launch site`
- Push target: `origin/main`

What was shipped:
- Refined the landing-page redesign with premium typography, scroll-aware header behavior, and motion tuning.
- Added canonical, Open Graph, and Twitter metadata across the landing, product, and company routes.
- Added `app/robots.txt`, `app/sitemap.ts`, and a generated `app/og/route.tsx` social image endpoint.
- Restored the shared `label-text` styling used by the contact form after the design refresh.
- Removed the stale `next lint` workspace script that no longer works under the current Next.js 16 CLI.
- Kept the release isolated to `apps/landing-page` plus the required `package-lock.json` updates.

What was verified before the push:
- `npm run lint`
- `npm run typecheck -w @treasuryos/landing-page`
- `npm run build -w @treasuryos/landing-page`

GitHub automation results for the pushed commit:
- `TreasuryOS CI` run `23923794434`: `success`
  - https://github.com/Web3-Platforms/TreasuryOS/actions/runs/23923794434
- `TreasuryOS CD` run `23923794485`: `success`
  - https://github.com/Web3-Platforms/TreasuryOS/actions/runs/23923794485

Vercel deployment signals for the pushed commit:
- `Vercel – landing-page`: `success` with the deployment marked complete.
- `Vercel – treasury-os`: still `pending` at the time of documentation and unrelated to the landing-page workspace changes.

Public smoke checks after the landing deployment completed:
- `https://www.treasuryos.xyz` returned `HTTP 200`.
- `https://www.treasuryos.xyz/robots.txt` returned the live robots file and sitemap reference.
- `https://www.treasuryos.xyz/sitemap.xml` returned the generated sitemap with landing, product, and company routes.
- The live homepage HTML exposed `property="og:image" content="https://www.treasuryos.xyz/og"`.
- `https://www.treasuryos.xyz/og` returned `HTTP 200` with `content-type: image/png`.

Operational notes:
- This deployment used the existing Vercel Git integration for the `landing-page` project; pushing the landing commit to GitHub was enough to start the release.
- The landing deployment is now using the hardened metadata and SEO surfaces that were added in `apps/landing-page`.
- Repository-wide commit status can remain `pending` briefly even after the landing deployment succeeds because other Vercel projects report on the same commit.

Outcome:
- The landing-page hardening changes are pushed to GitHub, deployed through the `landing-page` Vercel project, and live on `https://www.treasuryos.xyz`.
