import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: rootDir,
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress Sentry CLI output during builds unless both server and client DSNs are set
  silent: !process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Don't inject Sentry config when there is no client DSN
  disableClientWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Don't inject Sentry config when there is no server DSN
  disableServerWebpackPlugin: !process.env.SENTRY_DSN,
  // Tunnel requests through the Next.js server to avoid ad-blocker issues
  tunnelRoute: '/monitoring',
});
