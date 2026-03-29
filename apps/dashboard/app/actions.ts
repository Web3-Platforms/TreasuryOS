'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { fetchApi } from '@/lib/api-client';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    return {
      error:
        'Server misconfiguration: API_BASE_URL is not set. ' +
        'Add it to your Vercel project environment variables or .env.local for local development.',
    };
  }

  try {
    const res = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { error: `Authentication failed. Check credentials.` };
    }

    const data = await res.json() as { accessToken?: string };

    if (!data.accessToken) {
      return { error: 'Invalid response from server' };
    }

    const cookieStore = await cookies();
    cookieStore.set('treasuryos_access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours (matches TTL)
    });

    return { success: true };
  } catch (error) {
    console.error('Login action failed:', error);
    return { error: 'Network or server error.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('treasuryos_access_token');
  redirect('/login');
}

export async function submitEntityAction(entityId: string) {
  try {
    await fetchApi(`entities/${entityId}/submit`, {
      method: 'POST',
    });
    return { success: true };
  } catch (error) {
    console.error('Submit entity failed:', error);
    return { error: error instanceof Error ? error.message : 'Submit failed' };
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
