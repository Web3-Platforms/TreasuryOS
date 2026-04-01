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
  Search
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
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none -z-20 opacity-40" />
      <div className="fixed inset-0 bg-grid pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-20" />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-background/80 backdrop-blur-xl py-3 border-border' : 'bg-transparent py-5 border-transparent'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 group">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all" />
              <Image src="/logo.png" alt="TreasuryOS Logo" fill className="relative object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">TreasuryOS</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {['Features', 'Architecture', 'Compliance', 'Solutions'].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
            <div className="h-6 w-px bg-border mx-2" />
            <Link 
              href="https://dashboard.treasuryos.io" 
              className="px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground text-sm font-bold rounded-full transition-all flex items-center gap-2 group shadow-lg shadow-primary/10"
            >
              Portal Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <button className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background/95 backdrop-blur-2xl border-b border-border py-8 px-6 flex flex-col gap-6 overflow-hidden"
            >
              {['Features', 'Architecture', 'Compliance', 'Solutions'].map((item) => (
                <Link key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-xl font-bold hover:text-primary transition-colors">{item}</Link>
              ))}
              <Link 
                href="https://dashboard.treasuryos.io" 
                className="mt-4 px-6 py-4 bg-primary text-primary-foreground text-center font-bold rounded-xl shadow-xl shadow-primary/20"
              >
                Launch Institutional App
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-40">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[13px] font-bold uppercase tracking-[0.1em] mb-10 shadow-sm">
              <Shield className="w-4 h-4" /> Next-Gen Institutional Rails
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1] text-foreground">
              Solana's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-300% animate-gradient">Institutional Gateway</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-14 max-w-3xl mx-auto font-medium leading-relaxed">
              Bridge traditional finance with decentralized rails. Secure, multi-sig governed treasury management designed for the modern enterprise.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="#contact" 
                className="w-full sm:w-auto px-10 py-5 bg-foreground text-background font-black rounded-2xl hover:bg-foreground/90 transition-all text-lg shadow-2xl hover:-translate-y-1"
              >
                Get Started
              </Link>
              <Link 
                href="#features" 
                className="w-full sm:w-auto px-10 py-5 glass text-foreground font-bold rounded-2xl hover:bg-white/5 transition-all text-lg flex items-center justify-center gap-2"
              >
                Explore Stack <Layers className="w-5 h-5" />
              </Link>
            </div>

            {/* Platform Snapshot */}
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="mt-24 relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full -z-10 animate-pulse" />
              <div className="glass rounded-[2rem] p-4 p-2 lg:p-4 border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-inner">
                  <Image 
                    src="/architecture.png" 
                    alt="TreasuryOS Platform architecture" 
                    fill 
                    className="object-cover scale-105 hover:scale-100 transition-transform duration-700"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="container mx-auto px-6 py-12 border-y border-border/50">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">Powering Compliance for the Digital Age</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 font-black text-xl"><Globe className="w-6 h-6" /> GLOBALPAY</div>
          <div className="flex items-center gap-2 font-black text-xl"><Lock className="w-6 h-6" /> SECURESIGN</div>
          <div className="flex items-center gap-2 font-black text-xl"><Briefcase className="w-6 h-6" /> VESTCORP</div>
          <div className="flex items-center gap-2 font-black text-xl"><BarChart3 className="w-6 h-6" /> QUANTUM</div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-secondary/20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Enterprise Infrastructure</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">Built from the ground up to meet the rigorous demands of institutional compliance and asset safety.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Shield className="w-10 h-10 text-primary" />, 
                title: "Regulatory Compliance", 
                description: "Built-in KYC/AML workflows and MiCA-ready regulatory reporting ensuring your operations stay compliant globally.",
                accent: "from-blue-500/20 to-transparent"
              },
              { 
                icon: <LayoutDashboard className="w-10 h-10 text-accent" />, 
                title: "Multi-Sig Governance", 
                description: "Deep integration with Squads V4 for robust, auditable on-chain governance and programmable transaction signing.",
                accent: "from-purple-500/20 to-transparent"
              },
              { 
                icon: <Database className="w-10 h-10 text-primary" />, 
                title: "Banking Rails", 
                description: "Direct connection to traditional banking infrastructure via AMINA and ISO20022 standardized digital adapters.",
                accent: "from-teal-500/20 to-transparent"
              },
              { 
                icon: <Zap className="w-10 h-10 text-yellow-500" />, 
                title: "High Performance", 
                description: "Leverage Solana's sub-second finality and ultra-low fees without sacrificing institutional security controls.",
                accent: "from-yellow-500/20 to-transparent"
              },
              { 
                icon: <Search className="w-10 h-10 text-primary" />, 
                title: "Audit Transparency", 
                description: "Real-time event logging and full historical audit trails for every treasury operation and administrative action.",
                accent: "from-blue-500/20 to-transparent"
              },
              { 
                icon: <Lock className="w-10 h-10 text-red-500" />, 
                title: "Enclave Security", 
                description: "Secure signing material management with platform-injected secret isolation and hardware-level isolation.",
                accent: "from-red-500/20 to-transparent"
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                {...fadeInUp}
                whileHover={{ y: -10 }}
                className="group relative p-10 bg-muted/30 border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-muted/50 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <div className="mb-8 p-4 bg-background rounded-2xl w-fit shadow-xl border border-white/5">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="glass rounded-[3rem] p-12 lg:p-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 blur-[100px] -z-10" />
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Institutional Onboarding <br />Simplified.</h2>
                <div className="space-y-12">
                  {[
                    { step: "01", title: "Institutional KYC", desc: "Fast-track onboarding with automated business verification and risk scoring." },
                    { step: "02", title: "Whitelist Authority", desc: "Define compliance rules and whitelist institutional wallets on-chain." },
                    { step: "03", title: "Treasury Launch", desc: "Deploy multi-sig vaults and connect to banking rails in a few clicks." }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-6">
                      <span className="text-4xl font-black text-primary/30 font-mono">{s.step}</span>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                        <p className="text-muted-foreground font-medium">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-square w-full max-w-md mx-auto">
                <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-10 border-2 border-dashed border-accent/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-40 h-40 group">
                    <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full group-hover:bg-primary/50 transition-all" />
                    <Image src="/logo.png" alt="TreasuryOS" fill className="relative object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto glass rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            <div className="flex-1 p-12 lg:p-16 bg-gradient-to-br from-primary/20 to-accent/20 border-r border-white/5">
              <h2 className="text-4xl font-black mb-6 leading-tight">Secure your institution's future.</h2>
              <p className="text-xl text-foreground/80 mb-12 font-medium">Request a private demo and learn how TreasuryOS can modernize your digital asset infrastructure.</p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Global HQ</p>
                    <p className="font-bold text-lg">European Union (EU)</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Compliance</p>
                    <p className="font-bold text-lg">MiCA Ready Framework</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-[1.4] p-12 lg:p-16 bg-background/40">
              {formStatus === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-black mb-4">Request Received</h3>
                  <p className="text-muted-foreground text-lg font-medium mb-8">A member of our institutional team will contact you within 24 hours.</p>
                  <button 
                    onClick={() => setFormStatus('idle')}
                    className="text-primary font-bold hover:underline underline-offset-8"
                  >
                    Send another request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {formStatus === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 font-bold"
                    >
                      <AlertCircle className="w-6 h-6 flex-shrink-0" />
                      <p>{errorMessage}</p>
                    </motion.div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Contact Name</label>
                      <input 
                        type="text" id="name" name="name" required 
                        className="w-full bg-muted/50 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                        placeholder="e.g. Elena Rodriguez"
                      />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Institutional Email</label>
                      <input 
                        type="email" id="email" name="email" required 
                        className="w-full bg-muted/50 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                        placeholder="name@institution.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="org" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Organization</label>
                    <input 
                      type="text" id="org" name="organization" required 
                      className="w-full bg-muted/50 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                      placeholder="e.g. Alpine Asset Management"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Inquiry Details</label>
                    <textarea 
                      id="message" name="message" rows={4} required 
                      className="w-full bg-muted/50 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium resize-none"
                      placeholder="Tell us about your treasury requirements..."
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className="w-full py-5 bg-primary text-primary-foreground font-black text-xl rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-2xl shadow-primary/30"
                  >
                    {formStatus === 'submitting' ? 'Processing...' : 'Request Access'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-border/50 bg-secondary/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-8">
                <div className="relative w-8 h-8">
                  <Image src="/logo.png" alt="TreasuryOS Logo" fill className="object-contain" />
                </div>
                <span className="text-2xl font-bold tracking-tight">TreasuryOS</span>
              </Link>
              <p className="text-muted-foreground text-lg max-w-sm mb-10 leading-relaxed font-medium">
                The secure, compliant gateway for institutional digital asset management on the Solana blockchain.
              </p>
              <div className="flex gap-4">
                {[Globe, Lock, LayoutDashboard].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:text-primary transition-colors cursor-pointer">
                    <Icon className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-8 uppercase tracking-[0.2em] text-xs text-muted-foreground">Solutions</h4>
              <ul className="space-y-4 font-medium">
                {['Multi-Sig Treasury', 'Compliance Registry', 'Banking Rails', 'Audit Engine'].map((l) => (
                  <li key={l}><Link href="#" className="hover:text-primary transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-8 uppercase tracking-[0.2em] text-xs text-muted-foreground">Company</h4>
              <ul className="space-y-4 font-medium">
                {['About', 'Security', 'Legal', 'Contact'].map((l) => (
                  <li key={l}><Link href="#" className="hover:text-primary transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-8">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>MiCA Disclosure</span>
            </div>
            <p>© {new Date().getFullYear()} TreasuryOS Platforms. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
