'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '../app/actions';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    } else if (result?.success) {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="login-form-container" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #333', borderRadius: '8px', background: '#111' }}>
      <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>TreasuryOS Pilot Login</h2>
      
      {error && (
        <div style={{ padding: '0.75rem', background: '#ff4d4f22', color: '#ff4d4f', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #ff4d4f' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="admin@example.com"
            required 
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            required 
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: isPending ? '#555' : 'white',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: isPending ? 'not-allowed' : 'pointer'
          }}
        >
          {isPending ? 'Logging in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
