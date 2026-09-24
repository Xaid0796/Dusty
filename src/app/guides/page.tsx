'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { GUIDES_DATA } from './data';
import { BookOpen, ArrowRight, Clock, Calendar, Filter, ChevronDown, Search, Sparkles, Mail, ArrowRight as ArrowRightIcon } from 'lucide-react';

const CATEGORIES = ['All', 'Resume Tips', 'Cover Letters', 'Interview Prep', 'Career Advice'];

export default function GuidesIndexPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredGuides = useMemo(() => {
        return GUIDES_DATA.filter((guide) => {
            const matchesCategory = activeCategory === 'All' || guide.category === activeCategory;
            const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                guide.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    // Group guides by category for stats
    const categoryStats = useMemo(() => {
        const stats: Record<string, number> = {};
        GUIDES_DATA.forEach((guide) => {
            stats[guide.category] = (stats[guide.category] || 0) + 1;
        });
        return stats;
    }, []);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Career Guides & Expert Advice",
        "description": "Expert guides, ATS optimization tips, and proven frameworks to help you craft winning career documents and land your dream job.",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": GUIDES_DATA.map((guide, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Article",
                    "name": guide.title,
                    "description": guide.description,
                    "url": `https://docxume.in/guides/${guide.slug}`,
                    "datePublished": guide.publishedDate,
                    "author": {
                        "@type": "Organization",
                        "name": "DocXume"
                    }
                }
            }))
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Header />
            <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '40px 24px 80px' }}>

                {/* Hero Section */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginBottom: '16px'
                    }}>
                        <BookOpen size={14} /> Career Advice & Expert Guides
                    </span>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                        Resume, CV & Interview Masterclass
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                        Expert guides, ATS optimization tips, and proven frameworks to help you craft winning career documents and land your dream job.
                    </p>
                </div>

                {/* Stats Bar */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                    marginBottom: '40px',
                    padding: '24px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e3a8a' }}>{GUIDES_DATA.length}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Expert Guides</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>{CATEGORIES.length - 1}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Categories</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed' }}>
                            {GUIDES_DATA.reduce((sum, g) => sum + parseInt(g.readTime), 0)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Minutes of Reading</div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>100%</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Free Content</div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    alignItems: 'center',
                    marginBottom: '32px',
                    padding: '20px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                        <Search style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 18,
                            height: 18,
                            color: '#94a3b8'
                        }} />
                        <input
                            type="text"
                            placeholder="Search guides by topic, keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                background: '#f8fafc',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                        />
                    </div>

                    {/* Category Filter */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setActiveCategory(activeCategory === 'All' ? CATEGORIES[1] : 'All')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                background: activeCategory === 'All' ? '#1e3a8a' : '#f8fafc',
                                color: activeCategory === 'All' ? '#fff' : '#334155',
                                border: activeCategory === 'All' ? 'none' : '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            <Filter size={16} />
                            <span>{activeCategory}</span>
                            <ChevronDown size={14} />
                        </button>
                    </div>
                </div>

                {/* Category Pills (Mobile-friendly) */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '32px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    scrollbarWidth: 'none',
                }}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                background: activeCategory === cat ? '#1e3a8a' : '#ffffff',
                                color: activeCategory === cat ? '#fff' : '#475569',
                                border: activeCategory === cat ? 'none' : '1px solid #cbd5e1',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (activeCategory !== cat) e.currentTarget.style.background = '#f1f5f9';
                            }}
                            onMouseLeave={(e) => {
                                if (activeCategory !== cat) e.currentTarget.style.background = '#ffffff';
                            }}
                        >
                            {cat !== 'All' && categoryStats[cat] && (
                                <span style={{
                                    background: activeCategory === cat ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '0.7rem'
                                }}>
                                    {categoryStats[cat]}
                                </span>
                            )}
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results Count */}
                <div style={{ marginBottom: '24px', fontSize: '0.9rem', color: '#64748b' }}>
                    Showing <strong>{filteredGuides.length}</strong> of <strong>{GUIDES_DATA.length}</strong> guides
                    {activeCategory !== 'All' && <span> in <strong>{activeCategory}</strong></span>}
                    {searchQuery && <span> matching <strong>&ldquo;{searchQuery}&rdquo;</strong></span>}
                </div>

                {/* Guides Grid */}
                {filteredGuides.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '24px'
                    }}>
                        {filteredGuides.map((guide) => (
                            <Link
                                key={guide.slug}
                                href={`/guides/${guide.slug}`}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    padding: '28px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                        <span style={{
                                            background: '#e0e7ff',
                                            color: '#3730a3',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                        }}>
                                            {guide.category}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                                            <Clock size={13} /> {guide.readTime}
                                        </span>
                                    </div>

                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px', lineHeight: 1.4 }}>
                                        {guide.title}
                                    </h2>

                                    <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                                        {guide.description}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                        <Calendar size={13} /> {guide.publishedDate}
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#2563eb' }}>
                                        Read Guide <ArrowRightIcon size={16} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 24px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px'
                    }}>
                        <Search size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                            No guides found
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '24px' }}>
                            Try adjusting your search or filter to find what you're looking for.
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                            style={{
                                background: '#1e3a8a',
                                color: '#fff',
                                padding: '10px 24px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Newsletter Signup Section */}
                <div style={{
                    marginTop: '60px',
                    padding: '48px',
                    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    color: '#ffffff'
                }}>
                    <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', marginBottom: '16px' }}>
                        <Sparkles size={28} color="#ffffff" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px' }}>
                        Never Miss a Career Guide
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: '#e0e7ff', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                        Get weekly resume tips, interview strategies, and career advice delivered straight to your inbox. Join 10,000+ job seekers.
                    </p>
                    <form style={{ display: 'flex', gap: '12px', maxWidth: '450px', margin: '0 auto' }}>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            style={{
                                flex: 1,
                                padding: '14px 18px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none',
                            }}
                            required
                        />
                        <button
                            type="submit"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#ffffff',
                                color: '#1e3a8a',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '1rem',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Subscribe <ArrowRightIcon size={16} />
                        </button>
                    </form>
                    <p style={{ fontSize: '0.8rem', color: '#93c5fd', marginTop: '16px' }}>
                        No spam. Unsubscribe anytime. <Link href="/privacy-policy" style={{ color: '#fff', textDecoration: 'underline' }}>Privacy Policy</Link>
                    </p>
                </div>

                {/* CTA to Templates */}
                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    padding: '32px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                        Ready to Apply What You've Learned?
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '20px' }}>
                        Build a professional, ATS-friendly resume in minutes with our free templates.
                    </p>
                    <Link
                        href="/templates"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#1e3a8a',
                            color: '#fff',
                            padding: '12px 28px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                        }}
                    >
                        <Sparkles size={18} /> Browse Templates
                    </Link>
                </div>

            </main>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Footer />
        </div>
    );
}
