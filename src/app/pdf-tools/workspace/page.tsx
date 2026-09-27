'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import {
    Merge,
    Scissors,
    Stamp,
    Minimize2,
    RefreshCw,
    Upload,
    Download,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Trash2,
    FileText,
    ChevronRight,
} from 'lucide-react';
import {
    mergePdfs,
    compressPdf,
    watermarkPdf,
    splitPdf,
    rotatePdf,
    formatFileSize,
    downloadBlob,
} from '@/utils/pdfTools';
import type { PdfToolId, CompressionLevel, WatermarkOptions, RotationAngle, SplitOptions } from '@/utils/pdfTools';
import styles from './workspace.module.css';

// ─── Pipeline Step Type ──────────────────────────────────────────────────────

interface PipelineStep {
    id: PdfToolId;
    label: string;
    icon: React.ReactNode;
    status: 'pending' | 'active' | 'completed';
}

const TOOL_DEFINITIONS: { id: PdfToolId; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'merge', label: 'Merge PDF', icon: <Merge size={18} />, description: 'Combine multiple PDFs into one' },
    { id: 'compress', label: 'Compress PDF', icon: <Minimize2 size={18} />, description: 'Reduce file size' },
    { id: 'watermark', label: 'Watermark', icon: <Stamp size={18} />, description: 'Add text overlay to pages' },
    { id: 'split', label: 'Split PDF', icon: <Scissors size={18} />, description: 'Extract specific pages' },
    { id: 'rotate', label: 'Rotate Pages', icon: <RefreshCw size={18} />, description: 'Change page orientation' },
];

export default function PdfWorkspacePage() {
    // ─── State ─────────────────────────────────────────────────────────────────
    const [activeTool, setActiveTool] = useState<PdfToolId>('merge');
    const [pipeline, setPipeline] = useState<PipelineStep[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [resultPageCount, setResultPageCount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Watermark options
    const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
    const [watermarkDiagonal, setWatermarkDiagonal] = useState(true);

    // Split options
    const [splitFrom, setSplitFrom] = useState(1);
    const [splitTo, setSplitTo] = useState(1);

    // Rotate options
    const [rotateAngle, setRotateAngle] = useState<RotationAngle>(90);

    // Compress options
    const [compressLevel, setCompressLevel] = useState<CompressionLevel>('medium');

    // ─── Handlers ──────────────────────────────────────────────────────────────

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files;
        if (!selected || selected.length === 0) return;
        setError(null);
        setResultBlob(null);

        const pdfFiles = Array.from(selected).filter(
            (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );

        if (pdfFiles.length === 0) {
            setError('Please select valid PDF files only.');
            return;
        }

        setFiles((prev) => [...prev, ...pdfFiles]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setResultBlob(null);
    };

    const handleClearFiles = () => {
        setFiles([]);
        setResultBlob(null);
        setError(null);
    };

    const handleSwitchTool = (toolId: PdfToolId) => {
        setActiveTool(toolId);
        setError(null);
        setResultBlob(null);
    };

    const handleChainNext = () => {
        if (!resultBlob) return;
        const chainedFile = new File([resultBlob], 'pipeline-output.pdf', { type: 'application/pdf' });
        setFiles([chainedFile]);
        setResultBlob(null);
        setError(null);
    };

    const handleExecute = async () => {
        if (files.length === 0) {
            setError('Please upload at least one PDF file.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResultBlob(null);

        try {
            let result;

            switch (activeTool) {
                case 'merge': {
                    if (files.length < 2) {
                        setError('Merge requires at least 2 PDF files.');
                        setIsProcessing(false);
                        return;
                    }
                    result = await mergePdfs(files);
                    break;
                }
                case 'compress': {
                    result = await compressPdf(files[0], compressLevel);
                    break;
                }
                case 'watermark': {
                    const options: WatermarkOptions = {
                        text: watermarkText,
                        opacity: watermarkOpacity,
                        fontSize: 48,
                        color: '#888888',
                        type: watermarkDiagonal ? 'diagonal' : 'horizontal',
                    };
                    result = await watermarkPdf(files[0], options);
                    break;
                }
                case 'split': {
                    const options: SplitOptions = { fromPage: splitFrom, toPage: splitTo };
                    result = await splitPdf(files[0], options);
                    break;
                }
                case 'rotate': {
                    result = await rotatePdf(files[0], rotateAngle);
                    break;
                }
                default:
                    throw new Error('Unknown tool');
            }

            setResultBlob(result.blob);
            setResultPageCount(result.pageCount);

            // Update pipeline
            setPipeline((prev) => {
                const existing = prev.find((s) => s.id === activeTool);
                if (existing) {
                    return prev.map((s) => (s.id === activeTool ? { ...s, status: 'completed' as const } : s));
                }
                return [...prev, { id: activeTool, label: TOOL_DEFINITIONS.find((t) => t.id === activeTool)?.label || '', icon: null, status: 'completed' as const }];
            });
        } catch (err: any) {
            setError(err.message || 'An error occurred while processing the PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const toolDef = TOOL_DEFINITIONS.find((t) => t.id === activeTool);
        const fileName = `${toolDef?.label?.toLowerCase().replace(/\s+/g, '-') || 'output'}-result.pdf`;
        downloadBlob(resultBlob, fileName);
    };

    const handleResetPipeline = () => {
        setPipeline([]);
        setFiles([]);
        setResultBlob(null);
        setError(null);
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <Header />
            <main className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>PDF Tools Workspace</h1>
                    <p className={styles.subtitle}>
                        Chain multiple PDF operations together without re-uploading. Process files locally — nothing leaves your browser.
                    </p>
                </div>

                <div className={styles.workspaceGrid}>
                    {/* ─── Side Panel: Tool Selector ─────────────────────────────────── */}
                    <aside className={styles.sidebar}>
                        <span className={styles.sidebarTitle}>PDF Tools</span>
                        {TOOL_DEFINITIONS.map((tool) => (
                            <button
                                key={tool.id}
                                className={`${styles.toolButton} ${activeTool === tool.id ? styles.toolButtonActive : ''}`}
                                onClick={() => handleSwitchTool(tool.id)}
                            >
                                {tool.icon}
                                <span>{tool.label}</span>
                            </button>
                        ))}

                        {/* Pipeline Reset */}
                        {pipeline.length > 0 && (
                            <button
                                className={styles.toolButton}
                                onClick={handleResetPipeline}
                                style={{ marginTop: 'auto', color: '#ef4444' }}
                            >
                                <RefreshCw size={18} />
                                <span>Reset Pipeline</span>
                            </button>
                        )}
                    </aside>

                    {/* ─── Content Area ──────────────────────────────────────────────── */}
                    <section className={styles.contentArea}>

                        {/* Pipeline Tray */}
                        {pipeline.length > 0 && (
                            <div className={styles.pipelineTray}>
                                {pipeline.map((step, idx) => (
                                    <React.Fragment key={step.id}>
                                        <div
                                            className={`${styles.pipelineStep} ${step.status === 'completed' ? styles.pipelineStepCompleted : styles.pipelineStepActive
                                                }`}
                                        >
                                            <CheckCircle2 size={14} />
                                            <span>{step.label}</span>
                                        </div>
                                        {idx < pipeline.length - 1 && <ChevronRight size={14} color="#94a3b8" />}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.9rem' }}>
                                {error}
                            </div>
                        )}

                        {/* Upload Dropzone */}
                        <div className={styles.dropZone} onClick={() => fileInputRef.current?.click()}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                multiple={activeTool === 'merge'}
                                accept=".pdf,application/pdf"
                                style={{ display: 'none' }}
                            />
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.08)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                <Upload size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                {activeTool === 'merge' ? 'Click to upload multiple PDF files' : 'Click to upload a PDF file'}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Files are processed locally in your browser
                            </p>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 16px',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                            <FileText size={20} color="#ef4444" />
                                            <div style={{ overflow: 'hidden' }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {file.name}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(index)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleClearFiles}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-end' }}
                                >
                                    Clear All
                                </button>
                            </div>
                        )}

                        {/* Tool-Specific Options */}
                        {activeTool === 'watermark' && files.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Watermark Text</label>
                                <input
                                    type="text"
                                    value={watermarkText}
                                    onChange={(e) => setWatermarkText(e.target.value)}
                                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                />
                                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.05"
                                    value={watermarkOpacity}
                                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                                />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                    <input type="checkbox" checked={watermarkDiagonal} onChange={(e) => setWatermarkDiagonal(e.target.checked)} />
                                    Diagonal placement
                                </label>
                            </div>
                        )}

                        {activeTool === 'split' && files.length > 0 && (
                            <div style={{ display: 'flex', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>From Page</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={splitFrom}
                                        onChange={(e) => setSplitFrom(parseInt(e.target.value) || 1)}
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100px', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>To Page</label>
                                    <input
                                        type="number"
                                        min={splitFrom}
                                        value={splitTo}
                                        onChange={(e) => setSplitTo(parseInt(e.target.value) || 1)}
                                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTool === 'rotate' && files.length > 0 && (
                            <div style={{ display: 'flex', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                {([90, 180, 270] as RotationAngle[]).map((angle) => (
                                    <button
                                        key={angle}
                                        onClick={() => setRotateAngle(angle)}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            border: rotateAngle === angle ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                            background: rotateAngle === angle ? '#dbeafe' : 'white',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {angle}°
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeTool === 'compress' && files.length > 0 && (
                            <div style={{ display: 'flex', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                {(['low', 'medium', 'high'] as CompressionLevel[]).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setCompressLevel(level)}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            border: compressLevel === level ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                            background: compressLevel === level ? '#dbeafe' : 'white',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button
                                className={styles.actionBtn}
                                onClick={handleExecute}
                                disabled={isProcessing || files.length === 0}
                            >
                                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                                {isProcessing ? 'Processing...' : 'Execute'}
                            </button>

                            {resultBlob && (
                                <>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={handleDownload}
                                        style={{ background: '#10b981' }}
                                    >
                                        <Download size={18} />
                                        Download ({formatFileSize(resultBlob.size)})
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={handleChainNext}
                                        style={{ background: '#8b5cf6' }}
                                    >
                                        <ArrowRight size={18} />
                                        Chain Next Tool
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Result Info */}
                        {resultBlob && (
                            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircle2 size={20} color="#16a34a" />
                                <div>
                                    <p style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>Operation completed successfully</p>
                                    <p style={{ fontSize: '0.85rem', color: '#166534' }}>
                                        {resultPageCount} page{resultPageCount !== 1 ? 's' : ''} • {formatFileSize(resultBlob.size)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}