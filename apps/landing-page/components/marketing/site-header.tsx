'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { portalUrl, primaryNavigation } from '@/lib/marketing-content';

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 px-4 pt-4 transition-all duration-500 sm:px-6 lg:px-8"
    >
      <div 
        className={`mx-auto flex flex-row items-center justify-between w-full max-w-7xl rounded-full border transition-all duration-500 px-6 py-3 shadow-2xl backdrop-blur-2xl ${
          isScrolled 
            ? 'border-white/20 bg-slate-900/80 shadow-black/40 py-2' 
            : 'border-white/10 bg-slate-900/40 shadow-slate-950/20'
        }`}
      >
        <Link href="/" className="flex flex-row items-center gap-3 shrink-0 ml-2">
          <div className="relative h-9 w-9 shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-inner">
            <Image src="/logo.png" alt="TreasuryOS" width={36} height={36} className="object-contain p-1" priority />
          </div>
          <p className="text-sm font-bold tracking-tight text-white m-0">TreasuryOS</p>
        </Link>

        {/* Explicitly using flex-row and space-x for fallback reliability */}
        <nav className="hidden lg:flex flex-row items-center justify-center gap-x-8 px-4">
          {primaryNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 transition-all hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex flex-row items-center gap-3 mr-2">
          <Link href="/company/contact" className="button-secondary px-6 py-2.5 !text-[10px] uppercase tracking-[0.2em] font-bold">
            Book intro
          </Link>
          <Link href={portalUrl} className="button-primary px-6 py-2.5 !text-[10px] uppercase tracking-[0.2em] font-bold" target="_blank" rel="noreferrer">
            Open platform
            <ArrowUpRight className="h-3.5 w-3.5" />
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
