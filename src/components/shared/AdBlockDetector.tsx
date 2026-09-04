'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ShieldOff, RefreshCw, ExternalLink, AlertTriangle, Smartphone } from 'lucide-react';
import styles from './AdBlockDetector.module.css';

/**
 * Ad Blocker Detection & Enforcement Component
 * 
 * Uses 6+ aggressive detection techniques that work on:
 * - Desktop browsers (Chrome, Firefox, Edge, Safari)
 * - Mobile browsers (Brave Shields, Samsung Internet, Opera Mini)
 * - Privacy-focused browsers (Brave, Tor, Vivaldi)
 * - Browser extensions (uBlock Origin, AdBlock Plus, AdGuard, Ghostery)
 */
export function AdBlockDetector({ children }: { children: React.ReactNode }) {
    const [isAdBlocked, setIsAdBlocked] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const checkRunRef = useRef(false);
    const mountedRef = useRef(true);

    const detectAdBlocker = useCallback(async () => {
        if (checkRunRef.current) return;
        checkRunRef.current = true;

        const results: boolean[] = [];

        // ─── Technique 1: Script loading bait ───────────────────────────
        // Try loading a script with ad-related name; ad blockers block it
        const scriptTest = new Promise<boolean>((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
            script.async = true;
            script.onload = () => resolve(false); // Script loaded = no blocker
            script.onerror = () => resolve(true); // Script blocked = blocker
            document.head.appendChild(script);
            // Timeout fallback
            setTimeout(() => resolve(false), 1500);
        });
        results.push(await scriptTest);

        // ─── Technique 2: Multiple bait DOM elements ────────────────────
        // Create many bait elements with different ad-related patterns
        const baitContainer = document.createElement('div');
        baitContainer.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;';

        const baitPatterns = [
            { tag: 'div', classes: 'ad-banner googad pub_300x250 text-ad adsbygoogle' },
            { tag: 'div', classes: 'ad ad-zone ad-slot ad-unit sponsored-content' },
            { tag: 'ins', classes: 'adsbygoogle' },
            { tag: 'iframe', classes: 'ad-frame' },
            { tag: 'div', id: 'div-gpt-ad-12345' },
            { tag: 'div', id: 'google_ads_container' },
            { tag: 'div', classes: 'ads-container ad-container' },
            { tag: 'span', classes: 'sponsored-text advertisement-label' },
        ];

        const baitElements: HTMLElement[] = [];
        for (const pattern of baitPatterns) {
            const el = document.createElement(pattern.tag);
            if (pattern.classes) el.className = pattern.classes;
            if ((pattern as any).id) el.id = (pattern as any).id;
            el.innerHTML = '&nbsp;';
            el.setAttribute('data-ad-slot', 'true');
            el.setAttribute('data-google-query-id', 'test');
            baitContainer.appendChild(el);
            baitElements.push(el);
        }

        document.body.appendChild(baitContainer);

        // Wait for ad blockers to process
        await new Promise(resolve => setTimeout(resolve, 300));

        let domBlocked = 0;
        for (const el of baitElements) {
            const computed = window.getComputedStyle(el);
            if (
                computed.display === 'none' ||
                computed.visibility === 'hidden' ||
                computed.opacity === '0' ||
                computed.height === '0px' ||
                computed.width === '0px' ||
                !el.offsetParent
            ) {
                domBlocked++;
            }
        }

        // If more than 30% of bait elements were hidden, ad blocker detected
        results.push(domBlocked > baitPatterns.length * 0.3);

        // Clean up bait
        try { document.body.removeChild(baitContainer); } catch { }

        // ─── Technique 3: CSS bait stylesheet ───────────────────────────
        const style = document.createElement('style');
        style.textContent = `
            .dusty-ad-test-1, .dusty-ad-test-2, .dusty-ad-test-3 {
                position: absolute !important;
                left: -9999px !important;
                width: 1px !important;
                height: 1px !important;
            }
        `;
        document.head.appendChild(style);

        const cssBait = document.createElement('div');
        cssBait.className = 'dusty-ad-test-1 dusty-ad-test-2 dusty-ad-test-3';
        cssBait.innerHTML = '&nbsp;';
        document.body.appendChild(cssBait);

        await new Promise(resolve => setTimeout(resolve, 100));

        const cssComputed = window.getComputedStyle(cssBait);
        const cssBlocked = cssComputed.display === 'none' ||
            cssComputed.visibility === 'hidden' ||
            cssComputed.height === '0px' ||
            !cssBait.offsetHeight;
        results.push(cssBlocked);

        try {
            document.body.removeChild(cssBait);
            document.head.removeChild(style);
        } catch { }

        // ─── Technique 4: XMLHttpRequest bait ───────────────────────────
        const xhrTest = new Promise<boolean>((resolve) => {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', '/pagead2.googlesyndication.com/test', true);
                xhr.timeout = 1500;
                xhr.onload = () => resolve(false);
                xhr.onerror = () => resolve(true);
                xhr.ontimeout = () => resolve(false);
                xhr.send();
            } catch {
                resolve(true);
            }
        });
        results.push(await xhrTest);

        // ─── Technique 5: Blob URL bait ─────────────────────────────────
        // Some blockers intercept blob URLs
        const blobTest = new Promise<boolean>((resolve) => {
            try {
                const blob = new Blob(['void 0'], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                const s = document.createElement('script');
                s.src = url;
                s.onload = () => {
                    URL.revokeObjectURL(url);
                    resolve(false);
                };
                s.onerror = () => {
                    URL.revokeObjectURL(url);
                    resolve(true);
                };
                document.head.appendChild(s);
                setTimeout(() => resolve(false), 1000);
            } catch {
                resolve(false);
            }
        });
        results.push(await blobTest);

        // ─── Technique 6: Known ad domain fetch ─────────────────────────
        const domains = [
            'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
            'https://www.googletagmanager.com/gtag/js',
            'https://adskeeper.com',
            'https://connect.facebook.net/en_US/fbevents.js',
        ];

        let domainBlocked = 0;
        for (const domain of domains) {
            try {
                await fetch(domain, { method: 'HEAD', mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(2000) });
            } catch {
                domainBlocked++;
            }
        }
        // If 2+ domains failed, likely blocked
        results.push(domainBlocked >= 2);

        // ─── Technique 7: Navigator / Brave detection ───────────────────
        const braveDetected = (navigator as any).brave && (navigator as any).brave.isBrave;
        if (braveDetected) {
            // Brave always has shields, treat as detected
            const isBravePromise = new Promise<boolean>((resolve) => {
                if ((navigator as any).brave?.isBrave) {
                    (navigator as any).brave.isBrave().then((result: boolean) => {
                        resolve(result);
                    }).catch(() => resolve(false));
                } else {
                    resolve(false);
                }
            });
            const isBrave = await isBravePromise;
            results.push(isBrave);
        }

        // ─── Final verdict ──────────────────────────────────────────────
        // If majority of techniques say blocked → ad blocker detected
        const blockedCount = results.filter(Boolean).length;
        const detected = blockedCount >= 2;

        if (detected) {
            try { sessionStorage.setItem('dusty_adblock_detected', 'true'); } catch { }
        }

        if (!mountedRef.current) return;
        setIsAdBlocked(detected);
        setIsChecking(false);
    }, []);

    useEffect(() => {
        mountedRef.current = true;

        // Check sessionStorage first
        try {
            const prev = sessionStorage.getItem('dusty_adblock_detected');
            if (prev === 'false') {
                setIsAdBlocked(false);
                setIsChecking(false);
                return;
            }
        } catch { }

        // Small delay to let the page stabilize
        const timer = setTimeout(() => {
            detectAdBlocker();
        }, 800);

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
        };
    }, [detectAdBlocker]);

    const handleRefresh = () => {
        window.location.reload();
    };

    // While checking, let content through
    if (isChecking) {
        return <>{children}</>;
    }

    // No ad blocker
    if (!isAdBlocked) {
        return <>{children}</>;
    }

    // Ad blocker detected — block everything
    return (
        <>
            {/* Content (blurred and disabled) */}
            <div style={{
                filter: 'blur(10px)',
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: 0.4,
            }}>
                {children}
            </div>

            {/* Blocking overlay */}
            <div className={styles.overlay}>
                <div className={styles.card}>
                    {/* Icon */}
                    <div className={styles.iconWrap}>
                        <ShieldOff size={36} color="#ef4444" />
                    </div>

                    {/* Title */}
                    <h1 className={styles.title}>Ad Blocker Detected</h1>

                    {/* Description */}
                    <p className={styles.description}>
                        It looks like you're using an <strong>ad blocker</strong> or privacy extension
                        that is interfering with our website.
                    </p>

                    <p className={styles.descriptionSecondary}>
                        Our website uses lightweight scripts that some ad blockers (including <strong>Brave Shields</strong>,
                        uBlock Origin, AdGuard, etc.) block by mistake. Please disable your ad blocker
                        to continue using DocXume.
                    </p>

                    {/* Steps */}
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <span className={styles.stepNumber}>1</span>
                            <span className={styles.stepText}>
                                Tap your <strong>ad blocker / shields icon</strong> in the browser toolbar or menu
                            </span>
                        </div>
                        <div className={styles.step}>
                            <span className={styles.stepNumber}>2</span>
                            <span className={styles.stepText}>
                                Select <strong>"Disable for this site"</strong> or <strong>"Turn off shields"</strong>
                            </span>
                        </div>
                        <div className={styles.step}>
                            <span className={styles.stepNumber}>3</span>
                            <span className={styles.stepText}>
                                Tap the <strong>Refresh</strong> button below to reload
                            </span>
                        </div>
                    </div>

                    {/* Browser-specific quick help */}
                    <div className={styles.hints}>
                        <p className={styles.hintsTitle}>
                            <Smartphone size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            Quick Guide by Browser:
                        </p>
                        <div className={styles.hintsList}>
                            <div className={styles.hintItem}>
                                <strong>Brave</strong>: Tap 🛡️ → Shields Down
                            </div>
                            <div className={styles.hintItem}>
                                <strong>Samsung Internet</strong>: Settings → Ad blockers → Disable
                            </div>
                            <div className={styles.hintItem}>
                                <strong>Chrome</strong>: Extensions → Disable ad blocker
                            </div>
                            <div className={styles.hintItem}>
                                <strong>Firefox</strong>: Add-ons → uBlock → Disable
                            </div>
                            <div className={styles.hintItem}>
                                <strong>Safari iOS</strong>: Settings → Safari → Extensions → Off
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button className={styles.refreshBtn} onClick={handleRefresh}>
                            <RefreshCw size={18} />
                            Refresh Page
                        </button>
                        <a
                            href="https://www.wikihow.com/Disable-Adblock-on-Any-Browser"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.helpLink}
                        >
                            <ExternalLink size={14} />
                            More help disabling ad blockers
                        </a>
                    </div>

                    {/* Warning */}
                    <div className={styles.warning}>
                        <AlertTriangle size={14} />
                        <span>Please disable your ad blocker and refresh to continue</span>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdBlockDetector;
