'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  RotateCcw,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  Palette,
  User,
  FileText,
  ZoomIn,
  ZoomOut,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import {
  useGeneratorStore,
  STORAGE_KEY,
  createDefaultDocument,
} from '@/hooks/useGeneratorStore';
import { ResumePreview } from '@/components/generator/ResumePreview';
import { DraggableSections } from '@/components/generator/DraggableSections';
import {
  ContactEditor,
  StyleEditor,
} from '@/components/generator/SectionEditors';
import { generatePDF } from '@/utils/pdfGenerator';
import {
  ADDABLE_SECTION_KINDS,
  SECTION_KIND_LABELS,
} from '@/types/generator';
import type { GeneratorDocument, SectionKind } from '@/types/generator';
import styles from './generator.module.css';

// ─── Section icons for Add Section dialog ────────────────────────────────────
const SECTION_ICONS: Record<string, string> = {
  projects: '💡', internships: '🏢', certifications: '🎖️',
  achievements: '🏆', awards: '🥇', languages: '🌐',
  interests: '✨', volunteer: '🤝', publications: '📚', custom: '📝',
};

// ─── Generator Page ──────────────────────────────────────────────────────────
export default function GeneratorPage() {
  const [isClient, setIsClient] = useState(false);
  const [scale, setScale] = useState(0.8);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on client-side mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dusty_editor_theme') as 'light' | 'dark';
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('dusty_editor_theme', next);
    } catch {
      /* ignore */
    }
  };
  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('edit');

  // Modal states
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<GeneratorDocument | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [selectedKind, setSelectedKind] = useState<SectionKind>('projects');

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Accordion: tracks which section is expanded in sidebar
  const [activeAccordion, setActiveAccordion] = useState<string | null>('contact');

  // Photo crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1.2);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStartCrop, setDragStartCrop] = useState({ x: 0, y: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  // Refs
  const previewParentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const {
    document: doc,
    setDocument,
    history,
    future,
    undo,
    redo,
    addSection,
    clearDraft,
  } = useGeneratorStore();

  // ── Hydration ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ── Initialize store + check for existing draft ───────────────────────────
  useEffect(() => {
    if (!isClient) return;

    const defaultDoc = createDefaultDocument();
    setDocument(defaultDoc, true); // always start with default visually

    try {
      if (!sessionStorage.getItem('dusty_session_started')) {
        sessionStorage.setItem('dusty_session_started', 'true');
        localStorage.removeItem(STORAGE_KEY);
      }
      const rawDraft = localStorage.getItem(STORAGE_KEY);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft) as GeneratorDocument;
        // Only prompt recovery if the draft differs from the default
        if (JSON.stringify(parsed) !== JSON.stringify(defaultDoc)) {
          setPendingDraft(parsed);
          setShowDraftModal(true);
        }
      }
    } catch {
      /* malformed JSON — ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // ── A4 preview scale calculation ──────────────────────────────────────────
  useEffect(() => {
    if (!isClient) return;
    const calcScale = () => {
      if (!previewParentRef.current) return;
      const pw = previewParentRef.current.clientWidth;
      const s = Math.min((pw - 48) / 794, 1);
      setScale(s > 0.2 ? s : 0.5);
    };
    calcScale();
    window.addEventListener('resize', calcScale);
    const t = setTimeout(calcScale, 200);
    return () => {
      window.removeEventListener('resize', calcScale);
      clearTimeout(t);
    };
  }, [isClient, activeMobileTab]);

  // ── Draft recovery ─────────────────────────────────────────────────────────
  const handleContinueDraft = () => {
    if (pendingDraft) setDocument(pendingDraft, true);
    setShowDraftModal(false);
    setPendingDraft(null);
  };

  const handleStartFresh = () => {
    clearDraft();
    setDocument(createDefaultDocument(), true);
    setShowDraftModal(false);
    setPendingDraft(null);
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    clearDraft();
    setDocument(createDefaultDocument(), false);
    setShowResetModal(false);
  };

  // ── Add Section ────────────────────────────────────────────────────────────
  const handleAddSection = () => {
    addSection(selectedKind);
    setShowAddSection(false);
    // Auto-expand the newly added section
    const newId = `sec-${selectedKind}-`; // prefix — full id is in the store
    // We'll just reset accordion; user will see it at the bottom
  };

  // ── Addable kinds: always show all, plus Skills if not currently present ──
  const addableKinds = (): SectionKind[] => {
    if (!doc) return ADDABLE_SECTION_KINDS;
    const hasSkills = doc.sections.some((s) => s.kind === 'skills');
    const base = hasSkills ? ADDABLE_SECTION_KINDS : ['skills' as SectionKind, ...ADDABLE_SECTION_KINDS];
    return base;
  };

  // ── Photo upload ───────────────────────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      useGeneratorStore.getState().updateContact({ originalPhotoUrl: b64 });
      setCropImageSrc(b64);
      setCropOffset({ x: 0, y: 0 });
      setCropZoom(1.2);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const vw = 180;
    const vh = 180;
    const scale = Math.max(vw / naturalWidth, vh / naturalHeight);
    setDisplaySize({ width: naturalWidth * scale, height: naturalHeight * scale });
    setCropOffset({ x: 0, y: 0 });
  };

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCrop(true);
    setDragStartCrop({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCrop) return;
    setCropOffset({ x: e.clientX - dragStartCrop.x, y: e.clientY - dragStartCrop.y });
  };

  const handleCropMouseUp = () => setIsDraggingCrop(false);

  const handleApplyCrop = () => {
    if (!cropImageSrc) return;
    const img = new Image();
    img.onload = () => {
      const vw = 180;
      const vh = 180;
      const baseScale = Math.max(vw / img.naturalWidth, vh / img.naturalHeight);
      const dw = img.naturalWidth * baseScale * cropZoom;
      const dh = img.naturalHeight * baseScale * cropZoom;
      const dx = (dw - vw) / 2 - cropOffset.x;
      const dy = (dh - vh) / 2 - cropOffset.y;
      const sf = img.naturalWidth / dw;
      const sx = dx * sf;
      const sy = dy * sf;
      const sw = vw * sf;
      const sh = vh * sf;

      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 200, 200);
        const b64 = canvas.toDataURL('image/jpeg', 0.85);
        useGeneratorStore.getState().updateContact({ photoUrl: b64 });
        setShowCropModal(false);
        setCropImageSrc('');
      }
    };
    img.src = cropImageSrc;
  };

  // ── PDF download ───────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    const el = previewRef.current;
    if (!el) {
      setExportError('Preview not available. Please try again.');
      return;
    }
    if (!doc) return;

    setIsExporting(true);
    setExportError(null);

    const rawName = doc.contact.fullName || '';
    const cleanName = rawName.trim().replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-');
    const filename = cleanName ? `${cleanName}-Resume.pdf` : 'My-Resume.pdf';

    try {
      await generatePDF(el, filename);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export failed:', err);
      setExportError('PDF generation failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Toggle accordion ───────────────────────────────────────────────────────
  const toggleAccordion = (id: string) =>
    setActiveAccordion((prev) => (prev === id ? null : id));

  // ─── Guards ────────────────────────────────────────────────────────────────
  if (!isClient || !doc) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#64748b' }}>
        Loading Resume Generator…
      </div>
    );
  }

  const previewWrapperStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
  };

  return (
    <div
      data-theme={theme}
      className={`${styles.workspace} ${activeMobileTab === 'edit' ? styles.showEditor : styles.showPreview
        }`}
    >
      {/* ── Hidden photo file input ─────────────────────────────────────────── */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />

      {/* ── Top Toolbar ─────────────────────────────────────────────────────── */}
      <header className={styles.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <span className={styles.toolbarTitle}>Resume Generator</span>
            <span className={styles.toolbarSub}>Professional single-format resume</span>
          </div>
        </div>

        <div className={styles.toolbarActions}>
          <div className={styles.saveStatus}>
            <span className={styles.saveDot} />
            Auto-saved
          </div>

          <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <button className={styles.iconBtn} onClick={undo} disabled={!history.length} title="Undo">
            <Undo2 size={15} /> Undo
          </button>
          <button className={styles.iconBtn} onClick={redo} disabled={!future.length} title="Redo">
            <Redo2 size={15} /> Redo
          </button>
          <button className={styles.iconBtn} onClick={() => setShowResetModal(true)} title="Reset">
            <RotateCcw size={15} /> Reset
          </button>
          <button className={styles.downloadBtn} onClick={handleDownloadPDF} disabled={isExporting}>
            <Download size={15} />
            {isExporting ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </header>

      {exportError && (
        <div className={styles.errorBar}>{exportError}</div>
      )}
      {exportSuccess && (
        <div className={styles.successBar}>Download complete</div>
      )}

      {/* ── Main workspace ───────────────────────────────────────────────────── */}
      <div className={styles.main}>
        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <p className={styles.sidebarHeading}>Resume Editor</p>
          </div>

          <div className={styles.sidebarScroll}>
            {/* ── Style Settings (fixed — not in sections[]) ─────────────────── */}
            <div className={styles.fixedSection}>
              <button
                className={styles.fixedSectionHeader}
                onClick={() => toggleAccordion('style')}
              >
                <span className={styles.fixedSectionTitle}>
                  <Palette size={15} color="#0d9488" />
                  Style Settings
                  <span className={styles.fixedBadge}>Fixed</span>
                </span>
                {activeAccordion === 'style' ? (
                  <ChevronUp size={16} color="#94a3b8" />
                ) : (
                  <ChevronDown size={16} color="#94a3b8" />
                )}
              </button>
              {activeAccordion === 'style' && (
                <div className={styles.fixedSectionBody}>
                  <StyleEditor style={doc.style} />
                </div>
              )}
            </div>

            {/* ── Contact Information (fixed — not in sections[]) ────────────── */}
            <div className={styles.fixedSection}>
              <button
                className={styles.fixedSectionHeader}
                onClick={() => toggleAccordion('contact')}
              >
                <span className={styles.fixedSectionTitle}>
                  <User size={15} color="#6366f1" />
                  Contact Information
                  <span className={styles.fixedBadge}>Fixed</span>
                </span>
                {activeAccordion === 'contact' ? (
                  <ChevronUp size={16} color="#94a3b8" />
                ) : (
                  <ChevronDown size={16} color="#94a3b8" />
                )}
              </button>
              {activeAccordion === 'contact' && (
                <div className={styles.fixedSectionBody}>
                  <ContactEditor
                    contact={doc.contact}
                    onOpenPhotoUpload={() => photoInputRef.current?.click()}
                    onOpenCrop={() => {
                      const orig = doc.contact.originalPhotoUrl || doc.contact.photoUrl;
                      if (orig) {
                        setCropImageSrc(orig);
                        setCropOffset({ x: 0, y: 0 });
                        setCropZoom(1.2);
                        setShowCropModal(true);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* ── Reorderable content sections ──────────────────────────────── */}
            <DraggableSections
              sections={doc.sections}
              activeAccordion={activeAccordion}
              onToggleAccordion={toggleAccordion}
            />

            {/* ── Add Section ───────────────────────────────────────────────── */}
            <button
              className={styles.addSectionBtn}
              onClick={() => setShowAddSection(true)}
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>
        </aside>

        {/* ── RIGHT PREVIEW ──────────────────────────────────────────────────── */}
        <section className={styles.previewPanel} ref={previewParentRef}>
          <div style={previewWrapperStyle}>
            <div className={styles.previewShadow}>
              {/* previewRef captures the unscaled inner A4 element for PDF */}
              <div ref={previewRef}>
                <ResumePreview document={doc} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Mobile tab nav ───────────────────────────────────────────────────── */}
      <nav className={styles.mobileTabs}>
        <button
          className={`${styles.mobileTabBtn} ${activeMobileTab === 'edit' ? styles.mobileTabBtnActive : ''}`}
          onClick={() => setActiveMobileTab('edit')}
        >
          ✏️ Edit
        </button>
        <button
          className={`${styles.mobileTabBtn} ${activeMobileTab === 'preview' ? styles.mobileTabBtnActive : ''}`}
          onClick={() => setActiveMobileTab('preview')}
        >
          👁 Preview
        </button>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ── Draft Recovery Modal ──────────────────────────────────────────── */}
      {showDraftModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="dialog" aria-modal="true">
            <h3 className={styles.modalTitle}>Continue editing?</h3>
            <p className={styles.modalBody}>
              You have an unsaved resume draft from a previous session.
              Would you like to continue where you left off, or start fresh with the sample resume?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={handleStartFresh}>
                Start Fresh
              </button>
              <button className={styles.btnPrimary} onClick={handleContinueDraft}>
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Confirmation Modal ──────────────────────────────────────── */}
      {showResetModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="dialog" aria-modal="true">
            <h3 className={styles.modalTitle}>Reset Resume?</h3>
            <p className={styles.modalBody}>
              This will remove all your current changes and restore the default sample resume.
              This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setShowResetModal(false)}>
                Cancel
              </button>
              <button className={styles.btnDanger} onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Section Modal ─────────────────────────────────────────────── */}
      {showAddSection && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="dialog" aria-modal="true" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.modalTitle} style={{ margin: 0 }}>Add a Section</h3>
              <button onClick={() => setShowAddSection(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.addSectionList}>
              {addableKinds().map((kind) => (
                <button
                  key={kind}
                  className={`${styles.addSectionOption} ${selectedKind === kind ? styles.addSectionOptionSelected : ''}`}
                  onClick={() => setSelectedKind(kind)}
                >
                  <span>{SECTION_ICONS[kind] ?? '📄'}</span>
                  {SECTION_KIND_LABELS[kind]}
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setShowAddSection(false)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleAddSection}>
                <Plus size={14} style={{ marginRight: 4 }} />
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Crop Modal ──────────────────────────────────────────────── */}
      {showCropModal && cropImageSrc && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="dialog" aria-modal="true" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.modalTitle} style={{ margin: 0 }}>Adjust Photo</h3>
              <button onClick={() => setShowCropModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {/* Crop viewport */}
              <div
                className={styles.cropViewport}
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
              >
                <img
                  src={cropImageSrc}
                  alt="Crop preview"
                  draggable={false}
                  onLoad={onCropImageLoad}
                  style={{
                    width: displaySize.width * cropZoom,
                    height: displaySize.height * cropZoom,
                    objectFit: 'cover',
                    transform: `translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* Zoom controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setCropZoom((z) => Math.max(0.5, z - 0.1))}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex' }}
                >
                  <ZoomOut size={16} color="#475569" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  style={{ width: '160px' }}
                />
                <button
                  onClick={() => setCropZoom((z) => Math.min(3, z + 0.1))}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex' }}
                >
                  <ZoomIn size={16} color="#475569" />
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, textAlign: 'center' }}>
                Drag to reposition · Use slider to zoom
              </p>
            </div>

            <div className={styles.modalActions} style={{ marginTop: '20px' }}>
              <button className={styles.btnSecondary} onClick={() => setShowCropModal(false)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleApplyCrop}>
                Apply Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
