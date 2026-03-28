# Implementation Review: Dashboard Auth and Entities

The dashboard has now transitioned from a static status page into an interactive, authenticated operator console!

## Changes Made
- **Routing & Middleware**: Built out `middleware.ts` to protect routes under the App Router, redirecting unauthenticated users to `/login`.
- **API Client**: Implemented `lib/api-client.ts`, an isomorphic fetch wrapper that seamlessly passes the `treasuryos_access_token` session cookie to the API Gateway.
- **Login Component**: Created a Next.js 15 Server Action (`loginAction` in `app/actions.ts`) to orchestrate token exchange with POST `/api/auth/login`. Wired this to a new `LoginForm` client component displaying error states.
- **Redesigned AppShell**: Built out an authenticated layout in `components/app-shell.tsx` providing a persistent sidebar with navigation to the dashboard and entity queues, logging operators out securely with an interactive `LogoutButton` relying on Server Actions.
- **Entity Review Queue**: Created `/entities/page.tsx`, rendering a table of all onboarded entities directly from PostgreSQL, mapping their respective `KycStatus` and `RiskLevel`.
- **Entity Detail View**: Implemented the detailed payload screen at `/entities/[id]/page.tsx`, visualizing the entity's progression through internal drafts and Sumsub KYC hooks, adding an explicit call to action for operators to securely `submitEntityAction`.

## Testing Steps
You can verify the dashboard locally today by spinning up both applications:
1. In `apps/api-gateway`, run the backend: `npm run dev`
2. In `apps/dashboard`, run the frontend: `npm run dev`
3. Visit `http://localhost:3000` (it should redirect you to `/login`).
4. Login explicitly relying on the API Gateway seed data (e.g., your compliance officer or admin credentials seeded in the Postgres DB migrations).
5. The console will list all entities mapped straight from `entities.repository`.

> [!TIP]
> The forms are fully progressively enhanced Server Actions under React 19, meaning no additional state management frameworks (like Redux or Zustand) are required! All token handling successfully executes HTTP-only in `cookieStore`.
