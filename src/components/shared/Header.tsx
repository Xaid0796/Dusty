'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, Heart } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { showSupportPopup } from '@/components/shared/SupportPopup';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleFAQClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    if (pathname === '/') {
      const faqSection = document.getElementById('faq');
      if (faqSection) {
        faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.location.href = '/#faq';
  };

  const handleDonateClick = () => {
    setMenuOpen(false);
    showSupportPopup();
  };

  // Visible in the top bar (primary actions)
  const primaryItems = [
    { href: '/', label: 'Home', active: isActive('/') },
    { href: '/templates', label: 'Templates', active: isActive('/templates') || isActive('/editor') },
    { href: '/pdf-tools', label: 'PDF Tools', active: isActive('/pdf-tools') },
  ];

  // Grouped inside the three-line (hamburger) menu
  const menuItems = [
    { href: '/templates', label: 'Templates', active: isActive('/templates') || isActive('/editor') },
    { href: '/pdf-tools', label: 'PDF Tools', active: isActive('/pdf-tools') },
    { href: '/about', label: 'About', active: isActive('/about') },
    { href: '/contact', label: 'Contact', active: isActive('/contact') },
    { href: '/feedback', label: 'Feedback', active: isActive('/feedback') },
    { href: '/privacy-policy', label: 'Privacy Policy', active: isActive('/privacy-policy') },
    { href: '/terms-of-service', label: 'Terms of Service', active: isActive('/terms-of-service') },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Logo href="/" size="md" />

        {/* Primary items kept visible in the bar */}
        <nav className={styles.nav}>
          {primaryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${item.active ? styles.navLinkActive : ''}`}
            >
              {item.label}
            </Link>
          ))}
          <button
            className={styles.donateBtn}
            onClick={handleDonateClick}
            type="button"
          >
            <Heart size={14} fill="currentColor" />
            Support Us
          </button>
          <Link href="/templates" className="btn btn-primary btn-sm ctaBtn">
            Build Now
          </Link>
        </nav>

        {/* Three-line menu (shown on all screen sizes) */}
        <div className={styles.mobileMenuWrap} ref={menuRef}>
          <button
            className={styles.hamburgerBtn}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Overflow Dropdown */}
          {menuOpen && (
            <div className={styles.overflowMenu} role="menu">
              <div className={styles.overflowMenuHeader}>Menu</div>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.overflowMenuItem} ${item.active ? styles.overflowMenuItemActive : ''}`}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} className={styles.overflowChevron} />
                </Link>
              ))}
              <div className={styles.overflowDivider} />
              <button
                className={styles.overflowMenuItem}
                role="menuitem"
                onClick={handleFAQClick}
              >
                <span>FAQ</span>
                <ChevronRight size={16} className={styles.overflowChevron} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
