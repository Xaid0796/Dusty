'use client';
import React, { useState } from 'react';
import { useCanvasStore } from '@/canvas/store';
import { ChartElement } from '@/canvas/types';
import { X, PieChart, BarChart2, TrendingUp } from 'lucide-react';

interface ChartsPanelProps {
  onClose: () => void;
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface ChartPresetDef {
  id: string; // design-1 to design-10
  name: string;
  desc: string;
  preview: React.ReactNode;
}

const PIE_PRESETS: ChartPresetDef[] = [
  {
    id: 'design-1',
    name: 'Clean Flat',
    desc: 'Solid traditional slices, flat minimal colors.',
    preview: (
      <g>
        <path d="M 12,12 L 12,3 A 9,9 0 0,1 21,12 Z" fill="#3b82f6" />
        <path d="M 12,12 L 21,12 A 9,9 0 0,1 12,21 Z" fill="#14b8a6" />
        <path d="M 12,12 L 12,21 A 9,9 0 0,1 3,12 A 9,9 0 0,1 12,3 Z" fill="#f59e0b" />
      </g>
    ),
  },
  {
    id: 'design-2',
    name: 'Donut Tech',
    desc: 'Tech-themed donut chart with hollow inner mask.',
    preview: (
      <g>
        <path d="M 12,3 A 9,9 0 0,1 21,12 L 18,12 A 6,6 0 0,0 12,6 Z" fill="#10b981" />
        <path d="M 21,12 A 9,9 0 0,1 12,21 L 12,18 A 6,6 0 0,0 18,12 Z" fill="#6366f1" />
        <path d="M 12,21 A 9,9 0 0,1 3,12 A 9,9 0 0,1 12,3 L 12,6 A 6,6 0 0,0 6,12 A 6,6 0 0,0 12,18 Z" fill="#f59e0b" />
      </g>
    ),
  },
  {
    id: 'design-3',
    name: 'Cyberpunk Glow',
    desc: 'Hot neon contrast pie with outer shadow layers.',
    preview: (
      <g>
        <path d="M 12,12 L 12,4 A 8,8 0 0,1 20,12 Z" fill="#38bdf8" />
        <path d="M 12,12 L 20,12 A 8,8 0 0,1 12,20 Z" fill="#f43f5e" />
        <path d="M 12,12 L 12,20 A 8,8 0 0,1 4,12 A 8,8 0 0,1 12,4 Z" fill="#a855f7" />
      </g>
    ),
  },
  {
    id: 'design-4',
    name: 'Earthy Split',
    desc: 'Earthy terracotta palette with exploded gaps.',
    preview: (
      <g transform="scale(0.95) translate(0.6, 0.6)">
        <path d="M 11.5,11.5 L 11.5,3 A 8.5,8.5 0 0,1 20,11.5 Z" fill="#c2410c" />
        <path d="M 12.5,12.5 L 21,12.5 A 8.5,8.5 0 0,1 12.5,21 Z" fill="#15803d" />
        <path d="M 11.5,12.5 L 11.5,21 A 8.5,8.5 0 0,1 3,12.5 A 8.5,8.5 0 0,1 11.5,3.5 Z" fill="#b45309" />
      </g>
    ),
  },
  {
    id: 'design-5',
    name: 'Indigo Donut',
    desc: 'Professional monochromatic indigo ring.',
    preview: (
      <g>
        <path d="M 12,3 A 9,9 0 0,1 21,12 L 18,12 A 6,6 0 0,0 12,6 Z" fill="#1e3a8a" />
        <path d="M 21,12 A 9,9 0 0,1 12,21 L 12,18 A 6,6 0 0,0 18,12 Z" fill="#2563eb" />
        <path d="M 12,21 A 9,9 0 0,1 3,12 A 9,9 0 0,1 12,3 L 12,6 A 6,6 0 0,0 6,12 A 6,6 0 0,0 12,18 Z" fill="#60a5fa" />
      </g>
    ),
  },
  {
    id: 'design-6',
    name: 'Frosted Glass',
    desc: 'Translucent ice shades, white border outlines.',
    preview: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <path d="M 12,3 A 9,9 0 0,1 21,12 L 18,12 A 6,6 0 0,0 12,6 Z" fill="rgba(255,255,255,0.7)" stroke="#ffffff" strokeWidth="0.5" />
        <path d="M 21,12 A 9,9 0 0,1 12,21 L 12,18 A 6,6 0 0,0 18,12 Z" fill="rgba(255,255,255,0.4)" stroke="#ffffff" strokeWidth="0.5" />
        <path d="M 12,21 A 9,9 0 0,1 3,12 A 9,9 0 0,1 12,3 L 12,6 A 6,6 0 0,0 6,12 A 6,6 0 0,0 12,18 Z" fill="rgba(255,255,255,0.2)" stroke="#ffffff" strokeWidth="0.5" />
      </g>
    ),
  },
  {
    id: 'design-7',
    name: 'Comic Bold',
    desc: 'Retro contrast colors with heavy outline borders.',
    preview: (
      <g>
        <path d="M 12,12 L 12,3 A 9,9 0 0,1 21,12 Z" fill="#dc2626" stroke="#000000" strokeWidth="1.5" />
        <path d="M 12,12 L 21,12 A 9,9 0 0,1 12,21 Z" fill="#eab308" stroke="#000000" strokeWidth="1.5" />
        <path d="M 12,12 L 12,21 A 9,9 0 0,1 3,12 A 9,9 0 0,1 12,3 Z" fill="#2563eb" stroke="#000000" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    id: 'design-8',
    name: 'Corporate Slate',
    desc: 'Clean corporate slate grey gradient theme.',
    preview: (
      <g>
        <path d="M 12,12 L 12,3 A 9,9 0 0,1 21,12 Z" fill="#cbd5e1" />
        <path d="M 12,12 L 21,12 A 9,9 0 0,1 12,21 Z" fill="#94a3b8" />
        <path d="M 12,12 L 12,21 A 9,9 0 0,1 3,12 A 9,9 0 0,1 12,3 Z" fill="#64748b" />
      </g>
    ),
  },
  {
    id: 'design-9',
    name: 'Material Shadow',
    desc: 'Material UI layout, soft shadows.',
    preview: (
      <g>
        <path d="M 12,12 L 12,3 A 9,9 0 0,1 21,12 Z" fill="#f43f5e" />
        <path d="M 12,12 L 21,12 A 9,9 0 0,1 12,21 Z" fill="#3b82f6" />
        <path d="M 12,12 L 12,21 A 9,9 0 0,1 3,12 A 9,9 0 0,1 12,3 Z" fill="#ec4899" />
      </g>
    ),
  },
  {
    id: 'design-10',
    name: 'Gradient Luxe',
    desc: 'Luxurious gradients with a donut ring.',
    preview: (
      <g>
        <path d="M 12,3 A 9,9 0 0,1 21,12 L 18,12 A 6,6 0 0,0 12,6 Z" fill="#818cf8" />
        <path d="M 21,12 A 9,9 0 0,1 12,21 L 12,18 A 6,6 0 0,0 18,12 Z" fill="#34d399" />
        <path d="M 12,21 A 9,9 0 0,1 3,12 A 9,9 0 0,1 12,3 L 12,6 A 6,6 0 0,0 6,12 A 6,6 0 0,0 12,18 Z" fill="#fb7185" />
      </g>
    ),
  },
];

const BAR_PRESETS: ChartPresetDef[] = [
  {
    id: 'design-1',
    name: 'Clean Columns',
    desc: 'Classic sharp vertical columns.',
    preview: (
      <g>
        <rect x="4" y="6" width="3.5" height="12" fill="#3b82f6" />
        <rect x="10" y="3" width="3.5" height="15" fill="#14b8a6" />
        <rect x="16" y="9" width="3.5" height="9" fill="#f59e0b" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-2',
    name: 'Capsule Tech',
    desc: 'Pill-shaped vertical tech bars.',
    preview: (
      <g>
        <rect x="4" y="6" width="3.5" height="12" rx="1.75" fill="#10b981" />
        <rect x="10" y="3" width="3.5" height="15" rx="1.75" fill="#6366f1" />
        <rect x="16" y="9" width="3.5" height="9" rx="1.75" fill="#f59e0b" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-3',
    name: 'Neon Sticks',
    desc: 'Glowing vertical sticks with bubble markers.',
    preview: (
      <g>
        <line x1="5.75" y1="18" x2="5.75" y2="7" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="5.75" cy="7" r="2" fill="#38bdf8" />
        <line x1="11.75" y1="18" x2="11.75" y2="4" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11.75" cy="4" r="2" fill="#f43f5e" />
        <line x1="17.75" y1="18" x2="17.75" y2="10" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="17.75" cy="10" r="2" fill="#a855f7" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-4',
    name: 'Warm Horizontal',
    desc: 'Earthy horizontal bar layout.',
    preview: (
      <g>
        <rect x="4" y="4" width="12" height="3" fill="#c2410c" />
        <rect x="4" y="9" width="16" height="3" fill="#15803d" />
        <rect x="4" y="14" width="9" height="3" fill="#b45309" />
        <line x1="4" y1="2" x2="4" y2="20" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-5',
    name: 'Indigo Columns',
    desc: 'Monochromatic vertical columns.',
    preview: (
      <g>
        <rect x="4" y="6" width="3.5" height="12" fill="#1e3a8a" />
        <rect x="10" y="3" width="3.5" height="15" fill="#2563eb" />
        <rect x="16" y="9" width="3.5" height="9" fill="#60a5fa" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-6',
    name: 'Glass Frost',
    desc: 'Translucent columns, white border lines.',
    preview: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <rect x="4" y="7" width="3.5" height="11" fill="rgba(255,255,255,0.6)" stroke="#ffffff" strokeWidth="0.5" />
        <rect x="10" y="4" width="3.5" height="14" fill="rgba(255,255,255,0.4)" stroke="#ffffff" strokeWidth="0.5" />
        <rect x="16" y="10" width="3.5" height="8" fill="rgba(255,255,255,0.2)" stroke="#ffffff" strokeWidth="0.5" />
        <line x1="3" y1="18" x2="21" y2="18" stroke="#ffffff" strokeWidth="0.5" />
      </g>
    ),
  },
  {
    id: 'design-7',
    name: 'Retro Comic',
    desc: 'Thick black outlines with heavy block shading.',
    preview: (
      <g>
        <rect x="4" y="6" width="3.5" height="12" fill="#dc2626" stroke="#000000" strokeWidth="1.5" />
        <rect x="10" y="3" width="3.5" height="15" fill="#eab308" stroke="#000000" strokeWidth="1.5" />
        <rect x="16" y="9" width="3.5" height="9" fill="#2563eb" stroke="#000000" strokeWidth="1.5" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#000000" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    id: 'design-8',
    name: 'Slate Pillars',
    desc: 'Professional grey gradient pillars.',
    preview: (
      <g>
        <rect x="4" y="6" width="3.5" height="12" rx="1" fill="#cbd5e1" />
        <rect x="10" y="3" width="3.5" height="15" rx="1" fill="#94a3b8" />
        <rect x="16" y="9" width="3.5" height="9" rx="1" fill="#64748b" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#64748b" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-9',
    name: 'Soft Shadow',
    desc: 'Rounded top bars with shadow depth.',
    preview: (
      <g>
        <rect x="4" y="6" width="3.5" height="12" rx="1.5" fill="#f43f5e" />
        <rect x="10" y="3" width="3.5" height="15" rx="1.5" fill="#3b82f6" />
        <rect x="16" y="9" width="3.5" height="9" rx="1.5" fill="#ec4899" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-10',
    name: 'Luxe Pastel',
    desc: 'Beautiful vertical pastel columns.',
    preview: (
      <g>
        <rect x="4" y="6" width="3.5" height="12" rx="1.5" fill="#818cf8" />
        <rect x="10" y="3" width="3.5" height="15" rx="1.5" fill="#34d399" />
        <rect x="16" y="9" width="3.5" height="9" rx="1.5" fill="#fb7185" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
];

const LINE_PRESETS: ChartPresetDef[] = [
  {
    id: 'design-1',
    name: 'Standard Spline',
    desc: 'Standard smooth curve line.',
    preview: (
      <g>
        <path d="M 4,14 C 7,10 7,6 10,6 C 13,6 13,12 16,12 C 19,12 19,16 20,16" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        <circle cx="4" cy="14" r="1.5" fill="#3b82f6" />
        <circle cx="10" cy="6" r="1.5" fill="#3b82f6" />
        <circle cx="16" cy="12" r="1.5" fill="#3b82f6" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-2',
    name: 'Step Zigzag',
    desc: 'Step-like horizontal/vertical line transitions.',
    preview: (
      <g>
        <path d="M 4,14 L 10,14 L 10,6 L 16,6 L 16,12 L 20,12" fill="none" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="4" cy="14" r="1.5" fill="#10b981" />
        <circle cx="10" cy="6" r="1.5" fill="#6366f1" />
        <circle cx="16" cy="12" r="1.5" fill="#f59e0b" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-3',
    name: 'Neon Spline Area',
    desc: 'Curved spline with translucent glowing neon area fill.',
    preview: (
      <g>
        <path d="M 4,14 C 7,10 7,6 10,6 C 13,6 13,12 16,12 L 16,18 L 4,18 Z" fill="rgba(56,189,248,0.2)" />
        <path d="M 4,14 C 7,10 7,6 10,6 C 13,6 13,12 16,12" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="4" cy="14" r="1.5" fill="#38bdf8" />
        <circle cx="10" cy="6" r="1.5" fill="#f43f5e" />
        <circle cx="16" cy="12" r="1.5" fill="#a855f7" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-4',
    name: 'Earthy Linear',
    desc: 'Straight point-to-point terracotta paths.',
    preview: (
      <g>
        <path d="M 4,14 L 10,6 L 16,12 L 20,8" fill="none" stroke="#c2410c" strokeWidth="1.5" />
        <circle cx="4" cy="14" r="1.5" fill="#c2410c" />
        <circle cx="10" cy="6" r="1.5" fill="#c2410c" />
        <circle cx="16" cy="12" r="1.5" fill="#c2410c" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-5',
    name: 'Indigo Area',
    desc: 'Point-to-point path with dark indigo area fill.',
    preview: (
      <g>
        <path d="M 4,14 L 10,6 L 16,12 L 16,18 L 4,18 Z" fill="rgba(30,58,138,0.25)" />
        <path d="M 4,14 L 10,6 L 16,12" fill="none" stroke="#1e3a8a" strokeWidth="1.5" />
        <circle cx="4" cy="14" r="1.5" fill="#1e3a8a" />
        <circle cx="10" cy="6" r="1.5" fill="#2563eb" />
        <circle cx="16" cy="12" r="1.5" fill="#60a5fa" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-6',
    name: 'Glass spline',
    desc: 'Frosted white spline, ideal for overlays.',
    preview: (
      <g>
        <rect x="2" y="2" width="20" height="20" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <path d="M 4,14 C 7,10 7,6 10,6 C 13,6 13,12 16,12 L 16,18 L 4,18 Z" fill="rgba(255,255,255,0.08)" />
        <path d="M 4,14 C 7,10 7,6 10,6 C 13,6 13,12 16,12" fill="none" stroke="#ffffff" strokeWidth="1" />
        <circle cx="4" cy="14" r="1.2" fill="#ffffff" />
        <circle cx="10" cy="6" r="1.2" fill="#ffffff" />
        <circle cx="16" cy="12" r="1.2" fill="#ffffff" />
        <line x1="3" y1="18" x2="21" y2="18" stroke="#ffffff" strokeWidth="0.5" />
      </g>
    ),
  },
  {
    id: 'design-7',
    name: 'Comic Retro',
    desc: 'Heavy outlines, shadow styling retro feel.',
    preview: (
      <g>
        <path d="M 4,14 L 10,6 L 16,12" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
        <path d="M 4,14 L 10,6 L 16,12" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="4" cy="14" r="2.2" fill="#ffffff" stroke="#000000" strokeWidth="1" />
        <circle cx="10" cy="6" r="2.2" fill="#ffffff" stroke="#000000" strokeWidth="1" />
        <circle cx="16" cy="12" r="2.2" fill="#ffffff" stroke="#000000" strokeWidth="1" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#000000" strokeWidth="1.5" />
      </g>
    ),
  },
  {
    id: 'design-8',
    name: 'Dashed Slate',
    desc: 'Dashed slate line, professional corporate layout.',
    preview: (
      <g>
        <path d="M 4,14 L 10,6 L 16,12" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="4" cy="14" r="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.75" />
        <circle cx="10" cy="6" r="1.5" fill="#94a3b8" stroke="#64748b" strokeWidth="0.75" />
        <circle cx="16" cy="12" r="1.5" fill="#64748b" stroke="#64748b" strokeWidth="0.75" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-9',
    name: 'Material Wave',
    desc: 'Curved spline, material drop shadow points.',
    preview: (
      <g>
        <path d="M 4,14 C 7,10 7,6 10,6 C 13,6 13,12 16,12" fill="none" stroke="#f43f5e" strokeWidth="2" />
        <circle cx="4" cy="14" r="2" fill="#f43f5e" />
        <circle cx="10" cy="6" r="2" fill="#3b82f6" />
        <circle cx="16" cy="12" r="2" fill="#ec4899" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
  {
    id: 'design-10',
    name: 'Luxe Spline',
    desc: 'Gorgeous pastel spline with curves.',
    preview: (
      <g>
        <path d="M 4,14 C 7,10 7,6 10,6 C 13,6 13,12 16,12" fill="none" stroke="#818cf8" strokeWidth="2" />
        <circle cx="4" cy="14" r="1.8" fill="#818cf8" />
        <circle cx="10" cy="6" r="1.8" fill="#34d399" />
        <circle cx="16" cy="12" r="1.8" fill="#fb7185" />
        <line x1="2" y1="18" x2="22" y2="18" stroke="#cbd5e1" strokeWidth="0.75" />
      </g>
    ),
  },
];

export const ChartsPanel: React.FC<ChartsPanelProps> = ({ onClose }) => {
  const { document: doc, addElement } = useCanvasStore();
  const [activeTab, setActiveTab] = useState<'pie' | 'bar' | 'line'>('pie');

  const addChart = (chartType: 'pie' | 'bar' | 'line', designPreset: string) => {
    if (!doc) return;
    const cx = doc.page.width / 2;
    const cy = doc.page.height / 2;
    const width = 85;
    const height = 65;
    const maxZ = doc.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

    addElement({
      id: uid('chart'),
      type: 'chart',
      label: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      x: cx - width / 2,
      y: cy - height / 2,
      width,
      height,
      rotation: 0,
      zIndex: maxZ + 1,
      visible: true,
      locked: false,
      chartType,
      designPreset,
      data: [
        { label: 'Category A', value: 30 },
        { label: 'Category B', value: 50 },
        { label: 'Category C', value: 20 },
      ],
      showLegend: true,
      showValues: true,
      showLabels: true,
    } as any);
  };

  const currentPresets =
    activeTab === 'pie' ? PIE_PRESETS : activeTab === 'bar' ? BAR_PRESETS : LINE_PRESETS;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--border-panel, #e2e8f0)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-panel, #0f172a)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Charts Gallery
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-panel-muted, #64748b)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 5,
            display: 'flex',
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Tabs Selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 4,
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-panel, #e2e8f0)',
          flexShrink: 0,
        }}
      >
        {[
          { type: 'pie' as const, label: 'Pie', icon: PieChart },
          { type: 'bar' as const, label: 'Bar', icon: BarChart2 },
          { type: 'line' as const, label: 'Line', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 4px',
                background: isActive ? 'var(--primary-color, #3b82f6)' : 'var(--bg-panel-input, #f1f5f9)',
                color: isActive ? '#ffffff' : 'var(--text-panel, #0f172a)',
                border: '1px solid var(--border-panel, #cbd5e1)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 10,
                fontWeight: 700,
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Previews grid of the 10 designs */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {currentPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => addChart(activeTab, preset.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px 6px 8px',
                background: 'var(--bg-panel-input, #f8fafc)',
                border: '1px solid var(--border-panel, #e2e8f0)',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'center',
                minWidth: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-panel-btn-hover, #f1f5f9)';
                e.currentTarget.style.borderColor = 'var(--primary-color, #3b82f6)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-panel-input, #f8fafc)';
                e.currentTarget.style.borderColor = 'var(--border-panel, #e2e8f0)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {/* Graphic mini preview of the preset */}
              <div
                style={{
                  width: '100%',
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  border: '1px solid var(--border-panel, #cbd5e1)',
                  borderRadius: 6,
                  overflow: 'hidden',
                  padding: 2,
                  boxSizing: 'border-box',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
                  {preset.preview}
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
