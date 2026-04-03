import { fetchApi } from '@/lib/api-client';
import { AppShell } from '@/components/app-shell';
import { ChainSyncStatus, WalletStatus, type WalletRecord } from '@treasuryos/types';
import Link from 'next/link';

export default async function WalletsPage() {
  let wallets: WalletRecord[] = [];
  
  try {
    const data = await fetchApi<{ wallets: WalletRecord[] }>('wallets');
    wallets = data.wallets || [];
  } catch (error) {
    console.error('Failed to load wallets:', error);
  }

  return (
    <AppShell>
      <div>
        <div className="page-header">
          <h1 className="page-title">Wallet Review Queue</h1>
        </div>

        {wallets.length === 0 ? (
          <div className="page-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
            No wallets found in the system.
          </div>
        ) : (
          <div className="page-card table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Entity</th>
                  <th>Status</th>
                  <th>Chain Sync</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id}>
                    <td className="mono">
                      {wallet.walletAddress.substring(0, 8)}…{wallet.walletAddress.substring(wallet.walletAddress.length - 8)}
                    </td>
                    <td className="mono">
                      <Link href={`/entities/${wallet.entityId}`} style={{ color: 'var(--accent)' }}>
                        {wallet.entityId.substring(0, 8)}…
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${wallet.status === WalletStatus.Approved || wallet.status === WalletStatus.Synced ? 'badge-green' : wallet.status === WalletStatus.ProposalPending ? 'badge-amber' : wallet.status === WalletStatus.Rejected ? 'badge-red' : 'badge-gray'}`}>
                        {wallet.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${wallet.chainSyncStatus === ChainSyncStatus.Sent ? 'badge-green' : wallet.chainSyncStatus === ChainSyncStatus.ProposalPending ? 'badge-amber' : wallet.chainSyncStatus === ChainSyncStatus.Failed ? 'badge-red' : 'badge-gray'}`}>
                        {wallet.chainSyncStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/wallets/${wallet.id}`} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {wallet.status === WalletStatus.ProposalPending ? 'Track →' : 'Review →'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
