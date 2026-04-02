import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

import { CtaBand } from '@/components/marketing/cta-band';
import { PageHero } from '@/components/marketing/page-hero';
import { SectionHeader } from '@/components/marketing/section-header';
import { SiteShell } from '@/components/marketing/site-shell';
import { companyPages, companySummaries } from '@/lib/marketing-content';
import { buildPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Company',
  description:
    'Learn how TreasuryOS thinks about product design, rollout discipline, and institutional implementation.',
  path: '/company',
});

export default function CompanyPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Company"
        title="A company story built around institutional trust, rollout honesty, and durable operating systems."
        description="We design TreasuryOS for teams that need better control before they need more surface area. The company pages explain how we think, how we launch, and how we work with institutions evaluating the platform."
        actions={[
          { label: 'Contact the team', href: '/company/contact' },
          { label: 'Explore products', href: '/products', variant: 'secondary' },
        ]}
        aside={
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">What you will find here</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              {[
                'The product philosophy behind TreasuryOS',
                'How we shape pilot and launch decisions',
                'Ways to engage for architecture, rollout, or commercial discovery',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        }
      />

      <section className="shell-container pb-20 sm:pb-24">
        <SectionHeader
          eyebrow="Company pages"
          title="Choose the lens that helps your team evaluate TreasuryOS best."
          description="These pages are designed to answer the questions that usually come right after product interest: why this company, why this rollout posture, and how should we engage?"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {companySummaries.map((page) => {
            const Icon = page.icon;

            return (
              <article key={page.slug} className="surface-panel flex h-full flex-col p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{page.eyebrow}</span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-white">{page.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">{page.description}</p>
                <Link href={`/company/${page.slug}`} className="button-primary mt-8 w-fit">
                  Open page
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="shell-container pb-20 sm:pb-24">
        <SectionHeader
          eyebrow="Three themes"
          title="How TreasuryOS frames institutional adoption."
          description="Our company pages reinforce the same message across product, rollout, and engagement: trust is earned operationally."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Product integrity',
              description:
                companyPages.about.summary,
            },
            {
              title: 'Rollout discipline',
              description:
                companyPages.approach.summary,
            },
            {
              title: 'Working engagement',
              description:
                'We prefer practical conversations: launch workshops, architecture reviews, and operating-model discussions that help teams decide with clarity.',
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
        eyebrow="Speak with TreasuryOS"
        title="Want to evaluate the product and the rollout model together?"
        description="That is usually the right conversation. We can help your team understand both the software and the launch posture it requires."
        actions={[
          { label: 'Book a conversation', href: '/company/contact' },
          { label: 'Read the approach', href: '/company/approach', variant: 'secondary' },
        ]}
      />
    </SiteShell>
  );
}
