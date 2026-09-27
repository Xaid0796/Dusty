'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { FileText, Upload, CheckCircle2, Loader2, ArrowUp, ArrowDown, Trash2, X, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface ExtractedPage {
    pageNumber: number;
    fileName: string;
    url: string;
}

export default function ExtractPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [fileSize, setFileSize] = useState<string>('');
    const [pageCount, setPageCount] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
            setError('Please select a valid PDF file.');
            return;
        }

        setError(null);
        setExtractedPages([]);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const count = pdfDoc.getPageCount();

            setFile(selectedFile);
            setFileName(selectedFile.name);
            setFileSize(formatFileSize(selectedFile.size));
            setPageCount(count);
            // Select all pages by default
            setSelectedPages(Array.from({ length: count }, (_, i) => i));
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Could not read the PDF file. It might be corrupted or password protected.');
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const togglePageSelect = (index: number) => {
        const newSelected = selectedPages.includes(index)
            ? selectedPages.filter((i) => i !== index)
            : [...selectedPages, index];
        setSelectedPages(newSelected);
    };

    const selectAllPages = () => {
        setSelectedPages(Array.from({ length: pageCount }, (_, i) => i));
    };

    const clearSelection = () => {
        setSelectedPages([]);
    };

    const handleExtract = async () => {
        if (!file) {
            setError('Please upload a PDF file first.');
            return;
        }

        if (selectedPages.length === 0) {
            setError('Please select at least one page to extract.');
            return;
        }

        setIsExtracting(true);
        setError(null);
        setExtractedPages([]);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pagesToExtract = sourcePdf.getPages();
            const extractedPagesList: ExtractedPage[] = [];

            // Create the new PDF
            const newPdf = await PDFDocument.create();

            // Copy only the selected pages
            for (const pageIndex of selectedPages) {
                const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageIndex]);
                newPdf.addPage(copiedPage);

                // Prepare individual file for download
                const pdfBytes = await newPdf.save({ useObjectStreams: false });
                const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                const baseName = fileName.replace(/\.[^/.]+$/, '');
                extractedPagesList.push({
                    pageNumber: pageIndex + 1,
                    fileName: `${baseName}-page-${pageIndex + 1}.pdf`,
                    url,
                });
            }

            setExtractedPages(extractedPagesList);
        } catch (err) {
            console.error('Extraction failed:', err);
            setError('An error occurred while extracting pages. Please try again.');
        } finally {
            setIsExtracting(false);
        }
    };

    const downloadAll = () => {
        extractedPages.forEach((page) => {
            const link = document.createElement('a');
            link.href = page.url;
            link.download = page.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    const clearResults = () => {
        setExtractedPages([]);
        clearSelection();
    };

    const handleReset = () => {
        setFile(null);
        setExtractedPages([]);
        setSelectedPages([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <Header />
            <main style={{ padding: '40px 20px', backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 130px)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <Link href="/pdf-tools" replace className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <X size={16} /> Back to PDF Tools
                        </Link>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={26} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Extract Pages</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Select specific pages to extract into a new PDF document.
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
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                <Upload size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Click to upload a PDF file or drag and drop
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Select any PDF document to extract pages from
                            </p>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{ color: '#10b981' }}>
                                        <FileText size={22} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {fileName}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {fileSize}
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                        Select Pages to Extract ({selectedPages.length} of {pageCount})
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={selectAllPages}
                                            disabled={selectedPages.length === pageCount}
                                            className="btn btn-sm btn-secondary"
                                            style={{ fontSize: '0.85rem' }}
                                        >
                                            Select All
                                        </button>
                                        {selectedPages.length > 0 && (
                                            <button
                                                onClick={clearSelection}
                                                className="btn btn-sm btn-secondary"
                                                style={{ fontSize: '0.85rem' }}
                                            >
                                                Clear Selection
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px', maxHeight: '300px', overflowY: 'auto', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => togglePageSelect(pageNum - 1)}
                                            style={{
                                                aspectRatio: '1',
                                                borderRadius: '8px',
                                                border: selectedPages.includes(pageNum - 1)
                                                    ? '3px solid #10b981'
                                                    : '2px solid #cbd5e1',
                                                backgroundColor: selectedPages.includes(pageNum - 1) ? '#f0fdf4' : 'white',
                                                color: selectedPages.includes(pageNum - 1) ? '#10b981' : 'var(--text-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.9rem',
                                                fontWeight: selectedPages.includes(pageNum - 1) ? 700 : 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            title={`Page ${pageNum}`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>

                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    Click each page to select/deselect. Selected pages will be extracted into a new PDF document.
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleExtract}
                                    disabled={isExtracting || selectedPages.length === 0}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                                >
                                    {isExtracting ? (
                                        <>
                                            <Loader2 size={18} className="spin" /> Extracting...
                                        </>
                                    ) : (
                                        <>
                                            <FileText size={18} /> Extract {selectedPages.length} Page{selectedPages.length > 1 ? 's' : ''}
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    )}

                    {/* Results */}
                    {extractedPages.length > 0 && (
                        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '24px', border: '1px solid #bbf7d0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 750, color: '#166534' }}>
                                        {extractedPages.length} Page{extractedPages.length > 1 ? 's' : ''} Extracted Successfully!
                                    </h3>
                                </div>
                                <button
                                    onClick={clearResults}
                                    className="btn btn-sm btn-secondary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                                >
                                    <X size={14} /> Clear
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <button
                                    onClick={downloadAll}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                                >
                                    <Download size={18} /> Download All
                                </button>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Extracted pages will be downloaded one by one
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                                {extractedPages.map((page) => (
                                    <div
                                        key={page.pageNumber}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 16px',
                                            backgroundColor: 'white',
                                            borderRadius: '10px',
                                            border: '1px solid #bbf7d0'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                                                {page.pageNumber}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                    {page.fileName}
                                                </p>
                                            </div>
                                        </div>

                                        <a
                                            href={page.url}
                                            download={page.fileName}
                                            className="btn btn-sm btn-secondary"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#16a34a', color: 'white', borderColor: '#16a34a', padding: '8px 16px' }}
                                        >
                                            <FileText size={14} /> Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>
            <Footer />
        </>
    );
}