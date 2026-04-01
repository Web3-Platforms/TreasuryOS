# Sentry Beta Waiver Report

## Decision

Sentry is explicitly **waived for the beta launch**.

This means missing Railway/Vercel Sentry DSNs are no longer treated as a launch
blocker for the current beta scope.

## Why

- The application code is already wired for Sentry
- The current Sentry account state still does not provide the final
  organization/project/DSN setup needed for deployment
- The beta launch is allowed to proceed without Sentry as long as this is an
  intentional, documented decision rather than an accidental omission

## Operational Impact

For beta launch readiness:

- GitHub CD remains valid without Sentry DSNs
- Railway and Vercel environment verification no longer depends on Sentry values
- the remaining hard launch gate is the API custom-domain Cloudflare/TLS fix

## Follow-up

Sentry should be revisited after beta launch hardening so Railway and Vercel can
add real DSNs once the final Sentry project exists.
