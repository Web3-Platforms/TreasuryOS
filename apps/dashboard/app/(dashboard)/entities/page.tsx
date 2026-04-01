import { fetchApi } from '@/lib/api-client';
import { AppShell } from '@/components/app-shell';
import { isSumsubKycEnabled } from '@/lib/feature-flags';
import { getCurrentUser } from '@/lib/current-user';
import { canCreateEntityDraft } from '@/lib/rbac';
import type { AuthenticatedUser, EntityRecord } from '@treasuryos/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function EntitiesPage() {
  const sumsubEnabled = isSumsubKycEnabled();
  let user: AuthenticatedUser;
  let entities: EntityRecord[] = [];

  try {
    user = await getCurrentUser();
  } catch (error) {
    redirect('/login');
  }

  try {
    const data = await fetchApi<{ entities: EntityRecord[] }>('entities');
    entities = data.entities;
  } catch (error) {
    console.error('Failed to load entities:', error);
  }

  const canCreateDraft = canCreateEntityDraft(user);

  return (
    <AppShell>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0 }}>Entity Review Queue</h1>
          {canCreateDraft ? (
            <Link
              href="/entities/new"
              style={{
                padding: '0.5rem 1rem',
                background: '#fff',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                textDecoration: 'none',
              }}
            >
              New Draft
            </Link>
          ) : null}
        </div>

        {!sumsubEnabled && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              border: '1px solid #5c3b00',
              borderRadius: '8px',
              background: '#2b2111',
              color: '#f0c36d',
            }}
          >
            Sumsub KYC is coming soon. Draft entities can still be created, but KYC submission is temporarily disabled.
          </div>
        )}

        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#222', borderBottom: '1px solid #333' }}>
                <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Legal Name</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Jurisdiction</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>KYC</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc' }}>Risk</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: '#ccc', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entities.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                    {canCreateDraft ? (
                      <>
                        No entities found in the system.{' '}
                        <Link href="/entities/new" style={{ color: '#fff' }}>
                          Create the first draft.
                        </Link>
                      </>
                    ) : (
                      'No entities found in the system.'
                    )}
                  </td>
                </tr>
              ) : (
                entities.map((entity) => {
                  const showComingSoonKyc = !sumsubEnabled && !entity.kycApplicantId && entity.status === 'draft';
                  const kycBackground = showComingSoonKyc
                    ? '#5c3b00'
                    : entity.kycStatus === 'Approved'
                      ? '#0f5132'
                      : entity.kycStatus === 'Rejected'
                        ? '#842029'
                        : '#333';

                  return (
                    <tr key={entity.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '1rem' }}>
                        <Link href={`/entities/${entity.id}`} style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
                          {entity.legalName}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem', color: '#aaa' }}>{entity.jurisdiction}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', background: '#333', borderRadius: '4px', fontSize: '0.875rem' }}>
                          {entity.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', background: kycBackground, borderRadius: '4px', fontSize: '0.875rem' }}>
                          {showComingSoonKyc ? 'Coming soon' : entity.kycStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', background: entity.riskLevel === 'high' ? '#842029' : '#333', borderRadius: '4px', fontSize: '0.875rem' }}>
                          {entity.riskLevel}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <Link href={`/entities/${entity.id}`} style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.875rem' }}>
                          Review &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
