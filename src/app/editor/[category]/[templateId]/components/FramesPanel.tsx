'use client';
import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/canvas/store';
import { CanvasElement } from '@/canvas/types';
import { X } from 'lucide-react';

interface FramesPanelProps {
  onClose: () => void;
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface FrameDef {
  id: string;
  label: string;
  shape: 'rectangle' | 'square' | 'circle' | 'ellipse';
  preview: React.ReactNode;
  width: number;
  height: number;
}

const FRAMES: FrameDef[] = [
  {
    id: 'frame-rect',
    label: 'Rectangle Frame',
    shape: 'rectangle',
    width: 80,
    height: 55,
    preview: (
      <g>
        <rect x="2" y="4" width="20" height="16" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="12" cy="10" r="2.5" fill="#94a3b8" />
        <path d="M4 18 L10 12 L15 17 L19 14 L20 15 L20 18 Z" fill="#94a3b8" />
      </g>
    ),
  },
  {
    id: 'frame-square',
    label: 'Square Frame',
    shape: 'square',
    width: 55,
    height: 55,
    preview: (
      <g>
        <rect x="4" y="4" width="16" height="16" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="12" cy="10" r="2.2" fill="#94a3b8" />
        <path d="M6 18 L10 13 L14 17 L17 14 L18 15 L18 18 Z" fill="#94a3b8" />
      </g>
    ),
  },
  {
    id: 'frame-circle',
    label: 'Circle Frame',
    shape: 'circle',
    width: 55,
    height: 55,
    preview: (
      <g>
        <circle cx="12" cy="12" r="8.5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="12" cy="10" r="1.8" fill="#94a3b8" />
        <path d="M7 16 C8.5 13.5, 11 12, 13 14 L16.5 11 L18 13 C18.5 14, 18 16, 17 17 Z" fill="#94a3b8" />
      </g>
    ),
  },
  {
    id: 'frame-ellipse',
    label: 'Ellipse Frame',
    shape: 'ellipse',
    width: 80,
    height: 55,
    preview: (
      <g>
        <ellipse cx="12" cy="12" rx="9.5" ry="6.5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="12" cy="10" r="1.8" fill="#94a3b8" />
        <path d="M6.5 15 C8.5 12.5, 11 11, 13 13 L16 10 C17.5 12, 18 13.5, 18 14.5 Z" fill="#94a3b8" />
      </g>
    ),
  },
];

export const FramesPanel: React.FC<FramesPanelProps> = ({ onClose }) => {
  const { addElement, selectElement, document: doc } = useCanvasStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [onClose]);

  const addFrame = (def: FrameDef) => {
    if (!doc) return;
    const cx = doc.page.width / 2;
    const cy = doc.page.height / 2;
    const maxZ = Math.max(0, ...doc.elements.map((e) => e.zIndex));
    const frameId = uid('frame');

    addElement({
      id: frameId,
      type: 'frame',
      label: def.label,
      x: Number((cx - def.width / 2).toFixed(2)),
      y: Number((cy - def.height / 2).toFixed(2)),
      width: def.width,
      height: def.height,
      rotation: 0,
      zIndex: maxZ + 1,
      visible: true,
      locked: false,
      src: '',
      shape: def.shape,
      borderEnabled: false,
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: '#cbd5e1',
      objectFit: 'cover',
      cropX: 50,
      cropY: 50,
      zoom: 1,
      opacity: 1,
    } as CanvasElement);

    selectElement(frameId);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 12px', borderBottom: '1px solid var(--border-panel)', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-panel)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Frames</span>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-panel-muted)', cursor: 'pointer', padding: 4, borderRadius: 5, display: 'flex' }}
        >
          <X size={15} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {FRAMES.map((def) => (
            <button
              key={def.id}
              title={def.label}
              onClick={() => addFrame(def)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '12px 6px 10px',
                background: 'var(--bg-panel-input)',
                border: '1px solid var(--border-panel)',
                borderRadius: 10,
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
                  boxSizing: 'border-box',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" overflow="visible">
                  {def.preview}
                </svg>
              </div>
              <span style={{ lineHeight: 1.2, textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {def.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
