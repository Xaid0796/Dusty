import React from 'react';
import { GUIDES_DATA } from '../data';
import GuideDetailClient from './GuideDetailClient';

export async function generateStaticParams() {
    return GUIDES_DATA.map((guide) => ({
        slug: guide.slug,
    }));
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    return <GuideDetailClient slug={resolvedParams.slug} />;
}
