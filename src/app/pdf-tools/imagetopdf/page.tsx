'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Image as ImageIcon, ArrowLeft, Upload, FileText, CheckCircle2, Loader2, Download, Trash2 } from 'lucide-react';
import { imagesToPdf, formatFileSize, downloadBlob, ImageToPdfOptions } from '@/utils/pdfTools';

export default function ImageToPdfPage() {
    const [images, setImages] = useState<File[]>([]);
    const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        const validImages: File[] = [];
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
                validImages.push(file);
            }
        }

        if (validImages.length === 0) {
            setError('Please select valid image files (JPG, PNG, WebP).');
            return;
        }

        setError(null);
        setResultBlob(null);
        setImages((prev) => [...prev, ...validImages]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setResultBlob(null);
    };

    const handleConvert = async () => {
        if (images.length === 0) return;

        setIsProcessing(true);
        setError(null);
        setResultBlob(null);

        try {
            const options: ImageToPdfOptions = {
                pageSize,
                orientation,
                margin: [20, 20, 20, 20]
            };
            const result = await imagesToPdf(images, options);
            setResultBlob(result.blob);
            setPageCount(result.pageCount);
        } catch (err: any) {
            setError(err.message || 'An error occurred while converting images to PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        downloadBlob(resultBlob, 'images-converted.pdf');
    };

    const handleReset = () => {
        setImages([]);
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
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={26} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Images to PDF Converter</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Convert JPG, PNG, or WebP images into a single professional PDF document securely in your browser.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '20px', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: '2px dashed var(--border-color)',
                            borderRadius: '16px',
                            padding: '40px 20px',
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
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                        />
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                            <Upload size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            Click to upload images or drag and drop
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Support JPG, PNG, WebP (multiple files allowed)
                        </p>
                    </div>

                    {images.length > 0 && (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    Selected Images ({images.length})
                                </h3>
                                <button
                                    onClick={handleReset}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Clear All
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px', maxHeight: '250px', overflowY: 'auto' }}>
                                {images.map((img, index) => (
                                    <div key={index} style={{ position: 'relative', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '6px', borderRadius: '4px', backgroundColor: '#fff' }}>
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={img.name}
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                                            {img.name}
                                        </p>
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                                            title="Remove image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>Page Size</label>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(e.target.value as any)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
                                    >
                                        <option value="a4">A4 (Standard)</option>
                                        <option value="letter">US Letter</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>Orientation</label>
                                    <select
                                        value={orientation}
                                        onChange={(e) => setOrientation(e.target.value as any)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
                                    >
                                        <option value="portrait">Portrait</option>
                                        <option value="landscape">Landscape</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleConvert}
                                    disabled={isProcessing}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="spin" /> Converting...
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon size={18} /> Convert to PDF
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
                                        Conversion Successful!
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                                        {formatFileSize(resultBlob.size)} • {pageCount} pages generated
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