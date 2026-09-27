'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Stamp, ArrowLeft, Upload, FileText, CheckCircle2, Loader2, Download, Trash2 } from 'lucide-react';
import { watermarkPdf, formatFileSize, downloadBlob, WatermarkOptions } from '@/utils/pdfTools';

export default function WatermarkPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
    const [watermarkFontSize, setWatermarkFontSize] = useState(48);
    const [watermarkType, setWatermarkType] = useState<'center' | 'diagonal' | 'horizontal' | 'corner' | 'tiled'>('diagonal');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
            setError('Please select a valid PDF file.');
            return;
        }

        setError(null);
        setResultBlob(null);
        setFile(selected);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleWatermark = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setResultBlob(null);

        try {
            const options: WatermarkOptions = {
                text: watermarkText,
                opacity: watermarkOpacity,
                fontSize: watermarkFontSize,
                color: '#888888',
                type: watermarkType,
            };
            const result = await watermarkPdf(file, options);
            setResultBlob(result.blob);
        } catch (err: any) {
            setError(err.message || 'An error occurred while watermarking the PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'watermarked';
        downloadBlob(resultBlob, `${baseName}-watermarked.pdf`);
    };

    return (
        <>
            <Header />
            <main style={{ padding: '40px 20px', backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 130px)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <Link href="/pdf-tools" replace className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <ArrowLeft size={16} /> Back to PDF Tools
                        </Link>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Stamp size={26} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Watermark PDF File</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Add custom text overlays to your PDF documents securely in your browser.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '20px', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    {!file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed var(--border-color)',
                                borderRadius: '16px',
                                padding: '50px 20px',
                                textAlign: 'center',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                marginBottom: '30px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,application/pdf"
                                style={{ display: 'none' }}
                            />
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                <Upload size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Click to upload a PDF file or drag and drop
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Select any PDF document to add a watermark
                            </p>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{ color: '#f59e0b' }}>
                                        <FileText size={22} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {file.name}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setFile(null); setResultBlob(null); }}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <Trash2 size={14} /> Change File
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '24px', alignItems: 'start', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>Watermark Text</label>
                                        <input
                                            type="text"
                                            value={watermarkText}
                                            onChange={(e) => setWatermarkText(e.target.value)}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>Watermark Type / Layout</label>
                                        <select
                                            value={watermarkType}
                                            onChange={(e) => setWatermarkType(e.target.value as any)}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                                        >
                                            <option value="diagonal">Diagonal Watermark</option>
                                            <option value="center">Center Watermark</option>
                                            <option value="horizontal">Horizontal Watermark</option>
                                            <option value="corner">Corner Watermark</option>
                                            <option value="tiled">Tiled / Repeated Watermark</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.05"
                                            value={watermarkOpacity}
                                            onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>Font Size: {watermarkFontSize} pt</label>
                                        <input
                                            type="range"
                                            min="12"
                                            max="120"
                                            step="2"
                                            value={watermarkFontSize}
                                            onChange={(e) => setWatermarkFontSize(parseInt(e.target.value) || 48)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                {/* Live Preview Box */}
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', textAlign: 'center' }}>Live Preview</label>
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '1 / 1.414',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '8px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '16px'
                                    }}>
                                        {/* Mock Document Content Lines */}
                                        <div style={{ position: 'absolute', inset: '16px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.15, pointerEvents: 'none' }}>
                                            <div style={{ height: '12px', backgroundColor: '#334155', borderRadius: '4px', width: '80%' }}></div>
                                            <div style={{ height: '8px', backgroundColor: '#334155', borderRadius: '4px', width: '100%' }}></div>
                                            <div style={{ height: '8px', backgroundColor: '#334155', borderRadius: '4px', width: '90%' }}></div>
                                            <div style={{ height: '8px', backgroundColor: '#334155', borderRadius: '4px', width: '95%' }}></div>
                                            <div style={{ height: '12px', backgroundColor: '#334155', borderRadius: '4px', width: '60%', marginTop: '10px' }}></div>
                                            <div style={{ height: '8px', backgroundColor: '#334155', borderRadius: '4px', width: '100%' }}></div>
                                            <div style={{ height: '8px', backgroundColor: '#334155', borderRadius: '4px', width: '85%' }}></div>
                                        </div>

                                        {/* Watermark Overlay Preview */}
                                        {watermarkType === 'tiled' ? (
                                            <div style={{
                                                position: 'absolute',
                                                inset: '0',
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gridTemplateRows: 'repeat(3, 1fr)',
                                                alignItems: 'center',
                                                justifyItems: 'center',
                                                opacity: watermarkOpacity,
                                                transform: 'rotate(-25deg)',
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                color: '#64748b',
                                            }}>
                                                <div>{watermarkText || 'WATERMARK'}</div>
                                                <div>{watermarkText || 'WATERMARK'}</div>
                                                <div>{watermarkText || 'WATERMARK'}</div>
                                                <div>{watermarkText || 'WATERMARK'}</div>
                                                <div>{watermarkText || 'WATERMARK'}</div>
                                                <div>{watermarkText || 'WATERMARK'}</div>
                                            </div>
                                        ) : (
                                            <div style={{
                                                position: 'absolute',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                textAlign: 'center',
                                                opacity: watermarkOpacity,
                                                transform: watermarkType === 'diagonal' ? 'rotate(-35deg)' : 'none',
                                                top: watermarkType === 'corner' ? '12px' : watermarkType === 'horizontal' ? '45%' : 'auto',
                                                right: watermarkType === 'corner' ? '12px' : 'auto',
                                                fontWeight: 800,
                                                fontSize: `${Math.max(9, watermarkFontSize * 0.32)}px`,
                                                color: '#64748b',
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                                padding: '4px 8px',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '90%'
                                            }}>
                                                {watermarkText || 'WATERMARK'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleWatermark}
                                    disabled={isProcessing}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="spin" /> Applying Watermark...
                                        </>
                                    ) : (
                                        <>
                                            <Stamp size={18} /> Apply Watermark
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {resultBlob && (
                        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '24px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 750, color: '#166534' }}>
                                        Watermark Applied Successfully!
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                                        {formatFileSize(resultBlob.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="btn btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                            >
                                <Download size={16} /> Download
                            </button>
                        </div>
                    )}

                </div>
            </main>
            <Footer />
        </>
    );
}
