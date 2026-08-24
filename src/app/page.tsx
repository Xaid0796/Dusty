import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Zap, Paintbrush, Download, FileText, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <Header />

      <main>
        {/* Hero Banner Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>Next-Gen Doc Builder</span>
            <h1 className={styles.title}>
              Create Stunning <span className={styles.titleAccent}>Resumes</span> & <span className={styles.titleAccent}>Biodatas</span> in Minutes
            </h1>
            <p className={styles.subtitle}>
              Choose a design, edit directly in your browser, upload your photo, customize colors, and download a professional PDF immediately. Completely free and offline-first.
            </p>
            <div className={styles.heroActions}>
              <Link href="/generator" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Create Your Resume <ArrowRight size={16} />
              </Link>
              <Link href="/templates" className="btn btn-secondary btn-secondary-dark">
                Browse Templates
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Choose Dusty?</h2>
            <p className={styles.sectionSubtitle}>
              Our editor is fully data-driven, allowing you to instantly switch designs without losing your typed text.
            </p>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <Zap size={22} />
              </div>
              <h3 className={styles.featureTitle}>Instant Live Preview</h3>
              <p className={styles.featureDesc}>
                Watch your changes render in real-time as you type. Adjust spacings, margins, and layouts instantly without page reloads.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <Paintbrush size={22} />
              </div>
              <h3 className={styles.featureTitle}>Design Customization</h3>
              <p className={styles.featureDesc}>
                Pick custom brand colors, switch between elegant fonts, adjust sizing (small, medium, large), and align layouts with a single click.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <FileText size={22} />
              </div>
              <h3 className={styles.featureTitle}>Modular Architectures</h3>
              <p className={styles.featureDesc}>
                Our system separates input data structures from visual layouts. Switch from a Modern Resume to Classic instantly.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                <Download size={22} />
              </div>
              <h3 className={styles.featureTitle}>Local & Secure</h3>
              <p className={styles.featureDesc}>
                Your data stays entirely on your device. We compress uploaded photos client-side and save draft states in local browser storage.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action Footer Grid */}
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to build your document?</h2>
            <p className={styles.ctaDesc}>
              Join thousands of job seekers and professionals who create polished PDFs using our clean, standard templates.
            </p>
            <Link href="/templates" className="btn btn-secondary ctaBtn">
              Select a Template Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
