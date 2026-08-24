'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Merge, Scissors, ArrowLeft, Upload, Trash2, ArrowUp, ArrowDown, FileText, CheckCircle2, Loader2, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: string;
  pageCount?: number;
}

export default function MergePdfPage() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedFileName, setMergedFileName] = useState<string>('merged-document.pdf');
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
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    setError(null);
    setMergedUrl(null);

    const newItems: PdfFileItem[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select valid PDF files only.');
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();

        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          size: formatFileSize(file.size),
          pageCount,
        });
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(`Could not read ${file.name}. It might be corrupted or password protected.`);
      }
    }

    setFiles((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
    setMergedUrl(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
    setMergedUrl(null);
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
    setMergedUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setError(null);
    setMergedUrl(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageIndices = Array.from({ length: pdf.getPageCount() }, (_, i) => i);
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
    } catch (err) {
      console.error('Merge failed:', err);
      setError('An error occurred while merging the PDF files. Please try again.');
    } finally {
      setIsMerging(false);
    }
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
            <Link href="/pdf-tools/split" replace className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Scissors size={16} /> Switch to Split Tool
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Merge size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Merge PDF Files</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Combine multiple PDF documents into one secure file instantly in your browser.
              </p>
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '20px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {/* Upload Dropzone */}
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
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
            />
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
              <Upload size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Click to upload PDF files or drag and drop
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              You can select multiple PDF files at once
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Files to Merge ({files.length})
                </h3>
                <button
                  onClick={() => { setFiles([]); setMergedUrl(null); }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {files.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <div style={{ color: '#ef4444' }}>
                        <FileText size={20} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {item.size} {item.pageCount !== undefined ? `• ${item.pageCount} pages` : ''}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                        disabled={index === files.length - 1}
                        title="Move Down"
                        style={{ padding: '6px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: index === files.length - 1 ? 'not-allowed' : 'pointer', opacity: index === files.length - 1 ? 0.4 : 1 }}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        title="Remove"
                        style={{ padding: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', cursor: 'pointer', marginLeft: '6px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={handleMerge}
                  disabled={isMerging || files.length < 2}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', opacity: files.length < 2 ? 0.6 : 1 }}
                >
                  {isMerging ? (
                    <>
                      <Loader2 size={18} className="spin" /> Merging PDFs...
                    </>
                  ) : (
                    <>
                      <Merge size={18} /> Merge {files.length} PDFs
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success / Download Result */}
          {mergedUrl && (
            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '30px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 750, color: '#166534', marginBottom: '8px' }}>
                PDFs Merged Successfully!
              </h3>
              <p style={{ color: '#15803d', fontSize: '0.9rem', marginBottom: '20px' }}>
                Your combined PDF document is ready for download.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <a
                  href={mergedUrl}
                  download={mergedFileName}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                >
                  <Download size={18} /> Download Merged PDF
                </a>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
