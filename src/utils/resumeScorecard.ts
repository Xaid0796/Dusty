// ============================================================
// RESUME HEALTH SCORECARD UTILITY
// Evaluates canvas text elements for ATS readiness and completeness.
// ============================================================

import { TextElement } from '@/canvas/types';

export interface ScorecardRule {
    id: string;
    label: string;
    weight: number;
    description: string;
    evaluate: (elements: TextElement[]) => boolean;
}

export const scorecardRules: ScorecardRule[] = [
    {
        id: 'email',
        label: 'Professional Email Address',
        weight: 15,
        description: 'Ensure a valid email format is included for recruiters.',
        evaluate: (elements) => elements.some((el) => /[\w.-]+@[\w.-]+\.\w+/.test(el.content))
    },
    {
        id: 'phone',
        label: 'Contact Phone Number',
        weight: 15,
        description: 'Include a reachable phone number (supports international and US formats).',
        evaluate: (elements) => elements.some((el) =>
            /(\+?1[-.\s]?)?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/.test(el.content) ||
            /(\+\d{1,3}[- ]?)?\d{10}/.test(el.content)
        )
    },
    {
        id: 'summary',
        label: 'Professional Summary / Objective',
        weight: 15,
        description: 'Add a concise professional summary or career objective at the top.',
        evaluate: (elements) => elements.some((el) => /summary|objective|profile|about|overview/i.test(el.content))
    },
    {
        id: 'experience',
        label: 'Work Experience Section',
        weight: 20,
        description: 'Add employment history or professional experience headings.',
        evaluate: (elements) => elements.some((el) => /experience|work history|employment|career/i.test(el.content))
    },
    {
        id: 'education',
        label: 'Education & Qualifications',
        weight: 15,
        description: 'Include your educational background, university, or degree details.',
        evaluate: (elements) => elements.some((el) => /education|university|degree|college|school|academic/i.test(el.content))
    },
    {
        id: 'skills',
        label: 'Skills & Expertise Section',
        weight: 20,
        description: 'List technical and professional skills for ATS keyword matching.',
        evaluate: (elements) => elements.some((el) => /skills|expertise|technologies|proficiencies|tools/i.test(el.content))
    }
];

export interface ScorecardResult {
    score: number;
    results: (ScorecardRule & { passed: boolean })[];
}

export function evaluateResumeScore(elements: TextElement[]): ScorecardResult {
    let totalScore = 0;
    const results = scorecardRules.map((rule) => {
        const passed = rule.evaluate(elements);
        if (passed) {
            totalScore += rule.weight;
        }
        return {
            ...rule,
            passed,
        };
    });

    return {
        score: totalScore,
        results,
    };
}
