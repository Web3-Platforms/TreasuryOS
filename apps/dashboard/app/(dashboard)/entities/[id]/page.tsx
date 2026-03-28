import { fetchApi } from '@/lib/api-client';
import { AppShell } from '@/components/app-shell';
import type { EntityRecord, WalletRecord } from '@treasuryos/types';
import Link from 'next/link';
import { SubmitEntityButton } from '@/components/submit-entity-button';
import { RequestWalletForm } from '@/components/request-wallet-form';

export default async function EntityDetailPage({ params }: { params: { id: string } }) {
  let entity: EntityRecord | null = null;
  let wallets: WalletRecord[] = [];
  
  try {
    entity = await fetchApi<EntityRecord>(`entities/${params.id}`);
    const walletsData = await fetchApi<{ wallets: WalletRecord[] }>(`wallets?entityId=${params.id}`);
    wallets = walletsData.wallets || [];
  } catch (error) {
    console.error(`Failed to load entity ${params.id}:`, error);
  }

  if (!entity) {
    return (
      <AppShell>
        <div style={{ padding: '2rem' }}>
          <h1>Entity Not Found</h1>
          <p>The entity you are looking for does not exist or you do not have permission to view it.</p>
          <Link href="/entities" style={{ color: '#0d6efd' }}>&larr; Back to Entities</Link>
        </div>
      </AppShell>
    );
  }

  const canSubmit = entity.status === 'draft';
  const canRequestWallet = entity.status === 'approved' && entity.kycStatus === 'Approved';

  return (
    <AppShell>
      <div style={{ padding: '2rem', maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/entities" style={{ color: '#aaa', textDecoration: 'none' }}>&larr; Back to Entities</Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0' }}>{entity.legalName}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ padding: '0.25rem 0.5rem', background: '#333', borderRadius: '4px', fontSize: '0.875rem' }}>
                {entity.status}
              </span>
              <span style={{ color: '#888', fontSize: '0.875rem' }}>ID: {entity.id}</span>
            </div>
          </div>
          
          {canSubmit && (
            <SubmitEntityButton entityId={entity.id} />
          )}
        </div>

        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
            Entity Details
          </h2>
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', margin: 0 }}>
            <dt style={{ color: '#aaa', fontWeight: 500 }}>Jurisdiction</dt>
            <dd style={{ margin: 0 }}>{entity.jurisdiction}</dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Created At</dt>
            <dd style={{ margin: 0 }}>{new Date(entity.createdAt).toLocaleString()}</dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Last Updated</dt>
            <dd style={{ margin: 0 }}>{new Date(entity.lastUpdatedAt).toLocaleString()}</dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Risk Level</dt>
            <dd style={{ margin: 0 }}>
              <span style={{ color: entity.riskLevel === 'high' ? '#ff4d4f' : 'inherit' }}>
                {entity.riskLevel.toUpperCase()}
              </span>
            </dd>
          </dl>
        </div>

        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
            KYC Integration ({entity.provider})
          </h2>
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', margin: 0 }}>
            <dt style={{ color: '#aaa', fontWeight: 500 }}>KYC Status</dt>
            <dd style={{ margin: 0 }}>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                background: entity.kycStatus === 'Approved' ? '#0f5132' : entity.kycStatus === 'Rejected' ? '#842029' : '#333', 
                borderRadius: '4px', 
                fontSize: '0.875rem' 
              }}>
                {entity.kycStatus}
              </span>
            </dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Applicant ID</dt>
            <dd style={{ margin: 0, fontFamily: 'monospace', color: '#888' }}>
              {entity.kycApplicantId || 'Not assigned yet'}
            </dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>External User ID</dt>
            <dd style={{ margin: 0, fontFamily: 'monospace', color: '#888' }}>{entity.externalUserId}</dd>

            <dt style={{ color: '#aaa', fontWeight: 500 }}>Latest Webhook</dt>
            <dd style={{ margin: 0 }}>{entity.latestKycWebhookType || 'None'}</dd>

            {entity.latestKycReviewAnswer && (
              <>
                <dt style={{ color: '#aaa', fontWeight: 500 }}>Review Answer</dt>
                <dd style={{ margin: 0 }}>{entity.latestKycReviewAnswer}</dd>
              </>
            )}
          </dl>
        </div>

        {wallets.length > 0 && (
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
              Associated Wallets
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {wallets.map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#222', borderRadius: '4px', border: '1px solid #333' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{w.walletAddress}</span>
                    <span style={{ fontSize: '0.875rem', color: '#888' }}>
                      Status: <strong style={{ color: '#ccc' }}>{w.status}</strong> | Sync: <strong style={{ color: '#ccc' }}>{w.chainSyncStatus}</strong>
                    </span>
                  </div>
                  <Link href={`/wallets/${w.id}`} style={{ padding: '0.5rem 1rem', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px', alignSelf: 'center' }}>
                    View &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {canRequestWallet && <RequestWalletForm entityId={entity.id} />}
      </div>
    </AppShell>
  );
}
