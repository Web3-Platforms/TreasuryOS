import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { CreateEntityForm } from '@/components/create-entity-form';
import { getCurrentUser } from '@/lib/current-user';
import { canCreateEntityDraft } from '@/lib/rbac';
import type { AuthenticatedUser } from '@treasuryos/types';

export default async function NewEntityDraftPage() {
  let user: AuthenticatedUser;

  try {
    user = await getCurrentUser();
  } catch (error) {
    redirect('/login');
  }

  if (!canCreateEntityDraft(user)) {
    return (
      <AppShell>
        <div style={{ padding: '2rem', maxWidth: '800px' }}>
          <Link href="/entities" style={{ color: '#aaa', textDecoration: 'none' }}>
            &larr; Back to Entities
          </Link>

          <div style={{ marginTop: '1.5rem', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem' }}>
            <h1 style={{ marginTop: 0 }}>Draft Creation Unavailable</h1>
            <p style={{ color: '#ccc', lineHeight: 1.6, marginBottom: 0 }}>
              Only Admin and Compliance Officer accounts can create new entity drafts.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ padding: '2rem', maxWidth: '900px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/entities" style={{ color: '#aaa', textDecoration: 'none' }}>
            &larr; Back to Entities
          </Link>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: '0 0 0.75rem 0' }}>Create New Entity Draft</h1>
          <p style={{ color: '#aaa', margin: 0, lineHeight: 1.6 }}>
            Drafts can still be created during the pilot launch. KYC submission stays disabled until Sumsub is re-enabled.
          </p>
        </div>

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
          Phase 0 currently supports EU entities only, so new drafts are created with the EU jurisdiction locked in.
        </div>

        <CreateEntityForm />
      </div>
    </AppShell>
  );
}
