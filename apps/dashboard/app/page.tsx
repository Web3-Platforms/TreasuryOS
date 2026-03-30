import { redirect } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { AppShell } from '@/components/app-shell';
import type { AuthenticatedUser } from '@treasuryos/types';
import Link from 'next/link';

export default async function DashboardHome() {
  let user: AuthenticatedUser | null = null;
  try {
    const data = await fetchApi<{ user: AuthenticatedUser }>('auth/me');
    user = data.user;
  } catch (error) {
    // Middleware handles auth, but just in case
    redirect('/login');
  }

  return (
    <AppShell>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Welcome, {user.email}</h1>
        <p style={{ color: '#aaa', marginBottom: '2rem' }}>
          You are logged in as an administrator. Select an action below.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <Link href="/entities" style={{ display: 'block', padding: '1.5rem', border: '1px solid #333', borderRadius: '8px', background: '#111', textDecoration: 'none' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>Entity Review Queue</h2>
            <p style={{ color: '#888', margin: 0 }}>Review new entities and progress them through KYC</p>
          </Link>

          <Link href="/wallets" style={{ display: 'block', padding: '1.5rem', border: '1px solid #333', borderRadius: '8px', background: '#111', textDecoration: 'none' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>Wallet Governance</h2>
            <p style={{ color: '#888', margin: 0 }}>Approve institutional wallets for devnet sync</p>
          </Link>

          <Link href="/transactions" style={{ display: 'block', padding: '1.5rem', border: '1px solid #333', borderRadius: '8px', background: '#111', textDecoration: 'none' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>Transaction Escalate</h2>
            <p style={{ color: '#888', margin: 0 }}>Review flagged transactions cases</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
