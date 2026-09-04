'use client';

import React from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function PrivacyPolicyPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Header />
            <main style={{ flex: 1, maxWidth: '800px', margin: '40px auto', padding: '0 24px', color: '#1e293b' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>
                    Privacy Policy
                </h1>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.95rem' }}>
                    Last updated: August 29, 2026
                </p>

                <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.7', fontSize: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
                            1. Introduction
                        </h2>
                        <p>
                            Welcome to DocXume ("we", "our", or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
                            2. Client-Side Data Processing
                        </h2>
                        <p>
                            DocXume is designed with privacy at its core. All document creation, template customization, photo cropping, and PDF generation occur entirely within your web browser on your local device. We do not store your resumes, cover letters, or personal photos on our remote servers.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
                            3. Local Storage
                        </h2>
                        <p>
                            To prevent accidental data loss, we may save your draft progress locally in your browser's storage (localStorage). You retain full control over this data and can clear it at any time through your browser settings or by using reset functions within the application.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
                            4. Contact Us
                        </h2>
                        <p>
                            If you have any questions about this Privacy Policy, you can reach us through our <a href="/contact" style={{ color: '#2563eb', textDecoration: 'underline' }}>Contact page</a>. We read every message and will respond as soon as we can.
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
