'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCanvasStore } from '@/canvas/store';
import { sampleTemplates } from '@/templates/registry';
import { CanvasStage } from '@/app/editor/[category]/[templateId]/components/CanvasStage';
import { LeftToolbar } from '@/app/editor/[category]/[templateId]/components/LeftToolbar';
import { PropertiesPanel } from '@/app/editor/[category]/[templateId]/components/PropertiesPanel';
import { CommandPalette } from '@/app/editor/[category]/[templateId]/components/CommandPalette';
import { ImageCropModal } from '@/app/editor/[category]/[templateId]/components/ImageCropModal';
import { CanvasDocument } from '@/canvas/types';
import styles from '@/app/editor/[category]/[templateId]/editor.module.css';
import { ArrowLeft, Download, Upload, Send, Save, RefreshCw, Check, Loader2, FileCode, Layers } from 'lucide-react';

export default function AdminTemplateBuilderPage() {
    const router = useRouter();
    const {
        document: doc,
        selectedId,
        loadDocument,
        selectElement,
        updateElement,
        snapToGrid,
        setSnapToGrid,
    } = useCanvasStore();

    const [isClient, setIsClient] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [showGrid, setShowGrid] = useState(true);
    const [showRulers, setShowRulers] = useState(true);
    const [previewMode, setPreviewMode] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Metadata Fields
    const [filename, setFilename] = useState('my-new-template.ts');
    const [exportName, setExportName] = useState('myNewTemplate');
    const [templateId, setTemplateId] = useState('resume-custom');
    const [category, setCategory] = useState<'resume' | 'biodata' | 'cv' | 'cover-letter' | 'portfolio'>('resume');
    const [displayName, setDisplayName] = useState('My Custom Template');
    const [isPremium, setIsPremium] = useState(false);
    const [thumbnail, setThumbnail] = useState('');

    const pageRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sidebarImageInputRef = useRef<HTMLInputElement>(null);
    const svgInputRef = useRef<HTMLInputElement>(null);
    const tsImportInputRef = useRef<HTMLInputElement>(null);
    const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setThumbnail(dataUrl);
            if (e.target) e.target.value = '';
        };
        reader.readAsDataURL(file);
    };

    // Transparent image box workflow states
    const [showTransPrompt, setShowTransPrompt] = useState(false);
    const [pendingTransImgSrc, setPendingTransImgSrc] = useState('');
    const [selectedImgElementId, setSelectedImgElementId] = useState('');
    const [showColorSelect, setShowColorSelect] = useState(false);
    const [selectedTransColor, setSelectedTransColor] = useState('#ffffff');

    // ── Image Box replacement (prompts for transparency) ──────────────────────────────────
    const handlePhotoReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const selected = doc?.elements.find((el) => el.id === selectedId);
            if (selected?.type === 'image' || selected?.type === 'frame') {
                setPendingTransImgSrc(dataUrl);
                setSelectedImgElementId(selected.id);
                setShowTransPrompt(true);
            }
            if (e.target) e.target.value = '';
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        setIsClient(true);
        const params = new URLSearchParams(window.location.search);
        const editId = params.get('edit');
        if (editId) {
            const existingTemplate = sampleTemplates[editId];
            if (existingTemplate) {
                setTemplateId(existingTemplate.id);
                setDisplayName(existingTemplate.name);
                setCategory((existingTemplate.category || 'resume') as any);
                setIsPremium(existingTemplate.isPremium || false);
                setThumbnail(existingTemplate.thumbnail || '');
                setFilename(`${existingTemplate.id}.ts`);
                setExportName(`${existingTemplate.id.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())}Template`);
                loadDocument(existingTemplate, true);
                return;
            }
        }

        // Initialize with a blank canvas or default template
        const defaultDoc: CanvasDocument = {
            id: templateId,
            name: displayName,
            category: category,
            isPremium: isPremium,
            page: {
                id: 'page-1',
                width: 210,
                height: 297,
                background: '#ffffff',
            },
            elements: [
                {
                    id: 'title-1',
                    type: 'text',
                    label: 'Template Title',
                    x: 20,
                    y: 20,
                    width: 170,
                    height: 15,
                    rotation: 0,
                    zIndex: 1,
                    visible: true,
                    locked: false,
                    content: displayName,
                    style: {
                        fontSize: 24,
                        fontWeight: 'bold',
                        fontStyle: 'normal',
                        textDecoration: 'none',
                        fontFamily: 'Inter, sans-serif',
                        color: '#1e293b',
                        textAlign: 'left',
                        lineHeight: 1.2,
                        letterSpacing: 0,
                        padding: 0,
                    },
                },
            ],
        };
        loadDocument(defaultDoc, true);
    }, []);

    // Update document metadata when local metadata state changes
    useEffect(() => {
        if (doc) {
            useCanvasStore.setState({
                document: {
                    ...doc,
                    id: templateId,
                    name: displayName,
                    category: category,
                    isPremium: isPremium,
                    thumbnail: thumbnail || undefined,
                },
            });
        }
    }, [templateId, displayName, category, isPremium, thumbnail]);

    // Handle TS / JSON Template Import
    const handleImportTS = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            try {
                let parsed: any;
                if (content.trim().startsWith('{')) {
                    parsed = JSON.parse(content);
                } else {
                    const jsonMatch = content.match(/=\s*({[\s\S]*});?\s*$/);
                    if (jsonMatch) {
                        parsed = Function(`return ${jsonMatch[1]}`)();
                    } else {
                        throw new Error('Could not parse template object from file.');
                    }
                }

                if (parsed && parsed.elements && parsed.page) {
                    loadDocument(parsed, true);
                    if (parsed.id) setTemplateId(parsed.id);
                    if (parsed.name) {
                        setDisplayName(parsed.name);
                        setFilename(`${parsed.id || 'template'}.ts`);
                        setExportName(`${(parsed.id || 'template').replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())}Template`);
                    }
                    if (parsed.category) setCategory(parsed.category);
                    if (typeof parsed.isPremium === 'boolean') setIsPremium(parsed.isPremium);
                    setPublishMessage({ type: 'success', text: 'Template successfully imported!' });
                } else {
                    throw new Error('Invalid CanvasDocument structure.');
                }
            } catch (err: any) {
                setPublishMessage({ type: 'error', text: `Import failed: ${err.message}` });
            }
            if (e.target) e.target.value = '';
        };
        reader.readAsText(file);
    };

    // Export TS File Download
    const handleExportTS = () => {
        if (!doc) return;
        const fileContent = `import { CanvasDocument } from '@/canvas/types';

export const ${exportName}: CanvasDocument = ${JSON.stringify(
            {
                ...doc,
                id: templateId,
                name: displayName,
                category: category,
                isPremium: isPremium,
            },
            null,
            2
        )};
`;
        const blob = new Blob([fileContent], { type: 'text/typescript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.ts') ? filename : `${filename}.ts`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Publish to Website via Admin API
    const handlePublish = async () => {
        if (!doc) return;
        setIsPublishing(true);
        setPublishMessage(null);

        try {
            const payload = {
                filename,
                exportName,
                templateId,
                category,
                displayName,
                isPremium,
                document: {
                    ...doc,
                    id: templateId,
                    name: displayName,
                    category: category,
                    isPremium: isPremium,
                },
            };

            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to publish template.');
            }

            setPublishMessage({ type: 'success', text: data.message });
        } catch (err: any) {
            setPublishMessage({ type: 'error', text: err.message });
        } finally {
            setIsPublishing(false);
        }
    };

    if (!isClient || !doc) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.loadingSpinner} />
                <p>Loading Admin Template Builder…</p>
            </div>
        );
    }

    const selectedElement = doc.elements.find((el) => el.id === selectedId) || null;

    return (
        <div className={styles.workspace} data-theme={theme} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            {/* Hidden file inputs */}
            <input ref={tsImportInputRef} type="file" accept=".ts,.js,.json" style={{ display: 'none' }} onChange={handleImportTS} />
            <input ref={sidebarImageInputRef} type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />
            <input ref={svgInputRef} type="file" accept="image/svg+xml" style={{ display: 'none' }} />
            <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} onChange={handlePhotoReplace} />
            <input ref={thumbnailFileInputRef} type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} onChange={handleThumbnailSelect} />

            {/* ADMIN TOP BAR */}
            <header className={styles.toolbar} style={{ borderBottom: '2px solid #6366f1', background: '#1e1b4b', color: '#fff' }}>
                <div className={styles.toolbarLeft} style={{ gap: '15px' }}>
                    <button
                        className={styles.backBtn}
                        onClick={() => router.push('/admin/templates')}
                        title="Back to Admin Dashboard"
                        style={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={20} color="#818cf8" />
                        <span style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.5px' }}>Admin Template Builder</span>
                    </div>
                </div>

                {/* METADATA QUICK FIELDS IN TOOLBAR */}
                <div className={styles.toolbarCenter} style={{ gap: '10px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        style={{ padding: '6px 10px', borderRadius: '6px', background: '#312e81', color: '#fff', border: '1px solid #4f46e5', fontSize: '12px' }}
                        title="Template Category"
                    >
                        <option value="resume">Resume</option>
                        <option value="biodata">Biodata</option>
                        <option value="cv">CV</option>
                        <option value="cover-letter">Cover Letter</option>
                        <option value="portfolio">Portfolio</option>
                    </select>

                    <select
                        value={isPremium ? 'premium' : 'free'}
                        onChange={(e) => setIsPremium(e.target.value === 'premium')}
                        style={{ padding: '6px 10px', borderRadius: '6px', background: '#312e81', color: '#fff', border: '1px solid #4f46e5', fontSize: '12px' }}
                        title="Free or Premium Pricing"
                    >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                    </select>

                    <input
                        type="text"
                        value={templateId}
                        onChange={(e) => {
                            const val = e.target.value;
                            setTemplateId(val);
                            setFilename(`${val}.ts`);
                            setExportName(`${val.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())}Template`);
                        }}
                        placeholder="Template ID (e.g. resume-custom)"
                        style={{ padding: '6px 10px', borderRadius: '6px', background: '#312e81', color: '#fff', border: '1px solid #4f46e5', fontSize: '12px', width: '150px' }}
                        title="Template ID"
                    />

                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Display Name"
                        style={{ padding: '6px 10px', borderRadius: '6px', background: '#312e81', color: '#fff', border: '1px solid #4f46e5', fontSize: '12px', width: '140px' }}
                        title="Template Display Name"
                    />

                    <button
                        type="button"
                        onClick={() => thumbnailFileInputRef.current?.click()}
                        style={{ padding: '6px 12px', borderRadius: '6px', background: thumbnail ? '#065f46' : '#312e81', color: '#fff', border: '1px solid #4f46e5', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        title="Select Thumbnail Image File"
                    >
                        <span>{thumbnail ? '✓ Thumbnail Selected' : 'Select Thumbnail...'}</span>
                    </button>

                    <input
                        type="text"
                        value={exportName}
                        onChange={(e) => setExportName(e.target.value)}
                        placeholder="Export Const Name"
                        style={{ padding: '6px 10px', borderRadius: '6px', background: '#312e81', color: '#fff', border: '1px solid #4f46e5', fontSize: '12px', width: '130px' }}
                        title="Export TypeScript Constant Name"
                    />

                    <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        placeholder="Filename (.ts)"
                        style={{ padding: '6px 10px', borderRadius: '6px', background: '#312e81', color: '#fff', border: '1px solid #4f46e5', fontSize: '12px', width: '120px' }}
                        title="Filename (.ts)"
                    />
                </div>

                {/* ACTIONS */}
                <div className={styles.toolbarRight} style={{ gap: '8px' }}>
                    <button
                        className={styles.resetBtn}
                        onClick={() => tsImportInputRef.current?.click()}
                        title="Import TS Template"
                        style={{ background: '#3730a3', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                    >
                        <Upload size={13} />
                        <span>Import TS</span>
                    </button>

                    <button
                        className={styles.resetBtn}
                        onClick={handleExportTS}
                        title="Download TS Template File"
                        style={{ background: '#3730a3', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                    >
                        <Download size={13} />
                        <span>Export TS</span>
                    </button>

                    <button
                        className={styles.saveBtn}
                        onClick={handlePublish}
                        disabled={isPublishing}
                        title="Publish Template to Website"
                        style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}
                    >
                        {isPublishing ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={14} />}
                        <span>Publish to Website</span>
                    </button>
                </div>
            </header>

            {/* PUBLISH STATUS BANNER */}
            {publishMessage && (
                <div
                    style={{
                        padding: '10px 20px',
                        background: publishMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                        color: publishMessage.type === 'success' ? '#065f46' : '#991b1b',
                        borderBottom: `1px solid ${publishMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                        fontWeight: 500,
                    }}
                >
                    <span>{publishMessage.text}</span>
                    <button onClick={() => setPublishMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'inherit' }}>×</button>
                </div>
            )}

            {/* EDITOR BODY */}
            <div className={styles.editorBody} style={{ flex: 1, overflow: 'hidden' }}>
                <LeftToolbar
                    onUploadRasterImage={() => sidebarImageInputRef.current?.click()}
                    onUploadSVG={() => svgInputRef.current?.click()}
                    snapToGrid={snapToGrid}
                    onToggleSnap={() => setSnapToGrid(!snapToGrid)}
                    showGrid={showGrid}
                    onToggleGrid={() => setShowGrid((v) => !v)}
                    showRulers={showRulers}
                    onToggleRulers={() => setShowRulers((v) => !v)}
                    previewMode={previewMode}
                    onTogglePreview={() => setPreviewMode((v) => !v)}
                />

                <main className={styles.canvasPane}>
                    <div className={styles.canvasScroll}>
                        <CanvasStage
                            pageRef={pageRef}
                            showGrid={showGrid}
                            showRulers={showRulers}
                            previewMode={previewMode}
                        />
                    </div>
                </main>

                <aside className={styles.propertiesPane}>
                    <div className={styles.propertiesPaneInner}>
                        <PropertiesPanel
                            element={selectedElement}
                            onUploadClick={() => fileInputRef.current?.click()}
                            previewMode={previewMode}
                        />
                    </div>
                </aside>
            </div>

            {/* ── TRANSPARENT IMAGE QUESTION MODAL ── */}
            {showTransPrompt && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalHeader}>Transparent Background?</h3>
                        <p className={styles.modalBody}>
                            Does the image you are inserting have a transparent background?
                        </p>
                        <div className={styles.modalFooter} style={{ flexDirection: 'column', gap: 10 }}>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                                onClick={() => {
                                    setShowTransPrompt(false);
                                    setShowColorSelect(true);
                                }}
                                style={{ width: '100%' }}
                            >
                                Yes, It's Transparent
                            </button>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                                onClick={() => {
                                    if (selectedImgElementId && pendingTransImgSrc) {
                                        updateElement(selectedImgElementId, { src: pendingTransImgSrc, backgroundColor: 'transparent' } as any);
                                    }
                                    setShowTransPrompt(false);
                                    setPendingTransImgSrc('');
                                    setSelectedImgElementId('');
                                }}
                                style={{ width: '100%' }}
                            >
                                No, Normal Import
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── BACKGROUND COLOR SELECTION MODAL ── */}
            {showColorSelect && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalHeader}>Select Background Color</h3>
                        <p className={styles.modalBody} style={{ marginBottom: 16 }}>
                            Choose a background color to apply behind the transparent parts of this photo:
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
                            {[
                                { label: 'White', value: '#ffffff' },
                                { label: 'Black', value: '#000000' },
                                { label: 'Cream', value: '#fdf6e2' },
                                { label: 'Gray', value: '#f1f5f9' },
                                { label: 'Navy', value: '#1e3a8a' },
                                { label: 'Rose', value: '#ffe4e6' },
                                { label: 'Mint', value: '#ecfdf5' }
                            ].map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setSelectedTransColor(color.value)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '8px 4px',
                                        borderRadius: '8px',
                                        border: selectedTransColor === color.value ? '2px solid #6366f1' : '2px solid transparent',
                                        background: 'var(--bg-panel-input)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: color.value,
                                        border: '1px solid var(--border-panel)',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                                    }} />
                                    <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-panel)' }}>{color.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className={styles.modalFooter} style={{ flexDirection: 'column', gap: 10 }}>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                                onClick={() => {
                                    if (selectedImgElementId && pendingTransImgSrc) {
                                        updateElement(selectedImgElementId, { src: pendingTransImgSrc, backgroundColor: selectedTransColor } as any);
                                    }
                                    setShowColorSelect(false);
                                    setPendingTransImgSrc('');
                                    setSelectedImgElementId('');
                                }}
                                style={{ width: '100%' }}
                            >
                                Apply Color
                            </button>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                                onClick={() => {
                                    setShowColorSelect(false);
                                    setPendingTransImgSrc('');
                                    setSelectedImgElementId('');
                                }}
                                style={{ width: '100%' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ImageCropModal />
        </div>
    );
}
