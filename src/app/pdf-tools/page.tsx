import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Merge, Scissors } from 'lucide-react';
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
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
