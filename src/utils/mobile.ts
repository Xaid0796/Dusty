// src/utils/mobile.ts
// Mobile detection, haptic feedback, geolocation, pull-to-refresh, and viewport utilities

'use client';

// ─── Viewport Detection ──────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;

export function isMobileViewport(width?: number): boolean {
    if (typeof window === 'undefined') return false;
    return (width ?? window.innerWidth) <= MOBILE_BREAKPOINT;
}

export function isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - legacy API
        window.DocumentTouch && document instanceof window.DocumentTouch
    );
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w <= 480) return 'mobile';
    if (w <= 768) return 'tablet';
    return 'desktop';
}

// ─── Haptic Feedback ─────────────────────────────────────────────────────────
export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'error';

export function triggerHaptic(style: HapticStyle = 'light'): boolean {
    if (typeof window === 'undefined') return false;

    // Vibration API (Android / most mobile browsers)
    if ('vibrate' in navigator) {
        switch (style) {
            case 'light':
                navigator.vibrate(10);
                return true;
            case 'medium':
                navigator.vibrate(25);
                return true;
            case 'heavy':
                navigator.vibrate(50);
                return true;
            case 'success':
                navigator.vibrate([15, 50, 15]);
                return true;
            case 'error':
                navigator.vibrate([50, 30, 50]);
                return true;
        }
    }

    // iOS Safari doesn't support vibrate, but we can try AudioContext
    try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
            const ctx = new AudioCtx();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.frequency.value = style === 'error' ? 200 : 600;
            gainNode.gain.value = 0.01;
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.05);
            return true;
        }
    } catch {
        // Silent fail — not all environments support AudioContext
    }
    return false;
}

// ─── Geolocation ─────────────────────────────────────────────────────────────
export interface GeolocationResult {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    country?: string;
    formattedAddress?: string;
}

export function getCurrentPosition(timeoutMs = 10000): Promise<GeolocationResult> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const result: GeolocationResult = { latitude, longitude };

                // Try reverse geocoding with free Nominatim API
                try {
                    const resp = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    if (resp.ok) {
                        const data = await resp.json();
                        const addr = data.address || {};
                        result.city = addr.city || addr.town || addr.village || addr.hamlet || '';
                        result.state = addr.state || '';
                        result.country = addr.country || '';
                        result.formattedAddress = data.display_name || '';
                    }
                } catch {
                    // Geocoding is best-effort
                }

                resolve(result);
            },
            (err) => reject(err),
            { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300000 }
        );
    });
}

// ─── Pull-to-Refresh ─────────────────────────────────────────────────────────
export interface PullToRefreshOptions {
    onRefresh: () => void | Promise<void>;
    threshold?: number;       // px to pull before triggering
    resistance?: number;      // drag resistance factor (higher = harder to pull)
    maxPull?: number;         // max pull distance in px
}

export function initPullToRefresh(options: PullToRefreshOptions): () => void {
    const { onRefresh, threshold = 80, resistance = 2.5, maxPull = 140 } = options;

    let startY = 0;
    let pulling = false;
    let indicator: HTMLDivElement | null = null;

    const createIndicator = () => {
        const el = document.createElement('div');
        el.style.cssText = `
            position: fixed; top: -60px; left: 50%; transform: translateX(-50%);
            width: 44px; height: 44px; border-radius: 50%; background: #1e3a8a;
            display: flex; align-items: center; justify-content: center;
            z-index: 99999; transition: top 0.2s ease; color: white; font-size: 18px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        el.textContent = '↓';
        document.body.appendChild(el);
        return el;
    };

    const onTouchStart = (e: TouchEvent) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
            pulling = true;
            if (!indicator) indicator = createIndicator();
        }
    };

    const onTouchMove = (e: TouchEvent) => {
        if (!pulling) return;
        const pullDistance = Math.min((e.touches[0].clientY - startY) / resistance, maxPull);
        if (pullDistance < 0) return;

        if (indicator) {
            const top = pullDistance - 44;
            indicator.style.top = `${top}px`;
            indicator.textContent = pullDistance >= threshold ? '↻' : '↓';
        }
    };

    const onTouchEnd = async () => {
        if (!pulling) return;
        pulling = false;

        if (indicator) {
            const currentTop = parseFloat(indicator.style.top);
            const pullDistance = (currentTop + 44) * resistance;

            if (pullDistance >= threshold) {
                indicator.textContent = '↻';
                indicator.style.top = '10px';
                await onRefresh();
                await new Promise((r) => setTimeout(r, 500));
            }

            indicator.style.top = '-60px';
            setTimeout(() => {
                indicator?.remove();
                indicator = null;
            }, 300);
        }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
        document.removeEventListener('touchstart', onTouchStart);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        indicator?.remove();
    };
}

// ─── Debounced Auto-Save ─────────────────────────────────────────────────────
let _autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedAutoSave(
    key: string,
    data: unknown,
    delayMs = 400,
    onSaved?: () => void
): void {
    if (_autoSaveTimer) clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(() => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            onSaved?.();
        } catch {
            // localStorage may be full or disabled
        }
    }, delayMs);
}

export function loadFromStorage<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function removeFromStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        // silent
    }
}

// ─── Swipe Detection ─────────────────────────────────────────────────────────
export interface SwipeCallbacks {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
}

export function initSwipeDetection(
    element: HTMLElement,
    callbacks: SwipeCallbacks,
    opts?: { threshold?: number }
): () => void {
    const threshold = opts?.threshold ?? 50;
    let startX = 0;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - startX;
        const diffY = endY - startY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) callbacks.onSwipeRight?.();
                else callbacks.onSwipeLeft?.();
            }
        } else {
            if (Math.abs(diffY) > threshold) {
                if (diffY > 0) callbacks.onSwipeDown?.();
                else callbacks.onSwipeUp?.();
            }
        }
    };

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
        element.removeEventListener('touchstart', onTouchStart);
        element.removeEventListener('touchend', onTouchEnd);
    };
}
