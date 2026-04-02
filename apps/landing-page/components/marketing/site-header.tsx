'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

import { portalUrl, primaryNavigation } from '@/lib/marketing-content';

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/10 bg-slate-900/60 px-4 py-3 shadow-2xl shadow-slate-950/50 backdrop-blur-xl sm:px-6 transition-all hover:bg-slate-900/70 hover:border-white/15">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-lg shadow-primary/10">
            <Image src="/logo.png" alt="TreasuryOS" fill className="object-cover p-0" priority />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">TreasuryOS</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {primaryNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium tracking-wide text-slate-300 transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/company/contact" className="button-secondary px-5 py-2.5 text-sm tracking-wide">
            Book intro
          </Link>
          <Link href={portalUrl} className="button-primary px-5 py-2.5 text-sm tracking-wide" target="_blank" rel="noreferrer">
            Open platform
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-3 w-full max-w-7xl rounded-3xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl shadow-black/80 backdrop-blur-xl lg:hidden"
        >
          <nav className="flex flex-col gap-2">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-base font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-3">
            <Link href="/company/contact" onClick={() => setIsMenuOpen(false)} className="button-secondary justify-center py-3">
              Book intro
            </Link>
            <Link
              href={portalUrl}
              className="button-primary justify-center py-3"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              Open platform
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      ) : null}
    </motion.header>
  );
}
