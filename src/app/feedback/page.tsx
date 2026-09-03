'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { createClient } from '@supabase/supabase-js'
import styles from './page.module.css'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

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
    date: string
    items: FeedbackRecord[]
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
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
    return Array.from(map.entries()).map(([date, items]) => ({
        date,
        items,
    }))
}

export default function FeedbackPage() {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [message, setMessage] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState('')

    const [feedbackList, setFeedbackList] = useState<GroupedFeedback[]>([])
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(true)

    useEffect(() => {
        fetchFeedback()
    }, [])

    const fetchFeedback = async () => {
        setIsLoadingFeedback(true)
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Failed to fetch feedback:', error)
            } else if (data) {
                setFeedbackList(groupByDate(data))
            }
        } catch (err) {
            console.error('Failed to fetch feedback:', err)
        } finally {
            setIsLoadingFeedback(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (rating === 0) {
            setError('Please select a star rating.')
            return
        }
        if (message.trim().length < 3) {
            setError('Please write at least a few words about your experience.')
            return
        }

        setIsSubmitting(true)

        try {
            const { error: insertError } = await supabase.from('feedback').insert([
                {
                    message: message.trim(),
                    rating,
                    email: email.trim() || '',
                    category: 'general',
                    status: 'new',
                },
            ])

            if (insertError) {
                setError(insertError.message || 'Something went wrong. Please try again.')
                return
            }

            setIsSubmitted(true)
            fetchFeedback()
        } catch (err) {
            setError('Network error. Please check your connection and try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setRating(0)
        setMessage('')
        setEmail('')
        setError('')
        setIsSubmitted(false)
    }

    const displayRating = hoverRating || rating

    return (
        <div className={styles.container}>
            <Header />
            <main className={styles.main}>
                <div className={styles.card}>
                    {isSubmitted ? (
                        <div className={styles.successMessage}>
                            <span className={styles.successIcon}>🎉</span>
                            <h2 className={styles.successTitle}>Thank you!</h2>
                            <p className={styles.successText}>
                                Your feedback means the world to us. It helps us build a better
                                experience for everyone.
                            </p>
                            <button
                                className={styles.newFeedbackButton}
                                onClick={resetForm}
                            >
                                Submit Another Feedback
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className={styles.title}>We'd Love Your Feedback</h1>
                            <p className={styles.subtitle}>
                                Your thoughts help us improve DocXume. Let us know what you think!
                            </p>

                            <form onSubmit={handleSubmit}>
                                {/* Star Rating */}
                                <div className={styles.ratingSection}>
                                    <span className={styles.ratingLabel}>Your Rating</span>
                                    <div className={styles.starRow}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={`${styles.starButton} ${star <= displayRating
                                                    ? styles.starFilled
                                                    : styles.starEmpty
                                                    }`}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    {rating > 0 && (
                                        <span
                                            style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text-muted)',
                                                marginTop: '4px',
                                            }}
                                        >
                                            {rating === 1 && 'Poor'}
                                            {rating === 2 && 'Fair'}
                                            {rating === 3 && 'Good'}
                                            {rating === 4 && 'Very Good'}
                                            {rating === 5 && 'Excellent'}
                                        </span>
                                    )}
                                </div>

                                {/* Feedback Message */}
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        What did you think?
                                    </label>
                                    <textarea
                                        className={styles.formTextarea}
                                        placeholder="Tell us about your experience with DocXume..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        maxLength={1000}
                                        required
                                    />
                                    <div className={styles.charCount}>
                                        {message.length} / 1000
                                    </div>
                                </div>

                                {/* Email */}
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Email
                                        <span className={styles.optionalLabel}>(optional)</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={styles.formInput}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        maxLength={200}
                                    />
                                </div>

                                {/* Error */}
                                {error && <div className={styles.errorMessage}>{error}</div>}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* View Feedback Section */}
                    <div className={styles.viewSection}>
                        <h2 className={styles.viewTitle}>Recent Feedback</h2>
                        {isLoadingFeedback ? (
                            <div className={styles.loadingSpinner}>Loading feedback...</div>
                        ) : feedbackList.length === 0 ? (
                            <div className={styles.noFeedback}>
                                <div className={styles.emptyState}>
                                    <span className={styles.emptyIcon}>💬</span>
                                    <span>No feedback yet. Be the first to share your thoughts!</span>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.feedbackList}>
                                {feedbackList.map((group) =>
                                    group.items.map((item) => (
                                        <div key={item.id} className={styles.feedbackItem}>
                                            <div className={styles.feedbackStars}>
                                                {'★'.repeat(item.rating)}
                                                {'☆'.repeat(5 - item.rating)}
                                            </div>
                                            <p className={styles.feedbackMessage}>
                                                &ldquo;{item.message}&rdquo;
                                            </p>
                                            <div className={styles.feedbackMeta}>
                                                <span>{item.email || 'Anonymous'}</span>
                                                <span>·</span>
                                                <span>{formatTime(item.created_at)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
