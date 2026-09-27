'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Minimize2, ArrowLeft, Upload, FileText, CheckCircle2, Loader2, Download, Trash2, Merge } from 'lucide-react';
import { compressPdf, formatFileSize, downloadBlob, CompressionLevel } from '@/utils/pdfTools';

export default function CompressPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [compressLevel, setCompressLevel] = useState<CompressionLevel>('medium');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [resultPageCount, setResultPageCount] = useState<number>(0);
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

    const handleCompress = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setResultBlob(null);

        try {
            const result = await compressPdf(file, compressLevel);
            setResultBlob(result.blob);
            setResultPageCount(result.pageCount);
        } catch (err: any) {
            setError(err.message || 'An error occurred while compressing the PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'compressed';
        downloadBlob(resultBlob, `${baseName}-compressed.pdf`);
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
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Minimize2 size={26} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Compress PDF File</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Reduce your PDF file size securely in your browser without uploading to external servers.
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
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                <Upload size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Click to upload a PDF file or drag and drop
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Select any PDF document to compress
                            </p>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{ color: '#3b82f6' }}>
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

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                    Compression Level
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '10px' }}>
                                    {(['low', 'medium', 'high'] as CompressionLevel[]).map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setCompressLevel(level)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '10px',
                                                border: compressLevel === level ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                                backgroundColor: compressLevel === level ? '#eff6ff' : 'white',
                                                color: compressLevel === level ? '#1d4ed8' : 'var(--text-primary)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#b45309', backgroundColor: '#fffbeb', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    ⚠️ <strong>Note:</strong> Higher compression levels (especially Medium & High) reduce image quality and may slightly affect text sharpness or cause minor visual degradation in image-heavy PDFs.
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleCompress}
                                    disabled={isProcessing}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="spin" /> Compressing...
                                        </>
                                    ) : (
                                        <>
                                            <Minimize2 size={18} /> Compress PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {resultBlob && (() => {
                        const originalSize = file?.size || 1;
                        const compressedSize = resultBlob.size;
                        const savingsBytes = originalSize - compressedSize;
                        const savingsPercent = originalSize > 0 ? Math.max(0, Math.round((savingsBytes / originalSize) * 100)) : 0;

                        return (
                            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '24px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 750, color: '#166534', marginBottom: '4px' }}>
                                            Compression Successful! ({savingsPercent}% smaller)
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                                            Original: <strong>{formatFileSize(originalSize)}</strong> → Compressed: <strong>{formatFileSize(compressedSize)}</strong>
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
                        );
                    })()}

                </div>
            </main>
            <Footer />
        </>
    );
}