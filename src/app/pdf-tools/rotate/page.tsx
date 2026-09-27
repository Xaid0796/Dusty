'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { RotateCcw, ArrowLeft, Upload, FileText, CheckCircle2, Loader2, Download, Trash2 } from 'lucide-react';
import { rotatePdf, formatFileSize, downloadBlob, parsePageRange, RotationAngle } from '@/utils/pdfTools';

export default function RotatePdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [fileSize, setFileSize] = useState<string>('');
    const [pageCount, setPageCount] = useState<number>(0);
    const [rotationAngle, setRotationAngle] = useState<RotationAngle>(90);
    const [pagesInput, setPagesInput] = useState<string>('all');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
            setError('Please select a valid PDF file.');
            return;
        }

        setError(null);
        setResultBlob(null);

        try {
            const arrayBuffer = await selected.arrayBuffer();
            const pdfDoc = await (await import('pdf-lib')).PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const count = pdfDoc.getPageCount();

            setFile(selected);
            setFileName(selected.name);
            setFileSize(formatFileSize(selected.size));
            setPageCount(count);
            setPagesInput(`1-${count}`);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Could not read the PDF file. It might be corrupted or password protected.');
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRotate = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setResultBlob(null);

        try {
            const pageIndices = pagesInput.trim().toLowerCase() === 'all'
                ? 'all'
                : parsePageRange(pagesInput, pageCount).join(',');

            const result = await rotatePdf(file, rotationAngle, pageIndices);
            setResultBlob(result.blob);
        } catch (err: any) {
            setError(err.message || 'An error occurred while rotating the PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'rotated';
        downloadBlob(resultBlob, `${baseName}-rotated-${rotationAngle}.pdf`);
    };

    const handleReset = () => {
        setFile(null);
        setFileName('');
        setFileSize('');
        setPageCount(0);
        setPagesInput('all');
        setResultBlob(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
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
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.08)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RotateCcw size={26} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Rotate PDF Pages</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Rotate pages by 90°, 180°, or 270° for all or specific pages in your PDF document.
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
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.08)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                <Upload size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Click to upload a PDF file or drag and drop
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Select any PDF document to rotate pages
                            </p>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{ color: '#6366f1' }}>
                                        <FileText size={22} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {fileName}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {fileSize} • {pageCount} pages total
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleReset}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <Trash2 size={14} /> Change File
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                        Rotation Angle
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        {([90, 180, 270] as RotationAngle[]).map((angle) => (
                                            <button
                                                key={angle}
                                                type="button"
                                                onClick={() => setRotationAngle(angle)}
                                                style={{
                                                    padding: '16px',
                                                    borderRadius: '10px',
                                                    border: rotationAngle === angle ? '2px solid #6366f1' : '1px solid #cbd5e1',
                                                    backgroundColor: rotationAngle === angle ? '#ede9fe' : 'white',
                                                    color: rotationAngle === angle ? '#3730a3' : 'var(--text-primary)',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    fontSize: '1.1rem'
                                                }}
                                            >
                                                {angle}°
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                        Pages to Rotate
                                    </label>
                                    <input
                                        type="text"
                                        value={pagesInput}
                                        onChange={(e) => setPagesInput(e.target.value)}
                                        placeholder="e.g. 1-3, 5, 7-10"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                        Enter page numbers and/or ranges separated by commas. Use "all" for all pages.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleRotate}
                                    disabled={isProcessing}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#6366f1', borderColor: '#6366f1' }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="spin" /> Rotating...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw size={18} /> Rotate PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {resultBlob && (
                        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '24px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 750, color: '#166534', marginBottom: '4px' }}>
                                        Rotation Successful!
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                                        {formatFileSize(resultBlob.size)} • {pageCount} pages rotated by {rotationAngle}°
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