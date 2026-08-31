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
  ArrowLeft,
  User,
  FileCheck,
  X,
  Sparkles,
} from 'lucide-react';
import styles from './page.module.css';

type ModalStep = 'choice' | 'resume' | 'biodata' | null;

// Generator resume templates (matches /generator template ids)
const RESUME_OPTIONS: { id: string; name: string; desc: string; gradient: string; emoji: string }[] = [
  { id: 'classic', name: 'Classic Professional', desc: 'Timeless single-column professional resume layout.', gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', emoji: '📄' },
  { id: 'modern', name: 'Modern Minimalist', desc: 'Clean, contemporary design with subtle accents.', gradient: 'linear-gradient(135deg, #0f766e, #14b8a6)', emoji: '✨' },
  { id: 'sidebar', name: 'Executive Sidebar', desc: 'Structured two-column layout highlighting key skills and experience.', gradient: 'linear-gradient(135deg, #312e81, #6366f1)', emoji: '📊' },
  { id: 'greta', name: 'Greta Student Minimalist', desc: 'Soft pastel tones tailored for graduates and early professionals.', gradient: 'linear-gradient(135deg, #9a3412, #f97316)', emoji: '🎓' },
  { id: 'william', name: 'William Executive Designer', desc: 'Bold, high-impact header for creative and executive leaders.', gradient: 'linear-gradient(135deg, #581c87, #c084fc)', emoji: '💼' },
];

// Biodata generator templates (matches /biodata-generator template ids)
const BIODATA_OPTIONS: { id: 'classic' | 'modern' | 'floral'; name: string; desc: string; gradient: string; emoji: string }[] = [
  { id: 'classic', name: 'Classic', desc: 'Timeless professional layout with a clean, formal structure.', gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', emoji: '📄' },
  { id: 'modern', name: 'Modern', desc: 'Contemporary two-tone design with a fresh, balanced look.', gradient: 'linear-gradient(135deg, #0f766e, #14b8a6)', emoji: '✨' },
  { id: 'floral', name: 'Floral', desc: 'Elegant wedding-style floral background.', gradient: 'linear-gradient(135deg, #881337, #f472b6)', emoji: '🌸' },
];

const ROW_1_CANDIDATES = [
  { name: 'Alex Turner', role: 'Senior Software Engineer', image: '/resume-photo-1.jpeg', rating: '★ 5.0' },
  { name: 'Elena Rostova', role: 'Product Manager', image: '/resume-photo-2.jpeg', rating: '★ 4.9' },
  { name: 'Marcus Vance', role: 'Full Stack Architect', image: '/photos/male/american.jpeg', rating: '★ 5.0' },
  { name: 'Sophia Chen', role: 'UI/UX Lead Designer', image: '/photos/female/office-girl.jpeg', rating: '★ 4.8' },
  { name: 'Liam O’Connor', role: 'DevOps Specialist', image: '/photos/male/scottish-office.jpeg', rating: '★ 4.9' },
  { name: 'Priya Sharma', role: 'Data Scientist', image: '/photos/female/office-women.jpeg', rating: '★ 5.0' },
  { name: 'Ryan Gosling', role: 'Solutions Architect', image: '/photos/male/american-office.jpeg', rating: '★ 4.9' },
  { name: 'Clara Oswald', role: 'Technical Writer', image: '/photos/female/women-01.png', rating: '★ 5.0' },
];

const ROW_2_CANDIDATES = [
  { name: 'David Miller', role: 'Investment Strategist', image: '/photos/male/italian-office.jpeg', rating: '★ 4.9' },
  { name: 'Aisha Patel', role: 'Clinical Researcher', image: '/resume-photo-3.jpeg', rating: '★ 5.0' },
  { name: 'Lucas Gabriel', role: 'Marketing Director', image: '/photos/male/office-man.jpeg', rating: '★ 4.8' },
  { name: 'Isabella Rossi', role: 'Legal Consultant', image: '/resume-photo-4.jpeg', rating: '★ 4.9' },
  { name: 'Noah Wright', role: 'Cybersecurity Analyst', image: '/photos/male/men-01.png', rating: '★ 5.0' },
  { name: 'Zoe Alverez', role: 'Brand Strategist', image: '/resume-photo-5.jpeg', rating: '★ 4.9' },
  { name: 'Ethan Hunt', role: 'Security Engineer', image: '/photos/male/office-man.jpeg', rating: '★ 5.0' },
  { name: 'Mia Wong', role: 'Product Analyst', image: '/photos/female/women-01.png', rating: '★ 4.9' },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Is Dusty completely free to use?',
    a: 'Yes! Dusty is 100% free with no hidden subscription fees, watermark limitations, or paywalls for standard PDF downloads.',
  },
  {
    q: 'How does Dusty protect my personal data and privacy?',
    a: 'All data and uploaded photos are processed strictly client-side on your own browser. Nothing sensitive is ever uploaded to our servers.',
  },
  {
    q: 'Can I download my resume or biodata as a high-quality PDF?',
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
    q: 'Are there templates available for both job resumes and marriage biodatas?',
    a: 'Yes! We provide dedicated professional resume layouts as well as formal, modern, and floral biodata templates for marriage profiles.',
  },
  {
    q: 'Do I need to create an account or sign up before building?',
    a: 'No sign-up or registration is required. You can jump straight into the editor and start creating your document immediately.',
  },
  {
    q: 'Can I use Dusty offline on my computer or device?',
    a: 'Yes, Dusty is offline-first. Your drafts are saved automatically in your browser’s local storage so you can work anywhere.',
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

export default function Home() {
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const router = useRouter();

  // Lock body scroll + close on Escape while the modal is open
  useEffect(() => {
    if (!modalStep) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalStep(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [modalStep]);

  const openResumeTemplate = (templateId: string) => {
    window.open(`/generator?template=${templateId}`, '_blank');
  };

  const openBiodataTemplate = (templateId: 'classic' | 'modern' | 'floral') => {
    window.open(`/biodata-generator?template=${templateId}`, '_blank');
  };

  return (
    <>
      <Header />

      <main>
        {/* Hero Banner Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Create Professional <span className={styles.titleAccent}>Career & Personal Documents</span> in Minutes
            </h1>
            <p className={styles.subtitle}>
              Choose a design, edit directly in your browser, upload your photo, customize colors, and download a professional PDF immediately. Completely free and offline-first.
            </p>
            <div className={styles.heroActions}>
              <button
                onClick={() => setModalStep('choice')}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                Quick Start <ArrowRight size={16} />
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

        {/* Infinite Scrolling Dual Row Photo Carousel */}
        <section className={styles.carouselSection}>
          <div className={styles.carouselHeader}>
            <h2 className={styles.carouselTitle}>Explore Our Stunning Template Collection</h2>
            <p className={styles.carouselSubtitle}>
              Hover to pause. Click Explore More below to browse our template marketplace.
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
                    <div className={styles.carouselBadgeRow}>
                      <span className={styles.carouselTag}>{person.rating}</span>
                      <span className={styles.carouselTag} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>Verified</span>
                    </div>
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
                    <div className={styles.carouselBadgeRow}>
                      <span className={styles.carouselTag}>{person.rating}</span>
                      <span className={styles.carouselTag} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>Verified</span>
                    </div>
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
        <section className={styles.faqSection}>
          <div className={styles.faqContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
              <p className={styles.sectionSubtitle}>
                Everything you need to know about building your resume and biodata with Dusty.
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
              {modalStep === 'resume' || modalStep === 'biodata' ? (
                <button
                  className={styles.modalBackBtn}
                  onClick={() => setModalStep('choice')}
                  aria-label="Go back"
                >
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <span className={styles.modalHeaderIcon}>
                  <Zap size={18} />
                </span>
              )}
              <h2 className={styles.modalTitle}>
                {modalStep === 'choice' && 'What would you like to build?'}
                {modalStep === 'resume' && 'Choose a Resume Template'}
                {modalStep === 'biodata' && 'Choose a Biodata Template'}
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
              {/* Step 1: Resume or Biodata? */}
              {modalStep === 'choice' && (
                <div className={styles.choiceGrid}>
                  <button
                    className={styles.choiceCard}
                    onClick={() => setModalStep('resume')}
                  >
                    <span className={styles.choiceIcon} style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}>
                      <FileText size={28} />
                    </span>
                    <span className={styles.choiceName}>Resume</span>
                    <span className={styles.choiceDesc}>
                      Pick from professional resume designs and start editing instantly.
                    </span>
                    <span className={styles.choiceCta}>
                      Choose Resume <ArrowRight size={16} />
                    </span>
                  </button>

                  <button
                    className={styles.choiceCard}
                    onClick={() => setModalStep('biodata')}
                  >
                    <span className={styles.choiceIcon} style={{ background: 'linear-gradient(135deg, #9d174d, #f472b6)' }}>
                      <User size={28} />
                    </span>
                    <span className={styles.choiceName}>Biodata</span>
                    <span className={styles.choiceDesc}>
                      Choose a classic, modern, or floral biodata layout for marriage & profiles.
                    </span>
                    <span className={styles.choiceCta}>
                      Choose Biodata <ArrowRight size={16} />
                    </span>
                  </button>
                </div>
              )}

              {/* Step 2: Resume generator template picker */}
              {modalStep === 'resume' && (
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
              )}

              {/* Step 2: Biodata template picker */}
              {modalStep === 'biodata' && (
                <div className={styles.pickerGrid}>
                  {BIODATA_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      className={styles.pickerCard}
                      onClick={() => openBiodataTemplate(opt.id)}
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
              )}
            </div>


          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
