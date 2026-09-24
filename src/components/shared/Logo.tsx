'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Logo.module.css';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  taglineText?: string;
  variant?: 'full' | 'icon' | 'compact';
  href?: string | null;
  className?: string;
  light?: boolean;
}

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${styles.svgIcon} ${className}`}
      aria-label="DocXume Logo Icon"
    >
      <defs>
        {/* Background midnight gradient */}
        <linearGradient id="dxBgGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="50%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Diagonal 1 - Electric Cyan into Royal Blue */}
        <linearGradient id="dxGradCyanBlue" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Diagonal 2 - Neon Fuchsia into Violet */}
        <linearGradient id="dxGradPinkViolet" x1="38" y1="10" x2="10" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="45%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* Document Fold Accent */}
        <linearGradient id="dxFoldGrad" x1="33" y1="3" x2="45" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
        </linearGradient>

        {/* Inner glow filter */}
        <filter id="dxGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Squircle Badge Background */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="12"
        fill="url(#dxBgGrad)"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1"
      />

      {/* Subtle Document Corner Fold Notch */}
      <path
        d="M 33 3 L 45 15 L 33 15 Z"
        fill="url(#dxFoldGrad)"
      />
      <path
        d="M 33 3 L 45 15"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="0.8"
      />

      {/* ── Monogram X: Primary Diagonal (Top-Left to Bottom-Right) ── */}
      <path
        d="M 13.5 13.5 L 34.5 34.5"
        stroke="url(#dxGradCyanBlue)"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#dxGlow)"
      />

      {/* ── Monogram X: Crossing Diagonal (Top-Right to Bottom-Left) ── */}
      {/* Top segment */}
      <path
        d="M 34.5 13.5 L 26.5 21.5"
        stroke="url(#dxGradPinkViolet)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Bottom segment */}
      <path
        d="M 21.5 26.5 L 13.5 34.5"
        stroke="url(#dxGradPinkViolet)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Under-shadow where the crossing ribbon bridges over */}
      <circle cx="24" cy="24" r="3.5" fill="rgba(15, 23, 42, 0.4)" />

      {/* Intersecting Center Luminous Sparkle */}
      <path
        d="M 24 20.5 L 25.2 22.8 L 27.5 24 L 25.2 25.2 L 24 27.5 L 22.8 25.2 L 20.5 24 L 22.8 22.8 Z"
        fill="#ffffff"
        filter="url(#dxGlow)"
      />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  taglineText = 'Pro Docs',
  variant = 'full',
  href = '/',
  className = '',
  light = false,
}) => {
  const sizeClass =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  const content = (
    <div className={`${styles.logoWrapper} ${sizeClass} ${light ? styles.light : ''} ${className}`}>
      <div className={styles.iconBadge}>
        <LogoIcon />
      </div>

      {variant !== 'icon' && (
        <div className={styles.brandTextGroup}>
          <div className={styles.brandName}>
            <span className={styles.brandDoc}>Doc</span>
            <span className={styles.brandX}>X</span>
            <span className={styles.brandUme}>ume</span>
          </div>
          {showTagline && (
            <span className={styles.tagline}>{taglineText}</span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'inline-flex' }}>
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
