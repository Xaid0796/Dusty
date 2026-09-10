'use client';

import React from 'react';
import { SupportPopupProvider } from '@/components/shared/SupportPopup';
import { AdBlockDetector } from '@/components/shared/AdBlockDetector';
import { CookieConsent } from '@/components/shared/CookieConsent';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SupportPopupProvider>
            <AdBlockDetector>
                {children}
                <CookieConsent />
            </AdBlockDetector>
        </SupportPopupProvider>
    );
}
