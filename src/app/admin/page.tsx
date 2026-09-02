'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllTemplates, TemplateDefinition } from '@/templates/index';
import { TemplateThumbnail } from '@/components/shared/TemplateThumbnail';
import { Trash2, Plus, Edit3, Layers, Sparkles, FileText, Mail, Briefcase, Search, MessageSquare } from 'lucide-react';
import styles from '@/app/templates/page.module.css';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<TemplateDefinition[]>(() => getAllTemplates());
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'resume' | 'cv' | 'cover-letter'>('all');
    const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleDelete = async (tpl: TemplateDefinition) => {
        if (!confirm(`Are you sure you want to delete template "${tpl.name}" (${tpl.id})? This will permanently remove the template file and update the website registry.`)) {
            return;
        }

        setDeletingId(tpl.id);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/templates', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: tpl.id,
                    category: tpl.category,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete template.');
            }

            // Remove from local state
            setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
            setMessage({ type: 'success', text: data.message });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setDeletingId(null);
        }
    };

    const filteredTemplates = templates.filter((tpl) => {
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

    const categoryLabels: { id: 'all' | 'resume' | 'cv' | 'cover-letter'; label: string; icon: any }[] = [
        { id: 'all', label: 'All Templates', icon: Sparkles },
        { id: 'resume', label: 'Resumes', icon: Edit3 },
        { id: 'cv', label: 'CVs', icon: FileText },
        { id: 'cover-letter', label: 'Cover Letters', icon: Mail },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            {/* Admin Header */}
            <header style={{ background: '#1e1b4b', color: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #6366f1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Layers size={24} color="#818cf8" />
                    <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px' }}>Admin Template Dashboard</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link
                        href="/admin/feedback"
                        style={{
                            background: '#f59e0b',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <MessageSquare size={16} /> View Feedback
                    </Link>
                    <Link
                        href="/admin/templates"
                        style={{
                            background: '#6366f1',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <Plus size={16} /> Create New Template
                    </Link>
                    <Link
                        href="/templates"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        View Live Website
                    </Link>
                </div>
            </header>

            {/* Status Message */}
            {message && (
                <div
                    style={{
                        margin: '20px 32px 0',
                        padding: '12px 20px',
                        background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        color: message.type === 'success' ? '#065f46' : '#991b1b',
                        border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                    }}
                >
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'inherit' }}>×</button>
                </div>
            )}

            {/* Main Marketplace Gallery Content */}
            <main className={styles.page} style={{ flex: 1, padding: '32px' }}>
                <div className={styles.container}>
                    <div className={styles.header} style={{ marginBottom: '24px' }}>
                        <h2 className={styles.title}>Manage All Templates</h2>
                        <p className={styles.subtitle}>
                            Browse all templates across categories in a unified grid. Use the search bar and filters to quickly find, edit, or delete templates.
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
                                    placeholder="Search templates by name, category, or description..."
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
                                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
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
                                        onClick={() => setSelectedCategory(cat.id)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '7px',
                                            padding: '9px 18px',
                                            borderRadius: '10px',
                                            border: isActive ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                                            background: isActive ? '#e0e7ff' : '#ffffff',
                                            color: isActive ? '#3730a3' : '#475569',
                                            fontWeight: isActive ? 700 : 600,
                                            fontSize: '0.88rem',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.15s',
                                            boxShadow: isActive ? '0 2px 4px rgba(99,102,241,0.08)' : 'none'
                                        }}
                                    >
                                        <IconComponent size={16} color={isActive ? '#6366f1' : '#64748b'} />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Unified Grid View */}
                    <div className={styles.grid}>
                        {filteredTemplates.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                <FileText size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>No templates found</h3>
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>Try adjusting your search query, category filter, or pricing filter.</p>
                            </div>
                        ) : (
                            filteredTemplates.map((tpl) => (
                                <div key={tpl.id} className={styles.card} style={{ position: 'relative' }}>
                                    {/* DELETE BUTTON IN UPPER CORNER */}
                                    <button
                                        onClick={() => handleDelete(tpl)}
                                        disabled={deletingId === tpl.id}
                                        title="Delete Template"
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            zIndex: 20,
                                            background: '#ef4444',
                                            color: '#fff',
                                            border: 'none',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                            transition: 'transform 0.15s',
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                    <button
                                        onClick={() => window.open(`/admin/templates?edit=${tpl.id}`, '_blank', 'noopener,noreferrer')}
                                        title="Edit Template — opens admin template editor in a new tab"
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '48px',
                                            zIndex: 20,
                                            background: '#10b981',
                                            color: '#fff',
                                            border: 'none',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                            transition: 'transform 0.15s',
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        <Edit3 size={15} />
                                    </button>

                                    <div className={styles.thumbnail} style={{ overflow: 'hidden', height: '280px', position: 'relative', background: '#f8fafc' }}>
                                        <TemplateThumbnail template={tpl} />
                                        <span className={styles.categoryTag}>{tpl.category}</span>
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
                                            }}
                                        >
                                            {tpl.isPremium ? 'Premium' : 'Free'}
                                        </span>
                                    </div>

                                    <div className={styles.content}>
                                        <div className={styles.details}>
                                            <h3 className={styles.cardTitle}>{tpl.name}</h3>
                                            <p className={styles.cardDesc}>{tpl.description || 'Custom template in gallery.'}</p>
                                        </div>

                                        <div className={styles.btnGroup}>
                                            <Link
                                                href={`/editor/${tpl.category}/${tpl.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary"
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                                            >
                                                <Edit3 size={16} /> Edit / Use Template
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
