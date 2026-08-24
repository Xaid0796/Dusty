'use client';
import React from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Save,
  Download,
  Check,
  ChevronDown,
  RefreshCw,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react';
import { useCanvasStore } from '@/canvas/store';
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
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
}) => {
  const { zoom, setZoom, undo, redo, history, future } = useCanvasStore();
  const [showZoomMenu, setShowZoomMenu] = React.useState(false);
  const zoomRef = React.useRef<HTMLDivElement>(null);

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

  const saveCls =
    saveStatus === 'saved'
      ? styles.saveStatusSaved
      : saveStatus === 'saving'
        ? styles.saveStatusSaving
        : styles.saveStatusUnsaved;

  return (
    <header className={styles.toolbar}>
      {/* LEFT: Title */}
      <div className={styles.toolbarLeft}>
        <button className={styles.backBtn} onClick={onBack} title="Back to Templates">
          <ArrowLeft size={16} />
        </button>
        <input
          type="text"
          value={documentName}
          onChange={(e) => onNameChange(e.target.value)}
          className={styles.titleInput}
          placeholder="Untitled Resume"
          title="Rename document"
          spellCheck={false}
        />
      </div>

      {/* CENTER: Undo / Redo + Zoom */}
      <div className={styles.toolbarCenter}>
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

        <div className={styles.toolbarDivider} />

        {/* Zoom */}
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
      </div>

      {/* RIGHT: Reset, Save status, Theme, Save, Export */}
      <div className={styles.toolbarRight}>
        <button
          className={styles.resetBtn}
          disabled={!isDirty}
          onClick={onReset}
          title="Reset to original template"
        >
          <RefreshCw size={13} />
          <span>Reset</span>
        </button>

        <span className={`${styles.saveStatus} ${saveCls}`}>
          {saveStatus === 'saved' && <Check size={11} />}
          {saveStatus === 'saving' && <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} />}
          {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving…' : 'Unsaved'}
        </span>

        <button
          className={styles.iconBtn}
          onClick={onToggleTheme}
          title="Toggle Theme"
          style={{ width: 'auto', padding: '0 8px', gap: '5px', fontSize: '11px', fontWeight: 'bold' }}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        <div className={styles.toolbarDivider} />

        <button className={styles.saveBtn} onClick={onSave} title="Save draft (Ctrl+S)">
          <Save size={14} />
          <span>Save</span>
        </button>

        <button className={styles.pdfBtn} onClick={onExportPDF} title="Export as PDF">
          <Download size={14} />
          <span>Export PDF</span>
        </button>
      </div>
    </header>
  );
};
