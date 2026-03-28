import { fetchApi } from '@/lib/api-client';
import { AppShell } from '@/components/app-shell';
import type { EntityRecord } from '@treasuryos/types';
import Link from 'next/link';

export default async function EntitiesPage() {
  let entities: EntityRecord[] = [];
  try {
    const data = await fetchApi<{ entities: EntityRecord[] }>('entities');
    entities = data.entities;
  } catch (error) {
    console.error('Failed to load entities:', error);
  }

  return (
    <AppShell>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0 }}>Entity Review Queue</h1>
          <button style={{ padding: '0.5rem 1rem', background: '#fff', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            New Draft
          </button>
        </div>

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
                    No entities found in the system.
                  </td>
                </tr>
              ) : (
                entities.map((entity) => (
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
                      <span style={{ padding: '0.25rem 0.5rem', background: entity.kycStatus === 'Approved' ? '#0f5132' : '#333', borderRadius: '4px', fontSize: '0.875rem' }}>
                        {entity.kycStatus}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
