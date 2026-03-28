'use client';

import { logoutAction } from '../app/actions';

export function LogoutButton() {
  return (
    <form action={logoutAction} style={{ margin: 0, padding: 0 }}>
      <button 
        type="submit" 
        style={{
          background: 'none',
          border: 'none',
          color: '#ff4d4f',
          cursor: 'pointer',
          padding: 0,
          fontWeight: 500,
          textDecoration: 'none'
        }}
      >
        Sign Out
      </button>
    </form>
  );
}
