import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: rootDir,
  },
  /**
   * Proxy /api/* requests to the Railway API Gateway.
   *
   * This replaces the hardcoded rewrite in vercel.json, allowing any Railway
   * URL (auto-assigned staging or custom domain) to be used without a code
   * change — just set API_BASE_URL in Vercel environment variables.
   *
   * Staging example:   API_BASE_URL=https://treasuryos.up.railway.app/api
   * Production example: API_BASE_URL=https://api.treasuryos.aicustombot.net/api
   *
   * If API_BASE_URL is not set the rewrite is skipped (local dev uses
   * api-client.ts directly via the same env var, so this is consistent).
   */
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
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
