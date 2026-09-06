'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import {
  Zap,
  Paintbrush,
  Download,
  FileText,
  ArrowRight,
  FileCheck,
  X,
  Sparkles,
} from 'lucide-react';
import styles from './page.module.css';

type ModalStep = 'resume' | null;

// Generator resume templates (matches /generator template ids)
const RESUME_OPTIONS: { id: string; name: string; desc: string; gradient: string; emoji: string }[] = [
  { id: 'classic', name: 'Classic Professional', desc: 'Timeless single-column professional resume layout.', gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', emoji: '📄' },
  { id: 'modern', name: 'Modern Minimalist', desc: 'Clean, contemporary design with subtle accents.', gradient: 'linear-gradient(135deg, #0f766e, #14b8a6)', emoji: '✨' },
  { id: 'sidebar', name: 'Executive Sidebar', desc: 'Structured two-column layout highlighting key skills and experience.', gradient: 'linear-gradient(135deg, #312e81, #6366f1)', emoji: '📊' },
  { id: 'greta', name: 'Greta Student Minimalist', desc: 'Soft pastel tones tailored for graduates and early professionals.', gradient: 'linear-gradient(135deg, #9a3412, #f97316)', emoji: '🎓' },
  { id: 'william', name: 'William Executive Designer', desc: 'Bold, high-impact header for creative and executive leaders.', gradient: 'linear-gradient(135deg, #581c87, #c084fc)', emoji: '💼' },
];

const ROW_1_CANDIDATES = [
  { name: 'Alex Turner', role: 'Senior Software Engineer', image: '/resume-photo-1.jpeg' },
  { name: 'Elena Rostova', role: 'Product Manager', image: '/resume-photo-2.jpeg' },
  { name: 'Marcus Vance', role: 'Full Stack Architect', image: '/photos/male/american.jpeg' },
  { name: 'Sophia Chen', role: 'UI/UX Lead Designer', image: '/photos/female/office-girl.jpeg' },
  { name: 'Liam O’Connor', role: 'DevOps Specialist', image: '/photos/male/scottish-office.jpeg' },
  { name: 'Priya Sharma', role: 'Data Scientist', image: '/photos/female/office-women.jpeg' },
  { name: 'Ryan Gosling', role: 'Solutions Architect', image: '/photos/male/american-office.jpeg' },
  { name: 'Clara Oswald', role: 'Technical Writer', image: '/photos/female/women-01.png' },
];

const ROW_2_CANDIDATES = [
  { name: 'David Miller', role: 'Investment Strategist', image: '/photos/male/italian-office.jpeg' },
  { name: 'Aisha Patel', role: 'Clinical Researcher', image: '/resume-photo-3.jpeg' },
  { name: 'Lucas Gabriel', role: 'Marketing Director', image: '/photos/male/office-man.jpeg' },
  { name: 'Isabella Rossi', role: 'Legal Consultant', image: '/resume-photo-4.jpeg' },
  { name: 'Noah Wright', role: 'Cybersecurity Analyst', image: '/photos/male/men-01.png' },
  { name: 'Zoe Alverez', role: 'Brand Strategist', image: '/resume-photo-5.jpeg' },
  { name: 'Ethan Hunt', role: 'Security Engineer', image: '/photos/male/office-man.jpeg' },
  { name: 'Mia Wong', role: 'Product Analyst', image: '/photos/female/women-01.png' },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Is DocXume completely free to use?',
    a: 'Yes! DocXume is 100% free with no hidden subscription fees, watermark limitations, or paywalls for standard PDF downloads.',
  },
  {
    q: 'How does DocXume protect my personal data and privacy?',
    a: 'All data and uploaded photos are processed strictly client-side on your own browser. Nothing sensitive is ever uploaded to our servers.',
  },
  {
    q: 'Can I download my resume as a high-quality PDF?',
    a: 'Absolutely. You can instantly export your fully formatted document into a crisp, professional A4 PDF with one click.',
  },
  {
    q: 'How do I switch templates without losing my typed information?',
    a: 'Our modular architecture decouples your typed content from visual templates, letting you switch from Modern to Classic or Executive instantly.',
  },
  {
    q: 'Can I upload my own profile photo and customize brand colors?',
    a: 'Yes, you can upload square, circular, or rounded candidate photos and pick custom brand colors and fonts directly in the editor.',
  },
  {
    q: 'Are there templates available for resumes, CVs, and cover letters?',
    a: 'Yes! We provide dedicated professional resume layouts, CV templates, and matching cover letter styles including modern minimal, classic, and executive.',
  },
  {
    q: 'Do I need to create an account or sign up before building?',
    a: 'No sign-up or registration is required. You can jump straight into the editor and start creating your document immediately.',
  },
  {
    q: 'Can I use DocXume offline on my computer or device?',
    a: 'Yes, DocXume is offline-first. Your drafts are saved automatically in your browser’s local storage so you can work anywhere.',
  },
  {
    q: 'How do I adjust font styles, sizes, and layout margins?',
    a: 'The design toolbar gives you granular control over font families, line heights, spacing, and section margins in real time.',
  },
  {
    q: 'Are the generated PDF files ATS (Applicant Tracking System) friendly?',
    a: 'Our standard and professional templates use clean text structures and standard formatting to ensure high ATS compatibility.',
  },
  {
    q: 'How do I add, remove, or reorder sections in my resume?',
    a: 'You can easily drag-and-drop or toggle sections in the generator panel to rearrange your experience, skills, and education.',
  },
  {
    q: 'Can I create cover letters in addition to resumes and CVs?',
    a: 'Yes, our template marketplace includes a variety of matching cover letter styles including modern minimal, classic, and executive.',
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    "name": item.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.a,
    },
  })),
};

export default function Home() {
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const router = useRouter();

  // Lock body scroll + close on Escape or Browser Back while the modal is open
  useEffect(() => {
    if (!modalStep) return;
    document.body.style.overflow = 'hidden';

    // Push history state so back button closes/steps back in modal
    window.history.pushState({ modal: modalStep }, '');

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };

    const handlePopState = () => {
      setModalStep(null);
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [modalStep]);

  const openResumeTemplate = (templateId: string) => {
    window.open(`/generator?template=${templateId}`, '_blank');
  };

  return (
    <>
      <Header />

      <main>
        {/* Hero Banner Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>Free • No Signup Required</span>
            <h1 className={styles.title}>
              Free & Professional <span className={styles.titleAccent}>Resume, CV & Cover Letter</span> Builder
            </h1>
            <p className={styles.subtitle}>
              Create, customize, and download your resume, CV, or cover letter in minutes. No account, no login, no complicated registration — completely free and private.
            </p>
            <div className={styles.heroActions}>
              <button
                onClick={() => setModalStep('resume')}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                Create Resume Now <ArrowRight size={16} />
              </button>
              <Link href="/templates" className="btn btn-secondary btn-secondary-dark">
                Browse Templates
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Choose DocXume?</h2>
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

        {/* Infinite Scrolling Dual Row Photo Carousel */}
        <section className={styles.carouselSection}>
          <div className={styles.carouselHeader}>
            <h2 className={styles.carouselTitle}>Explore Our Stunning Template Collection</h2>
            <p className={styles.carouselSubtitle}>
              Check out our most popular template designs. Click Explore More below to browse the full collection.
            </p>
          </div>

          <div className={styles.marqueeContainer}>
            {/* Row 1 - Scroll Left */}
            <div className={styles.marqueeRow}>
              {[...ROW_1_CANDIDATES, ...ROW_1_CANDIDATES].map((person, idx) => (
                <div key={`r1-${idx}`} className={styles.carouselCard}>
                  <img src={person.image} alt={person.name} className={styles.carouselAvatar} />
                  <div className={styles.carouselInfo}>
                    <span className={styles.carouselName}>{person.name}</span>
                    <span className={styles.carouselRole}>{person.role}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2 - Scroll Right */}
            <div className={styles.marqueeRowReverse}>
              {[...ROW_2_CANDIDATES, ...ROW_2_CANDIDATES].map((person, idx) => (
                <div key={`r2-${idx}`} className={styles.carouselCard}>
                  <img src={person.image} alt={person.name} className={styles.carouselAvatar} />
                  <div className={styles.carouselInfo}>
                    <span className={styles.carouselName}>{person.name}</span>
                    <span className={styles.carouselRole}>{person.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.exploreMoreWrapper}>
            <Link href="/templates" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', fontSize: '1.05rem', fontWeight: 600 }}>
              Explore More <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Frequently Asked Questions Section */}
        <section id="faq" className={styles.faqSection}>
          <div className={styles.faqContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
              <p className={styles.sectionSubtitle}>
                Everything you need to know about building your resume, CV, and cover letter with DocXume.
              </p>
            </div>

            <div className={styles.timelineContainer}>
              {FAQ_ITEMS.map((item, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <div key={idx} className={`${styles.timelineItem} ${isLeft ? styles.left : styles.right}`}>
                    <div className={styles.timelineNode}>
                      <FileCheck size={16} />
                    </div>
                    <div className={styles.timelineContent}>
                      <h3 className={styles.faqQuestion}>{item.q}</h3>
                      <p className={styles.faqAnswer}>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Support / Donate Section */}
        <section style={{
          padding: '60px 20px',
          background: 'linear-gradient(135deg, #fff1f2, #fce7f3, #fef3c7)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>❤️</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
              Enjoying DocXume?
            </h2>
            <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, margin: '0 0 8px' }}>
              Every template is <strong>completely free</strong> — no watermarks, no subscriptions, no hidden fees.
            </p>
            <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 24px' }}>
              If DocXume helped you create a professional document, you can support us by scanning the QR code and contributing any amount you like. Even ₹1 helps us build more free templates for everyone. 😊
            </p>
            <div style={{
              display: 'inline-block',
              padding: '14px',
              background: '#ffffff',
              border: '2px solid #fecdd3',
              borderRadius: '18px',
              boxShadow: '0 4px 20px rgba(225, 29, 72, 0.08)',
              marginBottom: '12px',
            }}>
              <img
                src="/upi-qr.png"
                alt="Google Pay / UPI QR Code for donation"
                style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '8px' }}
              />
              <a
                href="upi://pay?pa=safirabiya@oksbi&pn=Receiver&cu=INR"
                className="support-popup-upi-button"
                style={{ display: 'block', marginTop: '10px' }}
              >
                Pay via UPI App
              </a>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, margin: 0 }}>
              UPI • Google Pay • Pay What You Want
            </p>
          </div>
        </section>

        {/* Call to Action Footer Grid */}
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to build your document?</h2>
            <p className={styles.ctaDesc}>
              Create a polished, professional PDF in minutes — free, private, and with no account required.
            </p>
            <Link href="/templates" className="btn btn-secondary ctaBtn">
              Select a Template Now
            </Link>
          </div>
        </section>
      </main>

      {/* ── Quick Start Modal ─────────────────────────────────────────────── */}
      {modalStep && (
        <div className={styles.modalBackdrop} onClick={() => setModalStep(null)}>
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal header */}
            <div className={styles.modalHeader}>
              <span className={styles.modalHeaderIcon}>
                <Zap size={18} />
              </span>
              <h2 className={styles.modalTitle}>
                Choose a Resume Template
              </h2>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setModalStep(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.pickerGrid}>
                {RESUME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={styles.pickerCard}
                    onClick={() => openResumeTemplate(opt.id)}
                  >
                    <span className={styles.pickerThumbPlaceholder} style={{ background: opt.gradient, fontSize: '3rem' }}>
                      {opt.emoji}
                    </span>
                    <span className={styles.pickerName}>{opt.name}</span>
                    <span className={styles.pickerDesc}>{opt.desc}</span>
                    <span className={styles.pickerSelect}>Select <ArrowRight size={14} /></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      <Footer />
    </>
  );
}
