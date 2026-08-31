'use client';
import React from 'react';
import { useCanvasStore } from '@/canvas/store';
import { useIsMobileOrTouch } from '@/utils/device';
import { X, Maximize2 } from 'lucide-react';

interface CanvasPanelProps {
    onClose: () => void;
    onReset?: () => void;
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

export const CanvasPanel: React.FC<CanvasPanelProps> = ({ onClose, onReset }) => {
    const {
        document: doc,
        setPageSize,
        showGrid,
        setShowGrid,
        snapToGrid,
        setSnapToGrid,
    } = useCanvasStore();

    const currentWidth = doc?.page.width || 210;
    const currentHeight = doc?.page.height || 297;
    const isMobileOrTouch = useIsMobileOrTouch();

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
                    Canvas Settings
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
                <div style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-panel-muted)',
                    marginBottom: '4px',
                    borderBottom: '1px solid var(--border-panel)',
                    paddingBottom: '4px'
                }}>
                    Page Sizes
                </div>

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

                {/* Canvas Options Header */}
                <div style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-panel-muted)',
                    marginTop: '12px',
                    marginBottom: '4px',
                    borderBottom: '1px solid var(--border-panel)',
                    paddingBottom: '4px'
                }}>
                    Canvas Options
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Toggle Show Grid */}
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: showGrid ? 'var(--bg-popover-active, rgba(99, 102, 241, 0.15))' : 'var(--bg-panel-input)',
                            color: 'var(--text-panel)',
                            border: showGrid ? '1px solid var(--primary-color)' : '1px solid var(--border-panel)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600,
                            textAlign: 'left',
                            transition: 'all 0.15s',
                        }}
                    >
                        <span>Show Grid Overlay</span>
                        <div style={{
                            width: '28px',
                            height: '16px',
                            borderRadius: '8px',
                            background: showGrid ? 'var(--primary-color)' : '#cbd5e1',
                            position: 'relative',
                            transition: 'background-color 0.2s',
                        }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                position: 'absolute',
                                top: '2px',
                                left: showGrid ? '14px' : '2px',
                                transition: 'left 0.2s',
                            }} />
                        </div>
                    </button>

                    {/* Toggle Snap to Grid */}
                    <button
                        onClick={() => setSnapToGrid(!snapToGrid)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: snapToGrid ? 'var(--bg-popover-active, rgba(99, 102, 241, 0.15))' : 'var(--bg-panel-input)',
                            color: 'var(--text-panel)',
                            border: snapToGrid ? '1px solid var(--primary-color)' : '1px solid var(--border-panel)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 600,
                            textAlign: 'left',
                            transition: 'all 0.15s',
                        }}
                    >
                        <span>Snap Elements to Grid</span>
                        <div style={{
                            width: '28px',
                            height: '16px',
                            borderRadius: '8px',
                            background: snapToGrid ? 'var(--primary-color)' : '#cbd5e1',
                            position: 'relative',
                            transition: 'background-color 0.2s',
                        }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                position: 'absolute',
                                top: '2px',
                                left: snapToGrid ? '14px' : '2px',
                                transition: 'left 0.2s',
                            }} />
                        </div>
                    </button>

                </div>

                {/* Reset Template Option */}
                {onReset && (
                    <>
                        <div style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--text-panel-muted)',
                            marginTop: '16px',
                            marginBottom: '4px',
                            borderBottom: '1px solid var(--border-panel)',
                            paddingBottom: '4px'
                        }}>
                            Danger Zone
                        </div>
                        <button
                            onClick={onReset}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '12px 14px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#ef4444',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                            }}
                        >
                            Reset Template to Default
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
