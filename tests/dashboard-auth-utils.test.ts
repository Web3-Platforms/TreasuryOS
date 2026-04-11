import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLoginUrl,
  getApiErrorStatus,
  isUnauthorizedError,
  isRecoverableSessionProbeError,
  resolvePostLoginRedirectPath,
  sanitizeCallbackUrl,
} from "../apps/dashboard/lib/auth.js";

test("sanitizeCallbackUrl keeps safe internal paths", () => {
  assert.equal(
    sanitizeCallbackUrl("/entities/entity-123?tab=kyc"),
    "/entities/entity-123?tab=kyc",
  );
});

test("sanitizeCallbackUrl rejects login and external redirects", () => {
  assert.equal(sanitizeCallbackUrl("/login"), null);
  assert.equal(sanitizeCallbackUrl("https://example.com/phish"), null);
  assert.equal(sanitizeCallbackUrl("//example.com/phish"), null);
});

test("buildLoginUrl preserves only safe callback URLs", () => {
  const loginUrl = new URL(
    buildLoginUrl({
      callbackUrl: "/reports?month=2026-03",
      reauth: true,
      sessionExpired: true,
    }),
    "https://dashboard.treasuryos.local",
  );

  assert.equal(loginUrl.pathname, "/login");
  assert.equal(
    loginUrl.searchParams.get("callbackUrl"),
    "/reports?month=2026-03",
  );
  assert.equal(loginUrl.searchParams.get("reauth"), "1");
  assert.equal(loginUrl.searchParams.get("sessionExpired"), "1");
});

test("buildLoginUrl drops unsafe callback URLs", () => {
  const loginUrl = new URL(
    buildLoginUrl({ callbackUrl: "https://example.com/phish" }),
    "https://dashboard.treasuryos.local",
  );

  assert.equal(loginUrl.pathname, "/login");
  assert.equal(loginUrl.searchParams.get("callbackUrl"), null);
});

test("resolvePostLoginRedirectPath falls back to the dashboard root", () => {
  assert.equal(resolvePostLoginRedirectPath(null), "/");
  assert.equal(
    resolvePostLoginRedirectPath("/wallets/wallet-1"),
    "/wallets/wallet-1",
  );
});

test("isUnauthorizedError recognizes the dashboard auth failure shapes", () => {
  assert.equal(isUnauthorizedError(new Error("Unauthorized")), true);
  assert.equal(
    isUnauthorizedError(new Error("API Error 401: Unauthorized")),
    true,
  );
  assert.equal(
    isUnauthorizedError(new Error("API Error 500: Unexpected failure")),
    false,
  );
});

test("getApiErrorStatus extracts API status codes from dashboard errors", () => {
  assert.equal(
    getApiErrorStatus(new Error("API Error 429: Too Many Requests")),
    429,
  );
  assert.equal(getApiErrorStatus(new Error("Unauthorized")), null);
});

test("isRecoverableSessionProbeError treats rate limits as non-fatal on login", () => {
  assert.equal(
    isRecoverableSessionProbeError(
      new Error("API Error 429: Too Many Requests"),
    ),
    true,
  );
  assert.equal(
    isRecoverableSessionProbeError(
      new Error("API Error 503: Service Unavailable"),
    ),
    true,
  );
  assert.equal(
    isRecoverableSessionProbeError(new Error("API Error 403: Forbidden")),
    false,
  );
});
