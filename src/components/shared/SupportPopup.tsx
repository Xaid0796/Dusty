'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Heart, Coffee } from 'lucide-react';
import './SupportPopup.css';

// ─── Global support popup state (singleton pattern) ───────────────────────────
let _showSupportPopupGlobal: (() => void) | null = null;

/** Call this after any successful PDF download to show the support popup */
export function showSupportPopup() {
    _showSupportPopupGlobal?.();
}

export function SupportPopupProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        _showSupportPopupGlobal = () => setVisible(true);
        return () => { _showSupportPopupGlobal = null; };
    }, []);

    const dismiss = useCallback(() => {
        const card = document.querySelector('.support-popup-card') as HTMLElement;
        const backdrop = document.querySelector('.support-popup-backdrop') as HTMLElement;
        if (card) card.classList.add('support-popup-exit');
        if (backdrop) backdrop.classList.add('support-popup-exit');
        setTimeout(() => setVisible(false), 300);
    }, []);

    if (!visible) return <>{children}</>;

    return (
        <>
            {children}
            <div
                className="support-popup-backdrop"
                onClick={dismiss}
                role="dialog"
                aria-modal="true"
                aria-label="Support this project"
            >
                <div className="support-popup-card" onClick={(e) => e.stopPropagation()}>
                    {/* Close button */}
                    <button className="support-popup-close" onClick={dismiss} aria-label="Close">
                        <X size={16} />
                    </button>

                    {/* Header */}
                    <div className="support-popup-header">
                        <div className="support-popup-heart-wrap">
                            <Heart size={28} color="#e11d48" fill="#e11d48" />
                        </div>
                        <h2 className="support-popup-title">❤️ Support This Project</h2>
                        <p className="support-popup-subtitle">Your template is ready! 🎉</p>
                    </div>

                    {/* Body */}
                    <div className="support-popup-body">
                        <p className="support-popup-text">
                            All our templates are <strong>completely free</strong> to download and use.
                            No catch, no watermarks, no hidden fees.
                        </p>
                        <p className="support-popup-text">
                            If DocXume helped you create a professional document, you can support us
                            by scanning the QR code below and contributing <strong>any amount you like</strong>.
                        </p>
                        <p className="support-popup-text-muted">
                            Even ₹1 helps us build more free templates for everyone. 😊
                        </p>

                        {/* QR Code */}
                        <div className="support-popup-qr-wrap">
                            <img
                                src="/upi-qr.png"
                                alt="Google Pay / UPI QR Code"
                                className="support-popup-qr"
                            />
                        </div>

                        <p className="support-popup-upi-label">
                            UPI • Pay What You Want
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="support-popup-footer">
                        <button className="support-popup-cta" onClick={dismiss}>
                            <Coffee size={18} />
                            I contributed — Thank you!
                        </button>
                        <button className="support-popup-dismiss" onClick={dismiss}>
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SupportPopupProvider;
