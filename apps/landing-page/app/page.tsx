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
  BarChart3,
  Search,
  Users,
  CreditCard,
  Cpu,
  Fingerprint
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
    <div className="min-h-screen selection:bg-primary/20 bg-background text-foreground font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none -z-20 opacity-40" />
      <div className="fixed inset-0 bg-radial-grid pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-30" />

      {/* Modern Header */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-background/80 backdrop-blur-2xl py-3 border-border' : 'bg-transparent py-6 border-transparent'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full scale-150" />
              <Image src="/logo.png" alt="TreasuryOS" fill className="relative object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">Treasury<span className="text-primary">OS</span></span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-10">
            {['Solutions', 'Features', 'Compliance', 'Pricing'].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
            <div className="h-6 w-px bg-border/50 mx-2" />
            <Link 
              href="https://dashboard.treasuryos.io" 
              className="px-6 py-2.5 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
            >
              Access Portal
            </Link>
          </div>

          <button className="md:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </nav>

      {/* Hero: "The Institutional Standard" */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-48">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/5 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-12 animate-pulse">
              <Shield className="w-4 h-4" /> Secure On-Chain Treasury
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.85] text-white">
              Solana's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient">Institutional <br />Gateway.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
              The only compliance-first, multi-sig governed treasury protocol built for the modern institutional enterprise.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="#contact" 
                className="w-full sm:w-auto px-12 py-5 bg-white text-background font-black text-lg rounded-2xl hover:bg-slate-200 transition-all shadow-2xl hover:-translate-y-1"
              >
                Request Access
              </Link>
              <Link 
                href="#features" 
                className="w-full sm:w-auto px-12 py-5 glass text-white font-black text-lg rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                Explore Stack <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid: Redefining the Visuals */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Engineered for <br /><span className="text-primary">Reliability.</span></h2>
            <p className="text-xl text-muted-foreground font-medium">A modular infrastructure stack designed to bridge traditional finance with decentralized rails.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Bento Feature */}
            <motion.div {...fadeInUp} className="md:col-span-2 md:row-span-2 glass rounded-[3rem] p-12 lg:p-16 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center mb-10 border border-primary/20 group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">Institutional <br />Multi-Sig Governance.</h3>
                <p className="text-xl text-muted-foreground max-w-md font-medium leading-relaxed">
                  Deep integration with Squads V4 for auditable, protocol-level governance. Define custom approval thresholds and role-based access controls.
                </p>
              </div>
              <div className="relative mt-12 w-full h-64 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                 <Image src="/architecture.png" alt="Platform Architecture" fill className="object-cover group-hover:scale-110 transition-transform duration-[20s]" />
              </div>
            </motion.div>

            <motion.div {...fadeInUp} className="glass rounded-[2.5rem] p-10 flex flex-col justify-between group">
              <div className="mb-6 w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center border border-accent/20 group-hover:rotate-12 transition-transform">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="text-2xl font-black mb-3">MiCA Compliant</h4>
                <p className="text-muted-foreground font-medium">Built-in regulatory reporting and automated KYC/KYB registries for institutional onboarding.</p>
              </div>
            </motion.div>

            <motion.div {...fadeInUp} className="glass rounded-[2.5rem] p-10 flex flex-col justify-between group">
              <div className="mb-6 w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-90 transition-transform">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="text-2xl font-black mb-3">Sub-Second Finality</h4>
                <p className="text-muted-foreground font-medium">Leverage Solana's high-speed execution layer for near-instant treasury operations.</p>
              </div>
            </motion.div>

            {/* Smaller Bento Cards */}
            <motion.div {...fadeInUp} className="glass rounded-[2rem] p-8 group">
              <BarChart3 className="w-10 h-10 mb-6 text-primary group-hover:translate-x-1 transition-transform" />
              <h5 className="text-xl font-bold mb-2">Audit Transparency</h5>
              <p className="text-muted-foreground text-sm font-medium">Full historical audit logs for every on-chain event.</p>
            </motion.div>

            <motion.div {...fadeInUp} className="glass rounded-[2rem] p-8 group">
              <CreditCard className="w-10 h-10 mb-6 text-primary group-hover:translate-x-1 transition-transform" />
              <h5 className="text-xl font-bold mb-2">Banking Rails</h5>
              <p className="text-muted-foreground text-sm font-medium">Direct ISO20022 standardized banking adapter integration.</p>
            </motion.div>

            <motion.div {...fadeInUp} className="glass rounded-[2rem] p-8 group">
              <Cpu className="w-10 h-10 mb-6 text-primary group-hover:translate-x-1 transition-transform" />
              <h5 className="text-xl font-bold mb-2">Enclave Security</h5>
              <p className="text-muted-foreground text-sm font-medium">Secure signing material management with enclave-level isolation.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Scale: "Architecture of Trust" */}
      <section className="py-32 bg-secondary/30 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em] mb-8">
                The Infrastructure
              </div>
              <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-10 text-white">Engineered for <br />the Global Scale.</h2>
              <ul className="space-y-8">
                {[
                  { icon: <Search className="w-6 h-6" />, title: "Real-time Transaction Monitoring", desc: "Automated screening against global sanction lists." },
                  { icon: <Users className="w-6 h-6" />, title: "Role-Based Permissions", desc: "Hierarchical management for admins, auditors, and officers." },
                  { icon: <Fingerprint className="w-6 h-6" />, title: "Institutional Identity", desc: "Verified entity registries synced directly on-chain." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-black/20">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                      <p className="text-muted-foreground font-medium">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative group cursor-crosshair">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/40 transition-all duration-1000" />
              <div className="glass rounded-[3rem] p-4 lg:p-8 relative">
                 <Image src="/architecture.png" alt="Architecture" width={1000} height={800} className="w-full h-auto rounded-3xl opacity-80 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="px-6 py-3 bg-white text-background font-black uppercase tracking-widest text-[10px] rounded-full shadow-2xl">View Technical Spec</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section: Refined Form */}
      <section id="contact" className="py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto glass rounded-[4rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_0_100px_-20px_rgba(37,99,235,0.2)]">
            <div className="flex-1 p-16 bg-primary text-white flex flex-col justify-between relative">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><Globe className="w-64 h-64" /></div>
              <div>
                <h2 className="text-5xl font-black tracking-tighter mb-6 relative z-10">Start your journey.</h2>
                <p className="text-xl text-white/80 font-medium mb-12 relative z-10 leading-relaxed max-w-sm">Join the elite institutions building their future on TreasuryOS.</p>
              </div>
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Shield className="w-7 h-7" /></div>
                  <p className="font-bold text-lg">MiCA Compliant Registry</p>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><CheckCircle2 className="w-7 h-7" /></div>
                  <p className="font-bold text-lg">Verified Institutional Onboarding</p>
                </div>
              </div>
            </div>
            
            <div className="flex-[1.4] p-16">
              {formStatus === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-8 border border-green-500/20"><CheckCircle2 className="w-12 h-12" /></div>
                  <h3 className="text-4xl font-black mb-4">Request Sent.</h3>
                  <p className="text-muted-foreground text-lg font-medium mb-10 max-w-xs">Our institutional success team will contact you shortly.</p>
                  <button onClick={() => setFormStatus('idle')} className="text-primary font-black uppercase tracking-[0.2em] text-[10px] hover:underline">New Inquiry</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {formStatus === 'error' && (
                    <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-4 font-bold shadow-lg shadow-red-500/5 animate-shake"><AlertCircle className="w-6 h-6 flex-shrink-0" /> {errorMessage}</div>
                  )}
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Name</label>
                      <input type="text" name="name" required className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium" placeholder="Full Name" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Work Email</label>
                      <input type="email" name="email" required className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium" placeholder="name@company.com" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Organization</label>
                    <input type="text" name="organization" required className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium" placeholder="Company Name" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Details</label>
                    <textarea name="message" required rows={4} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium resize-none" placeholder="How can we support your treasury operations?"></textarea>
                  </div>
                  <button type="submit" disabled={formStatus === 'submitting'} className="w-full py-6 bg-white text-background font-black text-xl rounded-[2rem] hover:bg-slate-200 transition-all shadow-2xl disabled:opacity-50 hover:shadow-primary/20">
                    {formStatus === 'submitting' ? 'Processing...' : 'Request Demo'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pro Footer */}
      <footer className="py-32 border-t border-border bg-black/40">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-10">
                <Image src="/logo.png" alt="Logo" width={32} height={32} />
                <span className="text-2xl font-black tracking-tighter">TreasuryOS</span>
              </Link>
              <p className="text-muted-foreground text-lg max-w-sm mb-12 font-medium leading-relaxed">
                Empowering the future of institutional digital asset management through security and compliance.
              </p>
              <div className="flex gap-6">
                 {['Twitter', 'LinkedIn', 'Discord'].map((s) => (
                    <span key={s} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white cursor-pointer transition-colors">{s}</span>
                 ))}
              </div>
            </div>
            
            {['Product', 'Company'].map((title, i) => (
               <div key={title}>
                  <h4 className="font-black text-white uppercase tracking-[0.2em] text-[11px] mb-8">{title}</h4>
                  <ul className="space-y-4 font-medium text-muted-foreground">
                    {(i === 0 ? ['Multi-Sig', 'KYC Registry', 'Reporting', 'Security'] : ['About', 'Legal', 'Privacy', 'Contact']).map((l) => (
                       <li key={l}><Link href="#" className="hover:text-primary transition-colors">{l}</Link></li>
                    ))}
                  </ul>
               </div>
            ))}
          </div>
          
          <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            <p>© {new Date().getFullYear()} TreasuryOS Platforms. All rights reserved.</p>
            <div className="flex gap-8">
               <span>Global Compliance Layer</span>
               <span>v3.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
