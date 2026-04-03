import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

import { ContactForm } from '@/components/marketing/contact-form';
import { CtaBand } from '@/components/marketing/cta-band';
import { SectionHeader } from '@/components/marketing/section-header';
import { SiteShell } from '@/components/marketing/site-shell';
import { FadeIn } from '@/components/marketing/fade-in';
import { buildPageMetadata } from '@/lib/site-metadata';
import {
  customerSegments,
  homeSignals,
  platformPillars,
  portalUrl,
  productSummaries,
} from '@/lib/marketing-content';

export const metadata = buildPageMetadata({
  title: 'Institutional Digital Asset Operating System',
  description:
    'Compliance-first governance, treasury operations, and regulatory reporting for institutional teams on Solana.',
  path: '/',
});

export default function LandingPage() {
  return (
    <SiteShell>
      {/* Hero Section */}
      <section className="shell-container section-space pt-16 sm:pt-24 lg:pt-32">
        <div className="grid gap-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
          <div className="flex flex-col gap-10">
            <FadeIn delay={0.2} duration={0.8}>
              <span className="eyebrow">Institutional Solana Treasury</span>
            </FadeIn>
            
            <FadeIn delay={0.3} duration={1}>
              <h1 className="max-w-5xl text-balance text-6xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl xl:text-9xl leading-[0.95]">
                Compliance-first <span className="text-primary italic font-light drop-shadow-[0_0_30px_hsla(var(--primary)/0.4)]">operating system</span> for assets.
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.45} duration={1}>
              <p className="max-w-2xl text-xl leading-relaxed text-slate-300 sm:text-2xl font-medium opacity-90">
                TreasuryOS bridges institutional governance with decentralized efficiency. A modular control plane for approvals, evidence, and regulatory reporting.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.4}>
              <div className="flex flex-wrap gap-3">
                {homeSignals.map((signal) => (
                  <span key={signal} className="rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wider text-slate-200">
                    {signal}
                  </span>
                ))}
              </div>
            </FadeIn>
            
            <FadeIn delay={0.5}>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <a href="#request-access" className="button-primary pr-6">
                  Request Early Access
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <Link href="/products" className="button-secondary">
                  Explore Products
                </Link>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4} yOffset={40}>
            <div className="surface-panel p-8 sm:p-12 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-1000 group-hover:opacity-100 rounded-3xl" />
              
              <div className="relative z-10 space-y-12">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                    Audit-Ready Flow
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                    MiCA Compliant
                  </span>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    {
                      title: 'Shared Context',
                      description: 'Signers see the same evidence and decision trail as operators.',
                    },
                    {
                      title: 'Policy Aware',
                      description: 'On-chain compliance rules enforced at the transaction layer.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="p-6 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                      <h2 className="text-sm font-bold text-white uppercase tracking-widest">{item.title}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400 font-medium">{item.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Institutional Posture</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200 font-medium">
                    Maintain rigorous control without sacrificing speed. Designed for treasury teams navigating the transition to decentralized rails.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Early Access Banner */}
      <section className="shell-container pb-10">
        <FadeIn>
          <div className="surface-panel flex flex-col gap-5 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="eyebrow">Pilot Program</span>
              <p className="mt-3 text-base font-medium text-white">Limited early access open for institutional teams.</p>
              <p className="mt-1 text-sm text-slate-400">Join the pilot and get direct product tours, onboarding support, and early compliance tooling.</p>
            </div>
            <a
              href="#request-access"
              className="button-primary shrink-0 justify-center"
              style={{ whiteSpace: 'nowrap' }}
            >
              Apply for Access
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </FadeIn>
      </section>

      {/* Platform Features */}
      <section id="platform" className="shell-container pb-24 sm:pb-32 lg:pb-40">
        <FadeIn>
          <SectionHeader
            eyebrow="Core Capabilities"
            title="A unified operating model for high-trust teams."
            description="Built to handle the operational burden of approval, audit readiness, and identity verification."
          />
        </FadeIn>
        
        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {customerSegments.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <FadeIn key={segment.title} delay={index * 0.1}>
                <div className="surface-panel p-10 h-full relative group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_-5px_hsla(var(--primary)/0.6)] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-10 text-xl font-bold text-white tracking-tight">{segment.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400 font-medium">{segment.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Products Selection */}
      <section className="shell-container pb-24 sm:pb-32 lg:pb-40">
        <FadeIn>
          <SectionHeader
            eyebrow="Product Suite"
            title="Specialized surfaces for every role."
            description="Tailored workflows for Treasury Managers, Compliance Officers, and Institutional Reviewers."
          />
        </FadeIn>
        
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {productSummaries.map((product, index) => {
            const Icon = product.icon;
            return (
              <FadeIn key={product.slug} delay={index * 0.15}>
                <article className="surface-panel flex h-full flex-col p-10 relative group border-white/5 hover:border-primary/30">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{product.eyebrow}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-8 text-2xl font-bold text-white tracking-tight">{product.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300 font-medium">{product.description}</p>
                  
                  <ul className="mt-10 space-y-4">
                    {product.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
                        <span className="text-sm text-slate-300 leading-relaxed font-medium">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto pt-12">
                    <Link href={`/products/${product.slug}`} className="button-secondary w-full justify-center py-3 border-white/10 group-hover:border-primary/40">
                      Product Details
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Architecture Focus */}
      <section className="shell-container pb-24 sm:pb-32 lg:pb-40">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <div className="flex flex-col gap-10">
            <FadeIn>
              <SectionHeader
                eyebrow="Architecture"
                title="Proven infrastructure for mission-critical operations."
                description="TreasuryOS integrates with Squads V4 for governance and maintains an on-chain compliance registry."
              />
            </FadeIn>
            
            <div className="grid gap-4">
              {platformPillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <FadeIn key={pillar.title} delay={index * 0.1}>
                    <div className="glass-panel p-6 flex gap-5 items-center hover:bg-white/5 cursor-default group border-white/5">
                      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{pillar.title}</h3>
                        <p className="mt-1 text-sm text-slate-400 font-medium leading-relaxed">{pillar.description}</p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>

          <FadeIn delay={0.2}>
            <div className="surface-panel overflow-hidden p-3 shadow-black/80">
              <div className="rounded-2xl border border-white/5 bg-slate-950/80 p-2 overflow-hidden shadow-inner relative group">
                <Image
                  src="/architecture.png"
                  alt="Architecture Overview"
                  width={1400}
                  height={1000}
                  className="rounded-xl opacity-90 transition-transform duration-1000 scale-[1.01] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Trust & Engagement Footer */}
      <section id="request-access" className="shell-container pb-24 sm:pb-32 lg:pb-40">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <FadeIn>
            <div className="surface-panel p-10 h-full flex flex-col justify-between">
              <div className="space-y-8">
                <span className="eyebrow">Engagement</span>
                <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">Built for institutional discipline.</h2>
                <p className="text-base leading-relaxed text-slate-400 font-medium">
                  We help institutional teams shape their transition to digital asset rails without compromising on regulatory integrity or internal controls.
                </p>
                <ul className="space-y-5">
                  {[
                    'MiCA & EU Regulatory Frameworks',
                    'ISO20022 Interoperability',
                    'Squads V4 Governance Integration',
                  ].map((item) => (
                    <li key={item} className="flex gap-4 items-center p-4 rounded-xl bg-white/5 border border-white/5">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm font-bold text-slate-200 tracking-wide">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-12 p-8 rounded-3xl bg-primary shadow-xl shadow-primary/20">
                <p className="text-sm font-bold leading-relaxed text-white tracking-wide">
                  Direct platform tours available for verified institutional teams. Open our pilot portal to explore the current interface.
                </p>
                <Link href={portalUrl} className="mt-6 inline-flex items-center gap-3 text-white font-bold uppercase tracking-widest text-xs">
                  Launch Platform
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="h-full">
              <ContactForm />
            </div>
          </FadeIn>
        </div>
      </section>

      <CtaBand
        eyebrow="Explore TreasuryOS"
        title="Ready to deploy institutional governance?"
        description="Connect with our solutions team to discuss your specific treasury and compliance requirements."
        actions={[
          { label: 'View Products', href: '/products' },
          { label: 'Platform Story', href: '/company', variant: 'secondary' },
        ]}
      />
    </SiteShell>
  );
}
