import { ReactNode } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { LogoutButton } from './logout-button';

export async function AppShell({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('treasuryos_access_token')?.value;

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <aside className="app-shell__sidebar" style={{ width: '250px', background: '#111', padding: '2rem', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <p className="eyebrow" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', margin: '0 0 0.5rem 0' }}>TreasuryOS</p>
          <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Pilot Console</h1>
        </div>
        
        {token && (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <Link href="/" style={{ color: '#ccc', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
            <Link href="/entities" style={{ color: '#ccc', textDecoration: 'none', fontWeight: 500 }}>Entities</Link>
            <Link href="/wallets" style={{ color: '#ccc', textDecoration: 'none', fontWeight: 500 }}>Wallets</Link>
            <Link href="/transactions" style={{ color: '#ccc', textDecoration: 'none', fontWeight: 500 }}>Transactions</Link>
            <Link href="/reports" style={{ color: '#ccc', textDecoration: 'none', fontWeight: 500 }}>Reports</Link>
            <Link href="#" style={{ color: '#666', textDecoration: 'none', fontWeight: 500, cursor: 'not-allowed' }}>Audit Logs</Link>
          </nav>
        )}

        {token && (
          <div style={{ padding: '1rem 0', borderTop: '1px solid #333' }}>
            <LogoutButton />
          </div>
        )}
      </aside>
      <main className="app-shell__content" style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
