'use client';

import { useState } from 'react';
import { requestWalletAction } from '../app/actions';

interface RequestWalletFormProps {
  entityId: string;
}

export function RequestWalletForm({ entityId }: RequestWalletFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const walletAddress = formData.get('walletAddress') as string;

    if (!walletAddress || walletAddress.length < 32) {
      setError('Please provide a valid Solana wallet address.');
      setIsPending(false);
      return;
    }

    try {
      const result = await requestWalletAction(entityId, walletAddress);
      
      if (result?.error) {
        setError(result.error);
      } else {
        // Clear value manually since we prevented default 
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      setError('Unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem', marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
        Request New Wallet
      </h2>

      {error && (
        <div style={{ padding: '0.75rem', background: '#ff4d4f22', color: '#ff4d4f', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #ff4d4f' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="walletAddress" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>
            Solana Wallet Address
          </label>
          <input 
            type="text" 
            id="walletAddress" 
            name="walletAddress" 
            placeholder="e.g. HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH"
            required 
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', fontFamily: 'monospace' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          style={{
            alignSelf: 'flex-start',
            padding: '0.75rem 1.5rem',
            background: isPending ? '#555' : 'white',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: isPending ? 'not-allowed' : 'pointer'
          }}
        >
          {isPending ? 'Requesting...' : 'Submit Wallet Request'}
        </button>
      </form>
    </div>
  );
}
