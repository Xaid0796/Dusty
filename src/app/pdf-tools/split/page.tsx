'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Scissors, Merge, ArrowLeft, Upload, FileText, CheckCircle2, Loader2, Download, Trash2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface SplitResult {
  fileName: string;
  url: string;
  pageRange: string;
}

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [pageRangeInput, setPageRangeInput] = useState<string>('');
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
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
    setSplitResults([]);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize(formatFileSize(selectedFile.size));
      setPageCount(count);
      setPageRangeInput(`1-${count}`);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Could not read the PDF file. It might be corrupted or password protected.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parsePageRanges = (input: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(maxPages, Math.max(start, end));
          for (let i = min; i <= max; i++) {
            pages.add(i - 1); // 0-indexed for pdf-lib
          }
        }
      } else {
        const pageNum = parseInt(trimmed, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          pages.add(pageNum - 1);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsSplitting(true);
    setError(null);
    setSplitResults([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const totalPages = sourcePdf.getPageCount();
      const results: SplitResult[] = [];

      if (splitMode === 'all') {
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          const baseName = fileName.replace(/\.[^/.]+$/, '');
          results.push({
            fileName: `${baseName}-page-${i + 1}.pdf`,
            url,
            pageRange: `Page ${i + 1}`,
          });
        }
      } else {
        const pageIndices = parsePageRanges(pageRangeInput, totalPages);
        if (pageIndices.length === 0) {
          setError('Please enter a valid page range (e.g., 1-3, 5).');
          setIsSplitting(false);
          return;
        }

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const baseName = fileName.replace(/\.[^/.]+$/, '');
        results.push({
          fileName: `${baseName}-extracted.pdf`,
          url,
          pageRange: `Pages: ${pageRangeInput}`,
        });
      }

      setSplitResults(results);
    } catch (err) {
      console.error('Split failed:', err);
      setError('An error occurred while splitting the PDF. Please try again.');
    } finally {
      setIsSplitting(false);
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
            <Link href="/pdf-tools/merge" replace className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Merge size={16} /> Switch to Merge Tool
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scissors size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Split PDF File</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Extract specific page ranges or split every page into individual PDF files securely.
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
                Select any PDF document to split or extract pages from
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
                      {fileSize} • {pageCount} pages total
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); setSplitResults([]); }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={14} /> Change File
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
                  Split Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setSplitMode('range')}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: splitMode === 'range' ? '2px solid #10b981' : '1px solid #cbd5e1',
                      backgroundColor: splitMode === 'range' ? '#f0fdf4' : 'white',
                      color: splitMode === 'range' ? '#065f46' : 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    Extract by Range / Pages
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Extract specific pages or page ranges
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSplitMode('all')}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: splitMode === 'all' ? '2px solid #10b981' : '1px solid #cbd5e1',
                      backgroundColor: splitMode === 'all' ? '#f0fdf4' : 'white',
                      color: splitMode === 'all' ? '#065f46' : 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    Split Every Page
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Save each page as a separate PDF file
                    </span>
                  </button>
                </div>
              </div>

              {splitMode === 'range' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Page Ranges
                  </label>
                  <input
                    type="text"
                    value={pageRangeInput}
                    onChange={(e) => setPageRangeInput(e.target.value)}
                    placeholder="e.g. 1-3, 5, 7-10"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Enter page numbers and/or page ranges separated by commas (e.g., 1-3, 5, 8-{pageCount}).
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSplit}
                  disabled={isSplitting}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                >
                  {isSplitting ? (
                    <>
                      <Loader2 size={18} className="spin" /> Splitting PDF...
                    </>
                  ) : (
                    <>
                      <Scissors size={18} /> {splitMode === 'all' ? `Split into ${pageCount} PDFs` : 'Extract PDF'}
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* Results */}
          {splitResults.length > 0 && (
            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '24px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 750, color: '#166534' }}>
                  PDF Split Successful! ({splitResults.length} file{splitResults.length > 1 ? 's' : ''})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {splitResults.map((res, i) => (
                  <div
                    key={i}
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
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {res.fileName}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {res.pageRange}
                      </p>
                    </div>

                    <a
                      href={res.url}
                      download={res.fileName}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#16a34a', color: 'white', borderColor: '#16a34a' }}
                    >
                      <Download size={14} /> Download
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
