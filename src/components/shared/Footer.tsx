import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div>
          © {new Date().getFullYear()} Dusty. All rights reserved.
        </div>
        <div className={styles.links}>
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
