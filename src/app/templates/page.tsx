'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { getAllTemplates } from '@/templates/index';
import { Edit3, Zap, ArrowRight, Search, Plus, FileText, Mail, Briefcase, Filter, ArrowLeft, X, FileCheck } from 'lucide-react';
import styles from './page.module.css';
import { TemplateThumbnail } from '@/components/shared/TemplateThumbnail';

// Resume template picker options (mirrored from Home)
const RESUME_OPTIONS = [
  { id: 'classic', name: 'Classic Professional', desc: 'Timeless professional layout with a clean, formal structure.', gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', emoji: '📄' },
  { id: 'modern', name: 'Modern Minimalist', desc: 'Clean, contemporary design with subtle accents.', gradient: 'linear-gradient(135deg, #0f766e, #14b8a6)', emoji: '✨' },
  { id: 'sidebar', name: 'Executive Sidebar', desc: 'Structured two-column layout highlighting key skills and experience.', gradient: 'linear-gradient(135deg, #312e81, #6366f1)', emoji: '📊' },
  { id: 'greta', name: 'Greta Student Minimalist', desc: 'Soft pastel tones tailored for graduates and early professionals.', gradient: 'linear-gradient(135deg, #9a3412, #f97316)', emoji: '🎓' },
  { id: 'william', name: 'William Executive Designer', desc: 'Bold, high-impact header for creative and executive leaders.', gradient: 'linear-gradient(135deg, #581c87, #c084fc)', emoji: '💼' },
];



export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'resume' | 'cv' | 'cover-letter'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'support'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalStep, setModalStep] = useState<'resume' | null>(null);
  const router = useRouter();
  const templates = getAllTemplates();

  const openResumeTemplate = (templateId: string) => {
    window.open(`/generator?template=${templateId}`, '_blank');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat && ['all', 'resume', 'cv', 'cover-letter'].includes(cat)) {
        setSelectedCategory(cat as any);
      }
    }
  }, []);

  // Sync UI with browser back/forward
  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat && ['all', 'resume', 'cv', 'cover-letter'].includes(cat)) {
        setSelectedCategory(cat as any);
      } else {
        setSelectedCategory('all');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleSelectCategory = (category: 'all' | 'resume' | 'cv' | 'cover-letter') => {
    setSelectedCategory(category);
    if (typeof window !== 'undefined') {
      const url = category === 'all' ? '/templates' : `/templates?category=${category}`;
      window.history.pushState(null, '', url);
    }
  };

  const filteredTemplates = templates.filter(tpl => {
    if (selectedCategory !== 'all' && tpl.category !== selectedCategory) return false;
    if (priceFilter === 'free' && tpl.isPremium) return false;
    if (priceFilter === 'support') return true; // show all templates in support mode
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = tpl.name.toLowerCase().includes(q);
      const matchDesc = (tpl.description || '').toLowerCase().includes(q);
      const matchCat = tpl.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const categoryLabels: { id: 'all' | 'resume' | 'cv' | 'cover-letter'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Templates', icon: FileText },
    { id: 'resume', label: 'Resumes', icon: Edit3 },
    { id: 'cv', label: 'CVs', icon: FileText },
    { id: 'cover-letter', label: 'Cover Letters', icon: Mail },
  ];

  return (
    <>
      <Header />

      <main className={styles.page}>
        <div className={styles.container}>

          <div className={styles.header}>
            <h1 className={styles.title}>Template Marketplace</h1>
            <p className={styles.subtitle}>
              Browse our complete collection of professional, pixel-perfect resumes, CVs, and cover letters.
            </p>
          </div>

          {/* Live Controls: Search, Category Tabs, Pricing Filter */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '32px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Top row: Search Bar & Pricing Filter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <div style={{
                position: 'relative',
                flex: 1,
                minWidth: '260px',
                maxWidth: '480px'
              }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search templates by name, role, or style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 16px 11px 42px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#f8fafc',
                    color: '#0f172a',
                    transition: 'all 0.15s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>

              {/* Pricing Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                {([
                  { value: 'free' as const, label: 'Free Templates' },
                  { value: 'support' as const, label: 'Support Us ❤️' },
                ]).map((filterOpt) => (
                  <button
                    key={filterOpt.value}
                    onClick={() => setPriceFilter(filterOpt.value)}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: priceFilter === filterOpt.value ? (filterOpt.value === 'support' ? 'linear-gradient(135deg, #e11d48, #f472b6)' : '#ffffff') : 'transparent',
                      color: priceFilter === filterOpt.value ? (filterOpt.value === 'support' ? '#ffffff' : '#0f172a') : '#64748b',
                      boxShadow: priceFilter === filterOpt.value && filterOpt.value !== 'support' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      whiteSpace: 'nowrap',
                      minHeight: '44px',
                    }}
                  >
                    {filterOpt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Support Us QR Code Section (shown when "Support Us" tab is active) */}
            {priceFilter === 'support' && (
              <div style={{
                background: 'linear-gradient(135deg, #fff1f2, #fce7f3, #fef3c7)',
                borderRadius: '16px',
                padding: '28px 24px',
                textAlign: 'center',
                marginBottom: '24px',
                border: '1px solid #fecdd3',
                animation: 'sp-scale-in 0.3s ease',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❤️</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Enjoying Our Free Templates?
                </h3>
                <p style={{ margin: '0 0 6px', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Every template is free — no watermarks, no subscriptions, no hidden fees.
                  If DocXume helped you create a professional document, you can support us by scanning the QR code below.
                </p>
                <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Even ₹1 helps us create more free templates for everyone. 😊
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '12px',
                  background: '#ffffff',
                  border: '2px solid #fecdd3',
                  borderRadius: '16px',
                  marginBottom: '10px',
                  boxShadow: '0 2px 12px rgba(225, 29, 72, 0.08)',
                }}>
                  <img
                    src="/upi-qr.png"
                    alt="Google Pay / UPI QR Code for donation"
                    style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
                  />
                  <a
                    href="upi://pay?pa=safirabiya@oksbi&pn=Receiver&cu=INR"
                    className="support-popup-upi-button"
                    style={{ display: 'block', marginTop: '10px' }}
                  >
                    Pay via UPI App
                  </a>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                  UPI • Google Pay • Pay What You Want
                </p>
              </div>
            )}

            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {categoryLabels.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '9px 18px',
                      borderRadius: '10px',
                      border: isActive ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      background: isActive ? '#eff6ff' : '#ffffff',
                      color: isActive ? '#1d4ed8' : '#475569',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                      boxShadow: isActive ? '0 2px 4px rgba(37,99,235,0.08)' : 'none'
                    }}
                  >
                    <IconComponent size={16} color={isActive ? '#2563eb' : '#64748b'} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resume Generator Banner */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
            borderRadius: '14px', padding: '20px 28px', gap: '16px', flexWrap: 'wrap', marginBottom: '32px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Zap size={18} color="#fbbf24" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Recommended Quick tool</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Quick Document Generator</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                No canvas adjustments. Fill in your fields and export polished resumes instantly.
              </p>
            </div>
            <button onClick={() => setModalStep('resume')} style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '11px 22px', borderRadius: '8px', background: '#fff',
              color: '#1e3a8a', fontWeight: 700, fontSize: '0.88rem', border: 'none',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'opacity 0.15s'
            }}>
              Create Resume Now <ArrowRight size={15} />
            </button>
          </div>

          {/* Quick Start Modal (Unified with Home Page design) */}
          {modalStep === 'resume' && (
            <div className={styles.modalBackdrop} onClick={() => setModalStep(null)}>
              <div
                className={styles.modalDialog}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <div className={styles.modalHeader}>
                  <span className={styles.modalHeaderIcon}>
                    <Zap size={18} />
                  </span>
                  <h2 className={styles.modalTitle}>Choose a Resume Template</h2>
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
                      <button key={opt.id} className={styles.pickerCard} onClick={() => openResumeTemplate(opt.id)}>
                        <span className={styles.pickerThumbPlaceholder} style={{ background: opt.gradient, fontSize: '3rem' }}>{opt.emoji}</span>
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

          {/* Unified Template Card Grid */}
          <div className={styles.grid}>
            {(() => {
              const items: Array<{ type: 'scratch' } | { type: 'template'; tpl: any }> = [];
              if (selectedCategory !== 'all' && priceFilter !== 'support') {
                items.push({ type: 'scratch' });
              }
              filteredTemplates.forEach((tpl) => {
                items.push({ type: 'template', tpl });
              });

              // 6th position - Native Banner
              // if (items.length >= 5) {
              //   items.splice(5, 0, { type: 'ad1' });
              // } else {
              //   items.push({ type: 'ad1' });
              // }

              // 12th position - 300x250 Banner
              // if (items.length >= 11) {
              //   items.splice(11, 0, { type: 'ad2' });
              // } else if (items.length >= 6) {
              //   items.push({ type: 'ad2' });
              // }

              if (items.length === 0) {
                return (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <FileText size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>No templates found</h3>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Try adjusting your search query, category filter, or pricing filter.</p>
                  </div>
                );
              }

              return items.map((item, idx) => {
                if (item.type === 'scratch') {
                  return (
                    <Link
                      key="scratch"
                      href={`/editor/${selectedCategory}/blank`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.card}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                    >
                      <div className={styles.thumbnail} style={{ overflow: 'hidden', height: '280px', position: 'relative', background: 'var(--bg-panel-input, #f8fafc)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ width: '90px', height: '127px', background: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>
                          <Plus size={28} color="#94a3b8" />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Start from Scratch</span>
                        <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#475569', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', zIndex: 10, textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Free</span>
                      </div>
                      <div className={styles.content}>
                        <div className={styles.details}>
                          <h3 className={styles.cardTitle}>Blank {selectedCategory === 'resume' ? 'Resume' : selectedCategory === 'cv' ? 'CV' : selectedCategory === 'cover-letter' ? 'Cover Letter' : 'Document'}</h3>
                          <p className={styles.cardDesc}>Start with a completely blank canvas and build your document from scratch using custom elements.</p>
                        </div>
                      </div>
                    </Link>
                  );
                }

                // if (item.type === 'ad1') {
                //   return <AdBannerBox key={`ad1-${idx}`} />;
                // }

                // if (item.type === 'ad2') {
                //   return <AdBannerBox2 key={`ad2-${idx}`} />;
                // }

                const tpl = item.tpl;
                return (
                  <Link
                    key={tpl.id}
                    href={`/editor/${tpl.category}/${tpl.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.card}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  >
                    <div className={styles.thumbnail} style={{ overflow: 'hidden', height: '280px', position: 'relative', background: '#f8fafc' }}>
                      <TemplateThumbnail template={tpl} />
                      <span className={styles.categoryTag}>{tpl.category}</span>
                      <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: tpl.isPremium ? '#f59e0b' : '#10b981', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', zIndex: 10, textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{tpl.isPremium ? 'Premium' : 'Free'}</span>
                    </div>
                    <div className={styles.content}>
                      <div className={styles.details}>
                        <h3 className={styles.cardTitle}>{tpl.name}</h3>
                        <p className={styles.cardDesc}>{tpl.description || (tpl.category === 'resume' ? 'Single-column professional resume layout for design editor customisation.' : 'Classic layout containing professional document details.')}</p>
                      </div>
                    </div>
                  </Link>
                );
              });
            })()}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
