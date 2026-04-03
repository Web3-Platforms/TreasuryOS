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
      <div>
        <div className="page-header">
          <h1 className="page-title">Welcome, {user.email}</h1>
        </div>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          You are logged in as an administrator. Select an action below.
        </p>

        <div className="grid-section">
          <Link href="/entities" className="page-card" style={{ padding: '1.5rem', display: 'block' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', marginTop: 0, color: 'var(--ink)' }}>Entity Review Queue</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.875rem' }}>
              {sumsubEnabled
                ? 'Review new entities and progress them through KYC'
                : 'Review new entities while Sumsub KYC is prepared for launch'}
            </p>
          </Link>

          <Link href="/wallets" className="page-card" style={{ padding: '1.5rem', display: 'block' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', marginTop: 0, color: 'var(--ink)' }}>Wallet Governance</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.875rem' }}>Approve institutional wallets for Solana sync preview</p>
          </Link>

          <Link href="/transactions" className="page-card" style={{ padding: '1.5rem', display: 'block' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', marginTop: 0, color: 'var(--ink)' }}>Transaction Escalations</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.875rem' }}>Review flagged transaction cases</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
