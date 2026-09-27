'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { MoveVertical, ArrowLeft, Upload, FileText, CheckCircle2, Loader2, Download, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { formatFileSize, downloadBlob } from '@/utils/pdfTools';

interface PageItem {
    id: string;
    originalIndex: number;
    pageNumber: number;
}

export default function ReorderPdfPagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [pages, setPages] = useState<PageItem[]>([]);
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
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const count = pdfDoc.getPageCount();

            const items: PageItem[] = Array.from({ length: count }, (_, i) => ({
                id: Math.random().toString(36).substring(2, 9),
                originalIndex: i,
                pageNumber: i + 1
            }));

            setFile(selected);
            setFileName(selected.name);
            setFileSize(formatFileSize(selected.size));
            setPages(items);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Could not read the PDF file. It might be corrupted or password protected.');
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        setPages((prev) => {
            const updated = [...prev];
            const temp = updated[index];
            updated[index] = updated[index - 1];
            updated[index - 1] = temp;
            return updated;
        });
        setResultBlob(null);
    };

    const handleMoveDown = (index: number) => {
        if (index === pages.length - 1) return;
        setPages((prev) => {
            const updated = [...prev];
            const temp = updated[index];
            updated[index] = updated[index + 1];
            updated[index + 1] = temp;
            return updated;
        });
        setResultBlob(null);
    };

    const handleReorder = async () => {
        if (!file || pages.length === 0) return;

        setIsProcessing(true);
        setError(null);
        setResultBlob(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const newPdf = await PDFDocument.create();

            const indicesToCopy = pages.map((p) => p.originalIndex);
            const copiedPages = await newPdf.copyPages(sourcePdf, indicesToCopy);
            copiedPages.forEach((p) => newPdf.addPage(p));

            const bytes = await newPdf.save();
            const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            setResultBlob(blob);
        } catch (err: any) {
            setError(err.message || 'An error occurred while reordering pages.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
        downloadBlob(resultBlob, `${baseName}-reordered.pdf`);
    };

    const handleReset = () => {
        setFile(null);
        setPages([]);
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
                            <MoveVertical size={26} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Reorder PDF Pages</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Rearrange the sequence of pages in your PDF document securely in your browser.
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
                                Select any PDF document to reorder its pages
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
                                            {fileSize} • {pages.length} pages total
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

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                    Arrange Page Sequence
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    {pages.map((item, index) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px 14px',
                                                backgroundColor: 'white',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', width: '24px' }}>
                                                    #{index + 1}
                                                </span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    Original Page {item.pageNumber}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => handleMoveUp(index)}
                                                    disabled={index === 0}
                                                    title="Move Up"
                                                    style={{ padding: '6px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.4 : 1 }}
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveDown(index)}
                                                    disabled={index === pages.length - 1}
                                                    title="Move Down"
                                                    style={{ padding: '6px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: index === pages.length - 1 ? 'not-allowed' : 'pointer', opacity: index === pages.length - 1 ? 0.4 : 1 }}
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleReorder}
                                    disabled={isProcessing}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#6366f1', borderColor: '#6366f1' }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="spin" /> Reordering...
                                        </>
                                    ) : (
                                        <>
                                            <MoveVertical size={18} /> Save Reordered PDF
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
                                        Reordering Successful!
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                                        New size: {formatFileSize(resultBlob.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="btn btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                            >
                                <Download size={16} /> Download PDF
                            </button>
                        </div>
                    )}

                </div>
            </main>
            <Footer />
        </>
    );
}