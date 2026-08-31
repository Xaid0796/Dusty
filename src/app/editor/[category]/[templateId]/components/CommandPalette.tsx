'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Undo2, Redo2, Copy, Clipboard, Trash2, Download, Save, Eye, Grid2X2, Layers, AlignCenter, Type, ImagePlus, Shapes, Smile, RefreshCw } from 'lucide-react';
import { useCanvasStore } from '@/canvas/store';
import { useIsMobileOrTouch } from '@/utils/device';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  shortcut?: string;
  keywords: string[];
  action: () => void;
}

interface CommandPaletteProps {
  onClose: () => void;
  onExportPDF: () => void;
  onSave: () => void;
  onToggleGrid: () => void;
  onTogglePreview: () => void;
  onUploadImage: () => void;
  onOpenElements: () => void;
  onReset: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onClose, onExportPDF, onSave, onToggleGrid,
  onTogglePreview, onUploadImage, onOpenElements, onReset,
}) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    undo, redo,
    copySelected, pasteClipboard, duplicateSelected, deleteSelected,
    selectAll, setZoom, bringToFront, sendToBack, bringForward, sendBackward,
    alignSelected, selectedIds,
  } = useCanvasStore();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const hasSel = selectedIds.length > 0;
  const hasMulti = selectedIds.length > 1;
  const isMobileOrTouch = useIsMobileOrTouch();

  const commands = useMemo<Command[]>(() => [
    // History
    { id: 'undo', label: 'Undo', icon: <Undo2 size={15} />, category: 'History', shortcut: 'Ctrl+Z', keywords: ['undo', 'back', 'revert'], action: () => { undo(); onClose(); } },
    { id: 'redo', label: 'Redo', icon: <Redo2 size={15} />, category: 'History', shortcut: 'Ctrl+Y', keywords: ['redo', 'forward'], action: () => { redo(); onClose(); } },
    // Clipboard
    { id: 'copy', label: 'Copy', description: hasSel ? undefined : 'Select an element first', icon: <Copy size={15} />, category: 'Edit', shortcut: 'Ctrl+C', keywords: ['copy', 'duplicate'], action: () => { copySelected(); onClose(); } },
    { id: 'paste', label: 'Paste', icon: <Clipboard size={15} />, category: 'Edit', shortcut: 'Ctrl+V', keywords: ['paste', 'put'], action: () => { pasteClipboard(); onClose(); } },
    { id: 'duplicate', label: 'Duplicate', icon: <Copy size={15} />, category: 'Edit', shortcut: 'Ctrl+D', keywords: ['duplicate', 'clone'], action: () => { duplicateSelected(); onClose(); } },
    { id: 'delete', label: 'Delete Selected', icon: <Trash2 size={15} />, category: 'Edit', shortcut: 'Del', keywords: ['delete', 'remove', 'trash'], action: () => { deleteSelected(); onClose(); } },
    { id: 'select-all', label: 'Select All', icon: <AlignCenter size={15} />, category: 'Selection', shortcut: 'Ctrl+A', keywords: ['select', 'all'], action: () => { selectAll(); onClose(); } },
    // Layer
    { id: 'bring-front', label: 'Bring to Front', icon: <Layers size={15} />, category: 'Layer', shortcut: '', keywords: ['front', 'layer', 'top', 'bring'], action: () => { bringToFront(); onClose(); } },
    { id: 'send-back', label: 'Send to Back', icon: <Layers size={15} />, category: 'Layer', shortcut: '', keywords: ['back', 'layer', 'bottom', 'behind'], action: () => { sendToBack(); onClose(); } },
    { id: 'bring-forward', label: 'Bring Forward', icon: <Layers size={15} />, category: 'Layer', keywords: ['forward', 'layer', 'up'], action: () => { bringForward(); onClose(); } },
    { id: 'send-backward', label: 'Send Backward', icon: <Layers size={15} />, category: 'Layer', keywords: ['backward', 'layer', 'down'], action: () => { sendBackward(); onClose(); } },
    // Align (multi-select)
    ...(hasMulti ? [
      { id: 'align-left', label: 'Align Left', icon: <AlignCenter size={15} />, category: 'Align', keywords: ['align', 'left'], action: () => { alignSelected('left'); onClose(); } },
      { id: 'align-center', label: 'Align Center', icon: <AlignCenter size={15} />, category: 'Align', keywords: ['align', 'center', 'horizontal'], action: () => { alignSelected('center'); onClose(); } },
      { id: 'align-right', label: 'Align Right', icon: <AlignCenter size={15} />, category: 'Align', keywords: ['align', 'right'], action: () => { alignSelected('right'); onClose(); } },
      { id: 'align-top', label: 'Align Top', icon: <AlignCenter size={15} />, category: 'Align', keywords: ['align', 'top'], action: () => { alignSelected('top'); onClose(); } },
      { id: 'align-middle', label: 'Align Middle', icon: <AlignCenter size={15} />, category: 'Align', keywords: ['align', 'middle', 'vertical'], action: () => { alignSelected('middle'); onClose(); } },
      { id: 'align-bottom', label: 'Align Bottom', icon: <AlignCenter size={15} />, category: 'Align', keywords: ['align', 'bottom'], action: () => { alignSelected('bottom'); onClose(); } },
    ] : []),
    // Zoom
    { id: 'zoom-50', label: 'Zoom 50%', icon: <Eye size={15} />, category: 'View', keywords: ['zoom', '50'], action: () => { setZoom(50); onClose(); } },
    { id: 'zoom-75', label: 'Zoom 75%', icon: <Eye size={15} />, category: 'View', keywords: ['zoom', '75'], action: () => { setZoom(75); onClose(); } },
    { id: 'zoom-100', label: 'Zoom 100%', icon: <Eye size={15} />, category: 'View', keywords: ['zoom', '100', 'fit'], action: () => { setZoom(100); onClose(); } },
    { id: 'zoom-150', label: 'Zoom 150%', icon: <Eye size={15} />, category: 'View', keywords: ['zoom', '150'], action: () => { setZoom(150); onClose(); } },
    // View toggles
    { id: 'toggle-grid', label: 'Toggle Grid', icon: <Grid2X2 size={15} />, category: 'View', keywords: ['grid', 'toggle'], action: () => { onToggleGrid(); onClose(); } },
    { id: 'toggle-preview', label: 'Toggle Preview Mode', icon: <Eye size={15} />, category: 'View', keywords: ['preview', 'clean', 'hide selection'], action: () => { onTogglePreview(); onClose(); } },
    // Add elements
    { id: 'add-text', label: 'Add Text', icon: <Type size={15} />, category: 'Add', shortcut: 'T', keywords: ['add', 'text', 'type'], action: () => { onClose(); document.querySelector<HTMLButtonElement>('[data-tooltip="Add Text (T)"]')?.click(); } },
    { id: 'add-image', label: 'Add Image', icon: <ImagePlus size={15} />, category: 'Add', keywords: ['add', 'image', 'photo'], action: () => { onUploadImage(); onClose(); } },

    { id: 'open-elements', label: 'Open Icons & Elements', icon: <Smile size={15} />, category: 'Add', keywords: ['icons', 'elements', 'linkedin', 'github', 'emoji'], action: () => { onOpenElements(); onClose(); } },
    // File
    { id: 'save', label: 'Save Draft', icon: <Save size={15} />, category: 'File', shortcut: 'Ctrl+S', keywords: ['save', 'draft'], action: () => { onSave(); onClose(); } },
    { id: 'export', label: 'Export as PDF', icon: <Download size={15} />, category: 'File', keywords: ['export', 'pdf', 'download', 'print'], action: () => { onExportPDF(); onClose(); } },
    { id: 'reset', label: 'Reset to Template', icon: <RefreshCw size={15} />, category: 'File', keywords: ['reset', 'restore', 'original', 'template'], action: () => { onReset(); onClose(); } },
  ], [undo, redo, hasSel, hasMulti, isMobileOrTouch, copySelected, pasteClipboard, duplicateSelected, deleteSelected, selectAll, bringToFront, sendToBack, bringForward, sendBackward, alignSelected, setZoom, onClose, onExportPDF, onSave, onToggleGrid, onTogglePreview, onUploadImage, onOpenElements, onReset]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.includes(q))
    );
  }, [query, commands]);

  // Keyboard navigation
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((v) => Math.min(v + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((v) => Math.max(v - 1, 0)); }
      if (e.key === 'Enter') {
        e.preventDefault();
        filtered[selected]?.action();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [filtered, selected, onClose]);

  // Reset selection when query changes
  useEffect(() => { setSelected(0); }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  // Group filtered commands by category
  const grouped = useMemo(() => {
    const cats = new Map<string, Command[]>();
    for (const cmd of filtered) {
      if (!cats.has(cmd.category)) cats.set(cmd.category, []);
      cats.get(cmd.category)!.push(cmd);
    }
    return cats;
  }, [filtered]);

  let globalIndex = 0;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-panel)', borderRadius: 14, width: '100%', maxWidth: 580, boxShadow: '0 24px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border-panel)', overflow: 'hidden', animation: 'modalPop 0.18s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border-panel)' }}>
          <Search size={17} style={{ color: 'var(--text-panel-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: 'var(--text-panel)', fontFamily: 'inherit', background: 'transparent', fontWeight: 500 }}
          />
          <kbd style={{ background: 'var(--bg-panel-btn)', border: '1px solid var(--border-panel)', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: 'var(--text-panel-muted)' }}>ESC</kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} style={{ maxHeight: 380, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-panel-muted)', fontSize: 13 }}>
              No commands found for "{query}"
            </div>
          )}
          {[...grouped.entries()].map(([cat, cmds]) => (
            <div key={cat}>
              <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-panel-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{cat}</div>
              {cmds.map((cmd) => {
                const idx = globalIndex++;
                const isActive = idx === selected;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelected(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      width: '100%', padding: '9px 16px', border: 'none', textAlign: 'left',
                      background: isActive ? 'var(--bg-popover-active)' : 'transparent',
                      cursor: 'pointer', transition: 'background 0.08s',
                    }}
                  >
                    <span style={{ color: isActive ? 'var(--text-popover-active)' : 'var(--text-panel-muted)', display: 'flex', flexShrink: 0 }}>{cmd.icon}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-panel)' }}>{cmd.label}</span>
                      {cmd.description && <span style={{ fontSize: 11, color: 'var(--text-panel-muted)', marginLeft: 8 }}>{cmd.description}</span>}
                    </span>
                    {cmd.shortcut && (
                      <kbd style={{ background: 'var(--bg-panel-btn)', border: '1px solid var(--border-panel)', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: 'var(--text-panel-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-panel)', display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-panel-muted)', fontWeight: 600 }}>↑↓ Navigate</span>
          <span style={{ fontSize: 10, color: 'var(--text-panel-muted)', fontWeight: 600 }}>↵ Execute</span>
          <span style={{ fontSize: 10, color: 'var(--text-panel-muted)', fontWeight: 600 }}>ESC Close</span>
        </div>
      </div>
    </div>
  );
};
