'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Jurisdiction, RiskLevel } from '@treasuryos/types';
import { createEntityAction } from '@/app/actions';

const riskLevels = Object.values(RiskLevel);

function formatRiskLevel(riskLevel: RiskLevel) {
  return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
}

export function CreateEntityForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const legalName = (formData.get('legalName') as string | null)?.trim() ?? '';

    if (legalName.length < 2) {
      setError('Legal name must be at least 2 characters long.');
      setIsPending(false);
      return;
    }

    const result = await createEntityAction(formData);

    if ('error' in result) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    router.push(`/entities/${result.entityId}`);
    router.refresh();
  }

  return (
    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem' }}>
      {error && (
        <div
          style={{
            padding: '0.75rem',
            background: '#ff4d4f22',
            color: '#ff4d4f',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #ff4d4f',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="hidden" name="jurisdiction" value={Jurisdiction.EU} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="legalName" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
            Legal Name
          </label>
          <input
            type="text"
            id="legalName"
            name="legalName"
            placeholder="TreasuryOS Demo Institution Ltd"
            required
            maxLength={200}
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="jurisdiction-display" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
              Jurisdiction
            </label>
            <input
              id="jurisdiction-display"
              value="EU (pilot launch)"
              readOnly
              aria-readonly="true"
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#1a1a1a', color: '#aaa' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="riskLevel" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
              Risk Level
            </label>
            <select
              id="riskLevel"
              name="riskLevel"
              defaultValue={RiskLevel.Medium}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
            >
              {riskLevels.map((riskLevel) => (
                <option key={riskLevel} value={riskLevel}>
                  {formatRiskLevel(riskLevel)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="notes" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            maxLength={4000}
            placeholder="Optional internal notes for the draft."
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '0.75rem 1.5rem',
              background: isPending ? '#555' : 'white',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending ? 'Creating Draft...' : 'Create Draft'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/entities')}
            disabled={isPending}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#ccc',
              border: '1px solid #444',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
