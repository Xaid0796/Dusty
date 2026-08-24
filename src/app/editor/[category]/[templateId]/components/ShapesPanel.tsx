'use client';
import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/canvas/store';
import { CanvasElement } from '@/canvas/types';
import { X } from 'lucide-react';

interface ShapesPanelProps {
  onClose: () => void;
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface ShapeDef {
  id: string;
  label: string;
  preview: React.ReactNode;
  create: (cx: number, cy: number) => Partial<CanvasElement>;
}

const SHAPES: ShapeDef[] = [
  // Lines
  {
    id: 'diagonal-line',
    label: 'Diagonal Line',
    preview: <line x1="4" y1="4" x2="20" y2="20" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />,
    create: (cx, cy) => ({ type: 'diagonal-line', width: 40, height: 40, x: cx - 20, y: cy - 20, fill: 'transparent', stroke: '#64748b', strokeWidth: 2, opacity: 1, styleMode: 'outline' }),
  },
  // Basic shapes
  {
    id: 'circle',
    label: 'Circle',
    preview: <circle cx="12" cy="12" r="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'circle', width: 36, height: 36, x: cx - 18, y: cy - 18, fill: '#dbeafe', stroke: '#3b82f6', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'rect',
    label: 'Rectangle',
    preview: <rect x="4" y="6" width="16" height="12" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" rx="0" />,
    create: (cx, cy) => ({ type: 'rect', width: 50, height: 30, x: cx - 25, y: cy - 15, fill: '#e0e7ff', stroke: '#6366f1', strokeWidth: 1.5, borderRadius: 0, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'rect-round',
    label: 'Rounded Rect',
    preview: <rect x="4" y="6" width="16" height="12" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" rx="4" />,
    create: (cx, cy) => ({ type: 'rect', width: 50, height: 30, x: cx - 25, y: cy - 15, fill: '#e0e7ff', stroke: '#6366f1', strokeWidth: 1.5, borderRadius: 8, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'l-shape',
    label: 'L-Shape',
    preview: <polygon points="5,5 11,5 11,13 19,13 19,19 5,19" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'l-shape', width: 36, height: 36, x: cx - 18, y: cy - 18, fill: '#e2e8f0', stroke: '#475569', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  // Triangles
  {
    id: 'triangle',
    label: 'Triangle',
    preview: <polygon points="12,4 22,20 2,20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'triangle', width: 44, height: 38, x: cx - 22, y: cy - 19, fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'right-triangle',
    label: 'Right Triangle',
    preview: <polygon points="4,4 4,20 20,20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'right-triangle', width: 40, height: 40, x: cx - 20, y: cy - 20, fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'diamond',
    label: 'Diamond',
    preview: <polygon points="12,3 21,12 12,21 3,12" fill="#fae8ff" stroke="#a855f7" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'diamond', width: 36, height: 36, x: cx - 18, y: cy - 18, fill: '#fae8ff', stroke: '#a855f7', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'pentagon',
    label: 'Pentagon',
    preview: <polygon points="12,3 21,10 18,20 6,20 3,10" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'pentagon', width: 38, height: 36, x: cx - 19, y: cy - 18, fill: '#d1fae5', stroke: '#10b981', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'hexagon',
    label: 'Hexagon',
    preview: <polygon points="12,3 20.5,8 20.5,16 12,21 3.5,16 3.5,8" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'hexagon', width: 36, height: 36, x: cx - 18, y: cy - 18, fill: '#ffe4e6', stroke: '#f43f5e', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  // Arrows
  {
    id: 'arrow-right',
    label: 'Arrow Right',
    preview: <polygon points="3,9 13,9 13,4 21,12 13,20 13,15 3,15" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'arrow', width: 48, height: 24, x: cx - 24, y: cy - 12, fill: '#e0e7ff', stroke: '#6366f1', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'arrow-left',
    label: 'Arrow Left',
    preview: <polygon points="21,9 11,9 11,4 3,12 11,20 11,15 21,15" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'arrow-left', width: 48, height: 24, x: cx - 24, y: cy - 12, fill: '#e0e7ff', stroke: '#6366f1', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'arrow-up',
    label: 'Arrow Up',
    preview: <polygon points="9,21 9,11 4,11 12,3 20,11 15,11 15,21" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'arrow-up', width: 24, height: 48, x: cx - 12, y: cy - 24, fill: '#e0e7ff', stroke: '#6366f1', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'arrow-down',
    label: 'Arrow Down',
    preview: <polygon points="9,3 9,13 4,13 12,21 20,13 15,13 15,3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'arrow-down', width: 24, height: 48, x: cx - 12, y: cy - 24, fill: '#e0e7ff', stroke: '#6366f1', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  // Stars
  {
    id: 'four-star',
    label: '4-Point Star',
    preview: <path d="M 12,2 Q 12,12 22,12 Q 12,12 12,22 Q 12,12 2,12 Q 12,12 12,2" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'four-star', width: 36, height: 36, x: cx - 18, y: cy - 18, fill: '#fef9c3', stroke: '#eab308', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'star',
    label: '5-Point Star',
    preview: <polygon points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 8.9,8.3" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'star', width: 36, height: 36, x: cx - 18, y: cy - 18, fill: '#fef9c3', stroke: '#eab308', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'eight-star',
    label: '8-Point Star',
    preview: <path d="M 12,2 L 14,9 L 21,7 L 17,12 L 22,16 L 15,15 L 12,22 L 9,15 L 2,16 L 7,12 L 3,7 L 10,9 Z" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'eight-star', width: 36, height: 36, x: cx - 18, y: cy - 18, fill: '#fef9c3', stroke: '#eab308', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  // Speech bubbles
  {
    id: 'speech-rect',
    label: 'Speech Rect',
    preview: <path d="M 3,4 A 2,2 0 0 1 5,2 L 19,2 A 2,2 0 0 1 21,4 L 21,14 A 2,2 0 0 1 19,16 H 9 L 5,20 V 16 A 2,2 0 0 1 3,14 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'speech-rect', width: 44, height: 36, x: cx - 22, y: cy - 18, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'speech-oval',
    label: 'Speech Oval',
    preview: <path d="M 12,3 C 17,3 21,6 21,10 C 21,14 17,17 13,17 L 9,20 L 9,17 C 5,16.5 3,14 3,10 C 3,6 7,3 12,3 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'speech-oval', width: 44, height: 36, x: cx - 22, y: cy - 18, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'cloud',
    label: 'Cloud Bubble',
    preview: <path d="M17,14a4,4,0,0,0,2.5-7.1A4.5,4.5,0,0,0,15,3a5.5,5.5,0,0,0-8,2.3A4,4,0,0,0,4.5,10,4,4,0,0,0,7,15l-1.5,4,4.5-2.5a6,6,0,0,0,7-2.5Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" transform="scale(0.9) translate(1, 1)" />,
    create: (cx, cy) => ({ type: 'cloud', width: 46, height: 38, x: cx - 23, y: cy - 19, fill: '#f1f5f9', stroke: '#64748b', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  // Special
  {
    id: 'heart',
    label: 'Heart',
    preview: <path d="M 12,20 L 10.5,18.7 C 5,13.7 1.5,10.5 1.5,6.5 C 1.5,3.2 4,1 7.2,1 C 9,1 10.7,1.8 11.7,3 C 12.7,1.8 14.4,1 16.2,1 C 19.4,1 21.9,3.2 21.9,6.5 C 21.9,10.5 18.4,13.7 12.9,18.7 Z" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" transform="scale(0.95) translate(0.5, 0.5)" />,
    create: (cx, cy) => ({ type: 'heart', width: 36, height: 36, x: cx - 18, y: cy - 18, fill: '#ffe4e6', stroke: '#f43f5e', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
  {
    id: 'lightning',
    label: 'Lightning',
    preview: <path d="M 13,2 L 3,13 H 11 L 10,22 L 20,11 H 13 Z" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" />,
    create: (cx, cy) => ({ type: 'lightning', width: 28, height: 44, x: cx - 14, y: cy - 22, fill: '#fef9c3', stroke: '#eab308', strokeWidth: 1.5, opacity: 1, styleMode: 'both' }),
  },
];

export const ShapesPanel: React.FC<ShapesPanelProps> = ({ onClose }) => {
  const { addElement, document: doc } = useCanvasStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside (on canvas or anywhere else)
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use capture so we intercept before canvas handlers
    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [onClose]);

  const addShape = (shape: ShapeDef) => {
    if (!doc) return;
    const cx = doc.page.width / 2;
    const cy = doc.page.height / 2;
    const maxZ = Math.max(0, ...doc.elements.map((e) => e.zIndex));
    const partial = shape.create(cx, cy);
    addElement({
      id: uid(shape.id),
      label: shape.label,
      rotation: 0,
      zIndex: maxZ + 1,
      visible: true,
      locked: false,
      ...partial,
    } as CanvasElement);
  };

  return (
    <div
      ref={panelRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 12px', borderBottom: '1px solid var(--border-panel)', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-panel)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shapes</span>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-panel-muted)', cursor: 'pointer', padding: 4, borderRadius: 5, display: 'flex' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Grid of shapes — padding ensures nothing clips on the right */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
          {SHAPES.map((shape) => (
            <button
              key={shape.id}
              title={shape.label}
              onClick={() => addShape(shape)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '9px 4px 7px',
                background: 'var(--bg-panel-input)',
                border: '1px solid var(--border-panel)',
                borderRadius: 9,
                cursor: 'pointer',
                transition: 'all 0.15s',
                color: 'var(--text-panel)',
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                minWidth: 0,
                overflow: 'hidden',
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
              <svg width="24" height="24" viewBox="0 0 24 24" overflow="visible">
                {shape.preview}
              </svg>
              <span style={{ lineHeight: 1.2, textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {shape.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
