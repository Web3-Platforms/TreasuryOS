# TreasuryOS: Institutional Cloudflare Security Hardening

To protect institutional funds and ensure the integrity of Solana treasury operations, we recommend a **Cloudflare-First** security architecture. This document outlines the mandatory hardening steps for a production-ready TreasuryOS environment.

## 1. Edge Firewall (WAF) & Rate Limiting

The Web Application Firewall (WAF) is your first line of defense. It filters malicious payloads before they reach the API Gateway.

### Recommended WAF Custom Rules (JSON import-ready)
Implement these rules to block automated scanning and common Web3 reconnaissance attempts:

- **Rule 1: Block Non-JSON API Traffic**
  - **Action**: Block
  - **Expression**: `(http.request.uri.path contains "/api/" and not http.request.header.content_type contains "application/json")`
- **Rule 2: Restrict Cross-Region Access**
  - **Action**: Managed Challenge
  - **Expression**: `(ip.geoip.country in {"CU", "IR", "KP", "SY", "RU"})`
- **Rule 3: Protect Authentication Endpoints**
  - **Action**: Rate Limit (10 requests / 10 minutes)
  - **Path**: `/api/auth/login`

## 2. SSL/TLS & Encryption

Encryption at the edge is mandatory to prevent man-in-the-middle (MITM) attacks and credential theft.

- **SSL/TLS Mode**: **Full (Strict)**
  - *Note: This requires an Origin CA certificate installed on your backend (Vercel/Railway), ensuring the connection is end-to-end encrypted.*
- **Always Use HTTPS**: Enabled
- **HSTS (HTTP Strict Transport Security)**: Enabled
  - **Max Age**: 6 months (15552000)
  - **Include Subdomains**: Enabled
  - **Preload**: Enabled
- **Minimum TLS Version**: **TLS 1.2** (TLS 1.3 Recommended)

## 3. Bot Management & Humanity Verification

Solana platforms are frequently targeted by bots scanning for transaction state. Prevent automated probing:

- **Bot Fight Mode**: Enabled
  - *Standard for free/pro plans; Enterprise should use 'Bot Management'.*
- **Managed Challenge for API**: 
  - Challenge requests with a high 'Verified Bot' score to ensure they are from legitimate browser sessions.
- **Cloudflare Turnstile Integration**: 
  - Replace traditional CAPTCHAs with **Turnstile** on your TreasuryOS login page for a zero-friction, privacy-respecting bot check.

## 4. Institutional Connectivity (mTLS)

For maximum security between the **TreasuryOS Dashboard** and the **API Gateway**, we recommend **Mutual TLS (mTLS)**.

- **How it works**: Cloudflare issues a client certificate that must be presented by the Dashboard when calling the API. 
- **The Result**: Even if an attacker discovers your backend API URL, they cannot access it without the cryptographic certificate, effectively creating a "dark" API.

## 5. Summary Checklist

| Feature | Recommended Setting | Why? |
|---------|---------------------|------|
| **SSL/TLS** | Full (Strict) | End-to-end encryption |
| **WAF** | Custom Rules | Blocks RPC scrapers \u0026 payloads |
| **HSTS** | Enabled | Prevents protocol downgrades |
| **Geo-Block** | Custom List | Regional compliance (institutional) |
| **mTLS** | Enabled (Optional) | Client-to-server cryptographical trust |
| **Turnstile** | Login Page | Prevents brute-force session creation |

---

> [!CAUTION]
> **Production Notice**
> Always test WAF rules in **'Log Only' (Simulate)** mode for 24 hours before deploying to 'Block'. This prevents accidental locking of legitimate institutional users during initial rollout.
