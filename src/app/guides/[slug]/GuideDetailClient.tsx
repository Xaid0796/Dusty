'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { GUIDES_DATA } from '../data';
import { ArrowLeft, Clock, Calendar, Share2, Sparkles, ChevronRight, List, Copy, Check } from 'lucide-react';

interface GuideDetailClientProps {
    slug: string;
}

export default function GuideDetailClient({ slug }: GuideDetailClientProps) {
    const guide = GUIDES_DATA.find((g) => g.slug === slug);

    if (!guide) {
        notFound();
    }

    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const relatedGuides = GUIDES_DATA.filter((g) => g.category === guide.category && g.slug !== guide.slug).slice(0, 3);
    const categories = Array.from(new Set(GUIDES_DATA.map((g) => g.category)));

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": guide.title,
        "description": guide.description,
        "datePublished": guide.publishedDate,
        "author": {
            "@type": "Organization",
            "name": "DocXume"
        },
        "publisher": {
            "@type": "Organization",
            "name": "DocXume",
            "logo": {
                "@type": "ImageObject",
                "url": "https://docxume.in/logo.svg"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://docxume.in/guides/${guide.slug}`
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '40px 24px 80px' }}>

                {/* Back Breadcrumb */}
                <div style={{ marginBottom: '24px' }}>
                    <Link
                        href="/guides"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#475569',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'color 0.2s',
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Career Guides
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px', alignItems: 'start' }}>

                    {/* Main Article Content */}
                    <article style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '48px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
                    }}>
                        {/* Meta Info */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{
                                background: '#e0e7ff',
                                color: '#3730a3',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                            }}>
                                {guide.category}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                                <Clock size={14} /> {guide.readTime}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                                <Calendar size={14} /> {guide.publishedDate}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
                            {guide.title}
                        </h1>

                        {/* Description / Subheader */}
                        <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.6, marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '32px' }}>
                            {guide.description}
                        </p>

                        {/* Article Body Sections */}
                        <div className="article-content" style={{ color: '#334155', fontSize: '1.05rem', lineHeight: 1.8 }}>
                            {guide.content.map((section, idx) => (
                                <div key={idx} style={{ marginBottom: '36px' }} id={`section-${idx}`}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', marginTop: '32px' }}>
                                        {section.heading}
                                    </h2>
                                    {section.paragraphs.map((p, pIdx) => (
                                        <p key={pIdx} style={{ marginBottom: '16px' }}>
                                            {p}
                                        </p>
                                    ))}

                                    {section.subsections && section.subsections.map((sub, sIdx) => (
                                        <div key={sIdx} style={{ marginTop: '20px', paddingLeft: '20px', borderLeft: '3px solid #3b82f6' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                                                {sub.subtitle}
                                            </h3>
                                            {sub.body.map((b, bIdx) => (
                                                <p key={bIdx} style={{ marginBottom: '12px', color: '#475569' }}>
                                                    {b}
                                                </p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Share & Actions Footer */}
                        <div style={{
                            marginTop: '48px',
                            paddingTop: '24px',
                            borderTop: '1px solid #e2e8f0',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Share2 size={16} /> Share this guide:
                                </span>
                                <button
                                    onClick={handleCopyLink}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 14px',
                                        background: copied ? '#dcfce7' : '#f1f5f9',
                                        color: copied ? '#166534' : '#334155',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {copied ? <Check size={14} color="#166534" /> : <Copy size={14} />}
                                    {copied ? 'Copied Link!' : 'Copy Link'}
                                </button>
                            </div>

                            <Link
                                href="/templates"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: '#1e3a8a',
                                    color: '#fff',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                }}
                            >
                                <Sparkles size={16} /> Build Resume Now
                            </Link>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>

                        {/* Table of Contents */}
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            padding: '24px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <List size={16} color="#2563eb" /> Table of Contents
                            </h3>
                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {guide.content.map((section, idx) => (
                                    <a
                                        key={idx}
                                        href={`#section-${idx}`}
                                        style={{
                                            fontSize: '0.9rem',
                                            color: '#475569',
                                            textDecoration: 'none',
                                            padding: '6px 0',
                                            transition: 'color 0.2s',
                                            borderLeft: '2px solid transparent',
                                            paddingLeft: '8px'
                                        }}
                                    >
                                        {section.heading}
                                    </a>
                                ))}
                            </nav>
                        </div>

                        {/* Related Guides */}
                        {relatedGuides.length > 0 && (
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                padding: '24px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                                    Related Guides
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {relatedGuides.map((rel) => (
                                        <Link
                                            key={rel.slug}
                                            href={`/guides/${rel.slug}`}
                                            style={{
                                                textDecoration: 'none',
                                                display: 'block',
                                                borderBottom: '1px solid #f1f5f9',
                                                paddingBottom: '12px'
                                            }}
                                        >
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px', lineHeight: 1.4 }}>
                                                {rel.title}
                                            </h4>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} /> {rel.readTime}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categories List */}
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            padding: '24px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                                Categories
                            </h3>
                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat}
                                        href={`/guides?category=${encodeURIComponent(cat)}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            color: '#334155',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <span>{cat}</span>
                                        <ChevronRight size={14} style={{ color: '#94a3b8' }} />
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>
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
