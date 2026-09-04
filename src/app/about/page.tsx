'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import styles from './page.module.css';

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <Header />
            <main className={styles.main}>
                <div className={styles.header}>
                    <span className={styles.badge}>About DocXume</span>
                    <h1 className={styles.title}>A free, private way to build professional documents</h1>
                    <p className={styles.lead}>
                        DocXume is a browser-based builder that helps job seekers and professionals create
                        polished resumes, CVs, and cover letters — entirely on their own device, at no cost.
                    </p>
                </div>

                <div className={styles.mission}>
                    <div className={styles.missionLabel}>Our Mission</div>
                    <p className={styles.missionText}>
                        Make professional, well-designed career documents accessible to everyone — free,
                        private by design, and free of watermarks, sign-ups, and paywalls.
                    </p>
                </div>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>What DocXume is</h2>
                    <p className={styles.sectionText}>
                        DocXume is a client-side document builder built with Next.js and React. It lets you
                        choose a professional template, fill in your details, customize colors and layout,
                        preview changes in real time, and download a clean PDF — all without installing
                        software or creating an account.
                    </p>
                    <p className={styles.sectionText}>
                        The toolkit covers multiple document types: resumes, CVs, and matching cover letters,
                        with a gallery of starter templates and an in-browser editor for fine-grained control.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>The problem we solve</h2>
                    <div className={styles.cardGrid}>
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Cost & lock-in</div>
                            <p className={styles.cardText}>
                                Many resume tools charge subscriptions or force watermarks on free exports.
                                DocXume is free to use with no hidden limitations.
                            </p>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Privacy</div>
                            <p className={styles.cardText}>
                                Your documents and photos are processed locally in your browser. You should
                                not have to upload sensitive personal data to a server to build a resume.
                            </p>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Complexity</div>
                            <p className={styles.cardText}>
                                Design tools can be overwhelming. DocXume focuses on a guided, template-first
                                experience with live preview so the result looks professional by default.
                            </p>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>How it helps you</h2>
                    <p className={styles.sectionText}>
                        Whether you are a student writing your first resume or a professional refreshing your
                        CV, DocXume gives you a fast path from a blank page to a downloadable, print-ready PDF.
                        Drafts are saved in your browser so you can step away and return without losing work,
                        and you can switch templates without retyping your content.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>About the project</h2>
                    <p className={styles.teamNote}>
                        DocXume is an independent, open project maintained by its developer(s). It is offered
                        as a free resource for anyone preparing job applications. We do not sell user data, and
                        we keep the core experience free so that cost is never a barrier to a good-looking
                        application.
                    </p>
                </section>

                <div className={styles.ctaWrap}>
                    <Link href="/templates" className={styles.ctaButton}>
                        Explore Templates <ArrowRight size={16} />
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
