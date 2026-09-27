import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Merge, Scissors, Minimize2, Stamp, Lock, FileText, RefreshCw, Image, ImageDown, Trash2, MoveVertical, RotateCcw } from 'lucide-react';
import styles from './page.module.css';

export default function PdfToolsPage() {
  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.container}>

          <div className={styles.header}>
            <h1 className={styles.title}>PDF Utilities</h1>
            <p className={styles.subtitle}>
              Free, client-side tools to manipulate your documents securely. Files are processed locally and never uploaded to any server.
            </p>
          </div>

          <div className={styles.grid}>
            {/* Merge Tool Card */}
            <Link href="/pdf-tools/merge" className={styles.card}>
              <div className={`${styles.iconWrapper} ${styles.mergeIcon}`}>
                <Merge size={26} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Merge PDF</h3>
                <p className={styles.cardDesc}>
                  Combine multiple PDF files into a single, cohesive document. Drag-and-drop to reorder pages before compiling.
                </p>
              </div>
            </Link>

            {/* Split Tool Card */}
            <Link href="/pdf-tools/split" className={styles.card}>
              <div className={`${styles.iconWrapper} ${styles.splitIcon}`}>
                <Scissors size={26} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Split PDF</h3>
                <p className={styles.cardDesc}>
                  Separate a single PDF file into multiple individual documents or extract specific pages.
                </p>
              </div>
            </Link>

            {/* Compress Tool Card */}
            <Link href="/pdf-tools/compress" className={styles.card}>
              <div className={`${styles.iconWrapper}`} style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
                <Minimize2 size={26} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Compress PDF</h3>
                <p className={styles.cardDesc}>
                  Reduce PDF file size while maintaining quality. Choose from multiple compression levels for optimal results.
                </p>
              </div>
            </Link>

            {/* Watermark Tool Card */}
            <Link href="/pdf-tools/watermark" className={styles.card}>
              <div className={`${styles.iconWrapper}`} style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
                <Stamp size={26} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Watermark PDF</h3>
                <p className={styles.cardDesc}>
                  Add custom text overlays with configurable opacity, font size, and diagonal or horizontal placement.
                </p>
              </div>
            </Link>

            {/* Encrypt Tool Card */}
            <Link href="/pdf-tools/encrypt" className={styles.card}>
              <div className={`${styles.iconWrapper}`} style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: '#dc2626' }}>
                <Lock size={26} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Protect PDF</h3>
                <p className={styles.cardDesc}>
                  Add password protection with AES encryption. Set user/owner passwords and control permissions (print, copy, modify).
                </p>
              </div>
            </Link>

            {/* Extract Pages Tool Card */}
            <Link href="/pdf-tools/extract" className={styles.card}>
              <div className={`${styles.iconWrapper}`} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                <FileText size={26} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Extract Pages</h3>
                <p className={styles.cardDesc}>
                  Select specific pages to extract into a new PDF document. Keep only the pages you need.
                </p>
              </div>
            </Link>

            {/* Rotate Pages Tool Card */}
            <Link href="/pdf-tools/rotate" className={styles.card}>
              <div className={`${styles.iconWrapper}`} style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', color: '#6366f1' }}>
                <RotateCcw size={26} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Rotate Pages</h3>
                <p className={styles.cardDesc}>
                  Quickly change page orientation by 90°, 180°, or 270° for all or specific pages in your PDF document.
                </p>
              </div>
            </Link>

            {/* Images to PDF Tool Card */}
            <Link href="/pdf-tools/imagetopdf" className={styles.card}>
              <div className={`${styles.iconWrapper}`} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                <Image size={26} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Images to PDF</h3>
                <p className={styles.cardDesc}>
                  Convert JPG, PNG, WebP images to PDF. Drag-drop to reorder, choose page size (A4, Letter, custom), and orientation.
                </p>
              </div>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
