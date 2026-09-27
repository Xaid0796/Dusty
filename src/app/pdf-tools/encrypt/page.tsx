'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Lock, ArrowLeft, Upload, FileText, CheckCircle2, Loader2, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { encryptPdf, formatFileSize, downloadBlob } from '@/utils/pdfTools';

export default function EncryptPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [userPassword, setUserPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
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

    const handleEncrypt = async () => {
        if (!file) return;

        if (!userPassword || userPassword.length < 4) {
            setError('Password must be at least 4 characters.');
            return;
        }

        if (userPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResultBlob(null);

        try {
            const result = await encryptPdf(file, {
                userPassword,
                ownerPassword: userPassword,
                permissions: ['all'],
            });
            setResultBlob(result.blob);
        } catch (err: any) {
            setError(err.message || 'An error occurred while protecting the PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'protected';
        downloadBlob(resultBlob, `${baseName}-protected.pdf`);
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
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(220, 38, 38, 0.08)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock size={26} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Protect PDF with Password</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Encrypt your PDF with a secure password. Completely client-side and private.
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
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(220, 38, 38, 0.08)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                <Upload size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                                Click to upload a PDF file or drag and drop
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Select any PDF document to protect with a password
                            </p>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{ color: '#dc2626' }}>
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
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPasswords ? 'text' : 'password'}
                                        value={userPassword}
                                        onChange={(e) => setUserPassword(e.target.value)}
                                        placeholder="Enter password (min 4 characters)"
                                        style={{
                                            width: '100%',
                                            padding: '12px 44px 12px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            backgroundColor: '#f8fafc',
                                            fontSize: '0.95rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            padding: '4px'
                                        }}
                                    >
                                        {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                    Required to open the PDF. Minimum 4 characters.
                                </p>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                    Confirm Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPasswords ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter password"
                                        style={{
                                            width: '100%',
                                            padding: '12px 44px 12px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            backgroundColor: '#f8fafc',
                                            fontSize: '0.95rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleEncrypt}
                                    disabled={isProcessing}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="spin" /> Encrypting...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} /> Protect PDF
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
                                        Encryption Successful!
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                                        New size: {formatFileSize(resultBlob.size)} (Original: {formatFileSize(file?.size || 0)})
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
