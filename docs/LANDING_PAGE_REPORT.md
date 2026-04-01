# TreasuryOS Landing Page & Lead Capture Report

## 1. Overview
As part of the TreasuryOS institutional rollout, a professional landing page was developed and deployed at `apps/landing-page`. This project serves as the public-facing entry point for potential institutional clients, providing a high-conversion interface for lead generation and product education.

**Live URL:** [https://landing-page-ten-inky-86.vercel.app](https://landing-page-ten-inky-86.vercel.app)

---

## 2. Completed Tasks
- **Modular Monorepo Workspace:** Created `@treasuryos/landing-page` using Next.js 16 (App Router).
- **Institutional Design System:** 
    - Dark-themed, high-fidelity UI using Tailwind CSS.
    - Smooth scroll-reveal animations with Framer Motion.
    - Responsive layout (Mobile/Tablet/Desktop).
- **Brand Integration:**
    - Logo and architecture assets integrated into the Hero and Features sections.
    - Professional typography (Inter) and institutional color palette (Deep Blue/Slate/Violet).
- **Lead Generation System:**
    - Custom Contact Form with validation.
    - Supabase Server Action integration for secure lead capture.
    - Automated success/error state handling.
- **Deployment & Ops:**
    - Vercel Production deployment configured.
    - Root `package.json` orchestration (`npm run dev:landing`).
    - Environment variable management for production secrets.

---

## 3. Bug & Risk Report

### 🛠 Known Issues (Technical Debt)
1.  **TypeScript Workspace Resolution:** The landing page currently uses a self-contained `tsconfig.json` because Vercel's standalone build for subdirectories has difficulty resolving the monorepo root `tsconfig.base.json`.
2.  **Telemetry Warning:** The build log shows a warning about multiple lockfiles. This is due to the Next.js Turbopack detector picking up the workspace root lockfile. It does not impact the production build but should be suppressed via `next.config.mjs`.

### ⚠️ Risks
1.  **Lead Capture Spam (High Risk):** The contact form does not currently have rate limiting or CAPTCHA. An automated bot could spam the Supabase `lead_contacts` table, potentially exhausting database resources or skewing lead data.
2.  **Input Sanitization (Medium Risk):** While Supabase/PostgreSQL handles SQL injection, the raw text from the "Message" field is stored directly. If this data is rendered in the TreasuryOS Dashboard without proper escaping, it could lead to Stored XSS (Cross-Site Scripting).
3.  **Supabase RLS (High Risk):** If Row Level Security (RLS) is not strictly configured on the `lead_contacts` table, anyone with the public Supabase URL could potentially read all contact inquiries.

---

## 4. Security Hardening Strategy

### Best Practices & Solutions
1.  **Database Security (RLS):**
    - **Action:** Enable RLS on the `lead_contacts` table.
    - **Policy:** Create an `INSERT-only` policy for the `service_role` key or a public policy that *only* allows inserts, never selects.
2.  **Rate Limiting & Anti-Spam:**
    - **Action:** Integrate `Upstash Rate Limit` or `hCaptcha`.
    - **Implementation:** Use the existing Upstash Redis instance to limit form submissions to 3-5 per IP per hour.
3.  **Data Validation:**
    - **Action:** Replace basic `FormData` extraction with `Zod` schema validation.
    - **Implementation:** Validate email formats, string lengths, and organization names before reaching the database.
4.  **Secret Management:**
    - **Action:** Rotate the `SUPABASE_SERVICE_KEY` periodically.
    - **Policy:** Ensure `SUPABASE_SERVICE_KEY` is NEVER prefixed with `NEXT_PUBLIC_` to prevent it from being bundled into the client-side JavaScript.
5.  **Monitoring:**
    - **Action:** Enable Sentry for the landing page.
    - **Implementation:** Track frontend crashes and server-action failures to identify malicious attempts or bugs in real-time.

---

## 5. Next Steps
- [ ] Implement Upstash-based rate limiting in `app/actions/contact.ts`.
- [ ] Add `hCaptcha` or `Turnstile` to the frontend form.
- [ ] Audit Supabase RLS policies for the `lead_contacts` table.
- [ ] Add E2E tests for the contact form workflow.
