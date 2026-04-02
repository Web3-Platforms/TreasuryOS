'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiskLevel, type EntityRecord } from '@treasuryos/types';

import { updateEntityAction } from '@/app/actions';

const riskLevels = Object.values(RiskLevel);

function formatRiskLevel(riskLevel: RiskLevel) {
  return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
}

type EditableEntity = Pick<EntityRecord, 'id' | 'jurisdiction' | 'legalName' | 'notes' | 'riskLevel' | 'status'>;

export function EditEntityForm({
  entity,
  manualKycBypassEnabled,
  sumsubEnabled,
}: {
  entity: EditableEntity;
  manualKycBypassEnabled: boolean;
  sumsubEnabled: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const resetsVerification = entity.status !== 'draft';
  const resetMessage = resetsVerification
    ? manualKycBypassEnabled && !sumsubEnabled
      ? 'Saving changes will move this entity back to draft and clear the current KYC/approval state. After saving, use the pilot bypass approval again from this page.'
      : 'Saving changes will move this entity back to draft and clear the current KYC/approval state. After saving, submit the entity to KYC again and re-approve it.'
    : 'Draft entities can be edited directly before submission.';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const result = await updateEntityAction(entity.id, new FormData(event.currentTarget));

    if ('error' in result) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    router.refresh();
  }

  return (
    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem', marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
        Edit Entity Info
      </h2>
      <p style={{ marginTop: 0, marginBottom: '1rem', color: '#f0c36d' }}>{resetMessage}</p>
      <p style={{ marginTop: 0, marginBottom: '1rem', color: '#888', fontSize: '0.875rem' }}>
        Existing wallets remain attached, but new approvals and screenings should only continue after the entity is re-approved.
      </p>

      {error && (
        <div style={{ padding: '0.75rem', background: '#ff4d4f22', color: '#ff4d4f', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #ff4d4f' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="hidden" name="jurisdiction" value={entity.jurisdiction} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="entity-legal-name" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
            Legal Name
          </label>
          <input
            id="entity-legal-name"
            name="legalName"
            type="text"
            defaultValue={entity.legalName}
            minLength={2}
            maxLength={200}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="entity-jurisdiction-display" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
              Jurisdiction
            </label>
            <input
              id="entity-jurisdiction-display"
              value={`${entity.jurisdiction} (pilot launch)`}
              readOnly
              aria-readonly="true"
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#1a1a1a', color: '#aaa' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="entity-risk-level" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
              Risk Level
            </label>
            <select
              id="entity-risk-level"
              name="riskLevel"
              defaultValue={entity.riskLevel}
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
          <label htmlFor="entity-notes" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
            Notes
          </label>
          <textarea
            id="entity-notes"
            name="notes"
            rows={5}
            maxLength={4000}
            defaultValue={entity.notes ?? ''}
            placeholder="Internal notes for the entity record."
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
            {isPending ? 'Saving...' : resetsVerification ? 'Save & Reset Approval Flow' : 'Save Draft Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
