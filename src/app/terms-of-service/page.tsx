'use client';

import React from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function TermsOfServicePage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Header />
            <main style={{ flex: 1, maxWidth: '800px', margin: '40px auto', padding: '0 24px', color: '#1e293b' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>
                    Terms of Service
                </h1>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.95rem' }}>
                    Last updated: August 29, 2026
                </p>

                <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.7', fontSize: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing and using Dusty, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
                            2. Use of Service
                        </h2>
                        <p>
                            Dusty provides tools for creating professional resumes, CVs, biodatas, and cover letters. You are solely responsible for the content, accuracy, and professional presentation of any documents generated using our platform.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
                            3. Intellectual Property
                        </h2>
                        <p>
                            All templates, UI designs, code architecture, and graphical assets provided on Dusty are the property of Dusty and are protected by applicable intellectual property laws. Generated documents remain the intellectual property of the user.
                        </p>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
                            4. Disclaimer of Warranties
                        </h2>
                        <p>
                            The service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. We do not guarantee employment outcomes or interview callbacks from documents created using our tools.
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
