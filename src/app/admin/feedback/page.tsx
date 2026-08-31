'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
    Layers,
    MessageSquare,
    Star,
    Calendar,
    User,
    Clock,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    BarChart3,
    TrendingUp,
    Search,
    Filter,
    Trash2,
} from 'lucide-react'

interface FeedbackRecord {
    id: number
    message: string
    rating: number
    category: string | null
    user_id: string | null
    name: string
    email: string
    created_at: string
    status: string
}

interface GroupedFeedback {
    dateKey: string
    dateLabel: string
    items: FeedbackRecord[]
}

function formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()

    if (isSameDay(d, today)) return '📅 Today'
    if (isSameDay(d, yesterday)) return '📅 Yesterday'

    return (
        '📅 ' +
        d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    )
}

function formatTime(dateStr: string): string {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

function groupByDate(items: FeedbackRecord[]): GroupedFeedback[] {
    const map = new Map<string, FeedbackRecord[]>()
    for (const item of items) {
        const dateKey = new Date(item.created_at).toISOString().split('T')[0]
        if (!map.has(dateKey)) map.set(dateKey, [])
        map.get(dateKey)!.push(item)
    }
    return Array.from(map.entries()).map(([dateKey, items]) => ({
        dateKey,
        dateLabel: formatDateLabel(items[0].created_at),
        items,
    }))
}

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
    return (
        <span style={{ display: 'inline-flex', gap: '1px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    fill={star <= rating ? '#f59e0b' : 'transparent'}
                    color={star <= rating ? '#f59e0b' : '#d1d5db'}
                    strokeWidth={1.5}
                />
            ))}
        </span>
    )
}

export default function AdminFeedbackPage() {
    const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [ratingFilter, setRatingFilter] = useState<number | null>(null)

    const fetchFeedback = async () => {
        setIsLoading(true)
        setError('')
        try {
            const res = await fetch('/api/feedback')
            const json = await res.json()
            if (json.error) {
                setError(json.error)
            } else {
                setFeedbackList(json.data || [])
                // Auto-expand all date groups
                const dates = new Set<string>(
                    (json.data || []).map((item: FeedbackRecord) =>
                        new Date(item.created_at).toISOString().split('T')[0]
                    )
                )
                setExpandedDates(dates)
            }
        } catch (err) {
            setError('Failed to fetch feedback')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return

        try {
            const res = await fetch('/api/feedback', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })

            if (res.ok) {
                setFeedbackList((prev) => prev.filter((item) => item.id !== id))
            } else {
                const json = await res.json()
                alert(json.error || 'Failed to delete feedback')
            }
        } catch {
            alert('Failed to delete feedback')
        }
    }

    useEffect(() => {
        fetchFeedback()
    }, [])

    const toggleDate = (dateKey: string) => {
        setExpandedDates((prev) => {
            const next = new Set(prev)
            if (next.has(dateKey)) next.delete(dateKey)
            else next.add(dateKey)
            return next
        })
    }

    const filteredList = useMemo(() => {
        let list = feedbackList
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            list = list.filter(
                (item) =>
                    item.message.toLowerCase().includes(q) ||
                    (item.email || '').toLowerCase().includes(q)
            )
        }
        if (ratingFilter !== null) {
            list = list.filter((item) => item.rating === ratingFilter)
        }
        return list
    }, [feedbackList, searchQuery, ratingFilter])

    const grouped = useMemo(() => groupByDate(filteredList), [filteredList])

    // Stats
    const stats = useMemo(() => {
        const total = feedbackList.length
        const avgRating =
            total > 0
                ? (feedbackList.reduce((sum, item) => sum + item.rating, 0) / total).toFixed(1)
                : '0.0'
        const ratingCounts = [0, 0, 0, 0, 0]
        feedbackList.forEach((item) => {
            if (item.rating >= 1 && item.rating <= 5) ratingCounts[item.rating - 1]++
        })
        const today = new Date().toISOString().split('T')[0]
        const todayCount = feedbackList.filter(
            (item) => item.created_at.split('T')[0] === today
        ).length
        return { total, avgRating, ratingCounts, todayCount }
    }, [feedbackList])

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            {/* Admin Header */}
            <header
                style={{
                    background: '#1e1b4b',
                    color: '#fff',
                    padding: '16px 32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '2px solid #6366f1',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Layers size={24} color="#818cf8" />
                    <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                        Admin Feedback Dashboard
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link
                        href="/admin"
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
                        <Layers size={16} /> Template Dashboard
                    </Link>
                    <Link
                        href="/feedback"
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
                        View Live Feedback Page
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Stats Cards */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '32px',
                    }}
                >
                    {/* Total Feedback */}
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '20px 24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div
                                style={{
                                    background: '#e0e7ff',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <MessageSquare size={18} color="#6366f1" />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Total Feedback
                            </span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                            {stats.total}
                        </div>
                    </div>

                    {/* Average Rating */}
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '20px 24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div
                                style={{
                                    background: '#fef3c7',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <TrendingUp size={18} color="#f59e0b" />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Avg Rating
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                                {stats.avgRating}
                            </span>
                            <StarDisplay rating={Math.round(parseFloat(stats.avgRating))} size={18} />
                        </div>
                    </div>

                    {/* Today's Feedback */}
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '20px 24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div
                                style={{
                                    background: '#d1fae5',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Calendar size={18} color="#10b981" />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Today
                            </span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                            {stats.todayCount}
                        </div>
                    </div>

                    {/* Rating Breakdown */}
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '20px 24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div
                                style={{
                                    background: '#fce7f3',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <BarChart3 size={18} color="#ec4899" />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Rating Breakdown
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = stats.ratingCounts[star - 1]
                                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
                                return (
                                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                                        <span style={{ width: '12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>{star}</span>
                                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                                        <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    width: `${pct}%`,
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                                                    borderRadius: '3px',
                                                    transition: 'width 0.3s ease',
                                                }}
                                            />
                                        </div>
                                        <span style={{ width: '20px', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>{count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div
                    style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '16px 24px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                        <Search
                            size={18}
                            color="#94a3b8"
                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <input
                            type="text"
                            placeholder="Search feedback by message or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px 10px 40px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                outline: 'none',
                                background: '#f8fafc',
                                color: '#0f172a',
                            }}
                        />
                    </div>

                    {/* Rating Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Filter size={16} color="#94a3b8" />
                        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                            <button
                                onClick={() => setRatingFilter(null)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    background: ratingFilter === null ? '#ffffff' : 'transparent',
                                    color: ratingFilter === null ? '#0f172a' : '#64748b',
                                    boxShadow: ratingFilter === null ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                }}
                            >
                                All
                            </button>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRatingFilter(ratingFilter === r ? null : r)}
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        background: ratingFilter === r ? '#ffffff' : 'transparent',
                                        color: ratingFilter === r ? '#0f172a' : '#64748b',
                                        boxShadow: ratingFilter === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    }}
                                >
                                    {r} <Star size={10} fill="#f59e0b" color="#f59e0b" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={fetchFeedback}
                        disabled={isLoading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: '#ffffff',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.6 : 1,
                        }}
                    >
                        <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Feedback List */}
                {isLoading && feedbackList.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#94a3b8',
                            fontSize: '0.95rem',
                        }}
                    >
                        <RefreshCw size={32} style={{ marginBottom: '12px', animation: 'spin 1s linear infinite' }} />
                        <p>Loading feedback...</p>
                    </div>
                ) : error ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            background: '#fef2f2',
                            borderRadius: '12px',
                            border: '1px solid #fecaca',
                            color: '#991b1b',
                        }}
                    >
                        <p style={{ fontWeight: 600, marginBottom: '12px' }}>{error}</p>
                        <button
                            onClick={fetchFeedback}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '8px',
                                border: '1px solid #fecaca',
                                background: '#ffffff',
                                color: '#991b1b',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : grouped.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#94a3b8',
                            background: '#ffffff',
                            borderRadius: '14px',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                            {searchQuery || ratingFilter ? 'No matching feedback found' : 'No feedback yet'}
                        </h3>
                        <p style={{ fontSize: '0.9rem' }}>
                            {searchQuery || ratingFilter ? 'Try adjusting your search or filter.' : 'Feedback will appear here once users submit it.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {grouped.map((group) => (
                            <div key={group.dateKey}>
                                {/* Date Header */}
                                <button
                                    onClick={() => toggleDate(group.dateKey)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px 0',
                                        marginBottom: '12px',
                                    }}
                                >
                                    {expandedDates.has(group.dateKey) ? (
                                        <ChevronDown size={18} color="#6366f1" />
                                    ) : (
                                        <ChevronRight size={18} color="#6366f1" />
                                    )}
                                    <span
                                        style={{
                                            fontSize: '0.95rem',
                                            fontWeight: 700,
                                            color: '#1e1b4b',
                                            letterSpacing: '0.3px',
                                        }}
                                    >
                                        {group.dateLabel}
                                    </span>
                                    <span
                                        style={{
                                            background: '#e0e7ff',
                                            color: '#4338ca',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                        }}
                                    >
                                        {group.items.length}
                                    </span>
                                </button>

                                {/* Feedback Cards */}
                                {expandedDates.has(group.dateKey) && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '26px' }}>
                                        {group.items.map((item) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    background: '#ffffff',
                                                    borderRadius: '12px',
                                                    padding: '18px 22px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '10px',
                                                    transition: 'box-shadow 0.2s ease',
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                                                }}
                                            >
                                                {/* Top Row: Stars + Time + Status */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <StarDisplay rating={item.rating} size={16} />
                                                        <span
                                                            style={{
                                                                fontSize: '0.78rem',
                                                                fontWeight: 700,
                                                                color: item.rating >= 4 ? '#059669' : item.rating >= 3 ? '#d97706' : '#dc2626',
                                                                background: item.rating >= 4 ? '#ecfdf5' : item.rating >= 3 ? '#fffbeb' : '#fef2f2',
                                                                padding: '2px 8px',
                                                                borderRadius: '6px',
                                                            }}
                                                        >
                                                            {item.rating === 5 && 'Excellent'}
                                                            {item.rating === 4 && 'Very Good'}
                                                            {item.rating === 3 && 'Good'}
                                                            {item.rating === 2 && 'Fair'}
                                                            {item.rating === 1 && 'Poor'}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                fontSize: '0.78rem',
                                                                color: '#94a3b8',
                                                            }}
                                                        >
                                                            <Clock size={12} />
                                                            {formatTime(item.created_at)}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: '0.7rem',
                                                                fontWeight: 700,
                                                                padding: '2px 8px',
                                                                borderRadius: '6px',
                                                                background: item.status === 'new' ? '#dbeafe' : item.status === 'read' ? '#f1f5f9' : '#d1fae5',
                                                                color: item.status === 'new' ? '#1d4ed8' : item.status === 'read' ? '#64748b' : '#059669',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                            }}
                                                        >
                                                            {item.status || 'new'}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Delete feedback"
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '28px',
                                                                height: '28px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #fecaca',
                                                                background: '#fef2f2',
                                                                color: '#dc2626',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                padding: 0,
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.background = '#dc2626'
                                                                e.currentTarget.style.color = '#ffffff'
                                                                e.currentTarget.style.borderColor = '#dc2626'
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.background = '#fef2f2'
                                                                e.currentTarget.style.color = '#dc2626'
                                                                e.currentTarget.style.borderColor = '#fecaca'
                                                            }}
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Message */}
                                                <p
                                                    style={{
                                                        fontSize: '0.95rem',
                                                        color: '#1e293b',
                                                        lineHeight: 1.6,
                                                        margin: 0,
                                                        fontStyle: 'italic',
                                                    }}
                                                >
                                                    &ldquo;{item.message}&rdquo;
                                                </p>

                                                {/* Bottom Row: Name + Category */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            fontSize: '0.82rem',
                                                            color: '#64748b',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        <User size={13} />
                                                        {item.email || 'Anonymous'}
                                                    </span>
                                                    {item.category && (
                                                        <span
                                                            style={{
                                                                fontSize: '0.72rem',
                                                                fontWeight: 600,
                                                                color: '#6366f1',
                                                                background: '#eef2ff',
                                                                padding: '2px 8px',
                                                                borderRadius: '6px',
                                                            }}
                                                        >
                                                            {item.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    )
}
