'use client';

import React, { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { supabase } from '@/utils/supabase';
import styles from './page.module.css';

type Category = 'support' | 'feedback' | 'report';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState<Category>('support');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (message.trim().length < 3) {
            setError('Please enter a short message so we can help you.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { error: insertError } = await supabase
                .from('feedback')
                .insert({
                    name: name.trim() || 'Anonymous',
                    email: email.trim() || '',
                    message: `[${category}] ${message.trim()}`,
                    category,
                    status: 'new',
                    rating: 0,
                })
                .select();

            if (insertError) {
                setError(insertError.message || 'Something went wrong. Please try again.');
                return;
            }

            setIsSubmitted(true);
        } catch (err: any) {
            setError(err?.message || 'Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setCategory('support');
        setMessage('');
        setError('');
        setIsSubmitted(false);
    };

    return (
        <div className={styles.container}>
            <Header />
            <main className={styles.main}>
                <div className={styles.card}>
                    {isSubmitted ? (
                        <div className={styles.successMessage}>
                            <span className={styles.successIcon}>📨</span>
                            <h2 className={styles.successTitle}>Message received</h2>
                            <p className={styles.successText}>
                                Thanks for reaching out. We read every message and will get back to you as
                                soon as we can.
                            </p>
                            <button className={styles.newButton} onClick={resetForm}>
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className={styles.title}>Contact DocXume</h1>
                            <p className={styles.subtitle}>
                                Questions, feedback, or something to report? Send us a message and we'll
                                take a look.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Name
                                        <span className={styles.optionalLabel}>(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        maxLength={120}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Email
                                        <span className={styles.optionalLabel}>(optional, for replies)</span>
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

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>How can we help?</label>
                                    <select
                                        className={styles.formSelect}
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as Category)}
                                    >
                                        <option value="support">Support / Question</option>
                                        <option value="feedback">Feedback / Suggestion</option>
                                        <option value="report">Report a problem</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Message</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        placeholder="Tell us what's on your mind…"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        maxLength={1000}
                                        required
                                    />
                                </div>

                                {error && <div className={styles.errorMessage}>{error}</div>}

                                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                                    {isSubmitting ? 'Sending…' : 'Send Message'}
                                </button>
                            </form>

                            <div className={styles.infoGrid}>
                                <div className={styles.infoBlock}>
                                    <div className={styles.infoLabel}>Support & Questions</div>
                                    <p className={styles.infoText}>
                                        Use the form above and select &ldquo;Support / Question&rdquo;. If you
                                        share an email, we'll reply there.
                                    </p>
                                </div>
                                <div className={styles.infoBlock}>
                                    <div className={styles.infoLabel}>Feedback & Suggestions</div>
                                    <p className={styles.infoText}>
                                        We love ideas. Pick &ldquo;Feedback / Suggestion&rdquo; and tell us
                                        what would make DocXume better.
                                    </p>
                                </div>
                                <div className={styles.infoBlock}>
                                    <div className={styles.infoLabel}>Reporting an Issue</div>
                                    <p className={styles.infoText}>
                                        Select &ldquo;Report a problem&rdquo; and describe what happened,
                                        including the page you were on if possible.
                                    </p>
                                </div>
                                <div className={styles.infoBlock}>
                                    <div className={styles.infoLabel}>Response Time</div>
                                    <p className={styles.infoText}>
                                        We aim to respond within a few business days. This is a free,
                                        independently run project, so response times may vary.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
