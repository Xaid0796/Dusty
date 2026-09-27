'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Trash2, ArrowLeft, Upload, FileText, CheckCircle2, Loader2, Download, X } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { formatFileSize, downloadBlob, parsePageRange } from '@/utils/pdfTools';

export default function DeletePdfPagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [pageCount, setPageCount] = useState(0);
    const [pagesToDelete, setPagesToDelete] = useState('');
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

            setFile(selected);
            setFileName(selected.name);
            setFileSize(formatFileSize(selected.size));
            setPageCount(count);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Could not read the PDF file. It might be corrupted or password protected.');
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDeletePages = async () => {
        if (!file) return;

        if (!pagesToDelete.trim()) {
            setError('Please specify pages to delete (e.g. 2, 4-6).');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResultBlob(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const totalPages = sourcePdf.getPageCount();

            const deleteIndices = parsePageRange(pagesToDelete, totalPages);
            const keepIndices: number[] = [];

            for (let i = 0; i < totalPages; i++) {
                if (!deleteIndices.includes(i)) {
                    keepIndices.push(i);
                }
            }

            if (keepIndices.length === 0) {
                setError('Cannot delete all pages from the PDF document.');
                setIsProcessing(false);
                return;
            }

            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, keepIndices);
            copiedPages.forEach((p) => newPdf.addPage(p));

            const bytes = await newPdf.save();
            const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            setResultBlob(blob);
        } catch (err: any) {
            setError(err.message || 'An error occurred while deleting pages.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
        downloadBlob(resultBlob, `${baseName}-pages-removed.pdf`);
    };

    const handleReset = () => {
        setFile(null);
        setResultBlob(null);
        setPagesToDelete('');
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
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={26} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Delete Pages from PDF</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Remove unwanted pages or page ranges from your PDF document securely in your browser.
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
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                <Upload size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Click to upload a PDF file or drag and drop
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Select any PDF document to remove pages from
                            </p>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{ color: '#ef4444' }}>
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

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                                    Pages to Delete
                                </label>
                                <input
                                    type="text"
                                    value={pagesToDelete}
                                    onChange={(e) => setPagesToDelete(e.target.value)}
                                    placeholder="e.g. 2, 5, 7-9"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                    Specify page numbers or ranges to remove, separated by commas (e.g. 3, 5-7).
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleDeletePages}
                                    disabled={isProcessing}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="spin" /> Deleting Pages...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={18} /> Delete Pages & Save
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
                                        Pages Deleted Successfully!
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