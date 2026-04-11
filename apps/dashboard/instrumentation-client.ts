import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Only sample traces in production — set to 0 to disable tracing entirely
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    // Replay captures user sessions for debugging; off by default
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
