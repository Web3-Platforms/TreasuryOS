'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

import { portalUrl, primaryNavigation } from '@/lib/marketing-content';

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/10 bg-slate-950/75 px-4 py-3 shadow-2xl shadow-slate-950/50 backdrop-blur-xl sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-lg shadow-primary/20">
            <Image src="/logo.png" alt="TreasuryOS" fill className="object-contain p-1" priority />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">TreasuryOS</p>
            <p className="text-xs text-slate-400">Institutional treasury operations</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {primaryNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-300 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/company/contact" className="button-secondary px-4 py-2.5 text-sm">
            Book intro
          </Link>
          <Link href={portalUrl} className="button-primary px-4 py-2.5 text-sm" target="_blank" rel="noreferrer">
            Open pilot portal
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="mx-auto mt-3 w-full max-w-7xl rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-2xl shadow-slate-950/60 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-2">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-base font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-3">
            <Link href="/company/contact" onClick={() => setIsMenuOpen(false)} className="button-secondary justify-center">
              Book intro
            </Link>
            <Link
              href={portalUrl}
              className="button-primary justify-center"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              Open pilot portal
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
