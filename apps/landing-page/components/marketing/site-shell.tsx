import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.14),transparent_34%),linear-gradient(180deg,#06101e_0%,#091222_38%,#050b17_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[32rem] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent)] opacity-70" />
      <SiteHeader />
      <main className="relative z-10 pb-12">{children}</main>
      <SiteFooter />
    </div>
  );
}
