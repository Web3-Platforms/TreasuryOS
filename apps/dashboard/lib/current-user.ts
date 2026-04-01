import { fetchApi } from '@/lib/api-client';
import type { AuthenticatedUser } from '@treasuryos/types';

export async function getCurrentUser() {
  const data = await fetchApi<{ user: AuthenticatedUser }>('auth/me');
  return data.user;
}
