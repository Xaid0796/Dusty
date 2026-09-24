import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <div className={styles.logoWrapper}>
              <Logo href="/" size="md" showTagline={false} light={true} />
            </div>
            <p className={styles.brandDescription}>
              Professional resume builder, CV templates, career guides, and PDF tools to help you land your dream job with confidence and style.
            </p>
          </div>

          <div className={styles.linksCols}>
            <div className={styles.col}>
              <h3 className={styles.colTitle}>Product & Guides</h3>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/templates" className={styles.link}>Resume Templates</Link>
                </li>
                <li>
                  <Link href="/guides" className={styles.link}>Career Guides & Tips</Link>
                </li>
                <li>
                  <Link href="/generator" className={styles.link}>Resume Generator</Link>
                </li>
                <li>
                  <Link href="/pdf-tools" className={styles.link}>PDF Tools</Link>
                </li>
              </ul>
            </div>

            <div className={styles.col}>
              <h3 className={styles.colTitle}>Company</h3>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/about" className={styles.link}>About Us</Link>
                </li>
                <li>
                  <Link href="/contact" className={styles.link}>Contact</Link>
                </li>
                <li>
                  <Link href="/feedback" className={styles.link}>Feedback</Link>
                </li>
                <li>
                  <Link href="/about" className={styles.link}>Careers</Link>
                </li>
              </ul>
            </div>

            <div className={styles.col}>
              <h3 className={styles.colTitle}>Legal</h3>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/privacy-policy" className={styles.link}>Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className={styles.link}>Terms of Service</Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className={styles.link}>Cookie Policy</Link>
                </li>
                <li>
                  <Link href="/about" className={styles.link}>Accessibility</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} DocXume. All rights reserved.
          </p>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.socialIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className={styles.socialIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
