# Implementation Plan: Cloudflare Institutional Security Hardening

To protect **TreasuryOS** institutional assets and high-value Solana operations, we will implement a multi-layered security strategy using Cloudflare's edge network. This plan hardens the platform against DDoS, malicious probing, and regional compliance risks.

## Phase 1: Edge Proxy & Encryption (Basics)
- **Goal**: Ensure all traffic is encrypted and routed through the Cloudflare global network.
- [ ] **SSL/TLS Configuration**: Set mode to `Full (Strict)` with an Origin CA certificate to prevent man-in-the-middle attacks between Cloudflare and Vercel/GCP.
- [ ] **HTTPS Enforcements**: Enable `HSTS`, `TLS 1.3`, and `Always Use HTTPS`.
- [ ] **Minify & Cache**: Optimize performance without compromising security by enabling edge caching for non-sensitive dashboard assets.

## Phase 2: WAF & DDoS Protection (The Shield)
- **Goal**: Filter out malicious requests and prevent service exhaustion.
- [ ] **WAF API Policy**: Implement custom rules to block non-JSON requests to `/api/*` and enforce mandatory Authorization headers.
- [ ] **Rate Limiting**: Apply aggressive rate limiting at the edge for `/api/auth` endpoints (10 req/min) to prevent brute-force attacks.
- [ ] **Solana RPC Scraper Protection**: Block common user agents and patterns used by RPC scrapers trying to probe treasury transaction state.

## Phase 3: Institutional Compliance (Geo & Bot)
- **Goal**: Restrict access to authorized regions and verified users.
- [ ] **Geo-Blocking**: RESTRICT access to only compliant jurisdictions (e.g., blocking sancitoned or non-operational regions).
- [ ] **Bot Management**: Enable "Interactive Challenge" (Managed Challenge) for high-risk IP scores to prevent automated scanning of the treasury dashboard.
- [ ] **Cloudflare Turnstile**: Integrate zero-friction CAPTCHA on the login page to verify human users.

## Phase 4: Advanced Zero Trust (mTLS)
- **Goal**: Secure service-to-service communication.
- [ ] **Mutual TLS (mTLS)**: Configure mTLS certificates for secure communication between the TreasuryOS Dashboard (Vercel) and the API Gateway (GCP/Self-hosted), ensuring only authorized clients can access the backend.

---

## Success Criteria
- [ ] SSL Labs rating of **A+** for the domain.
- [ ] All brute-force attempts at `/api/auth` are blocked at the edge.
- [ ] Compliance report showing 100% block rate for unauthorized regional IP addresses.
- [ ] Dashboard accessible only via HTTPS with HSTS enforced.
