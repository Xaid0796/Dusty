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
          <span>Dusty</span>
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

          <Link href="/templates" className="btn btn-primary btn-sm ctaBtn">
            Build Now
          </Link>
        </nav>
      </div>
    </header>
  );
};
export default Header;
