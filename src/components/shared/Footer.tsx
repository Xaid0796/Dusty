import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo href="/" size="sm" showTagline={false} />
          <span>© {new Date().getFullYear()} DocXume. All rights reserved.</span>
        </div>
        <div className={styles.links}>
          <Link href="/feedback" className={styles.link}>
            Feedback
          </Link>
          <Link href="/privacy-policy" className={styles.link}>
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className={styles.link}>
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
