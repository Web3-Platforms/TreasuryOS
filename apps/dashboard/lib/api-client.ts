import { createClient } from '../utils/supabase/server.js';

/**
 * Server-side API client for the dashboard.
 *
 * Uses API_BASE_URL (server-side env var, NOT NEXT_PUBLIC_) since all calls
 * happen in Server Components and Server Actions. This variable must be set
 * explicitly — there is no localhost fallback to prevent silent misconfiguration
 * in production.
 *
 * Environment setup:
 *   Vercel (production):  API_BASE_URL=https://api.treasuryos.aicustombot.net/api
 *   Local development:    API_BASE_URL=http://localhost:3001/api  (in .env.local)
 */
const API_BASE_URL = process.env.API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    'Missing required environment variable: API_BASE_URL\n' +
    'Set it to your Railway API URL (e.g. https://api.treasuryos.aicustombot.net/api) ' +
    'in Vercel project settings, or to http://localhost:3001/api in .env.local for local development.'
  );
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const errorBody = await response.text().catch(() => 'Unknown Error');
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as Promise<T>;
}
