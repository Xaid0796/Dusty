// ============================================================
// COOKIE CONSENT BANNER
// GDPR / CCPA compliant consent banner for AdSense & local storage.
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('docxume_cookie_consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('docxume_cookie_consent', 'accepted');
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem('docxume_cookie_consent', 'declined');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            background: '#1e293b',
            color: '#f8fafc',
            padding: '16px 24px',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '100%',
        }}>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: '1200px',
                gap: '16px'
            }}>
                <div style={{ fontSize: '13px', lineHeight: '1.5', flex: 1, minWidth: '280px' }}>
                    We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and serve personalized ads through Google AdSense. Read our{' '}
                    <Link href="/privacy-policy" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                        Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms-of-service" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                        Terms of Service
                    </Link>.
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        onClick={handleDecline}
                        style={{
                            background: 'transparent',
                            color: '#94a3b8',
                            border: '1px solid #475569',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        style={{
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}
