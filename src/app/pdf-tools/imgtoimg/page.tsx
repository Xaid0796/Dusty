'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { ImageDown, ArrowLeft, Upload, FileText, CheckCircle2, Loader2, Download, Trash2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { formatFileSize, downloadBlob } from '@/utils/pdfTools';

interface ExtractedImage {
    pageNumber: number;
    url: string;
    fileName: string;
}

export default function PdfToImagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [pageCount, setPageCount] = useState(0);
    const [imageFormat, setImageFormat] = useState<'jpeg' | 'png'>('jpeg');
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
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
        setExtractedImages([]);

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

    const handleConvert = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setExtractedImages([]);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdfDoc = await loadingTask.promise;
            const numPages = pdfDoc.numPages;
            const results: ExtractedImage[] = [];
            const baseName = fileName.replace(/\.[^/.]+$/, '');

            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context!,
                    viewport: viewport
                }).promise;

                const mimeType = imageFormat === 'png' ? 'image/png' : 'image/jpeg';
                const dataUrl = canvas.toDataURL(mimeType, 0.9);
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                results.push({
                    pageNumber: i,
                    url,
                    fileName: `${baseName}-page-${i}.${imageFormat === 'png' ? 'png' : 'jpg'}`
                });
            }

            setExtractedImages(results);
        } catch (err: any) {
            setError(err.message || 'An error occurred while converting PDF to images.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadAll = () => {
        extractedImages.forEach((img) => {
            const a = document.createElement('a');
            a.href = img.url;
            a.download = img.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    };

    const handleReset = () => {
        setFile(null);
        setExtractedImages([]);
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
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(217, 70, 239, 0.08)', color: '#d946ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageDown size={26} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>PDF to Images Converter</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Extract every page of your PDF document into high-resolution JPG or PNG images securely in your browser.
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
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(217, 70, 239, 0.08)', color: '#d946ef', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                <Upload size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Click to upload a PDF file or drag and drop
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Select any PDF document to convert into images
                            </p>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{ color: '#d946ef' }}>
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
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>Image Format</label>
                                <select
                                    value={imageFormat}
                                    onChange={(e) => setImageFormat(e.target.value as any)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
                                >
                                    <option value="jpeg">JPG / JPEG (Smaller size)</option>
                                    <option value="png">PNG (Higher quality)</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleConvert}
                                    disabled={isProcessing}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#d946ef', borderColor: '#d946ef' }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="spin" /> Converting Pages...
                                        </>
                                    ) : (
                                        <>
                                            <ImageDown size={18} /> Convert to Images
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {extractedImages.length > 0 && (
                        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '24px', border: '1px solid #bbf7d0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 750, color: '#166534' }}>
                                        Converted {extractedImages.length} Pages Successfully!
                                    </h3>
                                </div>
                                <button
                                    onClick={handleDownloadAll}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#16a34a', borderColor: '#16a34a', padding: '8px 16px', fontSize: '0.85rem' }}
                                >
                                    <Download size={16} /> Download All
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
                                {extractedImages.map((img) => (
                                    <div key={img.pageNumber} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '8px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '100%', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '6px', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                                            <img src={img.url} alt={img.fileName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                            Page {img.pageNumber}
                                        </p>
                                        <a
                                            href={img.url}
                                            download={img.fileName}
                                            className="btn btn-sm btn-secondary"
                                            style={{ width: '100%', textAlign: 'center', fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#16a34a', color: 'white', borderColor: '#16a34a' }}
                                        >
                                            Download
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