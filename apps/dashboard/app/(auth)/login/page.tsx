import { LoginForm } from '@/components/login-form';
import { AppShell } from '@/components/app-shell';

export default function LoginPage() {
  return (
    <AppShell>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoginForm />
      </div>
    </AppShell>
  );
}
