'use client';

import React from 'react';
import { SupportPopupProvider } from '@/components/shared/SupportPopup';
import { AdBlockDetector } from '@/components/shared/AdBlockDetector';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SupportPopupProvider>
            <AdBlockDetector>
                {children}
            </AdBlockDetector>
        </SupportPopupProvider>
    );
}
