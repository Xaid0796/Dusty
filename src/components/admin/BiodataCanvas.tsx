'use client';

import React, { useMemo, useState } from 'react';
import { useCanvasStore } from '@/canvas/store';
import { CanvasElement } from '@/canvas/types';
import { CanvasStage } from '@/app/editor/[category]/[templateId]/components/CanvasStage';
import { LeftToolbar } from '@/app/editor/[category]/[templateId]/components/LeftToolbar';
import { PropertiesPanel } from '@/app/editor/[category]/[templateId]/components/PropertiesPanel';
import { ImageCropModal } from '@/app/editor/[category]/[templateId]/components/ImageCropModal';
import styles from '@/app/editor/[category]/[templateId]/editor.module.css';
import { Frame, Image as ImageIcon, Sparkles, Type, Users } from 'lucide-react';

/**
 * BiodataSectionBlock — a reusable "section heading" text element preset used by
 * the Biodata canvas to quickly drop standard marriage-biodata section labels
 * (Personal Details, Family Details, Contact Details, etc.).
 */
const BIODATA_SECTIONS = [
    'Personal Details',
    'Family Details',
    'Contact Details',
    'Education & Occupation',
    'Hobbies & Interests',
    'Partner Preferences',
];

const uid = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface BiodataCanvasProps {
    pageRef: React.RefObject<HTMLDivElement | null>;
    showGrid: boolean;
    previewMode: boolean;
    onToggleGrid: () => void;
    onToggleSnap: () => void;
}

/**
 * AdminBiodataCanvas
 * -------------------------------------------------------------------------
 * An enhanced canvas component tailored for editing Biodata templates inside the
 * admin builder. It reuses the production canvas engine (`CanvasStage`,
 * `LeftToolbar`, `PropertiesPanel`, `useCanvasStore`) unchanged and layers on
 * Biodata-specific quick-insert tools:
 *   - Photo frame (FrameElement) used as the profile image slot
 *   - Ornamental divider (divider-diamond custom shape)
 *   - Section title blocks (pre-styled TextElements)
 *   - Quick info badges (rect + text groupings)
 *
 * The component purposefully does NOT modify any core canvas engine files
 * (rendering, store, event handling) — it only composes existing primitives.
 */
export const AdminBiodataCanvas: React.FC<BiodataCanvasProps> = ({
    pageRef,
    showGrid,
    previewMode,
    onToggleGrid,
    onToggleSnap,
}) => {
    const {
        document: doc,
        selectedId,
        addElement,
        updateElement,
        snapToGrid,
    } = useCanvasStore();

    const [showBioPanel, setShowBioPanel] = useState(true);

    const center = (w: number, h: number) => ({
        x: Math.max(8, ((doc?.page.width || 210) / 2) - w / 2),
        y: Math.max(8, ((doc?.page.height || 297) / 2) - h / 2),
    });

    // ── Biodata quick-insert helpers ──────────────────────────────────────────

    const addPhotoFrame = () => {
        if (!doc) return;
        const size = 45;
        const isA4 = (doc.page.height || 297) > 250;
        // Default photo slot: top-center on A4, left for other layouts.
        const x = isA4 ? Math.max(8, doc.page.width / 2 - size / 2) : 12;
        const y = isA4 ? 16 : 16;
        addElement({
            id: uid('frame'),
            type: 'frame',
            label: 'Profile Photo',
            x,
            y,
            width: size,
            height: size,
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            shape: 'circle',
            borderEnabled: true,
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: '#b91c1c',
            objectFit: 'cover',
            cropX: 50,
            cropY: 50,
            zoom: 1,
            opacity: 1,
        });
    };

    const addOrnamentDivider = () => {
        if (!doc) return;
        const w = Math.min(120, doc.page.width - 20);
        const p = center(w, 8);
        const dividerEl: CanvasElement = {
            id: uid('divider'),
            type: 'divider-diamond',
            label: 'Ornamental Divider',
            x: p.x,
            y: p.y,
            width: w,
            height: 8,
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            fill: '#d4af37',
            stroke: '#b91c1c',
            strokeWidth: 1,
            opacity: 1,
            styleMode: 'both',
        };
        addElement(dividerEl);
    };

    const addSectionTitle = (title: string) => {
        if (!doc) return;
        const w = Math.min(170, doc.page.width - 20);
        const p = center(w, 10);
        addElement({
            id: uid('section'),
            type: 'text',
            label: title,
            x: p.x,
            y: p.y,
            width: w,
            height: 10,
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            content: title,
            style: {
                fontFamily: 'Cinzel, serif',
                fontSize: 16,
                fontWeight: 'bold',
                fontStyle: 'normal',
                textDecoration: 'none',
                color: '#b91c1c',
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: 1,
                padding: 0,
            },
        });
    };

    const addInfoBadge = () => {
        if (!doc) return;
        const w = 80;
        const p = center(w, 10);
        const groupId = uid('badge');
        const bg: CanvasElement = {
            id: `${groupId}-bg`,
            type: 'rect',
            label: 'Badge Background',
            x: p.x,
            y: p.y,
            width: w,
            height: 10,
            rotation: 0,
            zIndex: 1,
            visible: true,
            locked: false,
            fill: '#fef3c7',
            stroke: '#d4af37',
            strokeWidth: 1,
            borderRadius: 4,
            opacity: 1,
            styleMode: 'both',
        };
        const txt: CanvasElement = {
            id: `${groupId}-txt`,
            type: 'text',
            label: 'Badge Text',
            x: p.x,
            y: p.y,
            width: w,
            height: 10,
            rotation: 0,
            zIndex: 2,
            visible: true,
            locked: false,
            content: 'Field: Value',
            style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                fontWeight: 'normal',
                fontStyle: 'normal',
                textDecoration: 'none',
                color: '#1e293b',
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: 0,
                padding: 2,
            },
        };
        addElement(bg);
        // Select background first so the second add nests logically; we then select both.
        addElement(txt);
        // Re-select so the badge text is the active element for editing.
        useCanvasStore.getState().selectElement(txt.id);
    };

    const selectedElement = useMemo(
        () => (doc ? doc.elements.find((el) => el.id === selectedId) || null : null),
        [doc, selectedId]
    );

    // If a frame is selected and has no image, make the "add photo" affordance obvious.
    const selectedIsEmptyFrame = selectedElement?.type === 'frame' && !(selectedElement as any).src;

    const handleUploadImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file || !doc) return;
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const target = doc.elements.find((el) => el.id === selectedId);
                if (target?.type === 'frame' || target?.type === 'image') {
                    updateElement(target.id, { src: dataUrl });
                } else {
                    const size = 60;
                    const p = center(size, size);
                    addElement({
                        id: uid('image'),
                        type: 'image',
                        label: file.name.replace(/\.[^/.]+$/, '') || 'Image',
                        x: p.x,
                        y: p.y,
                        width: size,
                        height: size,
                        rotation: 0,
                        zIndex: 1,
                        visible: true,
                        locked: false,
                        src: dataUrl,
                        objectFit: 'contain',
                        objectPosition: '50% 50%',
                        cropX: 50,
                        cropY: 50,
                        zoom: 1,
                        borderRadius: 0,
                        opacity: 1,
                    });
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    return (
        <div className={styles.workspace} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className={styles.editorBody} style={{ flex: 1, overflow: 'hidden' }}>
                {/* LEFT TOOLBAR (unchanged canvas engine) */}
                <LeftToolbar
                    onUploadRasterImage={handleUploadImage}
                    onUploadSVG={handleUploadImage}
                    previewMode={previewMode}
                    showGrid={showGrid}
                    snapToGrid={snapToGrid}
                    onToggleGrid={() => onToggleGrid()}
                    onToggleSnap={() => onToggleSnap()}
                />

                {/* BIODATA QUICK-INSERT RAIL */}
                {showBioPanel && !previewMode && (
                    <div
                        className={styles.leftSidebar}
                        style={{
                            width: 168,
                            flexShrink: 0,
                            borderRight: '1px solid var(--border-panel, #e2e8f0)',
                            background: 'var(--bg-panel, #ffffff)',
                            overflowY: 'auto',
                            padding: 12,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: '#b91c1c' }}>
                            <Users size={16} />
                            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>BIODATA TOOLS</span>
                        </div>

                        <div style={{ display: 'grid', gap: 8 }}>
                            <BioToolButton icon={<Frame size={15} />} label="Photo Frame" onClick={addPhotoFrame} />
                            {selectedIsEmptyFrame && (
                                <p style={{ fontSize: 10, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: 6, margin: '-2px 0 4px' }}>
                                    Selected frame has no photo. Use “Upload Image” then click the frame, or pick a photo above.
                                </p>
                            )}
                            <BioToolButton icon={<Sparkles size={15} />} label="Ornament Divider" onClick={addOrnamentDivider} />
                            <BioToolButton icon={<ImageIcon size={15} />} label="Info Badge" onClick={addInfoBadge} />
                        </div>

                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-panel-muted, #64748b)', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Section Titles
                        </div>
                        <div style={{ display: 'grid', gap: 6 }}>
                            {BIODATA_SECTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => addSectionTitle(s)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                                        border: '1px solid var(--border-panel, #e2e8f0)',
                                        background: 'var(--bg-panel-input, #f8fafc)',
                                        color: 'var(--text-panel, #0f172a)', fontSize: 11, fontWeight: 600,
                                        textAlign: 'left',
                                    }}
                                >
                                    <Type size={13} /> {s}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--border-panel, #e2e8f0)' }}>
                            <button
                                onClick={() => setShowBioPanel(false)}
                                style={{ width: '100%', padding: '6px 0', fontSize: 10, color: 'var(--text-panel-muted, #64748b)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Hide Biodata panel
                            </button>
                        </div>
                    </div>
                )}

                {!showBioPanel && !previewMode && (
                    <button
                        onClick={() => setShowBioPanel(true)}
                        title="Show Biodata tools"
                        style={{
                            width: 34, flexShrink: 0, alignSelf: 'stretch',
                            border: 'none', borderRight: '1px solid var(--border-panel, #e2e8f0)',
                            background: '#fef3c7', color: '#b91c1c', cursor: 'pointer', fontSize: 18,
                        }}
                    >
                        <Users size={16} />
                    </button>
                )}

                {/* CANVAS STAGE (unchanged canvas engine) */}
                <main className={styles.canvasPane}>
                    <div className={styles.canvasScroll}>
                        <CanvasStage
                            pageRef={pageRef}
                            showGrid={showGrid}
                            previewMode={previewMode}
                        />
                    </div>
                </main>

                {/* PROPERTIES PANEL (unchanged canvas engine) */}
                <aside className={styles.propertiesPane}>
                    <div className={styles.propertiesPaneInner}>
                        <PropertiesPanel
                            element={selectedElement}
                            onUploadClick={handleUploadImage}
                            previewMode={previewMode}
                        />
                    </div>
                </aside>
            </div>

            <ImageCropModal />
        </div>
    );
};

const BioToolButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px', borderRadius: 8, cursor: 'pointer', width: '100%',
            border: '1px solid #fca5a5', background: '#fff1f2', color: '#b91c1c',
            fontSize: 12, fontWeight: 700,
        }}
    >
        {icon} {label}
    </button>
);

export default AdminBiodataCanvas;
