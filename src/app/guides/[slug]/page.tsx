import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { GUIDES_DATA } from '../data';
import { ArrowLeft, Clock, Calendar, Share2, Sparkles, ChevronRight, List, Twitter, Linkedin, Facebook, Mail, Copy, Check } from 'lucide-react';

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    return GUIDES_DATA.map((guide) => ({
        slug: guide.slug,
    }));
}

export default function GuideDetailPage({ params }: PageProps) {
    const guide = GUIDES_DATA.find((g) => g.slug === params.slug);

    if (!guide) {
        notFound();
    }

    // Extract headings for table of contents
    const headings = guide.content.flatMap((section, sectionIdx) => [
        { id: `section-${sectionIdx}`, text: section.heading, level: 2 },
        ...(section.subsections?.map((sub, subIdx) => ({
            id: `section-${sectionIdx}-${subIdx}`,
            text: sub.subtitle,
            level: 3
        })) || [])
    ]);

    // Find related guides (same category, excluding current)
    const relatedGuides = GUIDES_DATA
        .filter(g => g.category === guide.category && g.slug !== guide.slug)
        .slice(0, 3);

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
                "url": "https://docxume.in/icon.svg"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://docxume.in/guides/${guide.slug}`
        }
    };

    const [copied, setCopied] = useState(false);
    const [showToc, setShowToc] = useState(true);

    const handleShare = async (platform: string) => {
        const url = `https://docxume.in/guides/${guide.slug}`;
        const text = guide.title;

        const shareUrls: Record<string, string> = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
        };

        if (platform === 'copy') {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Header />

            <main style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '40px 24px 80px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px' }}>
                    {/* Main Content Column */}
                    <div>
                        {/* Breadcrumb */}
                        <nav style={{ marginBottom: '24px', fontSize: '0.85rem', color: '#64748b' }} aria-label="Breadcrumb">
                            <ol style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', listStyle: 'none', margin: 0, padding: 0 }}>
                                <li>
                                    <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ChevronRight size={14} />
                                    <Link href="/guides" style={{ color: '#64748b', textDecoration: 'none' }}>Guides</Link>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ChevronRight size={14} />
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{guide.category}</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ChevronRight size={14} />
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{guide.title}</span>
                                </li>
                            </ol>
                        </nav>

                        {/* Back Button */}
                        <div style={{ marginBottom: '24px' }}>
                            <Link
                                href="/guides"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#475569',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                <ArrowLeft size={16} /> Back to Guides
                            </Link>
                        </div>

                        {/* Article Header */}
                        <div style={{ marginBottom: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '30px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
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
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                                    <Clock size={14} /> {guide.readTime}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                                    <Calendar size={14} /> {guide.publishedDate}
                                </span>
                            </div>

                            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '16px', letterSpacing: '-0.02em' }}>
                                {guide.title}
                            </h1>

                            <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.6 }}>
                                {guide.description}
                            </p>

                            {/* Social Share Bar */}
                            <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Share:</span>
                                <button onClick={() => handleShare('twitter')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#1da1f2', border: 'none', cursor: 'pointer', color: '#fff' }} aria-label="Share on Twitter"><Twitter size={16} /></button>
                                <button onClick={() => handleShare('linkedin')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#0a66c2', border: 'none', cursor: 'pointer', color: '#fff' }} aria-label="Share on LinkedIn"><Linkedin size={16} /></button>
                                <button onClick={() => handleShare('facebook')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#1877f2', border: 'none', cursor: 'pointer', color: '#fff' }} aria-label="Share on Facebook"><Facebook size={16} /></button>
                                <button onClick={() => handleShare('email')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#ea4335', border: 'none', cursor: 'pointer', color: '#fff' }} aria-label="Share via Email"><Mail size={16} /></button>
                                <button onClick={() => handleShare('copy')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#475569' }} aria-label="Copy link">
                                    {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Table of Contents */}
                        {headings.length > 0 && (
                            <div style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '32px',
                                display: 'none'
                            }} id="table-of-contents">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                        <List size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                        Table of Contents
                                    </h3>
                                    <button
                                        onClick={() => setShowToc(!showToc)}
                                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
                                    >
                                        {showToc ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {showToc && (
                                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {headings.map((heading, idx) => (
                                            <Link
                                                key={idx}
                                                href={`#${heading.id}`}
                                                style={{
                                                    fontSize: heading.level === 2 ? '0.95rem' : '0.85rem',
                                                    fontWeight: heading.level === 2 ? 600 : 500,
                                                    color: heading.level === 2 ? '#1e293b' : '#475569',
                                                    textDecoration: 'none',
                                                    paddingLeft: heading.level === 3 ? '16px' : 0,
                                                    transition: 'color 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = heading.level === 2 ? '#1e293b' : '#475569'}
                                            >
                                                {heading.text}
                                            </Link>
                                        ))}
                                    </nav>
                                )}
                            </div>
                        )}

                        {/* Article Body Content */}
                        <article style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                            {guide.content.map((section, sectionIdx) => (
                                <div key={sectionIdx} id={`section-${sectionIdx}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '10px' }}>
                                        {section.heading}
                                    </h2>
                                    {section.paragraphs.map((p, pIdx) => (
                                        <p key={pIdx} style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.8 }}>
                                            {p}
                                        </p>
                                    ))}

                                    {section.subsections && section.subsections.map((sub, subIdx) => (
                                        <div key={subIdx} id={`section-${sectionIdx}-${subIdx}`} style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
                                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
                                                {sub.subtitle}
                                            </h3>
                                            {sub.body.map((bp, bpIdx) => (
                                                <p key={bpIdx} style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                                                    {bp}
                                                </p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </article>

                        {/* Author Bio */}
                        <div style={{
                            marginTop: '60px',
                            padding: '24px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'flex-start'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>D</span>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>DocXume Career Team</h4>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 12px', lineHeight: 1.6 }}>
                                    Our career experts help job seekers create professional, ATS-friendly resumes and cover letters.
                                    DocXume's free resume builder has helped thousands land interviews at top companies.
                                </p>
                                <Link
                                    href="/about"
                                    style={{
                                        fontSize: '0.85rem',
                                        color: '#2563eb',
                                        fontWeight: 600,
                                        textDecoration: 'none'
                                    }}
                                >
                                    Learn more about us &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Call to Action Box */}
                        <div style={{
                            marginTop: '60px',
                            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                            borderRadius: '16px',
                            padding: '36px',
                            color: '#ffffff',
                            textAlign: 'center',
                            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)'
                        }}>
                            <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', marginBottom: '12px' }}>
                                <Sparkles size={24} color="#ffffff" />
                            </div>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>
                                Ready to Build Your Professional Resume?
                            </h3>
                            <p style={{ fontSize: '1rem', color: '#e0e7ff', maxWidth: '550px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                                Put these insights into action with DocXume's free, private, and ATS-friendly resume builder. No signup required.
                            </p>
                            <Link
                                href="/templates"
                                style={{
                                    display: 'inline-block',
                                    background: '#ffffff',
                                    color: '#1e3a8a',
                                    padding: '12px 28px',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                            >
                                Choose a Template Now
                            </Link>
                        </div>

                        {/* Related Articles */}
                        {relatedGuides.length > 0 && (
                            <div style={{ marginTop: '60px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>
                                    Related Guides
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                    {relatedGuides.map((related) => (
                                        <Link
                                            key={related.slug}
                                            href={`/guides/${related.slug}`}
                                            style={{
                                                display: 'block',
                                                padding: '24px',
                                                background: '#ffffff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                textDecoration: 'none',
                                                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                                                e.currentTarget.style.borderColor = '#cbd5e1';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                            }}
                                        >
                                            <div style={{
                                                background: '#e0e7ff',
                                                color: '#3730a3',
                                                padding: '4px 10px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                display: 'inline-block',
                                                marginBottom: '12px'
                                            }}>
                                                {related.category}
                                            </div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.4 }}>
                                                {related.title}
                                            </h3>
                                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '12px', lineHeight: 1.6 }}>
                                                {related.description}
                                            </p>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} /> {related.readTime}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} /> {related.publishedDate}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Newsletter Signup */}
                        <div style={{
                            marginTop: '60px',
                            padding: '32px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                                Get Career Tips Delivered to Your Inbox
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '20px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                                Join 10,000+ job seekers who receive weekly resume tips, interview strategies, and career advice.
                            </p>
                            <form style={{ display: 'flex', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                    }}
                                    required
                                />
                                <button
                                    type="submit"
                                    style={{
                                        background: '#1e3a8a',
                                        color: '#fff',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Subscribe
                                </button>
                            </form>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '12px' }}>
                                No spam. Unsubscribe anytime. <Link href="/privacy-policy" style={{ color: '#2563eb' }}>Privacy Policy</Link>
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Table of Contents (Desktop) */}
                        {headings.length > 0 && (
                            <div style={{
                                position: 'sticky',
                                top: '100px',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '20px',
                                height: 'fit-content'
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                                    <List size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                    On This Page
                                </h3>
                                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {headings.map((heading, idx) => (
                                        <Link
                                            key={idx}
                                            href={`#${heading.id}`}
                                            style={{
                                                fontSize: heading.level === 2 ? '0.9rem' : '0.8rem',
                                                fontWeight: heading.level === 2 ? 600 : 500,
                                                color: heading.level === 2 ? '#1e293b' : '#475569',
                                                textDecoration: 'none',
                                                paddingLeft: heading.level === 3 ? '12px' : 0,
                                                lineHeight: 1.5,
                                                display: 'block',
                                                transition: 'color 0.2s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = heading.level === 2 ? '#1e293b' : '#475569'}
                                        >
                                            {heading.text}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        )}

                        {/* Quick Action Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                            borderRadius: '12px',
                            padding: '24px',
                            color: '#ffffff',
                            textAlign: 'center'
                        }}>
                            <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', marginBottom: '12px' }}>
                                <Sparkles size={24} color="#ffffff" />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
                                Build Your Resume Free
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: '#e0e7ff', marginBottom: '16px', lineHeight: 1.5 }}>
                                Create an ATS-friendly resume in minutes with our professional templates.
                            </p>
                            <Link
                                href="/templates"
                                style={{
                                    display: 'inline-block',
                                    background: '#ffffff',
                                    color: '#1e3a8a',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    textDecoration: 'none',
                                }}
                            >
                                Start Building &rarr;
                            </Link>
                        </div>

                        {/* Popular Categories */}
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px'
                        }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                                Browse by Category
                            </h4>
                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {['Resume Tips', 'Cover Letters', 'Interview Prep', 'Career Advice'].map((cat) => (
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
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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
