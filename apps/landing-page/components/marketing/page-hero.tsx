import Link from 'next/link';
import type { ReactNode } from 'react';

import type { MarketingAction } from '@/lib/marketing-content';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  supportiveCopy?: string;
  actions?: MarketingAction[];
  aside?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  supportiveCopy,
  actions = [],
  aside,
}: PageHeroProps) {
  return (
    <section className="shell-container section-space">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>
          {actions.length ? (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              {actions.map((action) => {
                const className =
                  action.variant === 'secondary' ? 'button-secondary' : 'button-primary';

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
          ) : null}
          {supportiveCopy ? <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400">{supportiveCopy}</p> : null}
        </div>
        {aside ? <div className="surface-panel p-6 sm:p-8">{aside}</div> : null}
      </div>
    </section>
  );
}
