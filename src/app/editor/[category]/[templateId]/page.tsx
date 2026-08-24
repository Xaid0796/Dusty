'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCanvasStore } from '@/canvas/store';
import { sampleTemplates } from '@/templates/registry';
import { exportCanvasToPDF } from '@/canvas/pdfExport';
import { Toolbar } from './components/Toolbar';
import { LeftToolbar } from './components/LeftToolbar';
import { CanvasStage } from './components/CanvasStage';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CommandPalette } from './components/CommandPalette';
import { ImageCropModal } from './components/ImageCropModal';
import { CanvasDocument, CanvasElement } from '@/canvas/types';
import styles from './editor.module.css';

const safeSetLocalStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Failed to save to localStorage due to quota limits:', e);
    }
  }
};

export default function GenericCanvasEditorPage() {
  const params = useParams();
  const router = useRouter();
  const category = params?.category as string;
  const templateId = params?.templateId as string;

  const {
    document: doc,
    originalDocument,
    selectedId,
    loadDocument,
    setOriginalDocument,
    updateElement,
    selectElement,
    snapToGrid,
    setSnapToGrid,
  } = useCanvasStore();

  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [mobileTab, setMobileTab] = useState<'canvas' | 'properties' | 'tools'>('canvas');
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [pendingShapePanel, setPendingShapePanel] = useState(false);
  const [pendingIconPanel, setPendingIconPanel] = useState(false);

  // Modal states
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<CanvasDocument | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const isLeavingRef = useRef(false);

  // Transparent image box workflow states
  const [showTransPrompt, setShowTransPrompt] = useState(false);
  const [pendingTransImgSrc, setPendingTransImgSrc] = useState('');
  const [selectedImgElementId, setSelectedImgElementId] = useState('');
  const [showColorSelect, setShowColorSelect] = useState(false);
  const [selectedTransColor, setSelectedTransColor] = useState('#ffffff');

  const pageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarImageInputRef = useRef<HTMLInputElement>(null);
  const svgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dusty_editor_theme') as 'light' | 'dark';
      if (saved === 'light' || saved === 'dark') setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    safeSetLocalStorage('dusty_editor_theme', next);
  };

  // ── Draft validation ────────────────────────────────────
  const isValidCanvasDocument = (data: any): data is CanvasDocument => {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.id !== 'string') return false;
    if (typeof data.name !== 'string') return false;
    if (!data.page || typeof data.page !== 'object') return false;
    if (!Array.isArray(data.elements)) return false;
    for (const el of data.elements) {
      if (!el || typeof el !== 'object') return false;
      if (typeof el.id !== 'string') return false;
      if (typeof el.type !== 'string') return false;
      if (typeof el.x !== 'number') return false;
      if (typeof el.y !== 'number') return false;
      if (typeof el.width !== 'number') return false;
      if (typeof el.height !== 'number') return false;
    }
    return true;
  };

  // Helper to resolve template definition or dynamic blank canvas
  const getDefaultDocument = (cat: string, id: string): CanvasDocument | null => {
    const doc = sampleTemplates[id];
    if (doc) return doc;
    if (id === 'blank') {
      const categoryNames: Record<string, string> = {
        resume: 'Resume',
        cv: 'CV',
        biodata: 'Biodata',
        'cover-letter': 'Cover Letter',
        portfolio: 'Portfolio'
      };
      const catName = categoryNames[cat] || 'Document';
      return {
        id: 'blank',
        name: `Blank ${catName}`,
        category: cat as any,
        page: {
          id: 'page-1',
          width: 210,
          height: 297,
          background: '#ffffff',
        },
        elements: [],
      };
    }
    return null;
  };

  // ── Hydration ─────────────────────────────────────────
  useEffect(() => { setIsClient(true); }, []);

  // ── Initial load ──────────────────────────────────────
  useEffect(() => {
    if (!isClient) return;

    const initDoc = async () => {
      let defaultDoc = getDefaultDocument(category, templateId);
      if (!defaultDoc) {
        try {
          const res = await fetch(`/api/admin/templates?id=${templateId}&category=${category}`);
          if (res.ok) {
            const data = await res.json();
            if (isValidCanvasDocument(data)) {
              defaultDoc = data;
            }
          }
        } catch (e) {
          console.error('Failed to fetch custom template:', e);
        }
      }

      if (defaultDoc) setOriginalDocument(defaultDoc);
      else console.warn(`Template "${templateId}" not found.`);

      const draftKey = `dusty_canvas_draft_${category}_${templateId}`;
      const draftTimestampKey = `${draftKey}_savedAt`;

      if (!sessionStorage.getItem('dusty_session_started')) {
        sessionStorage.setItem('dusty_session_started', 'true');
        localStorage.removeItem(draftKey);
        localStorage.removeItem(draftTimestampKey);
      }

      const draft = localStorage.getItem(draftKey);

      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (isValidCanvasDocument(parsed)) {
            // Staleness check: ignore drafts older than 30 days (stale dev/test data)
            const savedAt = parseInt(localStorage.getItem(draftTimestampKey) || '0', 10);
            const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
            const isStale = savedAt > 0 && (Date.now() - savedAt) > THIRTY_DAYS_MS;

            // Diff check: don't show recovery if the draft is identical to the default template
            const isDifferentFromDefault = defaultDoc
              ? JSON.stringify(parsed.elements) !== JSON.stringify(defaultDoc.elements)
              || parsed.name !== defaultDoc.name
              : true;

            if (!isStale && isDifferentFromDefault) {
              setPendingDraft(parsed);
              setShowRecoveryModal(true);
              return;
            } else {
              // Silently discard stale or unchanged drafts
              localStorage.removeItem(draftKey);
              localStorage.removeItem(draftTimestampKey);
            }
          } else {
            localStorage.removeItem(draftKey);
            localStorage.removeItem(draftTimestampKey);
          }
        } catch {
          localStorage.removeItem(draftKey);
          localStorage.removeItem(draftTimestampKey);
        }
      }

      if (defaultDoc) {
        loadDocument(defaultDoc, true);
        setSaveStatus('saved');
      } else {
        const blankDoc: CanvasDocument = {
          id: templateId,
          name: templateId,
          category: category as any,
          page: { id: 'page-1', width: 210, height: 297, background: '#ffffff' },
          elements: []
        };
        loadDocument(blankDoc, true);
        setSaveStatus('saved');
      }
    };

    initDoc();
  }, [isClient, category, templateId, loadDocument, setOriginalDocument]);

  // ── Dirty check ───────────────────────────────────────
  const isDirty = useMemo(() => {
    if (!doc || !originalDocument) return false;
    if (doc.name !== originalDocument.name) return true;
    if (doc.elements.length !== originalDocument.elements.length) return true;

    const getProps = (el: CanvasElement) => {
      const base = { id: el.id, type: el.type, x: el.x, y: el.y, width: el.width, height: el.height, rotation: el.rotation || 0, zIndex: el.zIndex, visible: el.visible !== false, locked: el.locked === true };
      if (el.type === 'text') return { ...base, content: el.content, ...el.style };
      if (el.type === 'image') return { ...base, src: el.src, originalSrc: el.originalSrc, objectFit: el.objectFit, cropX: el.cropX ?? 50, cropY: el.cropY ?? 50, zoom: el.zoom ?? 1, borderRadius: el.borderRadius, opacity: el.opacity };
      if (el.type === 'rect') return { ...base, fill: el.fill, stroke: el.stroke, strokeWidth: el.strokeWidth, borderRadius: el.borderRadius, opacity: el.opacity, styleMode: el.styleMode };
      if (el.type === 'line') return { ...base, stroke: el.stroke, strokeWidth: el.strokeWidth, orientation: el.orientation };
      if (el.type === 'circle' || el.type === 'triangle' || el.type === 'star' || el.type === 'hexagon' || el.type === 'arrow') return { ...base, fill: el.fill, stroke: el.stroke, strokeWidth: el.strokeWidth, opacity: el.opacity, styleMode: el.styleMode };
      if (el.type === 'sticky') return { ...base, content: el.content, background: el.background, textColor: el.textColor, fontSize: el.fontSize, opacity: el.opacity };
      return base;
    };

    for (const el of doc.elements) {
      const orig = originalDocument.elements.find((o) => o.id === el.id);
      if (!orig) return true;
      if (JSON.stringify(getProps(el)) !== JSON.stringify(getProps(orig))) return true;
    }
    return false;
  }, [doc, originalDocument]);

  // ── Browser back interception ─────────────────────
  useEffect(() => {
    if (!isDirty || isLeavingRef.current) return;
    // Push ONE sentinel state so a back gesture can be intercepted
    window.history.pushState({ dustyGuard: true }, '', window.location.href);
    const handlePopState = (ev: PopStateEvent) => {
      if (isLeavingRef.current) return;
      // Re-push to keep the user on this page
      window.history.pushState({ dustyGuard: true }, '', window.location.href);
      setShowLeaveModal(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty]);

  // ── beforeunload guard ────────────────────────────────
  useEffect(() => {
    if (!isDirty || isLeavingRef.current) return;
    const handle = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Leave? Unsaved changes will be lost.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handle);
    return () => window.removeEventListener('beforeunload', handle);
  }, [isDirty]);

  // ── Autosave ──────────────────────────────────────────
  useEffect(() => {
    if (!doc || !isClient || !isDirty) return;
    setSaveStatus('saving');
    const draftKey = `dusty_canvas_draft_${category}_${templateId}`;
    safeSetLocalStorage(draftKey, JSON.stringify(doc));
    // Record when this draft was last saved — used by stale-draft detection on next load
    safeSetLocalStorage(`${draftKey}_savedAt`, String(Date.now()));
    const timer = setTimeout(() => setSaveStatus('saved'), 800);
    return () => clearTimeout(timer);
  }, [doc, isClient, isDirty, category, templateId]);

  // ── Ctrl+K: Command Palette ──────────────────────────────
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((v) => !v);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  // ── Name change ───────────────────────────────────────
  const handleNameChange = (newName: string) => {
    if (!doc) return;
    useCanvasStore.setState({ document: { ...doc, name: newName } });
    const draftKey = `dusty_canvas_draft_${category}_${templateId}`;
    safeSetLocalStorage(draftKey, JSON.stringify({ ...doc, name: newName }));
  };

  // ── Image Box replacement (prompts for transparency) ──────────────────────────────────
  const handlePhotoReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const selected = doc?.elements.find((el) => el.id === selectedId);
      if (selected?.type === 'image' || selected?.type === 'frame') {
        // Image box or frame replacement: prompt user for transparent image / background-color workflow
        setPendingTransImgSrc(dataUrl);
        setSelectedImgElementId(selected.id);
        setShowTransPrompt(true);
      }
      if (e.target) e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // ── Normal sidebar raster image import (never prompts for transparency) ────────────────
  const handleSidebarImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (doc) {
        const maxZ = doc.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
        const size = { width: 60, height: 60 };
        const x = Math.max(8, doc.page.width / 2 - size.width / 2);
        const y = Math.max(8, doc.page.height / 2 - size.height / 2);
        useCanvasStore.getState().addElement({
          id: `image-${Date.now()}`, type: 'image', label: 'Image',
          x, y, ...size, rotation: 0, zIndex: maxZ + 1, visible: true, locked: false,
          src: dataUrl, objectFit: 'cover', objectPosition: '50% 50%',
          cropX: 50, cropY: 50, zoom: 1, borderRadius: 0, opacity: 1,
        });
      }
      if (e.target) e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // ── Normal sidebar SVG vector image import (never prompts for transparency, keeps vector crisp) ────
  const handleSVGImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      alert('Please select a valid SVG file.');
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;

      if (!text.trim().toLowerCase().startsWith('<svg') && !text.includes('<svg')) {
        alert('Invalid SVG file content.');
        if (e.target) e.target.value = '';
        return;
      }

      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(text)}`;

      if (doc) {
        const maxZ = doc.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
        const size = { width: 60, height: 60 };
        const x = Math.max(8, doc.page.width / 2 - size.width / 2);
        const y = Math.max(8, doc.page.height / 2 - size.height / 2);

        useCanvasStore.getState().addElement({
          id: `svg-${Date.now()}`,
          type: 'image',
          label: 'Vector Graphic',
          x, y, ...size, rotation: 0, zIndex: maxZ + 1, visible: true, locked: false,
          src: dataUrl, objectFit: 'contain', objectPosition: '50% 50%',
          cropX: 50, cropY: 50, zoom: 1, borderRadius: 0, opacity: 1,
        });
      }
      if (e.target) e.target.value = '';
    };
    reader.readAsText(file);
  };

  // ── Save ──────────────────────────────────────────────
  const handleSave = () => {
    if (!doc) return;
    setSaveStatus('saving');
    const draftKey = `dusty_canvas_draft_${category}_${templateId}`;
    safeSetLocalStorage(draftKey, JSON.stringify(doc));
    setTimeout(() => setSaveStatus('saved'), 300);
  };

  // ── Export PDF ────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!pageRef.current || !doc) return;
    try {
      setSaveStatus('saving');
      const currentSelected = selectedId;
      const { isTextEditing: textEd, croppingId: cropId } = useCanvasStore.getState();
      selectElement(null);
      useCanvasStore.setState({ isTextEditing: false, croppingId: null });
      await new Promise((resolve) => setTimeout(resolve, 80));
      await exportCanvasToPDF(pageRef.current, doc.name || 'resume');
      if (currentSelected) selectElement(currentSelected);
      if (textEd) useCanvasStore.setState({ isTextEditing: true });
      if (cropId) useCanvasStore.setState({ croppingId: cropId });
      setSaveStatus('saved');
    } catch (err) {
      console.error('PDF export failed', err);
      setSaveStatus('unsaved');
    }
  };

  // ── Draft recovery ────────────────────────────────────
  const handleContinueEditing = () => {
    if (pendingDraft) { loadDocument(pendingDraft, true); setSaveStatus('saved'); }
    setShowRecoveryModal(false);
  };

  const handleStartOver = () => {
    const draftKey = `dusty_canvas_draft_${category}_${templateId}`;
    localStorage.removeItem(draftKey);
    const defaultDoc = getDefaultDocument(category, templateId);
    if (defaultDoc) { loadDocument(defaultDoc, true); setSaveStatus('saved'); }
    setShowRecoveryModal(false);
  };

  // ── Navigation ────────────────────────────────────
  const handleBack = () => {
    if (isDirty) {
      setShowLeaveModal(true);
    } else {
      isLeavingRef.current = true;
      // Replace current URL so the editor doesn't appear in the browser history stack
      router.replace(`/templates?category=${category}`);
    }
  };

  const handleSaveAndExit = () => {
    if (doc) {
      const draftKey = `dusty_canvas_draft_${category}_${templateId}`;
      safeSetLocalStorage(draftKey, JSON.stringify(doc));
    }
    isLeavingRef.current = true;
    setShowLeaveModal(false);
    router.replace(`/templates?category=${category}`);
  };

  const handleDontSaveAndExit = () => {
    const draftKey = `dusty_canvas_draft_${category}_${templateId}`;
    localStorage.removeItem(draftKey);
    isLeavingRef.current = true;
    setShowLeaveModal(false);
    useCanvasStore.setState({ history: [], future: [] });
    router.replace(`/templates?category=${category}`);
  };

  const handleConfirmReset = () => {
    const draftKey = `dusty_canvas_draft_${category}_${templateId}`;
    localStorage.removeItem(draftKey);
    const defaultDoc = getDefaultDocument(category, templateId);
    if (defaultDoc) {
      loadDocument(defaultDoc, true);
      useCanvasStore.setState({ history: [], future: [], selectedId: null, isTextEditing: false, croppingId: null });
      setSaveStatus('saved');
    }
    setShowResetModal(false);
  };

  // ── Loading screens ───────────────────────────────────
  if (!isClient) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Loading editor…</p>
      </div>
    );
  }

  if (showRecoveryModal) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalHeader}>Continue where you left off?</h3>
          <p className={styles.modalBody}>
            We found a saved draft for this template. Restore it to continue editing, or start fresh.
          </p>
          <div className={styles.modalFooter}>
            <button className={`${styles.modalBtn} ${styles.modalBtnSecondary}`} onClick={handleStartOver}>Start Fresh</button>
            <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={handleContinueEditing}>Restore Draft</button>
          </div>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Loading template…</p>
      </div>
    );
  }

  const selectedElement = doc.elements.find((el) => el.id === selectedId) || null;

  return (
    <div className={styles.workspace} data-theme={theme}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        style={{ display: 'none' }}
        onChange={handlePhotoReplace}
      />
      <input
        ref={sidebarImageInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        style={{ display: 'none' }}
        onChange={handleSidebarImageImport}
      />
      <input
        ref={svgInputRef}
        type="file"
        accept="image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleSVGImport}
      />

      {/* ── TOP BAR ── */}
      <Toolbar
        documentName={doc.name}
        onNameChange={handleNameChange}
        saveStatus={saveStatus}
        onSave={handleSave}
        onExportPDF={handleExportPDF}
        onBack={handleBack}
        isDirty={isDirty}
        onReset={() => setShowResetModal(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── EDITOR BODY (left sidebar + canvas + right panel) ── */}
      <div className={styles.editorBody}>

        {/* LEFT SIDEBAR - shown on desktop and mobile 'tools' tab */}
        <LeftToolbar
          onUploadRasterImage={() => sidebarImageInputRef.current?.click()}
          onUploadSVG={() => svgInputRef.current?.click()}
          snapToGrid={snapToGrid}
          onToggleSnap={() => setSnapToGrid(!snapToGrid)}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid((v) => !v)}
          showRulers={showRulers}
          onToggleRulers={() => setShowRulers((v) => !v)}
          previewMode={previewMode}
          onTogglePreview={() => setPreviewMode((v) => !v)}
        />

        {/* CANVAS SCROLL AREA */}
        <main className={`${styles.canvasPane} ${mobileTab === 'properties' || mobileTab === 'tools' ? styles.mobileHidden : ''}`}>
          <div className={styles.canvasScroll}>
            <CanvasStage
              pageRef={pageRef}
              showGrid={showGrid}
              showRulers={showRulers}
              previewMode={previewMode}
            />
          </div>
        </main>

        {/* RIGHT PROPERTIES PANEL */}
        <aside className={`${styles.propertiesPane} ${mobileTab === 'properties' ? styles.mobileVisible : ''}`}>
          <div className={styles.propertiesPaneInner}>
            <PropertiesPanel
              element={selectedElement}
              onUploadClick={() => fileInputRef.current?.click()}
              previewMode={previewMode}
            />
          </div>
        </aside>
      </div>

      {/* MOBILE TABS */}
      <nav className={styles.mobileNav}>
        <button
          className={`${styles.mobileNavBtn} ${mobileTab === 'canvas' ? styles.mobileNavBtnActive : ''}`}
          onClick={() => setMobileTab('canvas')}
        >
          <span>🖼</span>
          <span>Canvas</span>
        </button>
        <button
          className={`${styles.mobileNavBtn} ${mobileTab === 'tools' ? styles.mobileNavBtnActive : ''}`}
          onClick={() => setMobileTab('tools')}
        >
          <span>🛠</span>
          <span>Tools</span>
        </button>
        <button
          className={`${styles.mobileNavBtn} ${mobileTab === 'properties' ? styles.mobileNavBtnActive : ''}`}
          onClick={() => setMobileTab('properties')}
        >
          <span>⚙️</span>
          <span>Properties</span>
        </button>
      </nav>

      {/* ── LEAVE CONFIRMATION MODAL ── */}
      {showLeaveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalHeader}>Save your changes?</h3>
            <p className={styles.modalBody}>You have unsaved changes. Save before leaving?</p>
            <div className={styles.modalFooter} style={{ flexDirection: 'column', gap: 10 }}>
              <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={handleSaveAndExit} style={{ width: '100%' }}>Save &amp; Exit</button>
              <button className={`${styles.modalBtn} ${styles.modalBtnDanger}`} onClick={handleDontSaveAndExit} style={{ width: '100%' }}>Don&apos;t Save &amp; Exit</button>
              <button className={`${styles.modalBtn} ${styles.modalBtnSecondary}`} onClick={() => setShowLeaveModal(false)} style={{ width: '100%' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET CONFIRMATION MODAL ── */}
      {showResetModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalHeader}>Reset template?</h3>
            <p className={styles.modalBody}>All your edits will be permanently discarded. This cannot be undone.</p>
            <div className={styles.modalFooter}>
              <button className={`${styles.modalBtn} ${styles.modalBtnSecondary}`} onClick={() => setShowResetModal(false)}>Cancel</button>
              <button className={`${styles.modalBtn} ${styles.modalBtnDanger}`} onClick={handleConfirmReset}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSPARENT IMAGE QUESTION MODAL ── */}
      {showTransPrompt && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalHeader}>Transparent Background?</h3>
            <p className={styles.modalBody}>
              Does the image you are inserting have a transparent background?
            </p>
            <div className={styles.modalFooter} style={{ flexDirection: 'column', gap: 10 }}>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                onClick={() => {
                  setShowTransPrompt(false);
                  setShowColorSelect(true);
                }}
                style={{ width: '100%' }}
              >
                Yes, It's Transparent
              </button>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                onClick={() => {
                  if (selectedImgElementId && pendingTransImgSrc) {
                    updateElement(selectedImgElementId, { src: pendingTransImgSrc, backgroundColor: 'transparent' } as any);
                  }
                  setShowTransPrompt(false);
                  setPendingTransImgSrc('');
                  setSelectedImgElementId('');
                }}
                style={{ width: '100%' }}
              >
                No, Normal Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BACKGROUND COLOR SELECTION MODAL ── */}
      {showColorSelect && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalHeader}>Select Background Color</h3>
            <p className={styles.modalBody} style={{ marginBottom: 16 }}>
              Choose a background color to apply behind the transparent parts of this photo:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'White', value: '#ffffff' },
                { label: 'Black', value: '#000000' },
                { label: 'Cream', value: '#fdf6e2' },
                { label: 'Gray', value: '#f1f5f9' },
                { label: 'Navy', value: '#1e3a8a' },
                { label: 'Rose', value: '#ffe4e6' },
                { label: 'Mint', value: '#ecfdf5' }
              ].map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedTransColor(color.value)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: selectedTransColor === color.value ? '2px solid #6366f1' : '2px solid transparent',
                    background: 'var(--bg-panel-input)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: color.value,
                    border: '1px solid var(--border-panel)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                  }} />
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-panel)' }}>{color.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.modalFooter} style={{ flexDirection: 'column', gap: 10 }}>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                onClick={() => {
                  if (selectedImgElementId && pendingTransImgSrc) {
                    updateElement(selectedImgElementId, { src: pendingTransImgSrc, backgroundColor: selectedTransColor } as any);
                  }
                  setShowColorSelect(false);
                  setPendingTransImgSrc('');
                  setSelectedImgElementId('');
                }}
                style={{ width: '100%' }}
              >
                Apply Color
              </button>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                onClick={() => {
                  setShowColorSelect(false);
                  setPendingTransImgSrc('');
                  setSelectedImgElementId('');
                }}
                style={{ width: '100%' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMMAND PALETTE (Ctrl+K) ── */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onExportPDF={handleExportPDF}
          onSave={handleSave}
          onToggleGrid={() => setShowGrid((v) => !v)}
          onToggleRulers={() => setShowRulers((v) => !v)}
          onTogglePreview={() => setPreviewMode((v) => !v)}
          onUploadImage={() => sidebarImageInputRef.current?.click()}
          onOpenShapes={() => setPendingShapePanel(true)}
          onOpenElements={() => setPendingIconPanel(true)}
          onReset={() => setShowResetModal(true)}
        />
      )}
      <ImageCropModal />
    </div>
  );
}
