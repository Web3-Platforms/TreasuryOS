'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';

/**
 * Floating "Request Access" button that appears once the user scrolls
 * past the hero section, and hides when the #request-access form is
 * in the viewport. Gives every scroll position a clear path to the form.
 */
export function FloatingAccessCta() {
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const formRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    heroRef.current = document.querySelector('section');
    formRef.current = document.getElementById('request-access');

    const update = () => {
      if (!heroRef.current || !formRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      const formTop = formRef.current.getBoundingClientRect().top;
      const windowH = window.innerHeight;
      const pastHero = heroBottom < 0;
      const formOnScreen = formTop < windowH * 0.85;
      setVisible(pastHero && !formOnScreen);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  const scrollToForm = () => {
    document.getElementById('request-access')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToForm}
      aria-label="Scroll to request access form"
      className="fixed bottom-8 right-6 z-50 flex items-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-2xl shadow-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-primary/60 active:scale-95 animate-in fade-in slide-in-from-bottom-4"
    >
      Request Access
      <ArrowDown className="h-3.5 w-3.5" />
    </button>
  );
}
