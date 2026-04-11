/**
 * Next.js instrumentation hook — required for Sentry server-side and edge
 * initialization in the App Router. This file is automatically loaded by
 * Next.js before the application starts on both Node.js and Edge runtimes.
 *
 * Sentry client-side initialization is handled separately in
 * instrumentation-client.ts so it also works in Turbopack builds.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
