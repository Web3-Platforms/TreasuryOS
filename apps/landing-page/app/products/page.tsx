import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

import { CtaBand } from '@/components/marketing/cta-band';
import { PageHero } from '@/components/marketing/page-hero';
import { SectionHeader } from '@/components/marketing/section-header';
import { SiteShell } from '@/components/marketing/site-shell';
import { portalUrl, productSummaries } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Explore the TreasuryOS product suite for treasury control, compliance command, and reporting workflows designed for institutional teams.',
};

export default function ProductsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Products"
        title="A product suite designed around institutional treasury operations."
        description="TreasuryOS is organized around the real work of launch and operation: move treasury decisions forward, preserve compliance context, and produce reporting outputs people can actually trust."
        supportiveCopy="Each page below goes deeper into the operating model and the teams each surface serves best."
        actions={[
          { label: 'Book a product walkthrough', href: '/company/contact' },
          { label: 'Open the pilot portal', href: portalUrl, variant: 'secondary', external: true },
        ]}
        aside={
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">How the suite fits together</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <p>
                <span className="font-semibold text-white">Treasury Control</span> manages high-trust actions and governance context.
              </p>
              <p>
                <span className="font-semibold text-white">Compliance Command</span> keeps evidence, review trails, and onboarding context visible.
              </p>
              <p>
                <span className="font-semibold text-white">Reporting Studio</span> packages the resulting operational story for internal and external stakeholders.
              </p>
            </div>
          </div>
        }
      />

      <section className="shell-container pb-20 sm:pb-24">
        <SectionHeader
          eyebrow="Product detail pages"
          title="Start with the surface that matches your strongest pain point."
          description="Whether your team is struggling with approvals, evidence, or reporting, the suite is intentionally modular while still reinforcing one operating system."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {productSummaries.map((product) => {
            const Icon = product.icon;
            return (
              <article key={product.slug} className="surface-panel flex h-full flex-col p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{product.eyebrow}</span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-white">{product.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">{product.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/products/${product.slug}`} className="button-primary mt-8 w-fit">
                  View page
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="shell-container pb-20 sm:pb-24">
        <SectionHeader
          eyebrow="Operating rhythm"
          title="Why institutional teams evaluate TreasuryOS as a suite instead of a point solution."
          description="The products are separated for clarity, but they are designed to reinforce the same rollout decisions and evidence trail."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'One shared narrative',
              description:
                'The treasury, compliance, and reporting teams can all point to the same operational history when explaining what happened.',
            },
            {
              title: 'Rollout that stays truthful',
              description:
                'You can keep some capabilities phased while still giving teams a coherent product experience and stakeholder story.',
            },
            {
              title: 'Better decision handoffs',
              description:
                'Every handoff between teams preserves the context needed to review, approve, report, or escalate cleanly.',
            },
          ].map((item) => (
            <div key={item.title} className="surface-panel p-6">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        eyebrow="Next step"
        title="Want help deciding which product surface should lead your rollout?"
        description="We can help you map the right entry point based on your team structure, control posture, and the story you need to tell at launch."
        actions={[
          { label: 'Talk to the team', href: '/company/contact' },
          { label: 'Read the company approach', href: '/company/approach', variant: 'secondary' },
        ]}
      />
    </SiteShell>
  );
}
