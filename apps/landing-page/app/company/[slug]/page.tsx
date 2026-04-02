import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';

import { ContactForm } from '@/components/marketing/contact-form';
import { CtaBand } from '@/components/marketing/cta-band';
import { PageHero } from '@/components/marketing/page-hero';
import { SectionHeader } from '@/components/marketing/section-header';
import { SiteShell } from '@/components/marketing/site-shell';
import { companyPages, contactTracks, portalUrl } from '@/lib/marketing-content';
import { buildPageMetadata } from '@/lib/site-metadata';

const companySlugs = ['about', 'approach', 'contact'] as const;

export function generateStaticParams() {
  return companySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (slug === 'contact') {
    return buildPageMetadata({
      title: 'Contact',
      description: 'Book a TreasuryOS workshop, architecture review, or launch-planning conversation.',
      path: '/company/contact',
    });
  }

  const page = companyPages[slug];

  if (!page) {
    return buildPageMetadata({
      title: 'Company',
      path: '/company',
    });
  }

  return buildPageMetadata({
    title: page.title,
    description: page.description,
    path: `/company/${slug}`,
  });
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === 'contact') {
    return (
      <SiteShell>
        <PageHero
          eyebrow="Company / Contact"
          title="Bring us your launch questions, control model, or product evaluation brief."
          description="The best TreasuryOS conversations are concrete. Tell us whether you want a launch workshop, an architecture review, or a focused commercial discussion and we will shape the session around your real constraints."
          supportiveCopy="You can also visit the live pilot portal if you want to see the current operating surface before we speak."
          actions={[
            { label: 'Open the pilot portal', href: portalUrl, external: true },
            { label: 'Back to company', href: '/company', variant: 'secondary' },
          ]}
          aside={
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">What we can cover</p>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                {[
                  'Launch posture and rollout sequencing',
                  'Treasury and compliance workflow design',
                  'Product walkthroughs for decision-makers and operators',
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
            eyebrow="Engagement tracks"
            title="Choose the conversation that matches your decision stage."
            description="We can tailor the session based on whether your team is validating scope, reviewing architecture, or preparing a live rollout."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {contactTracks.map((track) => {
              const Icon = track.icon;
              return (
                <article key={track.title} className="surface-panel p-6 sm:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold text-white">{track.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{track.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="shell-container pb-20 sm:pb-24">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
            <div className="surface-panel p-6 sm:p-8">
              <span className="eyebrow">Before we speak</span>
              <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white">Bring the operating questions that matter.</h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-slate-400">
                <p>Useful starting points include:</p>
                <ul className="space-y-3">
                  {[
                    'Which workflows must go live first, and which should remain phased?',
                    'How are approvals and reviews currently distributed across teams?',
                    'What evidence do executives, auditors, or partners usually ask for?',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
                If your team would rather explore the product first, you can browse the <Link href="/products" className="text-white underline underline-offset-4">product pages</Link> and then return here with a sharper brief.
              </div>
            </div>
            <ContactForm title="Tell us how your team wants to evaluate TreasuryOS." buttonLabel="Send request" />
          </div>
        </section>

        <CtaBand
          eyebrow="Continue exploring"
          title="Want more context before we talk?"
          description="Read the product pages and rollout approach so your internal stakeholders arrive with a shared view of what TreasuryOS is built to do."
          actions={[
            { label: 'View products', href: '/products' },
            { label: 'Read the approach', href: '/company/approach', variant: 'secondary' },
          ]}
        />
      </SiteShell>
    );
  }

  const page = companyPages[slug];

  if (!page) {
    notFound();
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        supportiveCopy={page.summary}
        actions={[
          { label: 'Talk to the team', href: '/company/contact' },
          { label: 'Back to company', href: '/company', variant: 'secondary' },
        ]}
        aside={
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Core ideas</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              {page.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        }
      />

      {page.sections.map((section) => (
        <section key={section.title} className="shell-container pb-20 sm:pb-24">
          <SectionHeader eyebrow={page.eyebrow} title={section.title} description={section.description} />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="surface-panel p-6 sm:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold text-white">{item.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <section className="shell-container pb-20 sm:pb-24">
        <div className="surface-panel p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center">
            <div>
              <span className="eyebrow">Move from thesis to execution</span>
              <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Ready to translate these ideas into a real rollout plan?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                TreasuryOS is most valuable when the product design and delivery approach are considered together. If the page resonates, the next step is usually a practical conversation.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link href="/company/contact" className="button-primary">
                Contact TreasuryOS
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/products" className="button-secondary">
                View product pages
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
