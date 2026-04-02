import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

import { ContactForm } from '@/components/marketing/contact-form';
import { CtaBand } from '@/components/marketing/cta-band';
import { SectionHeader } from '@/components/marketing/section-header';
import { SiteShell } from '@/components/marketing/site-shell';
import {
  customerSegments,
  homeSignals,
  launchRoadmap,
  platformPillars,
  portalUrl,
  productSummaries,
} from '@/lib/marketing-content';

export default function LandingPage() {
  return (
    <SiteShell>
      <section className="shell-container section-space pt-10 sm:pt-14 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div>
            <span className="eyebrow">Pilot launch for institutional treasury on Solana</span>
            <h1 className="mt-8 max-w-5xl text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Compliance-first treasury operations for institutions moving onto digital-asset rails.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              TreasuryOS gives treasury, compliance, and operations teams one operating system for approvals, evidence, reporting, and phased rollout decisions—without forcing the institution to choose between speed and control.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
              {homeSignals.map((signal) => (
                <span key={signal} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {signal}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link href="/products" className="button-primary">
                Explore products
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/company/contact" className="button-secondary">
                Book a launch workshop
              </Link>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400">
              Current launch posture stays honest: the pilot focuses on governance, reporting, and operational workflows while deeper KYC and live on-chain sync expand in controlled phases.
            </p>
          </div>

          <div className="surface-panel p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-emerald-100">
                Launch-ready control plane
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Audit-ready reporting</span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Shared decision context',
                  description:
                    'Operators, reviewers, and signers see the same request, supporting evidence, and decision trail.',
                },
                {
                  title: 'Institutional rollout posture',
                  description:
                    'Launch what is ready now, keep the rest phased, and preserve one coherent operating model.',
                },
                {
                  title: 'Productive governance',
                  description:
                    'Turn governance from a bottleneck into a structured workflow that treasury teams can actually run.',
                },
                {
                  title: 'Evidence that travels',
                  description:
                    'Move from operations to audit, reporting, and stakeholder communication without reassembling the story.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Designed for the launch reality</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                TreasuryOS is positioned for institutions that need governance, compliance visibility, and reporting depth before they scale automation or widen on-chain exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="shell-container pb-20 sm:pb-24">
        <SectionHeader
          eyebrow="Built for high-trust teams"
          title="A cleaner operating model for treasury, compliance, and finance."
          description="The product is shaped around the people who actually carry the operational burden of launch, approval, and audit readiness."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {customerSegments.map((segment) => {
            const Icon = segment.icon;
            return (
              <div key={segment.title} className="surface-panel p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{segment.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{segment.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="shell-container pb-20 sm:pb-24">
        <SectionHeader
          eyebrow="Product suite"
          title="Three focused surfaces, one institutional operating system."
          description="Each product page sharpens a different part of the workflow, but they all reinforce the same control model and evidence trail."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {productSummaries.map((product) => {
            const Icon = product.icon;
            return (
              <article key={product.slug} className="surface-panel flex h-full flex-col p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium uppercase tracking-[0.22em] text-primary">{product.eyebrow}</span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-white">{product.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{product.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/products/${product.slug}`} className="button-secondary mt-8 w-fit">
                  View product page
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="shell-container pb-20 sm:pb-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Architecture posture"
              title="Built to connect operating decisions with the system state that matters."
              description="TreasuryOS keeps governance, review, and reporting close to the platform architecture so institutional teams can reason about the system they are actually running."
            />
            <div className="mt-8 grid gap-4">
              {platformPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="surface-panel flex gap-4 p-5">
                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-400">{pillar.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-panel overflow-hidden p-4 sm:p-5">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-3">
              <Image
                src="/architecture.png"
                alt="TreasuryOS architecture diagram"
                width={1200}
                height={900}
                className="h-auto w-full rounded-[1.25rem] object-cover"
                priority
              />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                'Policy-aware workflow orchestration',
                'Operator dashboards for institutional review',
                'Reporting and evidence generation pathways',
              ].map((item) => (
                <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell-container pb-20 sm:pb-24">
        <SectionHeader
          eyebrow="Rollout model"
          title="Launch with honesty now, widen scope with confidence later."
          description="TreasuryOS is strongest when the customer narrative, operating controls, and technical scope all say the same thing."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {launchRoadmap.map((step, index) => (
            <div key={step.title} className="surface-panel p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">0{index + 1}</p>
              <h3 className="mt-5 text-2xl font-semibold text-white">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="shell-container pb-20 sm:pb-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div className="surface-panel p-6 sm:p-8">
            <span className="eyebrow">Who this is for</span>
            <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white">TreasuryOS works best when the team is ready to operate with discipline.</h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Come to us with your current treasury flow, your approval model, or your launch questions. We will help shape the next phase without pretending every control has to switch on at once.
            </p>
            <div className="mt-8 space-y-4">
              {[
                'Treasury control rooms for high-trust workflows',
                'Compliance context that stays attached to the operational record',
                'Reporting outputs built for leadership, audit, and external review',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[1.6rem] border border-primary/20 bg-primary/10 p-5 text-sm leading-7 text-primary">
              Prefer a direct product tour instead of a form? Visit the live pilot portal to see the current operating surface.
              <div className="mt-4">
                <Link href={portalUrl} className="button-secondary" target="_blank" rel="noreferrer">
                  View the pilot portal
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <CtaBand
        eyebrow="Keep exploring"
        title="Move from the homepage into the product detail and company story pages."
        description="We redesigned the site to make evaluation easier: product pages explain the operational value, and company pages explain how TreasuryOS thinks about rollout and institutional trust."
        actions={[
          { label: 'View products', href: '/products' },
          { label: 'Meet the company', href: '/company', variant: 'secondary' },
        ]}
      />
    </SiteShell>
  );
}
