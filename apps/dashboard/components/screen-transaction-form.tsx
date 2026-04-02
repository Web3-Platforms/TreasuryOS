'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { screenTransactionAction } from '@/app/actions';

type ScreeningWalletOption = {
  id: string;
  status: string;
  walletAddress: string;
};

type ScreeningEntityOption = {
  id: string;
  legalName: string;
  wallets: ScreeningWalletOption[];
};

export function ScreenTransactionForm({ entities }: { entities: ScreeningEntityOption[] }) {
  const router = useRouter();
  const [selectedEntityId, setSelectedEntityId] = useState(entities[0]?.id ?? '');
  const [selectedWalletId, setSelectedWalletId] = useState(entities[0]?.wallets[0]?.id ?? '');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedEntity = useMemo(
    () => entities.find((entity) => entity.id === selectedEntityId) ?? entities[0],
    [entities, selectedEntityId],
  );
  const selectedWallet =
    selectedEntity?.wallets.find((wallet) => wallet.id === selectedWalletId) ?? selectedEntity?.wallets[0];

  function handleEntityChange(nextEntityId: string) {
    const nextEntity = entities.find((entity) => entity.id === nextEntityId);
    setSelectedEntityId(nextEntityId);
    setSelectedWalletId(nextEntity?.wallets[0]?.id ?? '');
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEntity || !selectedWallet) {
      setError('Choose an approved entity wallet before screening a transaction.');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const amount = Number(formData.get('amount'));
    const asset = ((formData.get('asset') as string | null) ?? 'USDC').trim().toUpperCase();
    const destinationWallet = ((formData.get('destinationWallet') as string | null) ?? '').trim();
    const referenceId = ((formData.get('referenceId') as string | null) ?? '').trim();
    const notes = ((formData.get('notes') as string | null) ?? '').trim();
    const manualReviewRequested = formData.get('manualReviewRequested') === 'on';

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    if (destinationWallet.length < 32) {
      setError('Destination wallet must be a valid Solana address.');
      return;
    }

    setIsPending(true);
    setError(null);
    setNotice(null);

    try {
      const result = await screenTransactionAction({
        amount,
        asset,
        destinationWallet,
        entityId: selectedEntity.id,
        manualReviewRequested,
        notes: notes || undefined,
        referenceId: referenceId || undefined,
        sourceWallet: selectedWallet.walletAddress,
        walletId: selectedWallet.id,
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }

      if (result.caseOpened && result.caseId) {
        router.push(`/transactions/${result.caseId}`);
        router.refresh();
        return;
      }

      form.reset();
      setNotice(
        `Transaction ${result.transactionReference} cleared screening. No case was opened because no review rule was triggered.`,
      );
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
      <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>Screen Transaction</h2>
      <p style={{ marginTop: 0, marginBottom: '1rem', color: '#aaa' }}>
        This queue only fills when screening rules trigger review. Use an approved or synced entity wallet below to screen a transaction;
        amounts above 1,000 or manual review requests will open a case.
      </p>

      {error && (
        <div style={{ padding: '0.75rem', background: '#ff4d4f22', color: '#ff4d4f', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #ff4d4f' }}>
          {error}
        </div>
      )}

      {notice && (
        <div style={{ padding: '0.75rem', background: '#0f513222', color: '#7ee787', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #0f5132' }}>
          {notice}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="screen-entity" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
              Entity
            </label>
            <select
              id="screen-entity"
              value={selectedEntity?.id ?? ''}
              onChange={(event) => handleEntityChange(event.target.value)}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
            >
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.legalName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="screen-wallet" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
              Source Wallet
            </label>
            <select
              id="screen-wallet"
              value={selectedWallet?.id ?? ''}
              onChange={(event) => setSelectedWalletId(event.target.value)}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', fontFamily: 'monospace' }}
            >
              {selectedEntity?.wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.walletAddress} ({wallet.status})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="screen-amount" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
              Amount
            </label>
            <input
              id="screen-amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue="2500"
              required
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="screen-asset" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
              Asset
            </label>
            <input
              id="screen-asset"
              name="asset"
              type="text"
              defaultValue="USDC"
              maxLength={24}
              required
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="screen-destination" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
              Destination Wallet
            </label>
            <input
              id="screen-destination"
              name="destinationWallet"
              type="text"
              minLength={32}
              maxLength={64}
              required
              placeholder="Destination Solana address"
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="screen-reference" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
              Reference ID
            </label>
            <input
              id="screen-reference"
              name="referenceId"
              type="text"
              minLength={3}
              maxLength={120}
              placeholder="Optional internal reference"
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="screen-notes" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
            Notes
          </label>
          <textarea
            id="screen-notes"
            name="notes"
            rows={4}
            maxLength={4000}
            placeholder="Optional context for the screening decision."
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', resize: 'vertical' }}
          />
        </div>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#ccc' }}>
          <input type="checkbox" name="manualReviewRequested" />
          Force manual review even if the amount would otherwise clear.
        </label>

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
            {isPending ? 'Screening...' : 'Screen Transaction'}
          </button>
          <div style={{ color: '#888', alignSelf: 'center', fontSize: '0.875rem' }}>
            Selected wallet: {selectedWallet?.walletAddress ?? 'No wallet available'}
          </div>
        </div>
      </form>
    </div>
  );
}
