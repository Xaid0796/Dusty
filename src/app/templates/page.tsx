'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { getAllTemplates } from '@/templates/index';
import { Edit3, Sparkles, ArrowRight, Search, Plus, FileText, Mail, Briefcase, Filter } from 'lucide-react';
import styles from './page.module.css';
import { TemplateThumbnail } from '@/components/shared/TemplateThumbnail';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'resume' | 'cv' | 'biodata' | 'cover-letter'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const templates = getAllTemplates();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat && ['all', 'resume', 'cv', 'biodata', 'cover-letter'].includes(cat)) {
        setSelectedCategory(cat as any);
      }
    }
  }, []);

  // Sync UI with browser back/forward
  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat && ['all', 'resume', 'cv', 'biodata', 'cover-letter'].includes(cat)) {
        setSelectedCategory(cat as any);
      } else {
        setSelectedCategory('all');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleSelectCategory = (category: 'all' | 'resume' | 'cv' | 'biodata' | 'cover-letter') => {
    setSelectedCategory(category);
    if (typeof window !== 'undefined') {
      const url = category === 'all' ? '/templates' : `/templates?category=${category}`;
      window.history.pushState(null, '', url);
    }
  };

  const filteredTemplates = templates.filter(tpl => {
    if (selectedCategory !== 'all' && tpl.category !== selectedCategory) return false;
    if (priceFilter === 'free' && tpl.isPremium) return false;
    if (priceFilter === 'paid' && !tpl.isPremium) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = tpl.name.toLowerCase().includes(q);
      const matchDesc = (tpl.description || '').toLowerCase().includes(q);
      const matchCat = tpl.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const categoryLabels: { id: 'all' | 'resume' | 'cv' | 'biodata' | 'cover-letter'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Templates', icon: Sparkles },
    { id: 'resume', label: 'Resumes', icon: Edit3 },
    { id: 'cv', label: 'CVs', icon: FileText },
    { id: 'biodata', label: 'Biodatas', icon: Sparkles },
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
              Browse our complete collection of professional, pixel-perfect resumes, CVs, biodatas, and cover letters.
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
                {(['all', 'free', 'paid'] as const).map((filterOpt) => (
                  <button
                    key={filterOpt}
                    onClick={() => setPriceFilter(filterOpt)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: priceFilter === filterOpt ? '#ffffff' : 'transparent',
                      color: priceFilter === filterOpt ? '#0f172a' : '#64748b',
                      boxShadow: priceFilter === filterOpt ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {filterOpt}
                  </button>
                ))}
              </div>
            </div>

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
                <Sparkles size={18} color="#fbbf24" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Recommended Quick tool</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Classic Resume Generator</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                No canvas adjustments. Fill in your fields, enable/disable segments, and export standard resumes instantly.
              </p>
            </div>
            <Link href="/generator" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '11px 22px', borderRadius: '8px', background: '#fff',
              color: '#1e3a8a', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none',
              whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'opacity 0.15s'
            }}>
              Create Quick Resume <ArrowRight size={15} />
            </Link>
          </div>

          {/* Unified Template Card Grid */}
          <div className={styles.grid}>
            {/* Blank Template / Start from Scratch Option (shown when specific category is selected and price allows) */}
            {selectedCategory !== 'all' && priceFilter !== 'paid' && (
              <div className={styles.card}>
                <div
                  className={styles.thumbnail}
                  style={{
                    overflow: 'hidden',
                    height: '280px',
                    position: 'relative',
                    background: 'var(--bg-panel-input, #f8fafc)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{
                    width: '90px',
                    height: '127px',
                    background: '#ffffff',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                  }}>
                    <Plus size={28} color="#94a3b8" />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Start from Scratch</span>

                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: '#475569',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      zIndex: 10,
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    Free
                  </span>
                </div>

                <div className={styles.content}>
                  <div className={styles.details}>
                    <h3 className={styles.cardTitle}>
                      Blank {selectedCategory === 'resume'
                        ? 'Resume'
                        : selectedCategory === 'cv'
                          ? 'CV'
                          : selectedCategory === 'biodata'
                            ? 'Biodata'
                            : selectedCategory === 'cover-letter'
                              ? 'Cover Letter'
                              : 'Document'}
                    </h3>
                    <p className={styles.cardDesc}>
                      Start with a completely blank canvas and build your document from scratch using custom elements.
                    </p>
                  </div>

                  <div className={styles.btnGroup}>
                    <Link href={`/editor/${selectedCategory}/blank`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#475569', borderColor: '#475569', width: '100%' }}>
                      <Plus size={16} /> Create Blank
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {filteredTemplates.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <FileText size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>No templates found</h3>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>Try adjusting your search query, category filter, or pricing filter.</p>
              </div>
            ) : (
              filteredTemplates.map((tpl) => (
                <div key={tpl.id} className={styles.card}>
                  <div
                    className={styles.thumbnail}
                    style={{ overflow: 'hidden', height: '280px', position: 'relative', background: '#f8fafc' }}
                  >
                    <TemplateThumbnail template={tpl} />
                    <span className={styles.categoryTag}>{tpl.category}</span>

                    {/* Free or Premium badge positioned at the top-left */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: tpl.isPremium ? '#f59e0b' : '#10b981',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        zIndex: 10,
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {tpl.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>

                  <div className={styles.content}>
                    <div className={styles.details}>
                      <h3 className={styles.cardTitle}>{tpl.name}</h3>
                      <p className={styles.cardDesc}>
                        {tpl.description || (tpl.category === 'resume'
                          ? 'Single-column professional resume layout for design editor customisation.'
                          : 'Classic layout containing professional document details.')}
                      </p>
                    </div>

                    <div className={styles.btnGroup}>
                      <Link href={`/editor/${tpl.category}/${tpl.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                        <Edit3 size={16} /> Use Template
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
