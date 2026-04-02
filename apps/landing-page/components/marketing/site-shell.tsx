import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      {/* Premium glowing background mesh matching new institutional theme */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.13),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.06),transparent_60%),linear-gradient(180deg,#030712_0%,#0f172a_40%,#030712_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[40rem] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent)] opacity-80" />
      <div className="pointer-events-none fixed inset-0 -z-30 bg-[url('/noise.png')] opacity-[0.02]" />
      <SiteHeader />
      <main className="relative z-10 pb-12">{children}</main>
      <SiteFooter />
    </div>
  );
}
