'use client';
import React from 'react';
import {
  Undo2,
  Redo2,
  Save,
  Download,
  ChevronDown,
  RefreshCw,
  Layers,
  Magnet,
  Eye,
  ChevronsUp,
  ArrowUp,
  ArrowDown,
  ChevronsDown,
  FileText,
  Minus,
  Plus,
} from 'lucide-react';
import { useCanvasStore } from '@/canvas/store';
import { MAX_PAGE_COUNT } from '@/canvas/types';
import { useIsMobileOrTouch } from '@/utils/device';
import styles from '../editor.module.css';

interface ToolbarProps {
  documentName: string;
  onNameChange: (name: string) => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  onSave: () => void;
  onExportPDF: () => void;
  onBack: () => void;
  isDirty: boolean;
  onReset: () => void;
  previewMode: boolean;
  onTogglePreview: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  documentName,
  onNameChange,
  saveStatus,
  onSave,
  onExportPDF,
  onBack,
  isDirty,
  onReset,
  previewMode,
  onTogglePreview,
}) => {
  const {
    zoom,
    setZoom,
    pageCount,
    setPageCount,
    undo,
    redo,
    history,
    future,
    selectedIds,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    snapToGrid,
    setSnapToGrid,
    showGrid,
    setShowGrid,
  } = useCanvasStore();

  const [showZoomMenu, setShowZoomMenu] = React.useState(false);
  const zoomRef = React.useRef<HTMLDivElement>(null);
  const hasSel = selectedIds.length > 0;
  const isMobileOrTouch = useIsMobileOrTouch();

  const onToggleSnap = () => setSnapToGrid(!snapToGrid);
  const onToggleGrid = () => setShowGrid(!showGrid);

  // Close zoom menu on outside click
  React.useEffect(() => {
    if (!showZoomMenu) return;
    const handle = (e: MouseEvent) => {
      if (zoomRef.current && !zoomRef.current.contains(e.target as Node)) {
        setShowZoomMenu(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showZoomMenu]);

  return (
    <header className={styles.toolbar}>
      {/* LEFT: Title */}
      <div className={styles.toolbarLeft}>
        <input
          type="text"
          value={documentName}
          onChange={(e) => onNameChange(e.target.value)}
          className={`${styles.titleInput} ${styles.mobileHidden}`}
          placeholder="Untitled Resume"
          title="Rename document"
          spellCheck={false}
        />
      </div>

      {/* CENTER: Undo / Redo + Front, Back, Snap, Grid + Zoom (centered horizontally) */}
      <div className={styles.toolbarCenter} style={{ justifyContent: 'center', flex: 2 }}>
        <button
          className={styles.iconBtn}
          disabled={history.length === 0}
          onClick={undo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          className={styles.iconBtn}
          disabled={future.length === 0}
          onClick={redo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>

        <div className={`${styles.toolbarDivider} ${styles.mobileHidden}`} />

        {/* Layer Controls */}
        <button
          className={`${styles.iconBtn} ${styles.mobileHidden}`}
          onClick={() => bringToFront()}
          disabled={!hasSel}
          title="Bring to Front"
          style={!hasSel ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}
        >
          <ChevronsUp size={16} />
        </button>
        <button
          className={`${styles.iconBtn} ${styles.mobileHidden}`}
          onClick={() => bringForward()}
          disabled={!hasSel}
          title="Bring Forward"
          style={!hasSel ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}
        >
          <ArrowUp size={16} />
        </button>
        <button
          className={`${styles.iconBtn} ${styles.mobileHidden}`}
          onClick={() => sendBackward()}
          disabled={!hasSel}
          title="Send Backward"
          style={!hasSel ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}
        >
          <ArrowDown size={16} />
        </button>
        <button
          className={`${styles.iconBtn} ${styles.mobileHidden}`}
          onClick={() => sendToBack()}
          disabled={!hasSel}
          title="Send to Back"
          style={!hasSel ? { opacity: 0.3, cursor: 'not-allowed' } : undefined}
        >
          <ChevronsDown size={16} />
        </button>

        <div className={`${styles.toolbarDivider} ${styles.mobileHidden}`} />

        {/* Snap, Grid */}
        <button
          className={`${styles.iconBtn} ${styles.mobileHidden} ${snapToGrid ? styles.active : ''}`}
          onClick={onToggleSnap}
          title={snapToGrid ? 'Snap: ON' : 'Snap: OFF'}
        >
          <Magnet size={16} />
        </button>
        <button
          className={`${styles.iconBtn} ${styles.mobileHidden} ${showGrid ? styles.active : ''}`}
          onClick={onToggleGrid}
          title={showGrid ? 'Grid: ON' : 'Grid: OFF'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        {!isMobileOrTouch && (
          <>
            <div className={`${styles.toolbarDivider} ${styles.mobileHidden}`} />
            <div className={styles.zoomContainer} ref={zoomRef}>
              <button
                className={styles.zoomBtn}
                onClick={() => setShowZoomMenu((v) => !v)}
                title="Zoom level"
              >
                <span>{zoom}%</span>
                <ChevronDown size={12} />
              </button>
              {showZoomMenu && (
                <div className={styles.zoomMenu}>
                  {[50, 75, 100, 125, 150, 175, 200].map((opt) => (
                    <button
                      key={opt}
                      className={`${styles.zoomMenuItem} ${opt === zoom ? styles.zoomMenuItemActive : ''}`}
                      onClick={() => { setZoom(opt); setShowZoomMenu(false); }}
                    >
                      {opt}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Page Count control (desktop only) */}
            <div className={`${styles.toolbarDivider} ${styles.mobileHidden}`} />
            <div
              className={styles.pageCountContainer}
              title="Page count (desktop only)"
            >
              <FileText size={14} className={styles.pageCountIcon} />
              <button
                className={styles.pageCountStepBtn}
                onClick={() => setPageCount(pageCount - 1)}
                disabled={pageCount <= 1}
                title="Remove a page"
                aria-label="Remove a page"
              >
                <Minus size={12} />
              </button>
              <span className={styles.pageCountValue}>{pageCount}</span>
              <button
                className={styles.pageCountStepBtn}
                onClick={() => setPageCount(pageCount + 1)}
                disabled={pageCount >= MAX_PAGE_COUNT}
                title="Add a page"
                aria-label="Add a page"
              >
                <Plus size={12} />
              </button>
              <span className={styles.pageCountLabel}>Pages</span>
            </div>
          </>
        )}

      </div>

      {/* RIGHT: Reset, Save, Review/Preview, Export */}
      <div className={styles.toolbarRight}>
        <button
          className={`${styles.resetBtn} ${styles.mobileHidden}`}
          disabled={!isDirty}
          onClick={onReset}
          title="Reset to original template"
        >
          <RefreshCw size={13} />
          <span>Reset</span>
        </button>

        <button
          className={`${styles.saveBtn} ${styles.manualSaveBtn}`}
          onClick={onSave}
          title="Save draft (Ctrl+S)"
          disabled={saveStatus === 'saving'}
        >
          <Save size={14} style={saveStatus === 'saving' ? { animation: 'spin 1s linear infinite' } : {}} />
          <span className={styles.mobileHideText}>{saveStatus === 'saving' ? 'Saving...' : 'Save'}</span>
        </button>

        <button
          className={`${styles.saveBtn} ${previewMode ? styles.active : ''}`}
          onClick={onTogglePreview}
          title={previewMode ? 'Exit Preview' : 'Preview Mode'}
          style={previewMode ? { background: 'rgba(99, 102, 241, 0.25)', color: '#6366f1', borderColor: '#6366f1' } : undefined}
        >
          <Eye size={14} />
          <span className={styles.mobileHideText}>{previewMode ? 'Exit Preview' : 'Preview'}</span>
        </button>

        <button className={styles.pdfBtn} onClick={onExportPDF} title="Export as PDF">
          <Download size={14} />
          <span className={styles.mobileHideText}>Export PDF</span>
        </button>
      </div>
    </header>
  );
};
