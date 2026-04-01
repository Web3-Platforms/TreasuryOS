'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, LayoutDashboard, Database, Globe, ArrowRight, CheckCircle2, Menu, X, AlertCircle } from 'lucide-react';
import { submitContactForm } from './actions/contact';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-muted">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="TreasuryOS Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight">TreasuryOS</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#architecture" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Architecture</Link>
            <Link href="#compliance" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Compliance</Link>
            <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Link 
              href="https://dashboard.treasuryos.io" 
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-b border-muted py-6 px-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
            <Link href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Features</Link>
            <Link href="#architecture" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Architecture</Link>
            <Link href="#compliance" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Compliance</Link>
            <Link href="#contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Contact</Link>
            <Link 
              href="https://dashboard.treasuryos.io" 
              className="px-4 py-3 bg-primary text-primary-foreground text-center font-semibold rounded-lg"
            >
              Launch Dashboard
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-6">
              <Shield className="w-3 h-3" /> MiCA Compliant Infrastructure
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Institutional-Grade <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Treasury for Solana</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Bridge traditional finance with decentralized rails. Secure, compliant, and multi-sig governed treasury management for the modern enterprise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="#contact" 
                className="w-full sm:w-auto px-8 py-4 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-all text-lg"
              >
                Schedule Demo
              </Link>
              <Link 
                href="https://dashboard.treasuryos.io" 
                className="w-full sm:w-auto px-8 py-4 bg-muted border border-muted-foreground/20 text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all text-lg flex items-center justify-center gap-2"
              >
                Launch App <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Enterprise Infrastructure</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built from the ground up to meet the rigorous demands of institutional compliance.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Shield className="w-8 h-8 text-primary" />, 
                title: "Compliance-as-a-Service", 
                description: "Built-in KYC/AML workflows, on-chain compliance registries, and MiCA-ready regulatory reporting." 
              },
              { 
                icon: <LayoutDashboard className="w-8 h-8 text-primary" />, 
                title: "Multi-Sig Governance", 
                description: "Deep integration with Squads V4 for robust, auditable on-chain governance and transaction signing." 
              },
              { 
                icon: <Database className="w-8 h-8 text-primary" />, 
                title: "Banking Rails Integration", 
                description: "Direct connection to traditional banking infrastructure via AMINA and ISO20022 standardized adapters." 
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-background border border-muted rounded-2xl hover:border-primary/50 transition-all"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Showcase */}
      <section id="architecture" className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">The Modern <br />Financial Stack</h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                TreasuryOS bridges the gap between traditional banking and the Solana blockchain, providing a seamless experience for managing institutional digital assets.
              </p>
              <ul className="space-y-4">
                {[
                  "On-chain Compliance Registry sync",
                  "Automated KYC/AML verification",
                  "Institutional-grade transaction monitoring",
                  "Unified API Gateway for all operations"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative aspect-[4/3] w-full bg-muted rounded-2xl overflow-hidden border border-muted shadow-2xl">
              <Image 
                src="/architecture.png" 
                alt="TreasuryOS Architecture" 
                fill 
                className="object-contain p-4 bg-white/5" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-background rounded-3xl border border-muted overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="flex-1 p-8 md:p-12 bg-gradient-to-br from-primary/10 to-accent/10">
              <h2 className="text-3xl font-bold mb-4">Start your journey</h2>
              <p className="text-muted-foreground mb-8">Ready to bring institutional compliance to your treasury? Let's talk.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">European Union (EU)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Compliance</p>
                    <p className="font-medium">MiCA Registered</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-[1.5] p-8 md:p-12">
              {formStatus === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">Our compliance team will be in touch shortly.</p>
                  <button 
                    onClick={() => setFormStatus('idle')}
                    className="mt-8 text-primary font-semibold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formStatus === 'error' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm animate-in fade-in zoom-in">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>{errorMessage}</p>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                      <input 
                        type="text" id="name" name="name" required 
                        className="w-full bg-muted border border-muted-foreground/20 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Work Email</label>
                      <input 
                        type="email" id="email" name="email" required 
                        className="w-full bg-muted border border-muted-foreground/20 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="org" className="text-sm font-medium">Organization</label>
                    <input 
                      type="text" id="org" name="organization" required 
                      className="w-full bg-muted border border-muted-foreground/20 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Company Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">How can we help?</label>
                    <textarea 
                      id="message" name="message" rows={4} required 
                      className="w-full bg-muted border border-muted-foreground/20 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Tell us about your institutional requirements..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {formStatus === 'submitting' ? 'Sending...' : 'Request Early Access'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-muted">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2 opacity-80">
              <div className="relative w-6 h-6">
                <Image src="/logo.png" alt="TreasuryOS Logo" fill className="object-contain" />
              </div>
              <span className="font-bold tracking-tight">TreasuryOS</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground">Terms of Service</Link>
              <Link href="#" className="hover:text-foreground">Legal Notice</Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TreasuryOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
