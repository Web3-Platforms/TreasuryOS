import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

import { ContactForm } from '@/components/marketing/contact-form';
import { CtaBand } from '@/components/marketing/cta-band';
import { SectionHeader } from '@/components/marketing/section-header';
import { SiteShell } from '@/components/marketing/site-shell';
import { FadeIn } from '@/components/marketing/fade-in';
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
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div>
            <FadeIn delay={0.1}>
              <span className="eyebrow">Pilot launch for institutional treasury on Solana</span>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="mt-8 max-w-5xl text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Compliance-first treasury operations for institutions moving onto digital-asset rails.
              </h1>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl font-medium">
                TreasuryOS gives treasury, compliance, and operations teams one operating system for approvals, evidence, reporting, and phased rollout decisions—without forcing the institution to choose between speed and control.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.4}>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200">
                {homeSignals.map((signal) => (
                  <span key={signal} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 hover:border-white/20 transition-colors shadow-lg">
                    {signal}
                  </span>
                ))}
              </div>
            </FadeIn>
            
            <FadeIn delay={0.5}>
              <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:flex-wrap">
                <Link href="/products" className="button-primary pl-7 pr-6">
                  Explore products
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/company/contact" className="button-secondary">
                  Book a launch workshop
                </Link>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.6}>
              <p className="mt-8 max-w-2xl text-sm leading-7 text-slate-400">
                Current launch posture stays honest: the pilot focuses on governance, reporting, and operational workflows while deeper KYC and live on-chain sync expand in controlled phases.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.4} yOffset={50}>
            <div className="surface-panel p-6 sm:p-8 lg:p-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200 relative z-10">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-emerald-300 font-medium tracking-wide shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]">
                    Launch-ready control plane
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 tracking-wide">Audit-ready reporting</span>
                </div>
                
                <div className="mt-10 grid gap-5 sm:grid-cols-2 relative z-10">
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
                    <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-6 transition-all hover:bg-slate-900/60 hover:border-white/20 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.05)]">
                      <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 rounded-[1.75rem] border border-primary/20 bg-primary/5 p-6 relative z-10 shadow-[inner_0_0_20px_rgba(59,130,246,0.05)]">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Designed for the launch reality</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    TreasuryOS is positioned for institutions that need governance, compliance visibility, and reporting depth before they scale automation or widen on-chain exposure.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="platform" className="shell-container pb-20 sm:pb-28">
        <FadeIn>
          <SectionHeader
            eyebrow="Built for high-trust teams"
            title="A cleaner operating model for treasury, compliance, and finance."
            description="The product is shaped around the people who actually carry the operational burden of launch, approval, and audit readiness."
          />
        </FadeIn>
        
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {customerSegments.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <FadeIn key={segment.title} delay={index * 0.1}>
                <div className="surface-panel p-8 h-full relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-8 text-xl font-bold text-white tracking-wide">{segment.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">{segment.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="shell-container pb-20 sm:pb-28">
        <FadeIn>
          <SectionHeader
            eyebrow="Product suite"
            title="Three focused surfaces, one institutional operating system."
            description="Each product page sharpens a different part of the workflow, but they all reinforce the same control model and evidence trail."
          />
        </FadeIn>
        
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {productSummaries.map((product, index) => {
            const Icon = product.icon;
            return (
              <FadeIn key={product.slug} delay={index * 0.15}>
                <article className="surface-panel flex h-full flex-col p-8 sm:p-10 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{product.eyebrow}</span>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="mt-8 text-2xl font-bold text-white tracking-tight">{product.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300">{product.description}</p>
                    <ul className="mt-8 space-y-4 text-sm text-slate-200">
                      {product.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-4">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-accent" />
                          <span className="leading-relaxed">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-10">
                      <Link href={`/products/${product.slug}`} className="button-secondary w-full justify-center">
                        View product specifics
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="shell-container pb-20 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
          <div>
            <FadeIn>
              <SectionHeader
                eyebrow="Architecture posture"
                title="Built to connect operating decisions with the system state that matters."
                description="TreasuryOS keeps governance, review, and reporting close to the platform architecture so institutional teams can reason about the system they are actually running."
              />
            </FadeIn>
            
            <div className="mt-10 grid gap-5">
              {platformPillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <FadeIn key={pillar.title} delay={index * 0.1}>
                    <div className="surface-panel flex gap-5 p-6 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-white/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_15px_-5px_rgba(59,130,246,0.2)]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {pillar.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">{pillar.description}</p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>

          <FadeIn delay={0.3}>
            <div className="surface-panel overflow-hidden p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-4 shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <Image
                  src="/architecture.png"
                  alt="TreasuryOS architecture diagram"
                  width={1200}
                  height={900}
                  className="h-auto w-full rounded-[1.25rem] object-cover border border-white/5 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  priority
                />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  'Policy-aware workflow orchestration',
                  'Operator dashboards for institutional review',
                  'Reporting and evidence generation pathways',
                ].map((item) => (
                  <div key={item} className="rounded-[1.4rem] border border-white/10 bg-slate-900/60 p-5 text-sm font-medium text-slate-300 tracking-wide text-center flex items-center justify-center">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="shell-container pb-20 sm:pb-28">
        <FadeIn>
          <SectionHeader
            eyebrow="Rollout model"
            title="Launch with honesty now, widen scope with confidence later."
            description="TreasuryOS is strongest when the customer narrative, operating controls, and technical scope all say the same thing."
          />
        </FadeIn>
        
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {launchRoadmap.map((step, index) => (
            <FadeIn key={step.title} delay={index * 0.1}>
              <div className="surface-panel p-8 sm:p-10 h-full">
                <p className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-primary shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)]">0{index + 1}</p>
                <h3 className="mt-6 text-2xl font-bold text-white">{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="contact" className="shell-container pb-20 sm:pb-32">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-stretch">
          <FadeIn>
            <div className="surface-panel p-8 sm:p-10 h-full flex flex-col justify-between">
              <div>
                <span className="eyebrow">Who this is for</span>
                <h2 className="mt-8 text-balance text-3xl font-bold tracking-tight text-white leading-tight">TreasuryOS works best when the team is ready to operate with discipline.</h2>
                <p className="mt-5 text-base leading-8 text-slate-400">
                  Come to us with your current treasury flow, your approval model, or your launch questions. We will help shape the next phase without pretending every control has to switch on at once.
                </p>
                <div className="mt-10 space-y-5">
                  {[
                    'Treasury control rooms for high-trust workflows',
                    'Compliance context that stays attached to the operational record',
                    'Reporting outputs built for leadership, audit, and external review',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4 rounded-[1.4rem] border border-white/10 bg-slate-900/40 p-5 text-sm font-medium text-slate-200">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-primary" />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-12 rounded-[1.75rem] border border-primary/30 bg-primary/10 p-6 shadow-[inner_0_0_30px_rgba(59,130,246,0.1)]">
                <p className="text-sm font-medium leading-relaxed text-slate-200">
                  Prefer a direct product tour instead of a form? Visit the live pilot portal to see the current operating surface.
                </p>
                <div className="mt-6">
                  <Link href={portalUrl} className="button-secondary w-full justify-center py-3 border-white/20" target="_blank" rel="noreferrer">
                    View the pilot portal
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2} className="h-full">
            <div className="h-full">
              <ContactForm />
            </div>
          </FadeIn>
        </div>
      </section>

      <FadeIn delay={0.1}>
        <CtaBand
          eyebrow="Keep exploring"
          title="Move from the homepage into the product detail and company story pages."
          description="We redesigned the site to make evaluation easier: product pages explain the operational value, and company pages explain how TreasuryOS thinks about rollout and institutional trust."
          actions={[
            { label: 'View products', href: '/products' },
            { label: 'Meet the company', href: '/company', variant: 'secondary' },
          ]}
        />
      </FadeIn>
    </SiteShell>
  );
}
