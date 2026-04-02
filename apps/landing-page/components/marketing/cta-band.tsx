import Link from 'next/link';

import type { MarketingAction } from '@/lib/marketing-content';

type CtaBandProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions: MarketingAction[];
};

export function CtaBand({ eyebrow, title, description, actions }: CtaBandProps) {
  return (
    <section className="shell-container pb-20 sm:pb-24">
      <div className="surface-panel relative overflow-hidden p-8 sm:p-10 lg:p-12">
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-16 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">{description}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:justify-end">
            {actions.map((action) => {
              const className = action.variant === 'secondary' ? 'button-secondary' : 'button-primary';

              return (
                <Link
                  key={`${action.label}-${action.href}`}
                  href={action.href}
                  className={className}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noreferrer' : undefined}
                >
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
