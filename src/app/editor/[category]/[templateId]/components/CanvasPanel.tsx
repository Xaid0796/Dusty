'use client';
import React from 'react';
import { useCanvasStore } from '@/canvas/store';
import { X, Maximize2 } from 'lucide-react';

interface CanvasPanelProps {
    onClose: () => void;
}

const CANVAS_SIZES = [
    { label: 'A4', width: 210, height: 297 },
    { label: 'A3', width: 297, height: 420 },
    { label: 'A5', width: 148, height: 210 },
    { label: 'Letter', width: 215.9, height: 279.4 },
    { label: 'Legal', width: 215.9, height: 355.6 },
    { label: 'Tabloid', width: 279.4, height: 431.8 },
    { label: 'Executive', width: 184.15, height: 266.7 },
    { label: 'Statement', width: 139.7, height: 215.9 },
    { label: 'B4', width: 250, height: 353 },
    { label: 'B5', width: 176, height: 250 },
];

export const CanvasPanel: React.FC<CanvasPanelProps> = ({ onClose }) => {
    const { document: doc, setPageSize } = useCanvasStore();
    const currentWidth = doc?.page.width || 210;
    const currentHeight = doc?.page.height || 297;

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
                    <Maximize2 size={14} style={{ color: 'var(--primary-color)' }} />
                    Canvas Size
                </span>
                <button
                    onClick={onClose}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-panel-muted)', cursor: 'pointer', padding: 4, borderRadius: 5, display: 'flex' }}
                >
                    <X size={15} />
                </button>
            </div>

            {/* Main panel scroll container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {CANVAS_SIZES.map((size) => {
                        const isSelected = Math.abs(size.width - currentWidth) < 1 && Math.abs(size.height - currentHeight) < 1;
                        return (
                            <button
                                key={size.label}
                                onClick={() => setPageSize(size.width, size.height)}
                                style={{
                                    padding: '10px 10px',
                                    background: isSelected ? 'var(--primary-color)' : 'var(--bg-panel-input)',
                                    color: isSelected ? '#ffffff' : 'var(--text-panel)',
                                    border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--border-panel)',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontSize: 11,
                                    fontWeight: isSelected ? 700 : 500,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: 3,
                                    transition: 'all 0.15s',
                                }}
                            >
                                <span>{size.label}</span>
                                <span style={{ fontSize: 9, opacity: isSelected ? 0.9 : 0.6 }}>{size.width} × {size.height} mm</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
