'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Undo2,
    Redo2,
    RotateCcw,
    Download,
    ChevronDown,
    ChevronUp,
    FileText,
    Sparkles,
    Flower2,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useBiodataStore, createDefaultDocument } from '@/hooks/useBiodataStore';
import { BiodataPreviewClassic } from '@/components/biodata/BiodataPreviewClassic';
import { BiodataPreviewModern } from '@/components/biodata/BiodataPreviewModern';
import { BiodataPreviewFloral } from '@/components/biodata/BiodataPreviewFloral';
import { PhotoHeadingEditor } from '@/components/biodata/PhotoHeadingEditor';
import { PersonalDetailsEditor } from '@/components/biodata/PersonalDetailsEditor';
import { FamilyDetailsEditor } from '@/components/biodata/FamilyDetailsEditor';
import { ContactEditor } from '@/components/biodata/ContactEditor';
import { generatePDF } from '@/utils/pdfGenerator';
import styles from './biodataGenerator.module.css';

export default function BiodataGeneratorPage() {
    const [isClient, setIsClient] = useState(false);
    const [scale, setScale] = useState(0.8);
    const [isPickingTemplate, setIsPickingTemplate] = useState(true);
    const [activeAccordion, setActiveAccordion] = useState<string>('photo');
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [exportSuccess, setExportSuccess] = useState(false);

    // Crop Modal States
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState('');
    const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
    const [cropZoom, setCropZoom] = useState(1);
    const [isDraggingCrop, setIsDraggingCrop] = useState(false);
    const [dragStartCrop, setDragStartCrop] = useState({ x: 0, y: 0 });
    const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

    const previewParentRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const {
        document: doc,
        setDocument,
        updateStyle,
        updatePhotoHeading,
        history,
        future,
        undo,
        redo,
        clearDraft,
    } = useBiodataStore();

    useEffect(() => {
        setIsClient(true);
        const params = new URLSearchParams(window.location.search);
        const tId = params.get('template');
        const defaultDoc = createDefaultDocument();
        if (tId === 'classic' || tId === 'modern' || tId === 'floral') {
            defaultDoc.style.templateId = tId;
            setIsPickingTemplate(false);
        }
        setDocument(defaultDoc, true);
    }, [setDocument]);

    useEffect(() => {
        if (!isClient || isPickingTemplate) return;
        const calcScale = () => {
            if (!previewParentRef.current) return;
            const pw = previewParentRef.current.clientWidth;
            const s = Math.min((pw - 60) / 794, 1);
            setScale(s > 0.2 ? s : 0.5);
        };
        calcScale();
        window.addEventListener('resize', calcScale);
        const t = setTimeout(calcScale, 200);
        return () => {
            window.removeEventListener('resize', calcScale);
            clearTimeout(t);
        };
    }, [isClient, isPickingTemplate]);

    const handleSelectTemplate = (templateId: 'classic' | 'modern' | 'floral') => {
        updateStyle({ templateId });
        setIsPickingTemplate(false);
        const url = new URL(window.location.href);
        url.searchParams.set('template', templateId);
        window.history.replaceState({}, '', url.toString());
    };

    const handleReset = () => {
        clearDraft();
        const defaultDoc = createDefaultDocument();
        setDocument(defaultDoc, false);
        setIsPickingTemplate(true);
    };

    const handleDownloadPDF = async () => {
        const el = previewRef.current;
        if (!el || !doc) {
            setExportError('Preview not available. Please try again.');
            return;
        }

        setIsExporting(true);
        setExportError(null);

        const rawName = doc.personal.fullName || 'Biodata';
        const cleanName = rawName.trim().replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-');
        const filename = `${cleanName}-Biodata.pdf`;

        try {
            await generatePDF(el, filename);
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (err) {
            console.error('PDF export failed:', err);
            setExportError('PDF generation failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // Crop handlers
    const openCropModal = () => {
        if (!doc) return;
        const orig = doc.photoHeading.originalPhotoUrl || doc.photoHeading.photoUrl;
        if (orig) {
            setCropImageSrc(orig);
            setCropOffset({ x: 0, y: 0 });
            setCropZoom(1);
            setShowCropModal(true);
        }
    };

    const onCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        const vw = 200;
        const vh = 240;
        const scaleFit = Math.max(vw / naturalWidth, vh / naturalHeight);
        const dw = naturalWidth * scaleFit;
        const dh = naturalHeight * scaleFit;
        setDisplaySize({ width: dw, height: dh });
        setCropOffset({
            x: (vw - dw) / 2,
            y: (vh - dh) / 2,
        });
        setCropZoom(1);
    };

    const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingCrop(true);
        setDragStartCrop({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
    };

    const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingCrop || !displaySize.width) return;
        const nextX = e.clientX - dragStartCrop.x;
        const nextY = e.clientY - dragStartCrop.y;

        const vw = 200;
        const vh = 240;
        const dw = displaySize.width * cropZoom;
        const dh = displaySize.height * cropZoom;

        const minX = vw - dw;
        const minY = vh - dh;

        const clampedX = Math.min(0, Math.max(minX, nextX));
        const clampedY = Math.min(0, Math.max(minY, nextY));

        setCropOffset({ x: clampedX, y: clampedY });
    };

    const handleCropMouseUp = () => setIsDraggingCrop(false);

    const handleZoomChange = (newZoom: number) => {
        const nextZoom = Math.max(1, Math.min(3, newZoom));
        setCropZoom(nextZoom);
    };

    const handleApplyCrop = () => {
        if (!cropImageSrc || !displaySize.width) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const vw = 200;
            const vh = 240;
            const naturalRatio = img.naturalWidth / displaySize.width;

            const sx = -cropOffset.x * naturalRatio / cropZoom;
            const sy = -cropOffset.y * naturalRatio / cropZoom;
            const sWidth = vw * naturalRatio / cropZoom;
            const sHeight = vh * naturalRatio / cropZoom;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                img,
                sx,
                sy,
                sWidth,
                sHeight,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const b64 = canvas.toDataURL('image/jpeg', 0.95);
            updatePhotoHeading({ photoUrl: b64 });
            setShowCropModal(false);
            setCropImageSrc('');
        };
        img.src = cropImageSrc;
    };

    const toggleAccordion = (id: string) =>
        setActiveAccordion((prev) => (prev === id ? '' : id));

    if (!isClient || !doc) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#1e3a8a' }}>
                Loading Biodata Generator…
            </div>
        );
    }

    if (isPickingTemplate) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>Choose Biodata Template</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Select a template to generate your biodata.</p>
                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginTop: '16px' }}>
                            <ArrowLeft size={16} /> Back to Home
                        </Link>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', flexWrap: 'wrap' }}>
                        <div
                            style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', cursor: 'pointer', width: '280px' }}
                            onClick={() => handleSelectTemplate('classic')}
                        >
                            <FileText size={48} color="#1e3a8a" style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>Classic</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 20px 0', flex: 1 }}>Professional single-column layout.</p>
                            <button style={{ width: '100%', padding: '10px', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600 }}>Select</button>
                        </div>

                        <div
                            style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', cursor: 'pointer', width: '280px' }}
                            onClick={() => handleSelectTemplate('modern')}
                        >
                            <Sparkles size={48} color="#0284c7" style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>Modern</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 20px 0', flex: 1 }}>Clean two-column editorial layout.</p>
                            <button style={{ width: '100%', padding: '10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600 }}>Select</button>
                        </div>

                        <div
                            style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', cursor: 'pointer', width: '280px' }}
                            onClick={() => handleSelectTemplate('floral')}
                        >
                            <Flower2 size={48} color="#881337" style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>Floral</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 20px 0', flex: 1 }}>Elegant wedding-style floral background.</p>
                            <button style={{ width: '100%', padding: '10px', background: '#881337', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600 }}>Select</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render logic
    const renderPreview = () => {
        switch (doc.style.templateId) {
            case 'modern': return <BiodataPreviewModern document={doc} />;
            case 'floral': return <BiodataPreviewFloral document={doc} />;
            default: return <BiodataPreviewClassic document={doc} />;
        }
    }

    return (
        <div className={styles.workspace}>
            <header className={styles.toolbar}>
                <div className={styles.toolbarBrand}>
                    <h1 className={styles.toolbarTitle}>{doc.style.templateId === 'modern' ? 'Modern Biodata' : doc.style.templateId === 'floral' ? 'Floral Biodata' : 'Classic Biodata'}</h1>
                </div>

                <div className={styles.toolbarActions}>
                    <button className={styles.iconBtn} onClick={undo} disabled={!history.length} title="Undo">
                        <Undo2 size={16} /> Undo
                    </button>
                    <button className={styles.iconBtn} onClick={redo} disabled={!future.length} title="Redo">
                        <Redo2 size={16} /> Redo
                    </button>
                    <button className={styles.iconBtn} onClick={handleReset} title="Reset">
                        <RotateCcw size={15} /> Reset
                    </button>
                    <button className={styles.downloadBtn} onClick={handleDownloadPDF} disabled={isExporting}>
                        <Download size={15} />
                        {isExporting ? 'Generating…' : 'Download PDF'}
                    </button>
                </div>
            </header>

            {exportError && <div className={styles.errorBar}>{exportError}</div>}
            {exportSuccess && <div className={styles.successBar}>PDF Download complete</div>}

            <div className={styles.main}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarScroll}>
                        <div className={styles.accordionItem}>
                            <button className={styles.accordionHeader} onClick={() => toggleAccordion('photo')}>
                                <span>Photo & Heading</span>
                                {activeAccordion === 'photo' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {activeAccordion === 'photo' && (
                                <div className={styles.accordionBody}>
                                    <PhotoHeadingEditor onOpenCrop={openCropModal} />
                                </div>
                            )}
                        </div>

                        <div className={styles.accordionItem}>
                            <button className={styles.accordionHeader} onClick={() => toggleAccordion('personal')}>
                                <span>Personal Details</span>
                                {activeAccordion === 'personal' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {activeAccordion === 'personal' && (
                                <div className={styles.accordionBody}>
                                    <PersonalDetailsEditor />
                                </div>
                            )}
                        </div>

                        <div className={styles.accordionItem}>
                            <button className={styles.accordionHeader} onClick={() => toggleAccordion('family')}>
                                <span>Family Details</span>
                                {activeAccordion === 'family' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {activeAccordion === 'family' && (
                                <div className={styles.accordionBody}>
                                    <FamilyDetailsEditor />
                                </div>
                            )}
                        </div>

                        <div className={styles.accordionItem}>
                            <button className={styles.accordionHeader} onClick={() => toggleAccordion('contact')}>
                                <span>Contact Details</span>
                                {activeAccordion === 'contact' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {activeAccordion === 'contact' && (
                                <div className={styles.accordionBody}>
                                    <ContactEditor />
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                <section className={styles.previewPanel} ref={previewParentRef}>
                    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                        <div className={styles.previewShadow} ref={previewRef}>
                            {renderPreview()}
                        </div>
                    </div>
                </section>
            </div>

            {/* Photo Crop Modal */}
            {showCropModal && cropImageSrc && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Adjust Photo</h3>
                            <button onClick={() => setShowCropModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div
                                style={{ width: '200px', height: '240px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', position: 'relative', cursor: 'grab', border: '2px solid #cbd5e1' }}
                                onMouseDown={handleCropMouseDown}
                                onMouseMove={handleCropMouseMove}
                                onMouseUp={handleCropMouseUp}
                                onMouseLeave={handleCropMouseUp}
                            >
                                <img
                                    src={cropImageSrc}
                                    alt="Crop preview"
                                    draggable={false}
                                    onLoad={onCropImageLoad}
                                    style={{
                                        width: displaySize.width * cropZoom,
                                        height: displaySize.height * cropZoom,
                                        objectFit: 'cover',
                                        transform: `translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                                        userSelect: 'none',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '280px' }}>
                                <button onClick={() => handleZoomChange(cropZoom - 0.1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                                    <ZoomOut size={16} />
                                </button>
                                <input
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.05"
                                    value={cropZoom}
                                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                                    style={{ flex: 1, accentColor: '#1e3a8a' }}
                                />
                                <button onClick={() => handleZoomChange(cropZoom + 0.1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                                    <ZoomIn size={16} />
                                </button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Drag to reposition · Use slider to zoom</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setShowCropModal(false)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={handleApplyCrop} style={{ flex: 1, padding: '10px', background: '#1e3a8a', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#ffffff', cursor: 'pointer' }}>
                                Apply Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
