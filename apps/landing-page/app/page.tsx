'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  LayoutDashboard, 
  Database, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X, 
  AlertCircle,
  Lock,
  Zap,
  Briefcase,
  Layers,
  BarChart3,
  Search,
  UserCheck,
  Building2,
  PieChart
} from 'lucide-react';
import { submitContactForm } from './actions/contact';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');
    
    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);

    if (result.error) {
      setFormStatus('error');
      setErrorMessage(result.error);
    } else {
      setFormStatus('success');
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-blue-500/30 font-sans antialiased">
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>
      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none -z-10" />

      {/* Glass Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl py-3 border-b border-white/5 shadow-2xl' : 'bg-transparent py-6 border-b border-transparent'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full" />
              <Image src="/logo.png" alt="TreasuryOS Logo" fill className="relative object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">Treasury<span className="text-blue-500">OS</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {['Features', 'How it Works', 'Architecture', 'Compliance'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-[13px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                {item}
              </Link>
            ))}
            <div className="w-px h-5 bg-white/10 mx-2" />
            <Link 
              href="https://dashboard.treasuryos.io" 
              className="px-6 py-2.5 bg-white text-slate-950 text-[13px] font-black uppercase tracking-widest rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-white/5"
            >
              Institutional Login
            </Link>
          </div>

          <button className="lg:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </nav>

      {/* Hero: Dynamic & Bold */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-48">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-black uppercase tracking-[0.2em] mb-8"
            >
              MiCA Compliant • Solana Native • Enterprise Ready
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white"
            >
              The New Standard in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500">Digital Treasury</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl lg:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Institutional-grade asset management meets on-chain compliance. Secure, multi-sig governed, and globally accessible.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="#contact" className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white font-black text-lg rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 active:scale-95">
                Request a Demo
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                View Features <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* Interactive Stat Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto py-12 border-y border-white/5 backdrop-blur-sm">
            {[
              { label: "On-Chain Speed", value: "< 400ms" },
              { label: "Transaction Fees", value: "< $0.01" },
              { label: "Security Layer", value: "Squads V4" },
              { label: "Compliance", value: "MiCA Ready" }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-400 transition-colors mb-2">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions: Sectioned & Dynamic */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 text-white">Institutional Safety, <br />Protocol Agility.</h2>
              <div className="space-y-10">
                {[
                  { icon: <Lock className="w-6 h-6" />, title: "Multi-Sig Governance", desc: "Enterprise-grade signing workflows powered by Squads V4. Customizable approval thresholds and role-based access." },
                  { icon: <UserCheck className="w-6 h-6" />, title: "On-Chain Compliance", desc: "Real-time whitelist enforcement and identity verification. MiCA-compliant registry ensures protocol-level asset safety." },
                  { icon: <BarChart3 className="w-6 h-6" />, title: "Real-time Auditing", desc: "Transparent transaction monitoring and historical audit logs. Every movement is recorded, verifiable, and institutional-ready." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-2 text-white">{item.title}</h4>
                      <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative p-2 bg-gradient-to-br from-blue-500/20 to-transparent rounded-[2.5rem] border border-white/5 shadow-2xl"
            >
              <div className="absolute inset-0 bg-blue-600/20 blur-[100px] -z-10" />
              <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-slate-950">
                <Image src="/architecture.png" alt="TreasuryOS Features" fill className="object-contain p-8 opacity-90 group-hover:scale-105 transition-transform duration-1000" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works: Visual & Step-Based */}
      <section id="how-it-works" className="py-32 bg-slate-950/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-6 text-white">Three Steps to Sovereignty</h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">We simplify the path to institutional digital asset management without compromising on strict compliance or security.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", icon: <Building2 className="w-8 h-8" />, title: "Institution Verification", desc: "Complete our fast-track KYC/KYB onboarding. Once verified, your institution is added to our global compliance registry." },
              { step: "02", icon: <PieChart className="w-8 h-8" />, title: "Configure Vaults", desc: "Deploy your multi-sig vaults on Solana. Define your signing rules, spending limits, and compliance whitelists." },
              { step: "03", title: "Scale Treasury", desc: "Manage assets, connect to banking rails, and generate MiCA-ready reports. Your institutional treasury is now globally connected." }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                {...fadeInUp} 
                transition={{ delay: i * 0.1 }}
                className="relative p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/50 transition-all group"
              >
                <div className="absolute top-6 right-8 text-5xl font-black text-white/5 group-hover:text-blue-500/10 transition-colors font-mono">{step.step}</div>
                <div className="mb-8 w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-blue-500 shadow-xl group-hover:scale-110 transition-transform">
                  {step.icon || <Globe className="w-8 h-8" />}
                </div>
                <h3 className="text-2xl font-black mb-4 text-white">{step.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Deep-Dive: Structured Section */}
      <section id="architecture" className="py-32">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-white/5 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] -z-10" />
            
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div {...fadeInUp}>
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                  The Institutional Stack
                </div>
                <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 text-white">Protocol-Native <br />Architecture.</h2>
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { label: "Execution", value: "Solana L1" },
                    { label: "Governance", value: "Squads V4" },
                    { label: "Identity", value: "SumSub / Registry" },
                    { label: "Banking", value: "AMINA / ISO20022" }
                  ].map((stat, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-10 text-slate-400 font-medium leading-relaxed max-w-md">
                  TreasuryOS is built as a modular middleware, ensuring institutional sovereignty through decentralized signing and centralized compliance control.
                </p>
              </motion.div>
              
              <div className="relative group cursor-zoom-in">
                <div className="absolute inset-0 bg-blue-500/30 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                  <Image src="/architecture.png" alt="Architecture Diagram" width={800} height={600} className="w-full h-auto p-4 bg-slate-950/50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form: Refined & Secure */}
      <section id="contact" className="py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row bg-slate-950 rounded-[3rem] border border-white/5 overflow-hidden shadow-[0_0_100px_-12px_rgba(59,130,246,0.3)]">
            <div className="flex-1 p-16 bg-blue-600 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Globe className="w-48 h-48" /></div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-8 relative z-10">Scale your institutional vision.</h2>
              <p className="text-xl text-blue-100 font-medium mb-12 relative z-10">Join the waitlist for the most secure and compliant gateway to the Solana ecosystem.</p>
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
                  <p className="font-bold">24h Priority Response</p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center"><Shield className="w-6 h-6" /></div>
                  <p className="font-bold">Compliant Onboarding Guide</p>
                </div>
              </div>
            </div>
            
            <div className="flex-[1.5] p-16">
              {formStatus === 'success' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6"><CheckCircle2 className="w-10 h-10" /></div>
                  <h3 className="text-3xl font-black mb-4 text-white">Request Sent</h3>
                  <p className="text-slate-400 font-medium mb-8">Our institutional success team will reach out within 24 hours.</p>
                  <button onClick={() => setFormStatus('idle')} className="text-blue-500 font-black hover:text-blue-400 transition-colors uppercase tracking-widest text-xs">New Inquiry</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {formStatus === 'error' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 font-bold"><AlertCircle className="w-5 h-5" /> {errorMessage}</div>
                  )}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</label>
                      <input type="text" name="name" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="Alexander Hamilton" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Institutional Email</label>
                      <input type="email" name="email" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="alex@bank.com" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Organization Name</label>
                    <input type="text" name="organization" required className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="Global Asset Management" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">How can we help?</label>
                    <textarea name="message" required rows={4} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all font-medium resize-none" placeholder="Details about your institutional treasury requirements..."></textarea>
                  </div>
                  <button type="submit" disabled={formStatus === 'submitting'} className="w-full py-5 bg-white text-slate-950 font-black text-lg rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl disabled:opacity-50">
                    {formStatus === 'submitting' ? 'Submitting...' : 'Send Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer: Compact & Pro */}
      <footer className="py-20 border-t border-white/5 bg-slate-950">
        <div className="container mx-auto px-6 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-10 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="text-xl font-black tracking-tighter text-white">TreasuryOS</span>
          </Link>
          <p className="text-slate-500 text-sm max-w-lg mx-auto mb-10 font-medium">
            Building the secure, protocol-native infrastructure for institutional digital asset management on the Solana blockchain.
          </p>
          <div className="flex justify-center gap-8 mb-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link href="#" className="hover:text-blue-500 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-blue-500 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-blue-500 transition-colors">Compliance</Link>
            <Link href="#" className="hover:text-blue-500 transition-colors">Legal</Link>
          </div>
          <p className="text-slate-600 text-xs font-medium">© {new Date().getFullYear()} TreasuryOS Platforms. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
