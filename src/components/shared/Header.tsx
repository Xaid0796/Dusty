'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText } from 'lucide-react';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <FileText size={18} color="white" />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Dusty</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--primary-color)', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '-3px' }}>Pro Docs</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.navLink} ${isActive('/') ? styles.navLinkActive : ''}`}
          >
            Home
          </Link>
          <Link
            href="/templates"
            className={`${styles.navLink} ${isActive('/templates') || isActive('/editor') ? styles.navLinkActive : ''}`}
          >
            Templates
          </Link>
          <Link
            href="/pdf-tools"
            className={`${styles.navLink} ${isActive('/pdf-tools') ? styles.navLinkActive : ''}`}
          >
            PDF Tools
          </Link>
          <Link
            href="/feedback"
            className={`${styles.navLink} ${isActive('/feedback') ? styles.navLinkActive : ''}`}
          >
            Feedback
          </Link>

          <Link href="/templates" className="btn btn-primary btn-sm ctaBtn">
            Build Now
          </Link>
        </nav>
      </div>
    </header>
  );
};
export default Header;
