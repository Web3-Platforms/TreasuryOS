'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { fetchApi } from '@/lib/api-client';
import { isDemoAccessAvailable, isSumsubKycEnabled } from '@/lib/feature-flags';
import { Jurisdiction, RiskLevel, type EntityRecord } from '@treasuryos/types';

type ActionResult = { success: true } | { error: string };
type CreateEntityActionResult = { success: true; entityId: string } | { error: string };

const ACCESS_TOKEN_COOKIE = 'treasuryos_access_token';
const API_BASE_URL_ERROR =
  'Server misconfiguration: API_BASE_URL is not set. ' +
  'Add it to your Vercel project environment variables or .env.local for local development.';

async function persistAccessToken(accessToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60,
  });
}

async function authenticateWithPassword(
  email: string,
  password: string,
  messages: {
    unauthorized: string;
    failed: string;
    invalidResponse: string;
  }
): Promise<ActionResult> {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    return { error: API_BASE_URL_ERROR };
  }

  let res: Response;

  try {
    res = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    console.error('Authentication request failed:', error);
    return { error: `${messages.failed} Network request failed.` };
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Authentication failed:', res.status, errorText);

    if (res.status === 401) {
      return { error: messages.unauthorized };
    }

    return { error: `${messages.failed} API returned ${res.status}.` };
  }

  let data: { accessToken?: string };

  try {
    data = (await res.json()) as { accessToken?: string };
  } catch (error) {
    console.error('Authentication response parse failed:', error);
    return { error: messages.invalidResponse };
  }

  if (!data.accessToken) {
    return { error: messages.invalidResponse };
  }

  await persistAccessToken(data.accessToken);
  return { success: true };
}

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  return authenticateWithPassword(email, password, {
    unauthorized: 'Authentication failed. Check credentials.',
    failed: 'Authentication failed.',
    invalidResponse: 'Invalid response from server.',
  });
}

export async function createEntityAction(formData: FormData): Promise<CreateEntityActionResult> {
  const legalName = (formData.get('legalName') as string | null)?.trim() ?? '';
  const jurisdiction = ((formData.get('jurisdiction') as string | null)?.trim() ?? Jurisdiction.EU) as Jurisdiction;
  const riskLevel = ((formData.get('riskLevel') as string | null)?.trim() ?? RiskLevel.Medium) as RiskLevel;
  const notesValue = (formData.get('notes') as string | null)?.trim() ?? '';
  const notes = notesValue.length > 0 ? notesValue : undefined;

  if (legalName.length < 2) {
    return { error: 'Legal name must be at least 2 characters long.' };
  }

  if (jurisdiction !== Jurisdiction.EU) {
    return { error: 'The current pilot launch only supports EU entities.' };
  }

  try {
    const entity = await fetchApi<EntityRecord>('entities', {
      method: 'POST',
      body: JSON.stringify({
        legalName,
        jurisdiction,
        riskLevel,
        notes,
      }),
    });

    revalidatePath('/entities');
    revalidatePath(`/entities/${entity.id}`);

    return { success: true, entityId: entity.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create draft failed';

    if (message.includes('403')) {
      return { error: 'You do not have permission to create entity drafts.' };
    }

    if (message.includes('401')) {
      return { error: 'Your session has expired. Please sign in again.' };
    }

    if (message.includes('400')) {
      return { error: message.replace(/^API Error 400:\s*/, '') || 'Create draft failed.' };
    }

    return { error: message };
  }
}

export async function demoLoginAction(): Promise<ActionResult> {
  if (!isDemoAccessAvailable()) {
    return { error: 'Demo access is not available right now.' };
  }

  const email = process.env.DEMO_ACCESS_EMAIL?.trim();
  const password = process.env.DEMO_ACCESS_PASSWORD;

  if (!email || !password) {
    return {
      error:
        'Server misconfiguration: DEMO_ACCESS_EMAIL and DEMO_ACCESS_PASSWORD must be set when demo access is enabled.',
    };
  }

  return authenticateWithPassword(email, password, {
    unauthorized: 'Demo access is temporarily unavailable.',
    failed: 'Demo access is temporarily unavailable.',
    invalidResponse: 'Demo access is temporarily unavailable.',
  });
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  redirect('/login');
}

export async function submitEntityAction(entityId: string) {
  if (!isSumsubKycEnabled()) {
    return { error: 'Sumsub KYC is coming soon.' };
  }

  try {
    await fetchApi(`entities/${entityId}/submit`, {
      method: 'POST',
    });
    revalidatePath(`/entities/${entityId}`);
    revalidatePath('/entities');
    return { success: true };
  } catch (error) {
    console.error('Submit entity failed:', error);
    return { error: error instanceof Error ? error.message : 'Submit failed' };
  }
}

export async function approveEntityAction(entityId: string) {
  try {
    await fetchApi(`entities/${entityId}/approve`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    revalidatePath(`/entities/${entityId}`);
    revalidatePath('/entities');
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Approve action failed' };
  }
}

export async function rejectEntityAction(entityId: string) {
  try {
    await fetchApi(`entities/${entityId}/reject`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    revalidatePath(`/entities/${entityId}`);
    revalidatePath('/entities');
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Reject action failed' };
  }
}

export async function requestWalletAction(entityId: string, walletAddress: string) {
  try {
    await fetchApi(`wallets`, {
      method: 'POST',
      body: JSON.stringify({ entityId, walletAddress }),
    });
    revalidatePath(`/entities/${entityId}`);
    revalidatePath(`/wallets`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Wallet request failed' };
  }
}

export async function reviewWalletAction(walletId: string) {
  try {
    await fetchApi(`wallets/${walletId}/review`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    revalidatePath(`/wallets/${walletId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Review action failed' };
  }
}

export async function approveWalletAction(walletId: string) {
  try {
    await fetchApi(`wallets/${walletId}/approve`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    revalidatePath(`/wallets/${walletId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Approve action failed' };
  }
}

export async function rejectWalletAction(walletId: string) {
  try {
    await fetchApi(`wallets/${walletId}/reject`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    revalidatePath(`/wallets/${walletId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Reject action failed' };
  }
}

export async function reviewTransactionAction(caseId: string) {
  try {
    await fetchApi(`transaction-cases/${caseId}/review`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    revalidatePath(`/transactions`);
    revalidatePath(`/transactions/${caseId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Review action failed' };
  }
}

export async function approveTransactionAction(caseId: string, notes: string) {
  try {
    await fetchApi(`transaction-cases/${caseId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    revalidatePath(`/transactions`);
    revalidatePath(`/transactions/${caseId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Approve action failed' };
  }
}

export async function rejectTransactionAction(caseId: string, notes: string) {
  try {
    await fetchApi(`transaction-cases/${caseId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    revalidatePath(`/transactions`);
    revalidatePath(`/transactions/${caseId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Reject action failed' };
  }
}

export async function escalateTransactionAction(caseId: string, notes: string) {
  try {
    await fetchApi(`transaction-cases/${caseId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    revalidatePath(`/transactions`);
    revalidatePath(`/transactions/${caseId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Escalate action failed' };
  }
}

export async function generateReportAction(month: string) {
  try {
    await fetchApi(`reports`, {
      method: 'POST',
      body: JSON.stringify({ month }),
    });
    revalidatePath(`/reports`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Generate report failed' };
  }
}
