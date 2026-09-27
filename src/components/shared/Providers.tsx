'use client';

import React from 'react';
import { SupportPopupProvider } from '@/components/shared/SupportPopup';
import { AdBlockDetector } from '@/components/shared/AdBlockDetector';
import { CookieConsent } from '@/components/shared/CookieConsent';
import { FAQBot } from '@/components/shared/FAQBot';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SupportPopupProvider>
            {children}
            <CookieConsent />
            <FAQBot />
        </SupportPopupProvider>
    );
}
