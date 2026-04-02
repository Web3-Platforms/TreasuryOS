import Image from 'next/image';
import Link from 'next/link';

import { companySummaries, portalUrl, primaryNavigation, productSummaries } from '@/lib/marketing-content';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <div className="shell-container py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1">
                <Image src="/logo.png" alt="TreasuryOS" width={44} height={44} className="object-cover" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">TreasuryOS</p>
                <p className="text-sm text-slate-400">Compliance-first treasury operations for institutional teams.</p>
              </div>
            </Link>
            <p className="mt-6 text-sm leading-7 text-slate-400">
              A focused pilot launch for institutions that want governance, reporting, and treasury workflows designed to mature with their control posture.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Pilot launch</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Compliance-first</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Solana-ready</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-white">Navigation</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={portalUrl} className="transition hover:text-white" target="_blank" rel="noreferrer">
                  Pilot portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-white">Products</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/products" className="transition hover:text-white">
                  Product overview
                </Link>
              </li>
              {productSummaries.map((product) => (
                <li key={product.slug}>
                  <Link href={`/products/${product.slug}`} className="transition hover:text-white">
                    {product.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-white">Company</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/company" className="transition hover:text-white">
                  Company overview
                </Link>
              </li>
              {companySummaries.map((page) => (
                <li key={page.slug}>
                  <Link href={`/company/${page.slug}`} className="transition hover:text-white">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TreasuryOS. Built for institutional treasury, governance, and compliance teams.</p>
          <p>Marketing site refreshed during pilot-launch cutover hardening.</p>
        </div>
      </div>
    </footer>
  );
}
