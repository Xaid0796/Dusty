'use client';
import React from 'react';
import { useCanvasStore } from '@/canvas/store';
import { CanvasElement } from '@/canvas/types';
import { X, Sparkles, Wand2 } from 'lucide-react';

interface DesignPanelProps {
  onClose: () => void;
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface TextPresetDef {
  id: string;
  label: string;
  fontFamily: string;
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  letterSpacing: number;
  content: string;
}

// ── High-quality transparent SVG decorative assets ────────────────────────
// Each ornament is rendered as a transparent SVG data-URI image element.
// All assets have transparent backgrounds and clear decorative intent.

const makeSvgUri = (svgContent: string, vb = '0 0 100 100') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="100" height="100">${svgContent}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

interface OrnamentAsset {
  id: string;
  label: string;
  /** SVG string used as transparent PNG stand-in via data URI */
  svgUri: string;
  /** Preview SVG inner content for the panel thumbnail */
  preview: React.ReactNode;
  defaultWidth: number;
  defaultHeight: number;
}

const ORNAMENTS: OrnamentAsset[] = [
  // 1 — Laurel Wreath
  {
    id: 'ornament-laurel-wreath',
    label: 'Laurel Wreath',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#4a7c59" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50,10 C30,15 18,30 18,50 C18,70 30,85 50,90 C70,85 82,70 82,50 C82,30 70,15 50,10Z" opacity="0.18"/>
        <path d="M20,50 C20,30 34,16 50,14"/>
        <path d="M80,50 C80,30 66,16 50,14"/>
        <path d="M22,42 L16,38 M24,34 L18,28 M30,26 L26,20"/>
        <path d="M78,42 L84,38 M76,34 L82,28 M70,26 L74,20"/>
        <path d="M22,58 L16,62 M24,66 L18,72 M30,74 L26,80"/>
        <path d="M78,58 L84,62 M76,66 L82,72 M70,74 L74,80"/>
        <path d="M35,88 Q50,95 65,88"/>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M12,12 C8,14 6,17 6,20 C6,23 8,26 12,27 C16,26 18,23 18,20 C18,17 16,14 12,12Z" opacity="0.2" />
        <path d="M6,20 C6,15 9,12 12,11" />
        <path d="M18,20 C18,15 15,12 12,11" />
        <path d="M7,18 L5,17 M7.5,15 L5.5,13 M9,13 L7.5,11" />
        <path d="M17,18 L19,17 M16.5,15 L18.5,13 M15,13 L16.5,11" />
        <path d="M9,26 Q12,28 15,26" />
      </g>
    ),
    defaultWidth: 60,
    defaultHeight: 60,
  },
  // 2 — Art Deco Fan
  {
    id: 'ornament-art-deco-fan',
    label: 'Art Deco Fan',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#b8972a" stroke-width="2" stroke-linecap="round">
        <path d="M50,85 L50,20"/>
        <path d="M50,85 L20,30"/>
        <path d="M50,85 L80,30"/>
        <path d="M50,85 L12,50"/>
        <path d="M50,85 L88,50"/>
        <path d="M50,85 L15,65"/>
        <path d="M50,85 L85,65"/>
        <path d="M20,30 Q50,10 80,30" stroke-width="2.5"/>
        <path d="M15,50 Q50,28 85,50"/>
        <path d="M15,65 Q50,45 85,65"/>
        <circle cx="50" cy="85" r="4" fill="#b8972a" opacity="0.6"/>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M12,22 L12,8" />
        <path d="M12,22 L5,10" />
        <path d="M12,22 L19,10" />
        <path d="M12,22 L3,14" />
        <path d="M12,22 L21,14" />
        <path d="M5,10 Q12,6 19,10" strokeWidth="1.6" />
        <path d="M3.5,14 Q12,9 20.5,14" />
        <circle cx="12" cy="22" r="1.5" fill="currentColor" opacity="0.7" />
      </g>
    ),
    defaultWidth: 55,
    defaultHeight: 50,
  },
  // 3 — Ornate Corner Bracket
  {
    id: 'ornament-corner-bracket',
    label: 'Corner Bracket',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#3b4f8c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10,50 L10,10 L50,10"/>
        <path d="M15,45 L15,15 L45,15"/>
        <path d="M10,10 Q15,10 15,15"/>
        <path d="M20,25 C22,20 28,18 25,22 C22,26 20,30 24,28"/>
        <circle cx="10" cy="10" r="3" fill="#3b4f8c" opacity="0.5"/>
        <circle cx="50" cy="10" r="2" fill="#3b4f8c" opacity="0.4"/>
        <circle cx="10" cy="50" r="2" fill="#3b4f8c" opacity="0.4"/>
      </g>`,
      '0 0 60 60'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3,15 L3,3 L15,3" />
        <path d="M5,13 L5,5 L13,5" />
        <path d="M3,3 Q5,3 5,5" />
        <circle cx="3" cy="3" r="1.3" fill="currentColor" opacity="0.6" />
      </g>
    ),
    defaultWidth: 45,
    defaultHeight: 45,
  },
  // 4 — Fleur de Lis
  {
    id: 'ornament-fleur-de-lis',
    label: 'Fleur de Lis',
    svgUri: makeSvgUri(
      `<g fill="#6b3fa0" opacity="0.85">
        <path d="M50,5 C45,15 35,18 35,28 C35,36 42,40 50,40 C58,40 65,36 65,28 C65,18 55,15 50,5Z"/>
        <path d="M50,40 C40,42 28,50 28,62 C28,72 38,78 50,78 C62,78 72,72 72,62 C72,50 60,42 50,40Z"/>
        <path d="M20,30 C15,32 10,38 12,44 C14,50 22,52 28,50 C32,48 34,44 32,40 C30,36 25,30 20,30Z"/>
        <path d="M80,30 C85,32 90,38 88,44 C86,50 78,52 72,50 C68,48 66,44 68,40 C70,36 75,30 80,30Z"/>
        <ellipse cx="50" cy="88" rx="12" ry="5" opacity="0.5"/>
        <path d="M38,78 Q50,90 62,78" fill="none" stroke="#6b3fa0" stroke-width="3"/>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="currentColor" opacity="0.8">
        <path d="M12,2 C10.5,5 8,6 8,9 C8,12 10,13.5 12,13.5 C14,13.5 16,12 16,9 C16,6 13.5,5 12,2Z" />
        <path d="M12,13.5 C9,14 5,17 5,21 C5,24 8,26 12,26 C16,26 19,24 19,21 C19,17 15,14 12,13.5Z" />
        <path d="M5,10 C3,11 1,13 2,15 C3,17 6,18 8,17 C9,16 9.5,14 9,12 C8,11 6.5,9 5,10Z" />
        <path d="M19,10 C21,11 23,13 22,15 C21,17 18,18 16,17 C15,16 14.5,14 15,12 C16,11 17.5,9 19,10Z" />
      </g>
    ),
    defaultWidth: 45,
    defaultHeight: 50,
  },
  // 5 — Vintage Divider Flourish
  {
    id: 'ornament-flourish-divider',
    label: 'Flourish Divider',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#8b5e3c" stroke-width="2" stroke-linecap="round">
        <line x1="5" y1="50" x2="35" y2="50"/>
        <line x1="65" y1="50" x2="95" y2="50"/>
        <path d="M35,50 Q40,38 50,38 Q60,38 65,50"/>
        <path d="M42,50 Q45,44 50,44 Q55,44 58,50"/>
        <circle cx="50" cy="50" r="3" fill="#8b5e3c" opacity="0.7"/>
        <path d="M18,44 C16,40 14,42 16,46 C18,50 16,54 14,50"/>
        <path d="M82,44 C84,40 86,42 84,46 C82,50 84,54 86,50"/>
      </g>`,
      '0 0 100 60'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <line x1="1" y1="12" x2="7" y2="12" />
        <line x1="17" y1="12" x2="23" y2="12" />
        <path d="M7,12 Q9,8 12,8 Q15,8 17,12" />
        <path d="M9,12 Q10.5,10 12,10 Q13.5,10 15,12" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" opacity="0.7" />
      </g>
    ),
    defaultWidth: 120,
    defaultHeight: 20,
  },
  // 6 — Baroque Scroll Frame
  {
    id: 'ornament-baroque-scroll',
    label: 'Baroque Scroll',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#c0954a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15,15 C15,8 22,5 28,10 C22,10 20,14 22,18 C24,22 30,20 30,15"/>
        <path d="M85,15 C85,8 78,5 72,10 C78,10 80,14 78,18 C76,22 70,20 70,15"/>
        <path d="M15,85 C15,92 22,95 28,90 C22,90 20,86 22,82 C24,78 30,80 30,85"/>
        <path d="M85,85 C85,92 78,95 72,90 C78,90 80,86 78,82 C76,78 70,80 70,85"/>
        <rect x="30" y="15" width="40" height="70" rx="2" opacity="0.15" fill="#c0954a"/>
        <line x1="30" y1="15" x2="70" y2="15"/>
        <line x1="30" y1="85" x2="70" y2="85"/>
        <line x1="15" y1="30" x2="15" y2="70"/>
        <line x1="85" y1="30" x2="85" y2="70"/>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4,4 C4,2 5.5,1 7,2.5 C5.5,2.5 5,3.5 5.5,4.5 C6,5.5 7.5,5 7.5,4" />
        <path d="M20,4 C20,2 18.5,1 17,2.5 C18.5,2.5 19,3.5 18.5,4.5 C18,5.5 16.5,5 16.5,4" />
        <path d="M4,20 C4,22 5.5,23 7,21.5 C5.5,21.5 5,20.5 5.5,19.5 C6,18.5 7.5,19 7.5,20" />
        <path d="M20,20 C20,22 18.5,23 17,21.5 C18.5,21.5 19,20.5 18.5,19.5 C18,18.5 16.5,19 16.5,20" />
        <rect x="7.5" y="4" width="9" height="16" rx="0.5" opacity="0.15" fill="currentColor" />
        <line x1="7.5" y1="4" x2="16.5" y2="4" />
        <line x1="7.5" y1="20" x2="16.5" y2="20" />
        <line x1="4" y1="7.5" x2="4" y2="16.5" />
        <line x1="20" y1="7.5" x2="20" y2="16.5" />
      </g>
    ),
    defaultWidth: 65,
    defaultHeight: 65,
  },
  // 7 — Mandala Ring
  {
    id: 'ornament-mandala-ring',
    label: 'Mandala Ring',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#d44a78" stroke-width="1.8" stroke-linecap="round">
        <circle cx="50" cy="50" r="40" opacity="0.25"/>
        <circle cx="50" cy="50" r="30" opacity="0.4"/>
        <circle cx="50" cy="50" r="8"/>
        ${Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = 50 + 12 * Math.cos(a), y1 = 50 + 12 * Math.sin(a);
        const x2 = 50 + 28 * Math.cos(a), y2 = 50 + 28 * Math.sin(a);
        const x3 = 50 + 38 * Math.cos(a), y3 = 50 + 38 * Math.sin(a);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><circle cx="${x3}" cy="${y3}" r="2.5" fill="#d44a78" opacity="0.6"/>`;
      }).join('')}
        ${Array.from({ length: 6 }, (_, i) => {
        const a = ((i * 60 + 30) * Math.PI) / 180;
        const mx = 50 + 20 * Math.cos(a), my = 50 + 20 * Math.sin(a);
        return `<circle cx="${mx}" cy="${my}" r="3" fill="#d44a78" opacity="0.35"/>`;
      }).join('')}
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" opacity="0.2" />
        <circle cx="12" cy="12" r="6.5" opacity="0.4" />
        <circle cx="12" cy="12" r="2" />
        <line x1="12" y1="4.5" x2="12" y2="9" /><line x1="12" y1="15" x2="12" y2="19.5" />
        <line x1="4.5" y1="12" x2="9" y2="12" /><line x1="15" y1="12" x2="19.5" y2="12" />
        <line x1="6.9" y1="6.9" x2="9.8" y2="9.8" /><line x1="14.2" y1="14.2" x2="17.1" y2="17.1" />
        <line x1="17.1" y1="6.9" x2="14.2" y2="9.8" /><line x1="9.8" y1="14.2" x2="6.9" y2="17.1" />
      </g>
    ),
    defaultWidth: 55,
    defaultHeight: 55,
  },
  // 8 — Feather Plume
  {
    id: 'ornament-feather-plume',
    label: 'Feather Plume',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#3d7a5c" stroke-width="2" stroke-linecap="round">
        <path d="M50,90 C50,90 30,70 28,45 C26,25 38,10 50,8 C62,10 74,25 72,45 C70,70 50,90 50,90Z" opacity="0.18" fill="#3d7a5c"/>
        <path d="M50,90 L50,8"/>
        <path d="M50,25 C44,22 38,24 36,30"/>
        <path d="M50,35 C42,30 34,33 32,40"/>
        <path d="M50,45 C40,40 32,43 30,50"/>
        <path d="M50,55 C40,52 33,54 32,60"/>
        <path d="M50,65 C42,63 36,66 36,70"/>
        <path d="M50,25 C56,22 62,24 64,30"/>
        <path d="M50,35 C58,30 66,33 68,40"/>
        <path d="M50,45 C60,40 68,43 70,50"/>
        <path d="M50,55 C60,52 67,54 68,60"/>
        <path d="M50,65 C58,63 64,66 64,70"/>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M12,22 C12,22 7,17 6.5,11 C6,6 9.5,2 12,2 C14.5,2 18,6 17.5,11 C17,17 12,22 12,22Z" opacity="0.15" fill="currentColor" />
        <path d="M12,22 L12,2" />
        <path d="M12,6 C10,5 8,5.5 7.5,7.5" />
        <path d="M12,9.5 C9.5,8 7,9 6.5,11" />
        <path d="M12,13 C9.5,12 7.5,13 7,15" />
        <path d="M12,6 C14,5 16,5.5 16.5,7.5" />
        <path d="M12,9.5 C14.5,8 17,9 17.5,11" />
        <path d="M12,13 C14.5,12 16.5,13 17,15" />
      </g>
    ),
    defaultWidth: 40,
    defaultHeight: 65,
  },
  // 9 — Celtic Knot
  {
    id: 'ornament-celtic-knot',
    label: 'Celtic Knot',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#1a5c8c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50,15 C38,15 28,25 28,37 C28,49 38,59 50,59 C62,59 72,49 72,37 C72,25 62,15 50,15"/>
        <path d="M50,25 C43,25 37,31 37,38 C37,45 43,51 50,51 C57,51 63,45 63,38 C63,31 57,25 50,25"/>
        <path d="M37,30 C30,22 20,25 18,33 C16,41 22,49 30,47 C36,45 38,38 35,33"/>
        <path d="M63,30 C70,22 80,25 82,33 C84,41 78,49 70,47 C64,45 62,38 65,33"/>
        <path d="M37,46 C30,54 20,51 18,62 C16,70 28,78 38,72 C44,68 44,60 40,56"/>
        <path d="M63,46 C70,54 80,51 82,62 C84,70 72,78 62,72 C56,68 56,60 60,56"/>
        <path d="M40,72 Q50,82 60,72"/>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12,4 C9,4 6.5,6.5 6.5,9.5 C6.5,12.5 9,15 12,15 C15,15 17.5,12.5 17.5,9.5 C17.5,6.5 15,4 12,4" />
        <path d="M6.5,7 C4,5 1.5,6 1,8.5 C0.5,11 2.5,13.5 5,13 C6.5,12.5 7,10.5 6,8.5" />
        <path d="M17.5,7 C20,5 22.5,6 23,8.5 C23.5,11 21.5,13.5 19,13 C17.5,12.5 17,10.5 18,8.5" />
        <path d="M6.5,13 C4,16 1.5,15 1,18 C0.5,20.5 4,22.5 7,21 C8.5,20 9,18 7.5,16" />
        <path d="M17.5,13 C20,16 22.5,15 23,18 C23.5,20.5 20,22.5 17,21 C15.5,20 15,18 16.5,16" />
      </g>
    ),
    defaultWidth: 58,
    defaultHeight: 65,
  },
  // 10 — Vintage Star Burst
  {
    id: 'ornament-starburst',
    label: 'Star Burst',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#c0892a" stroke-width="2" stroke-linecap="round">
        ${Array.from({ length: 16 }, (_, i) => {
        const a = (i * 22.5 * Math.PI) / 180;
        const inner = i % 2 === 0 ? 20 : 30;
        const outer = i % 2 === 0 ? 45 : 42;
        const x1 = 50 + inner * Math.cos(a), y1 = 50 + inner * Math.sin(a);
        const x2 = 50 + outer * Math.cos(a), y2 = 50 + outer * Math.sin(a);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      }).join('')}
        <circle cx="50" cy="50" r="18" opacity="0.2" fill="#c0892a"/>
        <circle cx="50" cy="50" r="10"/>
        <circle cx="50" cy="50" r="4" fill="#c0892a" opacity="0.6"/>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" />
        <line x1="5.4" y1="5.4" x2="18.6" y2="18.6" /><line x1="18.6" y1="5.4" x2="5.4" y2="18.6" />
        <line x1="12" y1="4.5" x2="15" y2="9" /><line x1="12" y1="19.5" x2="9" y2="15" />
        <circle cx="12" cy="12" r="4" opacity="0.25" fill="currentColor" />
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.7" />
      </g>
    ),
    defaultWidth: 55,
    defaultHeight: 55,
  },
  // 11 — Art Nouveau Branch
  {
    id: 'ornament-nouveau-branch',
    label: 'Art Nouveau Branch',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#5a7a3a" stroke-width="2" stroke-linecap="round">
        <path d="M10,90 C15,70 25,55 35,45 C45,35 55,30 65,20 C72,13 78,8 85,8"/>
        <path d="M35,45 C28,38 20,38 16,44 C12,50 15,58 22,56"/>
        <path d="M50,32 C46,22 38,18 33,24 C28,30 31,40 38,38"/>
        <path d="M65,20 C62,12 56,8 52,13 C48,18 51,26 57,24"/>
        <path d="M45,58 C40,52 42,44 49,44 C56,44 59,52 55,56"/>
        <ellipse cx="35" cy="46" rx="5" ry="7" fill="#5a7a3a" opacity="0.25" transform="rotate(-30 35 46)"/>
        <ellipse cx="50" cy="33" rx="5" ry="7" fill="#5a7a3a" opacity="0.25" transform="rotate(-45 50 33)"/>
        <ellipse cx="65" cy="21" rx="4" ry="6" fill="#5a7a3a" opacity="0.25" transform="rotate(-50 65 21)"/>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M3,22 C5,16 8,12 11,9 C14,6 17,5 20,2" />
        <path d="M11,9 C9,7 6,7 5,9 C4,11 5,14 7.5,13" />
        <path d="M17,5 C16,3 13.5,2.5 13,4 C12,6 13.5,8.5 15.5,8" />
        <ellipse cx="11" cy="9" rx="2" ry="3" fill="currentColor" opacity="0.2" transform="rotate(-30 11 9)" />
      </g>
    ),
    defaultWidth: 55,
    defaultHeight: 65,
  },
  // 12 — Diamond Chain Divider
  {
    id: 'ornament-diamond-chain',
    label: 'Diamond Chain',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#7b4f9e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="30" x2="20" y2="30"/>
        <polygon points="20,30 27,22 34,30 27,38" fill="#7b4f9e" opacity="0.25"/>
        <line x1="34" y1="30" x2="41" y2="30"/>
        <polygon points="41,30 48,22 55,30 48,38" fill="#7b4f9e" opacity="0.4"/>
        <line x1="55" y1="30" x2="62" y2="30"/>
        <polygon points="62,30 69,22 76,30 69,38" fill="#7b4f9e" opacity="0.25"/>
        <line x1="76" y1="30" x2="95" y2="30"/>
        <circle cx="50" cy="30" r="3.5" fill="#7b4f9e" opacity="0.6"/>
      </g>`,
      '0 0 100 60'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="12" x2="5" y2="12" />
        <polygon points="5,12 8,9 11,12 8,15" fill="currentColor" opacity="0.25" />
        <line x1="11" y1="12" x2="13" y2="12" />
        <polygon points="13,12 16,9 19,12 16,15" fill="currentColor" opacity="0.4" />
        <line x1="19" y1="12" x2="23" y2="12" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
      </g>
    ),
    defaultWidth: 120,
    defaultHeight: 25,
  },
  // 13 — Royal Crown
  {
    id: 'ornament-royal-crown',
    label: 'Royal Crown',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#c5a028" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15,70 L15,35 L30,50 L50,20 L70,50 L85,35 L85,70 Z" fill="#c5a028" opacity="0.15"/>
        <path d="M15,70 L15,35 L30,50 L50,20 L70,50 L85,35 L85,70 Z"/>
        <line x1="15" y1="70" x2="85" y2="70"/>
        <line x1="15" y1="78" x2="85" y2="78"/>
        <circle cx="50" cy="20" r="5" fill="#c5a028" opacity="0.6"/>
        <circle cx="30" cy="50" r="4" fill="#c5a028" opacity="0.45"/>
        <circle cx="70" cy="50" r="4" fill="#c5a028" opacity="0.45"/>
        <circle cx="15" cy="35" r="3" fill="#c5a028" opacity="0.4"/>
        <circle cx="85" cy="35" r="3" fill="#c5a028" opacity="0.4"/>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3,19 L3,10 L7,13 L12,5 L17,13 L21,10 L21,19 Z" fill="currentColor" opacity="0.15" />
        <path d="M3,19 L3,10 L7,13 L12,5 L17,13 L21,10 L21,19 Z" />
        <line x1="3" y1="19" x2="21" y2="19" />
        <circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.7" />
        <circle cx="7" cy="13" r="1.2" fill="currentColor" opacity="0.5" />
        <circle cx="17" cy="13" r="1.2" fill="currentColor" opacity="0.5" />
      </g>
    ),
    defaultWidth: 60,
    defaultHeight: 50,
  },
  // 14 — Vintage Compass Rose
  {
    id: 'ornament-compass-rose',
    label: 'Compass Rose',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#2c5f82" stroke-width="1.8" stroke-linecap="round">
        <circle cx="50" cy="50" r="35" opacity="0.2"/>
        <circle cx="50" cy="50" r="6"/>
        <path d="M50,15 L55,45 L50,50 L45,45 Z" fill="#2c5f82" opacity="0.5"/>
        <path d="M50,85 L55,55 L50,50 L45,55 Z" fill="#2c5f82" opacity="0.3"/>
        <path d="M15,50 L45,55 L50,50 L45,45 Z" fill="#2c5f82" opacity="0.3"/>
        <path d="M85,50 L55,55 L50,50 L55,45 Z" fill="#2c5f82" opacity="0.5"/>
        <path d="M26,26 L46,47 L50,50 L47,46 Z" opacity="0.4"/>
        <path d="M74,26 L54,47 L50,50 L53,46 Z" opacity="0.4"/>
        <path d="M26,74 L46,53 L50,50 L47,54 Z" opacity="0.4"/>
        <path d="M74,74 L54,53 L50,50 L53,54 Z" opacity="0.4"/>
        <text x="50" y="11" text-anchor="middle" font-size="8" fill="#2c5f82" font-family="serif" font-weight="bold">N</text>
        <text x="50" y="95" text-anchor="middle" font-size="8" fill="#2c5f82" font-family="serif">S</text>
        <text x="89" y="53" text-anchor="middle" font-size="8" fill="#2c5f82" font-family="serif">E</text>
        <text x="11" y="53" text-anchor="middle" font-size="8" fill="#2c5f82" font-family="serif">W</text>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="12" cy="12" r="8" opacity="0.2" />
        <circle cx="12" cy="12" r="1.5" />
        <path d="M12,4 L13.2,10 L12,12 L10.8,10 Z" fill="currentColor" opacity="0.6" />
        <path d="M12,20 L13.2,14 L12,12 L10.8,14 Z" fill="currentColor" opacity="0.4" />
        <path d="M4,12 L10,13.2 L12,12 L10,10.8 Z" fill="currentColor" opacity="0.4" />
        <path d="M20,12 L14,13.2 L12,12 L14,10.8 Z" fill="currentColor" opacity="0.6" />
        <path d="M6,6 L11,11 L12,12 L11.3,11 Z" opacity="0.4" />
        <path d="M18,6 L13,11 L12,12 L12.7,11 Z" opacity="0.4" />
      </g>
    ),
    defaultWidth: 60,
    defaultHeight: 60,
  },
  // 15 — Elegant Amphora Vase
  {
    id: 'ornament-amphora-vase',
    label: 'Amphora Vase',
    svgUri: makeSvgUri(
      `<g fill="none" stroke="#8c4a2a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M38,10 C34,10 30,13 28,17 C26,21 28,26 32,28 C36,30 40,30 40,35 C40,55 38,70 35,80 C32,87 36,92 50,92 C64,92 68,87 65,80 C62,70 60,55 60,35 C60,30 64,30 68,28 C72,26 74,21 72,17 C70,13 66,10 62,10 Z" fill="#8c4a2a" opacity="0.1"/>
        <path d="M38,10 C34,10 30,13 28,17 C26,21 28,26 32,28 C36,30 40,30 40,35 C40,55 38,70 35,80 C32,87 36,92 50,92 C64,92 68,87 65,80 C62,70 60,55 60,35 C60,30 64,30 68,28 C72,26 74,21 72,17 C70,13 66,10 62,10 Z"/>
        <line x1="38" y1="10" x2="62" y2="10"/>
        <path d="M42,35 Q50,32 58,35"/>
        <path d="M41,50 Q50,47 59,50"/>
        <path d="M41,65 Q50,62 59,65"/>
        <ellipse cx="50" cy="10" rx="12" ry="3" opacity="0.5"/>
      </g>`,
      '0 0 100 100'
    ),
    preview: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9,3 C8,3 6.5,4 6,5.5 C5.5,7 6,8.5 7.5,9 C9,9.5 9.5,9.5 9.5,11 C9.5,15.5 9,18.5 8,21 C7,23 8.5,24 12,24 C15.5,24 17,23 16,21 C15,18.5 14.5,15.5 14.5,11 C14.5,9.5 15,9.5 16.5,9 C18,8.5 18.5,7 18,5.5 C17.5,4 16,3 15,3 Z" fill="currentColor" opacity="0.1" />
        <path d="M9,3 C8,3 6.5,4 6,5.5 C5.5,7 6,8.5 7.5,9 C9,9.5 9.5,9.5 9.5,11 C9.5,15.5 9,18.5 8,21 C7,23 8.5,24 12,24 C15.5,24 17,23 16,21 C15,18.5 14.5,15.5 14.5,11 C14.5,9.5 15,9.5 16.5,9 C18,8.5 18.5,7 18,5.5 C17.5,4 16,3 15,3 Z" />
        <line x1="9" y1="3" x2="15" y2="3" />
        <path d="M10,11 Q12,10 14,11" />
        <path d="M10,15 Q12,14 14,15" />
      </g>
    ),
    defaultWidth: 45,
    defaultHeight: 65,
  },
];

// ── Designer Text Presets (16 total: 6 original + 10 new) ─────────────────

const TEXT_PRESETS: TextPresetDef[] = [
  // Original 6
  {
    id: 'calligraphy-gold',
    label: 'Gold Calligraphy',
    fontFamily: 'Great Vibes',
    color: '#c5a85c',
    fontSize: 32,
    fontWeight: 'normal',
    fontStyle: 'italic',
    letterSpacing: 0,
    content: 'Elegant Script',
  },
  {
    id: 'brush-accent',
    label: 'Beautiful Brush',
    fontFamily: 'Alex Brush',
    color: '#1e3b8a',
    fontSize: 34,
    fontWeight: 'normal',
    fontStyle: 'italic',
    letterSpacing: 0,
    content: 'Alex Brush Presets',
  },
  {
    id: 'elegant-serif',
    label: 'Classic Serif',
    fontFamily: 'Playfair Display',
    color: '#0f172a',
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 3,
    content: 'ELEGANT HEADING',
  },
  {
    id: 'modern-minimal',
    label: 'Modern Sans',
    fontFamily: 'Montserrat',
    color: '#6366f1',
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 4,
    content: 'MINIMAL PRESET',
  },
  {
    id: 'creative-touch',
    label: 'Creative Touch',
    fontFamily: 'Dancing Script',
    color: '#ec4899',
    fontSize: 26,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 0,
    content: 'Creative Handwriting',
  },
  {
    id: 'traditional-luxury',
    label: 'Luxury Heading',
    fontFamily: 'Times New Roman',
    color: '#1e293b',
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 2,
    content: 'LUXURY TRADITION',
  },

  // 10 New Presets
  {
    id: 'rose-gold-script',
    label: 'Rose Gold Script',
    fontFamily: 'Pinyon Script',
    color: '#c9797a',
    fontSize: 30,
    fontWeight: 'normal',
    fontStyle: 'italic',
    letterSpacing: 0,
    content: 'Rose Gold Beauty',
  },
  {
    id: 'art-deco-title',
    label: 'Art Deco Title',
    fontFamily: 'Cinzel',
    color: '#b8972a',
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 6,
    content: 'ART DECO TITLE',
  },
  {
    id: 'gothic-bold',
    label: 'Gothic Slab',
    fontFamily: 'Libre Baskerville',
    color: '#1c1c1c',
    fontSize: 22,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 1,
    content: 'Gothic Bold Slab',
  },
  {
    id: 'monsieur-la',
    label: 'Monsieur Script',
    fontFamily: 'Monsieur La Doulaise',
    color: '#4a3060',
    fontSize: 28,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    content: 'Monsieur Script',
  },
  {
    id: 'tech-blueprint',
    label: 'Tech Blueprint',
    fontFamily: 'Space Mono',
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 2,
    content: 'TECH_BLUEPRINT_v1',
  },
  {
    id: 'vintage-poster',
    label: 'Vintage Poster',
    fontFamily: 'Oswald',
    color: '#b45309',
    fontSize: 22,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 3,
    content: 'VINTAGE POSTER',
  },
  {
    id: 'hand-note',
    label: 'Handwritten Note',
    fontFamily: 'Caveat',
    color: '#374151',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    content: 'A handwritten note',
  },
  {
    id: 'royal-italic',
    label: 'Royal Italic',
    fontFamily: 'Cormorant Garamond',
    color: '#3b1f6b',
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    letterSpacing: 1,
    content: 'Royal Italic Style',
  },
  {
    id: 'mrs-saint-delafield',
    label: 'Mrs Saint Delafield',
    fontFamily: 'Mrs Saint Delafield',
    color: '#9b2335',
    fontSize: 30,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    content: 'Mrs Saint Delafield',
  },
  {
    id: 'chalk-board',
    label: 'Chalk Display',
    fontFamily: 'Shadows Into Light',
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 1,
    content: 'Chalk Display Text',
  },
];

export const DesignPanel: React.FC<DesignPanelProps> = ({ onClose }) => {
  const { document: doc, addElement } = useCanvasStore();

  const addOrnament = (ornament: OrnamentAsset) => {
    if (!doc) return;
    const cx = doc.page.width / 2;
    const cy = doc.page.height / 2;
    const maxZ = doc.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

    const commaIdx = ornament.svgUri.indexOf(',');
    const decodedSvg = commaIdx !== -1 ? decodeURIComponent(ornament.svgUri.slice(commaIdx + 1)) : '';

    // Extract the default color from the decoded SVG
    const defaultColorMatch = decodedSvg.match(/stroke="([^"]+)"/) || decodedSvg.match(/fill="([^"]+)"/);
    const defaultColor = defaultColorMatch ? defaultColorMatch[1] : '#4a7c59';

    addElement({
      id: uid('ornament'),
      type: 'image',
      label: ornament.label,
      x: cx - ornament.defaultWidth / 2,
      y: cy - ornament.defaultHeight / 2,
      width: ornament.defaultWidth,
      height: ornament.defaultHeight,
      rotation: 0,
      zIndex: maxZ + 1,
      visible: true,
      locked: false,
      src: ornament.svgUri,
      objectFit: 'contain',
      objectPosition: '50% 50%',
      cropX: 50,
      cropY: 50,
      zoom: 1,
      borderRadius: 0,
      opacity: 1,
      // Custom properties for ornament colorization
      isOrnament: true,
      ornamentColor: defaultColor,
      ornamentSvgContent: decodedSvg,
    } as CanvasElement & { isOrnament?: boolean; ornamentColor?: string; ornamentSvgContent?: string });
  };

  const addTextPreset = (preset: TextPresetDef) => {
    if (!doc) return;
    const cx = doc.page.width / 2;
    const cy = doc.page.height / 2;
    const maxZ = doc.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
    const width = 100;
    const height = 15;

    addElement({
      id: uid('text'),
      type: 'text',
      label: preset.label,
      x: cx - width / 2,
      y: cy - height / 2,
      width,
      height,
      rotation: 0,
      zIndex: maxZ + 1,
      visible: true,
      locked: false,
      content: preset.content,
      style: {
        fontFamily: preset.fontFamily,
        fontSize: preset.fontSize,
        fontWeight: preset.fontWeight,
        fontStyle: preset.fontStyle,
        textDecoration: 'none',
        color: preset.color,
        textAlign: 'center',
        lineHeight: 1.3,
        letterSpacing: preset.letterSpacing,
        padding: 1,
      },
    } as CanvasElement);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--border-panel)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-panel)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} style={{ color: '#d4af37' }} />
          Design Presets
        </span>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-panel-muted)', cursor: 'pointer', padding: 4, borderRadius: 5, display: 'flex' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Main panel scroll container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Section 1: Decorative Ornaments */}
        <div>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-panel-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Decorative Ornaments · {ORNAMENTS.length}
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
            {ORNAMENTS.map((ornament) => (
              <button
                key={ornament.id}
                title={ornament.label}
                onClick={() => addOrnament(ornament)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '8px 3px 6px',
                  background: 'var(--bg-panel-input)',
                  border: '1px solid var(--border-panel)',
                  borderRadius: 9,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  color: 'var(--text-panel)',
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel-btn-hover)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel-input)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-panel)';
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" overflow="visible" style={{ color: 'var(--primary-color)' }}>
                  {ornament.preview}
                </svg>
                <span style={{ lineHeight: 1.2, textAlign: 'center', fontSize: 7.5, maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {ornament.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Designer Text */}
        <div>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-panel-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Designer Text Presets · {TEXT_PRESETS.length}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {TEXT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => addTextPreset(preset)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  background: 'var(--bg-panel-input)',
                  border: '1px solid var(--border-panel)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  color: 'var(--text-panel)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel-btn-hover)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel-input)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-panel)';
                }}
              >
                <Wand2 size={12} style={{ color: preset.color, flexShrink: 0 }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-panel)' }}>{preset.label}</div>
                  <div style={{
                    fontSize: 11,
                    fontFamily: preset.fontFamily,
                    color: preset.color,
                    fontStyle: preset.fontStyle,
                    fontWeight: preset.fontWeight,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    marginTop: 2,
                  }}>
                    {preset.content}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
