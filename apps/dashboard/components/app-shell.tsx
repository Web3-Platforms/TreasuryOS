import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { NavSidebar } from './nav-sidebar';
import { LogoutButton } from './logout-button';

export async function AppShell({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('treasuryos_access_token')?.value;

  return (
    <div className="app-shell">
      <NavSidebar hasToken={!!token} logoutSlot={token ? <LogoutButton /> : undefined} />
      <main className="app-shell__content">
        {children}
      </main>
    </div>
  );
}

