'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '@/canvas/store';
import { CanvasElement } from '@/canvas/types';
import {
    Eye, EyeOff, Lock, LockOpen, Trash2, Copy,
    Type, Image as ImageIcon, Square, Circle, Triangle, Star, Hexagon,
    ArrowRight, Minus, StickyNote, Table, PenTool,
    Layers as LayersIcon, BarChart2, Frame, QrCode, Box,
    ChevronUp, ChevronDown, ChevronsUp, ChevronsDown
} from 'lucide-react';
import styles from '../editor.module.css';

interface LayersPanelProps {
    previewMode?: boolean;
}

export const getElementDisplayName = (el: CanvasElement): string => {
    if (el.label && el.label.trim()) return el.label;
    if (el.type === 'text' && (el as any).content && typeof (el as any).content === 'string') {
        const preview = (el as any).content.trim().slice(0, 20);
        if (preview) return `Text: "${preview}${preview.length >= 20 ? '…' : ''}"`;
    }

    const typeNames: Record<string, string> = {
        text: 'Text Box',
        image: 'Image',
        rect: 'Rectangle',
        circle: 'Circle',
        triangle: 'Triangle',
        star: 'Star Shape',
        hexagon: 'Hexagon',
        arrow: 'Arrow',
        line: 'Divider Line',
        sticky: 'Sticky Note',
        table: 'Table Grid',
        drawing: 'Freehand Drawing',
        'diagonal-line': 'Diagonal Line',
        wave: 'Wave Line',
        'l-shape': 'L-Shape',
        'right-triangle': 'Right Triangle',
        diamond: 'Diamond',
        pentagon: 'Pentagon',
        'four-star': '4-Point Star',
        'eight-star': '8-Point Star',
        'speech-rect': 'Speech Bubble',
        'speech-oval': 'Speech Oval',
        cloud: 'Cloud Shape',
        heart: 'Heart Shape',
        lightning: 'Lightning Bolt',
        'arrow-left': 'Left Arrow',
        'arrow-up': 'Up Arrow',
        'arrow-down': 'Down Arrow',
        'floral-branch': 'Floral Branch',
        'elegant-corner': 'Elegant Corner',
        'divider-diamond': 'Divider Diamond',
        'badge-star': 'Badge Star',
        'arch-accent': 'Arch Accent',
        'wave-accent': 'Wave Accent',
        group: 'Group Folder',
        chart: 'Chart Component',
        frame: 'Photo Frame',
        'qr-code': 'QR Code',
    };

    return typeNames[el.type] || el.type;
};

export const getElementIcon = (type: CanvasElement['type']) => {
    switch (type) {
        case 'text': return <Type size={13} />;
        case 'image': return <ImageIcon size={13} />;
        case 'rect': return <Square size={13} />;
        case 'circle': return <Circle size={13} />;
        case 'triangle': return <Triangle size={13} />;
        case 'star': return <Star size={13} />;
        case 'hexagon': return <Hexagon size={13} />;
        case 'arrow': return <ArrowRight size={13} />;
        case 'line': return <Minus size={13} />;
        case 'sticky': return <StickyNote size={13} />;
        case 'table': return <Table size={13} />;
        case 'drawing': return <PenTool size={13} />;
        case 'group': return <LayersIcon size={13} />;
        case 'chart': return <BarChart2 size={13} />;
        case 'frame': return <Frame size={13} />;
        case 'qr-code': return <QrCode size={13} />;
        default: return <Box size={13} />;
    }
};

export const LayersList: React.FC<LayersPanelProps> = ({ previewMode = false }) => {
    const {
        document: doc,
        selectedIds,
        selectElement,
        updateElement,
        deleteElement,
        bringForward,
        sendBackward,
        bringToFront,
        sendToBack,
        duplicateSelected,
    } = useCanvasStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const finishEditing = () => {
        if (editingId && editName.trim()) {
            updateElement(editingId, { label: editName.trim() });
        }
        setEditingId(null);
        setEditName('');
    };

    const startEditing = (el: CanvasElement, e?: React.MouseEvent) => {
        if (previewMode) return;
        if (e) e.stopPropagation();
        setEditingId(el.id);
        setEditName(el.label || getElementDisplayName(el));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            finishEditing();
        } else if (e.key === 'Escape') {
            setEditingId(null);
            setEditName('');
        }
    };

    const handleSelect = (id: string, additive = false) => {
        if (previewMode) return;
        if (editingId) finishEditing();
        selectElement(id, additive);
    };

    const handleVisibilityToggle = (el: CanvasElement, e: React.MouseEvent) => {
        if (previewMode) return;
        e.stopPropagation();
        updateElement(el.id, { visible: !el.visible });
    };

    const handleLockToggle = (el: CanvasElement, e: React.MouseEvent) => {
        if (previewMode) return;
        e.stopPropagation();
        updateElement(el.id, { locked: !el.locked });
    };

    const handleDelete = (el: CanvasElement, e: React.MouseEvent) => {
        if (previewMode || el.locked) return;
        e.stopPropagation();
        deleteElement(el.id);
    };

    const handleDuplicate = (el: CanvasElement, e: React.MouseEvent) => {
        if (previewMode || el.locked) return;
        e.stopPropagation();
        selectElement(el.id);
        duplicateSelected();
    };

    if (!doc) return null;

    // Sort elements descending by zIndex so top elements appear at the top of the list
    const sortedElements = [...doc.elements].sort((a, b) => b.zIndex - a.zIndex);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Header Bar */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px 8px', borderBottom: '1px solid var(--border-panel)',
                background: 'var(--bg-panel-input)', userSelect: 'none',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LayersIcon size={14} style={{ color: 'var(--primary-color, #6366f1)' }} />
                    <span style={{
                        fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                        textTransform: 'uppercase', color: 'var(--text-panel)'
                    }}>
                        Layers & Objects
                    </span>
                </div>
                <span style={{
                    fontSize: '10px', fontWeight: 700, color: 'var(--text-panel-muted)',
                    background: 'var(--bg-panel-btn)', padding: '2px 7px', borderRadius: '10px',
                    border: '1px solid var(--border-panel)'
                }}>
                    {sortedElements.length}
                </span>
            </div>

            {/* Scrollable Layer List */}
            <div style={{
                maxHeight: '220px', minHeight: '80px', overflowY: 'auto', overflowX: 'hidden',
                padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '3px',
                background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-panel)',
            }}>
                {sortedElements.length === 0 ? (
                    <div style={{
                        padding: '24px 12px', textAlign: 'center', color: 'var(--text-panel-muted)',
                        fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                    }}>
                        <span>Canvas is empty</span>
                        <span style={{ fontSize: '10px', opacity: 0.7 }}>Add elements from the left toolbar</span>
                    </div>
                ) : (
                    sortedElements.map((el, index) => {
                        const isSelected = selectedIds.includes(el.id);
                        const isFirst = index === 0;
                        const isLast = index === sortedElements.length - 1;

                        return (
                            <div
                                key={el.id}
                                onClick={(e) => {
                                    const additive = e.ctrlKey || e.metaKey || e.shiftKey;
                                    handleSelect(el.id, additive);
                                }}
                                onDoubleClick={(e) => startEditing(el, e)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '5px 8px', borderRadius: '6px',
                                    background: isSelected ? 'rgba(99,102,241,0.15)' : 'transparent',
                                    border: isSelected ? '1px solid #6366f1' : '1px solid transparent',
                                    cursor: previewMode ? 'default' : 'pointer',
                                    opacity: el.visible ? 1 : 0.45,
                                    transition: 'background 0.12s, border 0.12s',
                                    userSelect: 'none',
                                }}
                                title={`Z-Index: ${el.zIndex}`}
                            >
                                {/* Element Type Icon */}
                                <div style={{
                                    width: '22px', height: '22px', borderRadius: '4px',
                                    background: isSelected ? '#6366f1' : 'var(--bg-panel-input)',
                                    color: isSelected ? '#ffffff' : 'var(--text-panel-muted)',
                                    border: isSelected ? 'none' : '1px solid var(--border-panel)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {getElementIcon(el.type)}
                                </div>

                                {/* Layer Name */}
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                                    {editingId === el.id ? (
                                        <input
                                            ref={editInputRef}
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            onBlur={finishEditing}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                width: '100%', height: '22px', padding: '0 6px',
                                                border: '1px solid #6366f1', borderRadius: '4px',
                                                background: 'var(--bg-panel)', color: 'var(--text-panel)',
                                                fontSize: '11px', fontWeight: 600, outline: 'none',
                                                boxShadow: '0 0 0 2px rgba(99,102,241,0.2)',
                                            }}
                                        />
                                    ) : (
                                        <span
                                            style={{
                                                fontSize: '11px', fontWeight: isSelected ? 600 : 500,
                                                color: isSelected ? 'var(--text-panel)' : 'var(--text-panel-muted)',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                cursor: 'text',
                                            }}
                                            title="Double-click to rename"
                                        >
                                            {getElementDisplayName(el)}
                                        </span>
                                    )}
                                </div>

                                {/* Z-Index Order Actions (visible on selected) */}
                                {isSelected && !previewMode && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => bringForward(el.id)}
                                            disabled={isFirst}
                                            title="Bring Forward"
                                            style={{
                                                width: '18px', height: '18px', padding: 0,
                                                border: 'none', background: 'transparent',
                                                color: isFirst ? 'var(--border-panel)' : 'var(--text-panel)',
                                                cursor: isFirst ? 'default' : 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <ChevronUp size={12} />
                                        </button>
                                        <button
                                            onClick={() => sendBackward(el.id)}
                                            disabled={isLast}
                                            title="Send Backward"
                                            style={{
                                                width: '18px', height: '18px', padding: 0,
                                                border: 'none', background: 'transparent',
                                                color: isLast ? 'var(--border-panel)' : 'var(--text-panel)',
                                                cursor: isLast ? 'default' : 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <ChevronDown size={12} />
                                        </button>
                                    </div>
                                )}

                                {/* Visibility Toggle */}
                                <button
                                    onClick={(e) => handleVisibilityToggle(el, e)}
                                    title={el.visible ? 'Hide Element' : 'Show Element'}
                                    style={{
                                        width: '22px', height: '22px', padding: 0,
                                        borderRadius: '4px', border: 'none', background: 'transparent',
                                        color: el.visible ? 'var(--text-panel-muted)' : '#ef4444',
                                        cursor: previewMode ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    {el.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                </button>

                                {/* Lock Toggle */}
                                <button
                                    onClick={(e) => handleLockToggle(el, e)}
                                    title={el.locked ? 'Unlock Position' : 'Lock Position'}
                                    style={{
                                        width: '22px', height: '22px', padding: 0,
                                        borderRadius: '4px', border: 'none', background: 'transparent',
                                        color: el.locked ? '#f59e0b' : 'var(--text-panel-muted)',
                                        cursor: previewMode ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    {el.locked ? <Lock size={12} /> : <LockOpen size={12} />}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
