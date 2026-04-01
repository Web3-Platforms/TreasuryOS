'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { demoLoginAction, loginAction } from '../app/actions';

type PendingAction = 'login' | 'demo' | null;
const MAIN_SITE_URL = 'https://treasuryos.xyz';

interface LoginFormProps {
  showDemoAccess?: boolean;
}

export function LoginForm({ showDemoAccess = false }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const isPending = pendingAction !== null;

  function handleSuccess() {
    router.push('/');
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPendingAction('login');

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if ('error' in result) {
      setError(result.error);
      setPendingAction(null);
    } else {
      handleSuccess();
    }
  }

  async function handleDemoLogin() {
    setError(null);
    setPendingAction('demo');

    const result = await demoLoginAction();

    if ('error' in result) {
      setError(result.error);
      setPendingAction(null);
    } else {
      handleSuccess();
    }
  }

  return (
    <div className="login-form-container" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #333', borderRadius: '8px', background: '#111' }}>
      <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>TreasuryOS Pilot Login</h2>

      <div
        style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.22) 0%, rgba(85, 34, 204, 0.26) 55%, rgba(19, 194, 194, 0.22) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.28)',
        }}
      >
        <div style={{ color: '#d6e4ff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Explore TreasuryOS
        </div>
        <p style={{ margin: '0.5rem 0 0.85rem', color: '#d9e8ff', fontSize: '0.92rem', lineHeight: 1.5 }}>
          See the main TreasuryOS site for the product story, positioning, and launch vision before you sign in.
        </p>
        <a
          href={MAIN_SITE_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            width: '100%',
            padding: '0.9rem 1rem',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.96)',
            color: '#0a1f44',
            textDecoration: 'none',
            fontWeight: 700,
            boxSizing: 'border-box',
          }}
        >
          <span>Visit Main Site</span>
          <span aria-hidden="true" style={{ fontSize: '1rem' }}>↗</span>
        </a>
      </div>
      
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
          {pendingAction === 'login' ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      {showDemoAccess && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0 0.75rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#333' }} />
            <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Demo
            </span>
            <div style={{ flex: 1, height: '1px', background: '#333' }} />
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isPending}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#111',
              color: 'white',
              border: '1px solid #555',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: isPending ? 'not-allowed' : 'pointer'
            }}
          >
            {pendingAction === 'demo' ? 'Opening demo...' : 'Continue with Demo'}
          </button>

          <p style={{ margin: '0.75rem 0 0', color: '#999', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Demo access signs visitors in with a server-managed account so they can explore the product without seeing the password.
          </p>
        </>
      )}
    </div>
  );
}
