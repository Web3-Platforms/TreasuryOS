'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Building2, Wallet, ArrowLeftRight, FileText } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/entities', label: 'Entities', icon: Building2 },
  { href: '/wallets', label: 'Wallets', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/reports', label: 'Reports', icon: FileText },
];

type NavSidebarProps = {
  hasToken: boolean;
  logoutSlot?: React.ReactNode;
};

export function NavSidebar({ hasToken, logoutSlot }: NavSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      <div className="sidebar-brand">
        <span className="sidebar-eyebrow">TreasuryOS</span>
        <h1 className="sidebar-title">Pilot Console</h1>
      </div>

      {hasToken && (
        <nav className="sidebar-nav">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link${active ? ' sidebar-link--active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} className="sidebar-link-icon" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}

      {hasToken && logoutSlot && (
        <div className="sidebar-footer">{logoutSlot}</div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="app-shell__sidebar hidden-mobile">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="mobile-topbar show-mobile">
        <div className="mobile-topbar-brand">
          <span className="sidebar-eyebrow" style={{ fontSize: '0.65rem' }}>TreasuryOS</span>
          <span className="mobile-topbar-title">Pilot Console</span>
        </div>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="mobile-overlay show-mobile" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={`mobile-drawer show-mobile${mobileOpen ? ' mobile-drawer--open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
