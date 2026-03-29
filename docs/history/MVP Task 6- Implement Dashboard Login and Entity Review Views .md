# MVP Task 6: Implement Dashboard Login and Entity Review Views

Provide a brief description of the problem, any background context, and what the change accomplishes.
Now that the API Gateway is successfully decoupled from the legacy `PilotStore` and fully backed by PostgreSQL, the immediate next step in the MVP roadmap is **Task 6: implement dashboard login and entity review views**. 

This will transform `apps/dashboard` from a static summary page into a functional, data-driven operator console.

## User Review Required

> [!IMPORTANT]
> The Execution Plan guides us to "port best ideas from \`TreasuryOS2\`". I don't currently have the `TreasuryOS2` codebase open in this workspace. For this implementation plan, **I am proposing we build clean, standard Next.js components matching the existing styling in `apps/dashboard/globals.css`** to get the functionality wired to the API first. Let me know if you would prefer to give me access to the `TreasuryOS2` repo instead!

## Proposed Changes

### Dashboard Auth & API Integration
We need to connect the Next.js frontend to the operational API Gateway.
#### [NEW] `apps/dashboard/lib/api-client.ts`
- Create a fetch-based API client helper to seamlessly communicate with `apps/api-gateway`.
- Handle passing cookies (session token) for SSR and client-side requests.

#### [NEW] `apps/dashboard/middleware.ts`
- Implement Next.js middleware to protect console routes (like `/entities`) and redirect unauthenticated users to `/login`.

### Operator Views

#### [NEW] `apps/dashboard/app/login/page.tsx`
- Implement a login form capturing email and password.
- Submit credentials to `POST /api/auth/login` and store the session token.

#### [MODIFY] `apps/dashboard/app/page.tsx`
- Refactor the current static landing page to act as the authenticated root dashboard (or redirect to `/entities`).

#### [NEW] `apps/dashboard/app/entities/page.tsx`
- Implement the **Entity Review List** view.
- Fetch and display entities from `GET /api/entities` in a structured table.

#### [NEW] `apps/dashboard/app/entities/[id]/page.tsx`
- Implement the **Entity Detail** view.
- Fetch single entity details.
- Provide a UI button wired to `POST /api/entities/:entityId/submit` to advance an entity into the Sumsub KYC pipeline.

## Open Questions

> [!NOTE]
> Are there specific UI component libraries (e.g., `shadcn/ui`, `lucide-react`) you prefer I install for the dashboard's tables and buttons, or should I stick to raw CSS and standard HTML elements as currently used?

## Verification Plan

### Automated Tests
- Run `npm run typecheck` and `npm run build` within `apps/dashboard` to ensure type safety with the current MVP types.

### Manual Verification
- Start the API Gateway and the Dashboard servers.
- Manually log in using one of the seeded pilot user credentials.
- Navigate to the Entities view and verify the data matches Postgres.
- Attempt to submit a draft entity to verify the KYC API integration triggers correctly.
