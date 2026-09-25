import React from 'react';
import { GUIDES_DATA } from '../data';
import GuideDetailClient from '@/app/guides/[slug]/GuideDetailClient';

export async function generateStaticParams() {
    return GUIDES_DATA.map((guide) => ({
        slug: guide.slug,
    }));
}

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function GuideDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    return <GuideDetailClient slug={resolvedParams.slug} />;
}
