import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { isSumsubKycEnabled } from '@/lib/feature-flags';
import { getCurrentUser } from '@/lib/current-user';
import type { AuthenticatedUser } from '@treasuryos/types';
import Link from 'next/link';

export default async function DashboardHome() {
  const sumsubEnabled = isSumsubKycEnabled();
  let user: AuthenticatedUser;
  try {
    user = await getCurrentUser();
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
            <p style={{ color: '#888', margin: 0 }}>
              {sumsubEnabled
                ? 'Review new entities and progress them through KYC'
                : 'Review new entities while Sumsub KYC is prepared for launch'}
            </p>
          </Link>

          <Link href="/wallets" style={{ display: 'block', padding: '1.5rem', border: '1px solid #333', borderRadius: '8px', background: '#111', textDecoration: 'none' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>Wallet Governance</h2>
            <p style={{ color: '#888', margin: 0 }}>Approve institutional wallets for Solana sync preview</p>
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
