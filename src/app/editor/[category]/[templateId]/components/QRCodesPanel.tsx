'use client';
import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/canvas/store';
import { CanvasElement, QRCodeDesignPreset } from '@/canvas/types';
import { X } from 'lucide-react';

interface QRCodesPanelProps {
  onClose: () => void;
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface QRDef {
  id: QRCodeDesignPreset;
  label: string;
  preview: React.ReactNode;
}

const QR_PRESETS: QRDef[] = [
  {
    id: 'classic',
    label: 'Classic',
    preview: (
      <g fill="#0f172a">
        <rect x="2" y="2" width="6" height="6" />
        <rect x="3" y="3" width="4" height="4" fill="#ffffff" />
        <rect x="4" y="4" width="2" height="2" />
        
        <rect x="16" y="2" width="6" height="6" />
        <rect x="17" y="3" width="4" height="4" fill="#ffffff" />
        <rect x="18" y="4" width="2" height="2" />
        
        <rect x="2" y="16" width="6" height="6" />
        <rect x="3" y="17" width="4" height="4" fill="#ffffff" />
        <rect x="4" y="18" width="2" height="2" />

        <rect x="11" y="4" width="2" height="2" />
        <rect x="13" y="7" width="2" height="2" />
        <rect x="9" y="11" width="2" height="2" />
        <rect x="12" y="14" width="2" height="2" />
        <rect x="17" y="12" width="2" height="2" />
        <rect x="15" y="18" width="2" height="2" />
      </g>
    ),
  },
  {
    id: 'minimal',
    label: 'Minimal',
    preview: (
      <g fill="#0f172a">
        <rect x="2" y="2" width="6" height="6" fill="none" stroke="#0f172a" strokeWidth="1" />
        <rect x="4" y="4" width="2" height="2" />
        
        <rect x="16" y="2" width="6" height="6" fill="none" stroke="#0f172a" strokeWidth="1" />
        <rect x="18" y="4" width="2" height="2" />
        
        <rect x="2" y="16" width="6" height="6" fill="none" stroke="#0f172a" strokeWidth="1" />
        <rect x="4" y="18" width="2" height="2" />

        <rect x="11" y="4" width="1.5" height="1.5" />
        <rect x="13" y="7" width="1.5" height="1.5" />
        <rect x="9" y="11" width="1.5" height="1.5" />
        <rect x="12" y="14" width="1.5" height="1.5" />
        <rect x="17" y="12" width="1.5" height="1.5" />
        <rect x="15" y="18" width="1.5" height="1.5" />
      </g>
    ),
  },
  {
    id: 'rounded',
    label: 'Rounded',
    preview: (
      <g fill="#0f172a">
        <rect x="2" y="2" width="6" height="6" rx="1.5" ry="1.5" />
        <rect x="3" y="3" width="4" height="4" rx="1" ry="1" fill="#ffffff" />
        <rect x="4" y="4" width="2" height="2" rx="0.5" ry="0.5" />
        
        <rect x="16" y="2" width="6" height="6" rx="1.5" ry="1.5" />
        <rect x="17" y="3" width="4" height="4" rx="1" ry="1" fill="#ffffff" />
        <rect x="18" y="4" width="2" height="2" rx="0.5" ry="0.5" />
        
        <rect x="2" y="16" width="6" height="6" rx="1.5" ry="1.5" />
        <rect x="3" y="17" width="4" height="4" rx="1" ry="1" fill="#ffffff" />
        <rect x="4" y="18" width="2" height="2" rx="0.5" ry="0.5" />

        <rect x="11" y="4" width="2" height="2" rx="0.7" ry="0.7" />
        <rect x="13" y="7" width="2" height="2" rx="0.7" ry="0.7" />
        <rect x="9" y="11" width="2" height="2" rx="0.7" ry="0.7" />
        <rect x="12" y="14" width="2" height="2" rx="0.7" ry="0.7" />
        <rect x="17" y="12" width="2" height="2" rx="0.7" ry="0.7" />
        <rect x="15" y="18" width="2" height="2" rx="0.7" ry="0.7" />
      </g>
    ),
  },
  {
    id: 'rounded-dots',
    label: 'Rounded Dots',
    preview: (
      <g fill="#0f172a">
        <circle cx="5" cy="5" r="3" />
        <circle cx="5" cy="5" r="2" fill="#ffffff" />
        <circle cx="5" cy="5" r="1" />
        
        <circle cx="19" cy="5" r="3" />
        <circle cx="19" cy="5" r="2" fill="#ffffff" />
        <circle cx="19" cy="5" r="1" />
        
        <circle cx="5" cy="19" r="3" />
        <circle cx="5" cy="19" r="2" fill="#ffffff" />
        <circle cx="5" cy="19" r="1" />

        <circle cx="12" cy="5" r="0.8" />
        <circle cx="14" cy="8" r="0.8" />
        <circle cx="10" cy="12" r="0.8" />
        <circle cx="13" cy="15" r="0.8" />
        <circle cx="18" cy="13" r="0.8" />
        <circle cx="16" cy="19" r="0.8" />
      </g>
    ),
  },
  {
    id: 'modern',
    label: 'Modern',
    preview: (
      <g fill="#0f172a">
        <rect x="2" y="2" width="6" height="6" rx="1.5" ry="1.5" />
        <rect x="3" y="3" width="4" height="4" rx="1" ry="1" fill="#ffffff" />
        <rect x="4" y="4" width="2" height="2" rx="0.5" ry="0.5" />
        
        <rect x="16" y="2" width="6" height="6" rx="1.5" ry="1.5" />
        <rect x="17" y="3" width="4" height="4" rx="1" ry="1" fill="#ffffff" />
        <rect x="18" y="4" width="2" height="2" rx="0.5" ry="0.5" />
        
        <rect x="2" y="16" width="6" height="6" rx="1.5" ry="1.5" />
        <rect x="3" y="17" width="4" height="4" rx="1" ry="1" fill="#ffffff" />
        <rect x="4" y="18" width="2" height="2" rx="0.5" ry="0.5" />

        <rect x="11" y="4" width="2" height="2" rx="0.8" ry="0.8" />
        <rect x="13" y="7" width="2" height="2" rx="0.8" ry="0.8" />
        <rect x="9" y="11" width="2" height="2" rx="0.8" ry="0.8" />
        <rect x="12" y="14" width="2" height="2" rx="0.8" ry="0.8" />
        <rect x="17" y="12" width="2" height="2" rx="0.8" ry="0.8" />
        <rect x="15" y="18" width="2" height="2" rx="0.8" ry="0.8" />
      </g>
    ),
  },
  {
    id: 'dots',
    label: 'Dots',
    preview: (
      <g fill="#0f172a">
        <circle cx="5" cy="5" r="3" />
        <circle cx="5" cy="5" r="2" fill="#ffffff" />
        <circle cx="5" cy="5" r="1.2" />
        
        <circle cx="19" cy="5" r="3" />
        <circle cx="19" cy="5" r="2" fill="#ffffff" />
        <circle cx="19" cy="5" r="1.2" />
        
        <circle cx="5" cy="19" r="3" />
        <circle cx="5" cy="19" r="2" fill="#ffffff" />
        <circle cx="5" cy="19" r="1.2" />

        <circle cx="12" cy="5" r="0.9" />
        <circle cx="14" cy="8" r="0.9" />
        <circle cx="10" cy="12" r="0.9" />
        <circle cx="13" cy="15" r="0.9" />
        <circle cx="18" cy="13" r="0.9" />
        <circle cx="16" cy="19" r="0.9" />
      </g>
    ),
  },
  {
    id: 'professional',
    label: 'Professional',
    preview: (
      <g fill="#0f172a">
        <path d="M 4 2 L 6 2 L 8 4 L 8 6 L 6 8 L 4 8 L 2 6 L 2 4 Z" />
        <path d="M 4.3 3 L 5.7 3 L 7 4.3 L 7 5.7 L 5.7 7 L 4.3 7 L 3 5.7 L 3 4.3 Z" fill="#ffffff" />
        <rect x="4" y="4" width="2" height="2" rx="0.5" ry="0.5" />
        
        <path d="M 18 2 L 20 2 L 22 4 L 22 6 L 20 8 L 18 8 L 16 6 L 16 4 Z" />
        <path d="M 18.3 3 L 19.7 3 L 21 4.3 L 21 5.7 L 19.7 7 L 18.3 7 L 17 5.7 L 17 4.3 Z" fill="#ffffff" />
        <rect x="18" y="4" width="2" height="2" rx="0.5" ry="0.5" />
        
        <path d="M 4 16 L 6 16 L 8 18 L 8 20 L 6 22 L 4 22 L 2 20 L 2 18 Z" />
        <path d="M 4.3 17 L 5.7 17 L 7 18.3 L 7 19.7 L 5.7 21 L 4.3 21 L 3 19.7 L 3 18.3 Z" fill="#ffffff" />
        <rect x="4" y="18" width="2" height="2" rx="0.5" ry="0.5" />

        <rect x="11" y="4" width="2" height="2" />
        <rect x="13" y="7" width="2" height="2" />
        <rect x="9" y="11" width="2" height="2" />
        <rect x="12" y="14" width="2" height="2" />
        <rect x="17" y="12" width="2" height="2" />
        <rect x="15" y="18" width="2" height="2" />
      </g>
    ),
  },
  {
    id: 'elegant',
    label: 'Elegant',
    preview: (
      <g fill="#0f172a">
        <rect x="2" y="2" width="6" height="6" rx="1.5" ry="1.5" />
        <rect x="3" y="3" width="4" height="4" rx="1" ry="1" fill="#ffffff" />
        <rect x="4" y="4" width="2" height="2" rx="0.5" ry="0.5" />
        
        <rect x="16" y="2" width="6" height="6" rx="1.5" ry="1.5" />
        <rect x="17" y="3" width="4" height="4" rx="1" ry="1" fill="#ffffff" />
        <rect x="18" y="4" width="2" height="2" rx="0.5" ry="0.5" />
        
        <rect x="2" y="16" width="6" height="6" rx="1.5" ry="1.5" />
        <rect x="3" y="17" width="4" height="4" rx="1" ry="1" fill="#ffffff" />
        <rect x="4" y="18" width="2" height="2" rx="0.5" ry="0.5" />

        <circle cx="12" cy="5" r="0.75" />
        <circle cx="14" cy="8" r="0.75" />
        <circle cx="10" cy="12" r="0.75" />
        <circle cx="13" cy="15" r="0.75" />
        <circle cx="18" cy="13" r="0.75" />
        <circle cx="16" cy="19" r="0.75" />
      </g>
    ),
  },
  {
    id: 'bold',
    label: 'Bold',
    preview: (
      <g fill="#0f172a">
        <rect x="1.5" y="1.5" width="7" height="7" rx="0.5" ry="0.5" />
        <rect x="2.5" y="2.5" width="5" height="5" fill="#ffffff" />
        <rect x="3" y="3" width="4" height="4" />
        
        <rect x="15.5" y="1.5" width="7" height="7" rx="0.5" ry="0.5" />
        <rect x="16.5" y="2.5" width="5" height="5" fill="#ffffff" />
        <rect x="17" y="3" width="4" height="4" />
        
        <rect x="1.5" y="15.5" width="7" height="7" rx="0.5" ry="0.5" />
        <rect x="2.5" y="16.5" width="5" height="5" fill="#ffffff" />
        <rect x="3" y="17" width="4" height="4" />

        <rect x="10.5" y="3.5" width="2.5" height="2.5" />
        <rect x="12.5" y="6.5" width="2.5" height="2.5" />
        <rect x="8.5" y="10.5" width="2.5" height="2.5" />
        <rect x="11.5" y="13.5" width="2.5" height="2.5" />
        <rect x="16.5" y="11.5" width="2.5" height="2.5" />
        <rect x="14.5" y="17.5" width="2.5" height="2.5" />
      </g>
    ),
  },
  {
    id: 'framed',
    label: 'Framed',
    preview: (
      <g fill="#0f172a">
        <rect x="0.5" y="0.5" width="23" height="23" fill="none" stroke="#0f172a" strokeWidth="0.8" rx="1.5" />
        <rect x="3" y="3" width="5" height="5" />
        <rect x="4" y="4" width="3" height="3" fill="#ffffff" />
        <rect x="5" y="5" width="1" height="1" />
        
        <rect x="16" y="3" width="5" height="5" />
        <rect x="17" y="4" width="3" height="3" fill="#ffffff" />
        <rect x="18" y="5" width="1" height="1" />
        
        <rect x="3" y="16" width="5" height="5" />
        <rect x="4" y="17" width="3" height="3" fill="#ffffff" />
        <rect x="5" y="18" width="1" height="1" />

        <rect x="11" y="4" width="1.5" height="1.5" />
        <rect x="13" y="7" width="1.5" height="1.5" />
        <rect x="9" y="11" width="1.5" height="1.5" />
        <rect x="12" y="14" width="1.5" height="1.5" />
        <rect x="17" y="12" width="1.5" height="1.5" />
        <rect x="15" y="18" width="1.5" height="1.5" />
      </g>
    ),
  },
];

export const QRCodesPanel: React.FC<QRCodesPanelProps> = ({ onClose }) => {
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

  const addQRCode = (preset: QRCodeDesignPreset, label: string) => {
    if (!doc) return;
    const cx = doc.page.width / 2;
    const cy = doc.page.height / 2;
    const maxZ = Math.max(0, ...doc.elements.map((e) => e.zIndex));
    const qrId = uid('qrcode');
    const width = 45;
    const height = 45;

    addElement({
      id: qrId,
      type: 'qr-code',
      label: `${label} QR Code`,
      x: Number((cx - width / 2).toFixed(2)),
      y: Number((cy - height / 2).toFixed(2)),
      width,
      height,
      rotation: 0,
      zIndex: maxZ + 1,
      visible: true,
      locked: false,
      content: 'https://example.com',
      designPreset: preset,
      foregroundColor: '#0f172a',
      backgroundColor: '#ffffff',
      margin: 2,
    } as CanvasElement);

    selectElement(qrId);
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
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-panel)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>QR Codes</span>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-panel-muted)', cursor: 'pointer', padding: 4, borderRadius: 5, display: 'flex' }}
        >
          <X size={15} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {QR_PRESETS.map((def) => (
            <button
              key={def.id}
              title={def.label}
              onClick={() => addQRCode(def.id, def.label)}
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
