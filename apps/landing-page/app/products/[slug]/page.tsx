import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';

import { CtaBand } from '@/components/marketing/cta-band';
import { PageHero } from '@/components/marketing/page-hero';
import { SectionHeader } from '@/components/marketing/section-header';
import { SiteShell } from '@/components/marketing/site-shell';
import { portalUrl, productPages } from '@/lib/marketing-content';

export function generateStaticParams() {
  return Object.keys(productPages).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productPages[slug];

  if (!product) {
    return { title: 'Product' };
  }

  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productPages[slug];

  if (!product) {
    notFound();
  }

  const Icon = product.icon;

  return (
    <SiteShell>
      <PageHero
        eyebrow={product.eyebrow}
        title={product.kicker}
        description={product.description}
        supportiveCopy={product.narrative}
        actions={[
          { label: 'Talk through this workflow', href: '/company/contact' },
          { label: 'Back to products', href: '/products', variant: 'secondary' },
        ]}
        aside={
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {product.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        }
      />

      <section className="shell-container pb-20 sm:pb-24">
        <SectionHeader
          eyebrow="Capabilities"
          title={`What ${product.shortTitle} delivers inside the operating model.`}
          description="These capabilities are designed to improve the team's decision quality while keeping evidence and accountability intact."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {product.capabilities.map((capability) => {
            const CapabilityIcon = capability.icon;

            return (
              <article key={capability.title} className="surface-panel p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <CapabilityIcon className="h-5 w-5" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-white">{capability.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">{capability.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="shell-container pb-20 sm:pb-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Workflow"
              title="How the product moves work forward."
              description="Each stage is designed to reduce ambiguity, preserve context, and make the next handoff cleaner."
            />
            <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
              This product is most effective when it is paired with a clear operating model for who creates requests, who reviews them, and who needs to defend the decision later.
            </div>
          </div>

          <div className="grid gap-5">
            {product.workflow.map((step, index) => (
              <div key={step.title} className="surface-panel p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Step 0{index + 1}</p>
                <h3 className="mt-4 text-2xl font-semibold text-white">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell-container pb-20 sm:pb-24">
        <SectionHeader
          eyebrow="Best-fit teams"
          title="The people who get the most value from this surface."
          description="TreasuryOS is deliberately cross-functional, but each page has a natural operational champion."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {product.teams.map((team) => (
            <div key={team} className="surface-panel p-5 text-center text-base font-medium text-white">
              {team}
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        eyebrow="Continue the evaluation"
        title={`See how ${product.shortTitle} fits into the broader TreasuryOS rollout.`}
        description="Move into the company pages for rollout strategy, launch posture, and how we shape institutional implementations without overselling the current scope."
        actions={[
          { label: 'Talk to the team', href: '/company/contact' },
          { label: 'Read the delivery approach', href: '/company/approach', variant: 'secondary' },
          { label: 'View pilot portal', href: portalUrl, variant: 'secondary', external: true },
        ]}
      />
    </SiteShell>
  );
}
