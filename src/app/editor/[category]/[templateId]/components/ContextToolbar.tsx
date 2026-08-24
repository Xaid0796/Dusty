'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Clipboard,
  Layers,
  Trash2,
  FlipHorizontal,
  FlipVertical,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronsUp,
  ChevronsDown,
  Scissors,
  ChevronDown,
} from 'lucide-react';
import { useCanvasStore } from '@/canvas/store';
import { CanvasElement, TextElement } from '@/canvas/types';
import { mmToPx } from '@/canvas/utils';
import styles from '../editor.module.css';

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Arial', 'Source Sans Pro', 'Helvetica Neue', 'Times New Roman',
  'Georgia', 'Garamond', 'Courier New', 'Trebuchet MS', 'Verdana',
  'Playfair Display', 'Lato', 'Montserrat', 'Poppins', 'Raleway',
  'Libre Baskerville', 'Cormorant Garamond', 'Cinzel',
  'Alex Brush', 'Dancing Script', 'Great Vibes', 'Mrs Saint Delafield',
  'Monsieur La Doulaise', 'Pinyon Script', 'Caveat',
  'Oswald', 'Space Mono', 'Shadows Into Light',
];

const FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32, 36, 42, 48, 56, 64, 72];


interface ContextToolbarProps {
  element: CanvasElement;
  zoom: number;
}

export const ContextToolbar: React.FC<ContextToolbarProps> = ({ element, zoom }) => {
  const {
    document: doc,
    selectedIds,
    copySelected,
    pasteClipboard,
    duplicateSelected,
    deleteElement,
    cutSelected,
    bringForward,
    sendBackward,
    updateElement,
    isTextEditing,
    croppingId,
    groupSelected,
    ungroupSelected,
  } = useCanvasStore();

  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (showFontMenu && fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setShowFontMenu(false);
      }
      if (showSizeMenu && sizeMenuRef.current && !sizeMenuRef.current.contains(e.target as Node)) {
        setShowSizeMenu(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showFontMenu, showSizeMenu]);

  // Don't show context toolbar while text editing or cropping
  if (isTextEditing || (croppingId && croppingId === element.id) || !doc || selectedIds.length === 0) return null;

  // Get selected elements
  const selectedElements = doc.elements.filter((el) => selectedIds.includes(el.id));
  if (selectedElements.length === 0) return null;

  // Calculate bounding box of all selected elements in mm
  const minX = Math.min(...selectedElements.map((el) => el.x));
  const maxX = Math.max(...selectedElements.map((el) => el.x + el.width));
  const minY = Math.min(...selectedElements.map((el) => el.y));
  const maxY = Math.max(...selectedElements.map((el) => el.y + el.height));
  const width = maxX - minX;

  const pxX = mmToPx(minX);
  const pxY = mmToPx(minY);
  const pxW = mmToPx(width);

  // Position the toolbar horizontally centered over the element bounding box
  const toolbarLeft = pxX + pxW / 2;
  const toolbarTop = pxY - 48;

  const isSingle = selectedElements.length === 1;
  const isText = isSingle && element.type === 'text';
  const textEl = isText ? (element as TextElement) : null;

  const handleStyleChange = (updates: Partial<TextElement['style']>) => {
    if (!textEl) return;
    updateElement(element.id, { style: { ...textEl.style, ...updates } } as any);
  };

  return (
    <div
      className={styles.contextToolbar}
      style={{
        left: `${toolbarLeft}px`,
        top: `${Math.max(4, toolbarTop)}px`,
      }}
      // Prevent click from propagating to canvas
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Group Option (rendered when multiple items are selected) */}
      {!isSingle && (
        <>
          <button
            className={styles.ctxBtn}
            onClick={() => groupSelected()}
            title="Group Elements (Ctrl+G)"
            style={{ fontWeight: 600, fontSize: 11, paddingLeft: 8, paddingRight: 8, color: '#6366f1' }}
          >
            Group
          </button>
          <div className={styles.contextToolbarDivider} />
        </>
      )}

      {/* Ungroup Option (rendered when a single group is selected) */}
      {isSingle && element.type === 'group' && (
        <>
          <button
            className={styles.ctxBtn}
            onClick={() => ungroupSelected()}
            title="Ungroup Elements (Ctrl+Shift+G)"
            style={{ fontWeight: 600, fontSize: 11, paddingLeft: 8, paddingRight: 8, color: '#6366f1' }}
          >
            Ungroup
          </button>
          <div className={styles.contextToolbarDivider} />
        </>
      )}

      {/* Text formatting (only for single text element selection) */}
      {isText && textEl && (
        <>
          {/* Font Family selector */}
          <div style={{ position: 'relative' }} ref={fontMenuRef}>
            <button
              className={styles.ctxBtn}
              onClick={() => { setShowFontMenu(v => !v); setShowSizeMenu(false); }}
              title="Font Family"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, paddingLeft: 6, paddingRight: 6 }}
            >
              <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: textEl.style.fontFamily }}>
                {textEl.style.fontFamily || 'Inter'}
              </span>
              <ChevronDown size={10} />
            </button>
            {showFontMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: 'var(--bg-popover)',
                  border: '1px solid var(--border-popover)',
                  borderRadius: 8,
                  boxShadow: 'var(--shadow-popover)',
                  maxHeight: 200,
                  overflowY: 'auto',
                  zIndex: 10100,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 4,
                  minWidth: 120,
                }}
              >
                {FONT_FAMILIES.map((font) => (
                  <button
                    key={font}
                    onClick={() => {
                      handleStyleChange({ fontFamily: font });
                      setShowFontMenu(false);
                    }}
                    style={{
                      background: font === textEl.style.fontFamily ? 'var(--bg-popover-active)' : 'transparent',
                      color: font === textEl.style.fontFamily ? 'var(--text-popover-active)' : 'var(--text-popover)',
                      border: 'none',
                      borderRadius: 5,
                      padding: '5px 8px',
                      fontSize: 11,
                      fontWeight: font === textEl.style.fontFamily ? 600 : 500,
                      fontFamily: font,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      if (font !== textEl.style.fontFamily) {
                        e.currentTarget.style.background = 'var(--bg-popover-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (font !== textEl.style.fontFamily) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size selector */}
          <div style={{ position: 'relative' }} ref={sizeMenuRef}>
            <button
              className={styles.ctxBtn}
              onClick={() => { setShowSizeMenu(v => !v); setShowFontMenu(false); }}
              title="Font Size"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, paddingLeft: 6, paddingRight: 6 }}
            >
              <span>{textEl.style.fontSize ?? 12}pt</span>
              <ChevronDown size={10} />
            </button>
            {showSizeMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: 'var(--bg-popover)',
                  border: '1px solid var(--border-popover)',
                  borderRadius: 8,
                  boxShadow: 'var(--shadow-popover)',
                  maxHeight: 200,
                  overflowY: 'auto',
                  zIndex: 10100,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 4,
                  minWidth: 60,
                }}
              >
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      handleStyleChange({ fontSize: size });
                      setShowSizeMenu(false);
                    }}
                    style={{
                      background: size === textEl.style.fontSize ? 'var(--bg-popover-active)' : 'transparent',
                      color: size === textEl.style.fontSize ? 'var(--text-popover-active)' : 'var(--text-popover)',
                      border: 'none',
                      borderRadius: 5,
                      padding: '5px 8px',
                      fontSize: 11,
                      fontWeight: size === textEl.style.fontSize ? 700 : 500,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      if (size !== textEl.style.fontSize) {
                        e.currentTarget.style.background = 'var(--bg-popover-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (size !== textEl.style.fontSize) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {size}pt
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.contextToolbarDivider} />

          <button
            className={`${styles.ctxBtn} ${textEl.style.fontWeight === 'bold' ? styles.ctxBtnActive : ''}`}
            onClick={() => handleStyleChange({ fontWeight: textEl.style.fontWeight === 'bold' ? 'normal' : 'bold' })}
            title="Bold (Ctrl+B)"
          >
            <Bold size={13} />
          </button>
          <button
            className={`${styles.ctxBtn} ${textEl.style.fontStyle === 'italic' ? styles.ctxBtnActive : ''}`}
            onClick={() => handleStyleChange({ fontStyle: textEl.style.fontStyle === 'italic' ? 'normal' : 'italic' })}
            title="Italic"
          >
            <Italic size={13} />
          </button>
          <button
            className={`${styles.ctxBtn} ${textEl.style.textDecoration === 'underline' ? styles.ctxBtnActive : ''}`}
            onClick={() => handleStyleChange({ textDecoration: textEl.style.textDecoration === 'underline' ? 'none' : 'underline' })}
            title="Underline"
          >
            <Underline size={13} />
          </button>

          <div className={styles.contextToolbarDivider} />

          <button
            className={`${styles.ctxBtn} ${textEl.style.textAlign === 'left' ? styles.ctxBtnActive : ''}`}
            onClick={() => handleStyleChange({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft size={13} />
          </button>
          <button
            className={`${styles.ctxBtn} ${textEl.style.textAlign === 'center' ? styles.ctxBtnActive : ''}`}
            onClick={() => handleStyleChange({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter size={13} />
          </button>
          <button
            className={`${styles.ctxBtn} ${textEl.style.textAlign === 'right' ? styles.ctxBtnActive : ''}`}
            onClick={() => handleStyleChange({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight size={13} />
          </button>
          <button
            className={`${styles.ctxBtn} ${textEl.style.textAlign === 'justify' ? styles.ctxBtnActive : ''}`}
            onClick={() => handleStyleChange({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify size={13} />
          </button>

          <div className={styles.contextToolbarDivider} />
        </>
      )}

      {/* Image flip */}
      {isSingle && element.type === 'image' && (
        <>
          <button
            className={styles.ctxBtn}
            onClick={() => updateElement(element.id, { flipX: !(element as any).flipX } as any)}
            title="Flip Horizontal"
          >
            <FlipHorizontal size={13} />
          </button>
          <button
            className={styles.ctxBtn}
            onClick={() => updateElement(element.id, { flipY: !(element as any).flipY } as any)}
            title="Flip Vertical"
          >
            <FlipVertical size={13} />
          </button>
          <div className={styles.contextToolbarDivider} />
        </>
      )}

      {/* Layer order */}
      <button className={styles.ctxBtn} onClick={() => bringForward()} title="Bring Forward">
        <ChevronsUp size={13} />
      </button>
      <button className={styles.ctxBtn} onClick={() => sendBackward()} title="Send Backward">
        <ChevronsDown size={13} />
      </button>

      <div className={styles.contextToolbarDivider} />

      {/* Copy / Cut / Paste / Duplicate */}
      <button className={styles.ctxBtn} onClick={() => copySelected()} title="Copy (Ctrl+C)">
        <Copy size={13} />
      </button>
      <button className={styles.ctxBtn} onClick={() => cutSelected()} title="Cut (Ctrl+X)">
        <Scissors size={13} />
      </button>
      <button className={styles.ctxBtn} onClick={() => pasteClipboard()} title="Paste (Ctrl+V)">
        <Clipboard size={13} />
      </button>
      <button
        className={styles.ctxBtn}
        onClick={() => duplicateSelected()}
        title="Duplicate (Ctrl+D)"
        style={{ fontWeight: 700, fontSize: 12, letterSpacing: '-0.02em', paddingLeft: 10, paddingRight: 10 }}
      >
        ×2
      </button>

      <div className={styles.contextToolbarDivider} />

      {/* Delete */}
      <button
        className={`${styles.ctxBtn} ${styles.ctxBtnDanger}`}
        onClick={() => {
          selectedIds.forEach((id) => deleteElement(id));
        }}
        title="Delete (Del)"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};
