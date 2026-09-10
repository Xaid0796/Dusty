// ============================================================
// RESUME SCORECARD PANEL COMPONENT
// Displays live ATS readiness score and checklist.
// ============================================================

'use client';

import React, { useMemo } from 'react';
import { useCanvasStore } from '@/canvas/store';
import { TextElement, CanvasElement } from '@/canvas/types';
import { evaluateResumeScore } from '@/utils/resumeScorecard';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export function ResumeScorecardPanel() {
    const document = useCanvasStore((state) => state.document);

    const { score, results } = useMemo(() => {
        const elements = document?.elements || [];
        const textEls = elements.filter((el: CanvasElement): el is TextElement => el.type === 'text');
        return evaluateResumeScore(textEls);
    }, [document]);

    const getScoreColor = (s: number) => {
        if (s >= 75) return '#10B981'; // Green
        if (s >= 50) return '#F59E0B'; // Amber
        return '#EF4444'; // Red
    };

    return (
        <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} color="#2563EB" />
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#111827' }}>Resume Health & ATS</h3>
                </div>
                <div style={{
                    background: getScoreColor(score),
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    padding: '4px 10px',
                    borderRadius: '20px'
                }}>
                    {score}%
                </div>
            </div>

            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 14px 0' }}>
                Real-time checklist evaluating your document structure for recruiter readability and ATS compliance.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {results.map((rule) => (
                    <div
                        key={rule.id}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px',
                            background: rule.passed ? '#F0FDF4' : '#FEF2F2',
                            borderRadius: '8px',
                            border: `1px solid ${rule.passed ? '#BBF7D0' : '#FECCA7'}`
                        }}
                    >
                        {rule.passed ? (
                            <CheckCircle2 size={18} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                        ) : (
                            <AlertCircle size={18} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                        )}
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: rule.passed ? '#166534' : '#991B1B' }}>
                                {rule.label}
                            </div>
                            <div style={{ fontSize: '11px', color: rule.passed ? '#15803D' : '#B91C1C', marginTop: '2px' }}>
                                {rule.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
