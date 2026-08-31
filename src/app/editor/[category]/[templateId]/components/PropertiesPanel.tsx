'use client';

import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Upload,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Crop,
  MousePointer2,
} from 'lucide-react';
import { CanvasElement, TextElement, TextStyle, ChartElement } from '@/canvas/types';
import { useCanvasStore } from '@/canvas/store';
import { AdvancedColorPickerPopup } from './AdvancedColorPickerPopup';
import styles from '../editor.module.css';
interface PropertiesPanelProps {
  element: CanvasElement | null;
  onUploadClick: () => void;
  previewMode?: boolean;
  theme?: 'light' | 'dark';
}

const FONT_FAMILIES = [
  // Requested Fonts
  'Inter', 'Montserrat', 'Lato', 'Roboto', 'Garamond', 'Playfair Display', 'Source Sans Pro', 'Helvetica Neue',
  // Standard / System
  'Arial', 'Times New Roman', 'Georgia', 'Courier New', 'Trebuchet MS', 'Verdana',
  // Additional Elegant Serif
  'Poppins', 'Raleway', 'Libre Baskerville', 'Cormorant Garamond', 'Cinzel',
  // Script / Calligraphy
  'Alex Brush', 'Dancing Script', 'Great Vibes', 'Mrs Saint Delafield',
  'Monsieur La Doulaise', 'Pinyon Script', 'Caveat',
  // Display / Specialty
  'Oswald', 'Space Mono', 'Shadows Into Light',
];

const FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32, 36, 42, 48, 56, 64, 72];

// ── Collapsible Section ────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({
  title, children, defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div className={styles.sectionHeader} onClick={() => setOpen((v) => !v)}>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {title}
      </div>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
};

// ── Color picker field ─────────────────────────────────────
const ColorField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [currentColor, setCurrentColor] = useState(value);

  return (
    <>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{label}</label>
        <div className={styles.colorRow}>
          <div className={styles.colorSwatch}>
            <button
              onClick={() => setShowPopup(true)}
              style={{
                width: 24,
                height: 24,
                backgroundColor: currentColor,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            />
            <div style={{ position: 'absolute', inset: 0, background: currentColor, borderRadius: 5, pointerEvents: 'none' }} />
          </div>
          <input
            type="text"
            className={`${styles.input} ${styles.colorHex}`}
            value={currentColor || ''}
            onChange={(e) => {
              setCurrentColor(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="#000000"
            spellCheck={false}
          />
        </div>
      </div>
      {showPopup && (
        <AdvancedColorPickerPopup
          color={currentColor}
          onChange={(newColor) => {
            setCurrentColor(newColor);
            onChange(newColor);
          }}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

// ── Number input field ─────────────────────────────────────
const NumField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min = 0, max = 9999, step = 1, unit }) => (
  <div className={styles.fieldGroup}>
    <label className={styles.fieldLabel}>{label}</label>
    <div className={styles.inputWithUnit}>
      <input
        type="number"
        className={styles.input}
        value={Number(value.toFixed(1))}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
        min={min}
        max={max}
        step={step}
        style={unit ? { paddingRight: 28 } : {}}
      />
      {unit && <span className={styles.inputUnit}>{unit}</span>}
    </div>
  </div>
);

// ── Slider field ───────────────────────────────────────────
const SliderField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = '' }) => (
  <div className={styles.fieldGroup}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
      <label className={styles.fieldLabel}>{label}</label>
      <span className={styles.sliderValue}>{value}{unit}</span>
    </div>
    <div className={styles.sliderRow}>
      <input
        type="range"
        className={styles.slider}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
      />
    </div>
  </div>
);

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, onUploadClick, previewMode = false, theme = 'light' }) => {
  const {
    updateElement,
    deleteElement,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    setCroppingId,
    document: canvasDocument,
    selectedIds,
    setPageSize,
  } = useCanvasStore();

  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const fontMenuRef = React.useRef<HTMLDivElement>(null);
  const sizeMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) setShowFontMenu(false);
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target as Node)) setShowSizeMenu(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  if (!element) {
    return (
      <div className={styles.noSelection} style={previewMode ? { pointerEvents: 'none', position: 'relative' } : undefined}>
        {previewMode && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'var(--bg-panel)',
            opacity: 0.72,
            borderRadius: 'inherit',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, pointerEvents: 'none',
          }}>
            <img
              src="/hide-layer.svg"
              alt="Preview Mode"
              style={{
                width: 28,
                height: 28,
                filter: theme === 'dark' ? 'invert(1)' : 'none',
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-panel-muted)', textAlign: 'center', letterSpacing: '0.05em' }}>PREVIEW MODE</span>
            <span style={{ fontSize: 10, color: 'var(--text-panel-muted)', textAlign: 'center' }}>Editing is disabled</span>
          </div>
        )}
        <div className={styles.noSelectionIcon}>
          <MousePointer2 size={32} style={{ opacity: 0.6 }} />
        </div>
        <h3 className={styles.noSelectionTitle}>No element selected</h3>
        <p className={styles.noSelectionHint}>Click on any element on the canvas to select and edit it.</p>
        <div className={styles.noSelectionTip}>
          <div className={styles.noSelectionTipItem}><span className={styles.noSelectionTipIcon}>↖</span> Click to select an element</div>
          <div className={styles.noSelectionTipItem}><span className={styles.noSelectionTipIcon}>⤵</span> Double-click to edit text</div>
          <div className={styles.noSelectionTipItem}><span className={styles.noSelectionTipIcon}>⌨</span> Ctrl+Z to undo, Del to delete</div>
        </div>
      </div>
    );
  }

  const update = (updates: Partial<CanvasElement>) => updateElement(element.id, updates);
  const updateStyle = (s: Partial<TextStyle>) => {
    if (element.type !== 'text') return;
    update({ style: { ...(element as TextElement).style, ...s } } as any);
  };

  const formattedLabel = element.label
    || element.id.replace(/-/g, ' ').replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className={styles.editPanel} style={previewMode ? { position: 'relative' } : undefined}>
      {previewMode && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: 'var(--bg-panel)',
          opacity: 0.72,
          borderRadius: 'inherit',
          cursor: 'not-allowed',
          pointerEvents: 'all',
        }} />
      )}
      {/* Header */}
      <div className={styles.editPanelHeader}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className={styles.editPanelTitle}>{formattedLabel}</h2>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className={`${styles.smallActionBtn} ${element.locked ? styles.smallActionBtnActive : ''}`}
              onClick={() => update({ locked: !element.locked })}
              title={element.locked ? 'Unlock' : 'Lock position'}
            >
              {element.locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
            <button
              className={`${styles.smallActionBtn} ${!element.visible ? styles.smallActionBtnActive : ''}`}
              onClick={() => update({ visible: !element.visible })}
              title={element.visible ? 'Hide' : 'Show'}
            >
              {element.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button
              className={styles.smallActionBtnDanger}
              onClick={() => deleteElement(element.id)}
              title="Delete element"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        {element.locked && (
          <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 6 }}>
            🔒 Unlock to edit position and size
          </p>
        )}
      </div>

      {/* Body */}
      <div className={styles.editPanelBody}>

        {/* ── POSITION & SIZE ── */}
        <Section title="Position & Size">
          <div className={styles.fieldRow}>
            <NumField label="X" value={element.x} onChange={(v) => update({ x: v } as any)} step={0.5} unit="mm" />
            <NumField label="Y" value={element.y} onChange={(v) => update({ y: v } as any)} step={0.5} unit="mm" />
          </div>
          <div className={styles.fieldRow}>
            <NumField label="Width" value={element.width} onChange={(v) => update({ width: Math.max(1, v) } as any)} min={1} step={0.5} unit="mm" />
            <NumField label="Height" value={element.height} onChange={(v) => update({ height: Math.max(1, v) } as any)} min={1} step={0.5} unit="mm" />
          </div>
          <NumField label="Rotation" value={element.rotation || 0} onChange={(v) => update({ rotation: v } as any)} min={-360} max={360} step={1} unit="°" />
        </Section>

        {/* ── HYPERLINK / URL ── */}
        <Section title="Hyperlink / URL">
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>URL / Link</label>
            <input
              type="text"
              className={styles.input}
              value={element.url || ''}
              onChange={(e) => update({ url: e.target.value } as any)}
              placeholder="https://example.com"
            />
          </div>
        </Section>

        {/* ── TEXT PROPERTIES ── */}
        {element.type === 'text' && (() => {
          const el = element as TextElement;
          return (
            <>
              <Section title="Content">
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Text</label>
                  <textarea
                    className={styles.textarea}
                    value={el.content}
                    onChange={(e) => {
                      const newContent = e.target.value;
                      const lines = newContent.split('\n');
                      const estCharsPerLine = Math.max(8, Math.floor((el.width || 50) / 2.5));
                      const totalLines = lines.reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / estCharsPerLine)), 0);
                      const fontSizePt = el.style.fontSize || 12;
                      const lineHeight = el.style.lineHeight || 1.3;
                      const newHeight = Math.max(6, totalLines * fontSizePt * lineHeight * 0.38 + (el.style.padding || 0) * 2);
                      update({ content: newContent, height: newHeight } as any);
                    }}
                    rows={4}
                    placeholder="Enter text…"
                  />
                </div>
              </Section>

              <Section title="Typography">
                {/* Font family */}
                <div className={styles.fieldGroup} ref={fontMenuRef}>
                  <label className={styles.fieldLabel}>Font Family</label>
                  <div className={styles.dropdownWrapper}>
                    <button
                      className={styles.dropdownBtn}
                      onClick={() => { setShowFontMenu((v) => !v); setShowSizeMenu(false); }}
                    >
                      <span style={{ fontFamily: el.style.fontFamily, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {el.style.fontFamily}
                      </span>
                      <ChevronDown size={12} style={{ flexShrink: 0 }} />
                    </button>
                    {showFontMenu && (
                      <div className={styles.dropdownList}>
                        {FONT_FAMILIES.map((font) => (
                          <button
                            key={font}
                            className={`${styles.dropdownItem} ${font === el.style.fontFamily ? styles.dropdownItemActive : ''}`}
                            style={{ fontFamily: font }}
                            onClick={() => { updateStyle({ fontFamily: font }); setShowFontMenu(false); }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Font size */}
                <div className={styles.fieldGroup} ref={sizeMenuRef}>
                  <label className={styles.fieldLabel}>Font Size</label>
                  <div className={styles.dropdownWrapper}>
                    <button
                      className={styles.dropdownBtn}
                      onClick={() => { setShowSizeMenu((v) => !v); setShowFontMenu(false); }}
                    >
                      <span>{el.style.fontSize}pt</span>
                      <ChevronDown size={12} />
                    </button>
                    {showSizeMenu && (
                      <div className={styles.dropdownList} style={{ maxHeight: 200 }}>
                        {FONT_SIZES.map((size) => (
                          <button
                            key={size}
                            className={`${styles.dropdownItem} ${size === el.style.fontSize ? styles.dropdownItemActive : ''}`}
                            onClick={() => { updateStyle({ fontSize: size }); setShowSizeMenu(false); }}
                          >
                            {size}pt
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Style buttons */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Style</label>
                  <div className={styles.styleRow}>
                    <button className={`${styles.styleBtn} ${el.style.fontWeight === 'bold' ? styles.styleBtnActive : ''}`} onClick={() => updateStyle({ fontWeight: el.style.fontWeight === 'bold' ? 'normal' : 'bold' })} title="Bold"><Bold size={13} /></button>
                    <button className={`${styles.styleBtn} ${el.style.fontStyle === 'italic' ? styles.styleBtnActive : ''}`} onClick={() => updateStyle({ fontStyle: el.style.fontStyle === 'italic' ? 'normal' : 'italic' })} title="Italic"><Italic size={13} /></button>
                    <button className={`${styles.styleBtn} ${el.style.textDecoration === 'underline' ? styles.styleBtnActive : ''}`} onClick={() => updateStyle({ textDecoration: el.style.textDecoration === 'underline' ? 'none' : 'underline' })} title="Underline"><Underline size={13} /></button>
                    <div className={styles.styleSeparator} />
                    <button className={`${styles.styleBtn} ${el.style.textAlign === 'left' ? styles.styleBtnActive : ''}`} onClick={() => updateStyle({ textAlign: 'left' })} title="Left"><AlignLeft size={13} /></button>
                    <button className={`${styles.styleBtn} ${el.style.textAlign === 'center' ? styles.styleBtnActive : ''}`} onClick={() => updateStyle({ textAlign: 'center' })} title="Center"><AlignCenter size={13} /></button>
                    <button className={`${styles.styleBtn} ${el.style.textAlign === 'right' ? styles.styleBtnActive : ''}`} onClick={() => updateStyle({ textAlign: 'right' })} title="Right"><AlignRight size={13} /></button>
                    <button className={`${styles.styleBtn} ${el.style.textAlign === 'justify' ? styles.styleBtnActive : ''}`} onClick={() => updateStyle({ textAlign: 'justify' })} title="Justify"><AlignJustify size={13} /></button>
                  </div>
                </div>

                <ColorField label="Color" value={el.style.color} onChange={(v) => updateStyle({ color: v })} />

                <div className={styles.fieldRow}>
                  <NumField label="Line Height" value={el.style.lineHeight} onChange={(v) => updateStyle({ lineHeight: v })} min={0.5} max={4} step={0.05} />
                  <NumField label="Letter Spacing" value={el.style.letterSpacing} onChange={(v) => updateStyle({ letterSpacing: v })} min={-5} max={20} step={0.1} unit="px" />
                </div>

                {/* Bullet Library */}
                <div className={styles.fieldGroup} style={{ marginTop: 12 }}>
                  <label className={styles.fieldLabel}>Bullet Library</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                    {['•', '○', '■', '❖', '➢', '✓'].map((bullet) => (
                      <button
                        key={bullet}
                        className={styles.styleBtn}
                        style={{ fontSize: 13, height: 28, padding: 0 }}
                        onClick={() => update({ content: (el.content ? el.content + '\n' : '') + bullet + ' ' } as any)}
                        title={`Insert bullet ${bullet}`}
                      >
                        {bullet}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>
            </>
          );
        })()}

        {/* ── IMAGE PROPERTIES ── */}
        {element.type === 'image' && (
          <Section title="Image">
            <button
              className={styles.panelBtn}
              onClick={onUploadClick}
            >
              <Upload size={13} />
              Replace Image
            </button>
            <button
              className={styles.panelBtn}
              onClick={() => setCroppingId(element.id)}
            >
              <Crop size={13} />
              Edit Crop
            </button>

            {/* Ornament Color Picker */}
            {(element as any).isOrnament && (element as any).ornamentColor && (
              <div className={styles.fieldGroup} style={{ marginBottom: 8 }}>
                <label className={styles.fieldLabel}>Ornament Color</label>
                <div className={styles.colorRow}>
                  <div className={styles.colorSwatch}>
                    <input type="color" value={(element as any).ornamentColor} onChange={(e) => update({ ornamentColor: e.target.value } as any)} />
                    <div style={{ position: 'absolute', inset: 0, background: (element as any).ornamentColor, borderRadius: 5, pointerEvents: 'none' }} />
                  </div>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.colorHex}`}
                    value={(element as any).ornamentColor}
                    onChange={(e) => update({ ornamentColor: e.target.value } as any)}
                    placeholder="#000000"
                    maxLength={7}
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Object Fit</label>
              <select
                className={styles.input}
                value={(element as any).objectFit || 'contain'}
                onChange={(e) => update({ objectFit: e.target.value as any } as any)}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
              </select>
            </div>

            <SliderField label="Border Radius" value={(element as any).borderRadius || 0} onChange={(v) => update({ borderRadius: v } as any)} min={0} max={100} unit="px" />
            <SliderField label="Opacity" value={Math.round(((element as any).opacity ?? 1) * 100)} onChange={(v) => update({ opacity: v / 100 } as any)} min={0} max={100} unit="%" />

            <div style={{ marginTop: 4 }}>
              <div className={styles.sectionHeader} style={{ cursor: 'default', paddingTop: 0, paddingBottom: 6 }}>Adjustments</div>
              <div style={{ paddingTop: 4 }}>
                <SliderField label="Brightness" value={Math.round(((element as any).brightness ?? 1) * 100)} onChange={(v) => update({ brightness: v / 100 } as any)} min={0} max={200} unit="%" />
                <SliderField label="Contrast" value={Math.round(((element as any).contrast ?? 1) * 100)} onChange={(v) => update({ contrast: v / 100 } as any)} min={0} max={200} unit="%" />
                <SliderField label="Saturation" value={Math.round(((element as any).saturation ?? 1) * 100)} onChange={(v) => update({ saturation: v / 100 } as any)} min={0} max={200} unit="%" />
                <SliderField label="Blur" value={(element as any).blur ?? 0} onChange={(v) => update({ blur: v } as any)} min={0} max={20} step={0.5} unit="px" />
              </div>
            </div>

            <button
              className={styles.panelBtn}
              onClick={() => update({ objectFit: 'cover', cropX: 50, cropY: 50, zoom: 1, rotation: 0, opacity: 1, brightness: 1, contrast: 1, saturation: 1, blur: 0, borderRadius: 0 } as any)}
            >
              <RotateCcw size={13} />
              Reset Image
            </button>
          </Section>
        )}

        {/* ── FRAME PROPERTIES ── */}
        {element.type === 'frame' && (() => {
          const el = element as any;
          return (
            <Section title="Frame">
              <button
                className={styles.panelBtn}
                onClick={onUploadClick}
              >
                <Upload size={13} />
                Replace Image
              </button>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Shape</label>
                <select
                  className={styles.input}
                  value={el.shape || 'rectangle'}
                  onChange={(e) => {
                    const newShape = e.target.value as any;
                    const updates: any = { shape: newShape };
                    if (newShape === 'circle' || newShape === 'square') {
                      const size = Math.max(el.width, el.height);
                      updates.width = size;
                      updates.height = size;
                    }
                    update(updates);
                  }}
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                  <option value="ellipse">Ellipse</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Image Fit</label>
                <select
                  className={styles.input}
                  value={el.objectFit || 'cover'}
                  onChange={(e) => update({ objectFit: e.target.value as any } as any)}
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                </select>
              </div>

              {el.src && (
                <div style={{ marginTop: 12, borderTop: '1px solid var(--border-panel, #e2e8f0)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className={styles.fieldLabel} style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em', color: 'var(--text-panel, #0f172a)' }}>Image Position & Crop</div>

                  <SliderField
                    label="Zoom"
                    value={Math.round((el.zoom || 1) * 100)}
                    onChange={(v) => update({ zoom: v / 100 } as any)}
                    min={100}
                    max={500}
                    unit="%"
                  />
                  <SliderField
                    label="Horizontal Position"
                    value={el.cropX ?? 50}
                    onChange={(v) => update({ cropX: v } as any)}
                    min={0}
                    max={100}
                    unit="%"
                  />
                  <SliderField
                    label="Vertical Position"
                    value={el.cropY ?? 50}
                    onChange={(v) => update({ cropY: v } as any)}
                    min={0}
                    max={100}
                    unit="%"
                  />
                  <button
                    className={styles.panelBtn}
                    style={{ marginTop: 8 }}
                    onClick={() => update({ zoom: 1, cropX: 50, cropY: 50 } as any)}
                  >
                    <RotateCcw size={13} />
                    Reset Crop
                  </button>
                </div>
              )}

              <div className={styles.fieldGroup} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 8 }}>
                <span className={styles.fieldLabel} style={{ marginBottom: 0 }}>Border</span>
                <input
                  type="checkbox"
                  checked={el.borderEnabled || false}
                  onChange={(e) => update({ borderEnabled: e.target.checked } as any)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {el.borderEnabled && (
                <div style={{ borderLeft: '2px solid var(--border-panel, #e2e8f0)', paddingLeft: 10, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SliderField
                    label="Border Width"
                    value={el.borderWidth || 2}
                    onChange={(v) => update({ borderWidth: v } as any)}
                    min={1}
                    max={15}
                    unit="px"
                  />

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Border Style</label>
                    <select
                      className={styles.input}
                      value={el.borderStyle || 'solid'}
                      onChange={(e) => update({ borderStyle: e.target.value as any } as any)}
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>

                  <ColorField
                    label="Border Color"
                    value={el.borderColor || '#cbd5e1'}
                    onChange={(v) => update({ borderColor: v } as any)}
                  />
                </div>
              )}

              <SliderField
                label="Opacity"
                value={Math.round((el.opacity ?? 1) * 100)}
                onChange={(v) => update({ opacity: v / 100 } as any)}
                min={0}
                max={100}
                unit="%"
              />
            </Section>
          );
        })()}

        {/* ── QR CODE PROPERTIES ── */}
        {element.type === 'qr-code' && (() => {
          const el = element as any;
          const { checkQRContrast } = require('@/utils/qrCode');
          const isContrastSafe = checkQRContrast(el.foregroundColor || '#0f172a', el.backgroundColor || '#ffffff');

          return (
            <Section title="QR Code">
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Content / URL</label>
                <input
                  type="text"
                  className={styles.input}
                  value={el.content || ''}
                  onChange={(e) => update({ content: e.target.value } as any)}
                  placeholder="https://example.com"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Design Preset</label>
                <select
                  className={styles.input}
                  value={el.designPreset || 'classic'}
                  onChange={(e) => update({ designPreset: e.target.value as any } as any)}
                >
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="rounded">Rounded</option>
                  <option value="rounded-dots">Rounded Dots</option>
                  <option value="modern">Modern</option>
                  <option value="dots">Dots</option>
                  <option value="professional">Professional</option>
                  <option value="elegant">Elegant</option>
                  <option value="bold">Bold</option>
                  <option value="framed">Framed</option>
                </select>
              </div>

              <ColorField
                label="Foreground Color"
                value={el.foregroundColor || '#0f172a'}
                onChange={(v) => update({ foregroundColor: v } as any)}
              />

              <ColorField
                label="Background Color"
                value={el.backgroundColor || '#ffffff'}
                onChange={(v) => update({ backgroundColor: v } as any)}
              />

              {!isContrastSafe && (
                <div style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: 6,
                  padding: '8px 10px',
                  color: '#b45309',
                  fontSize: 10,
                  fontWeight: 600,
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}>
                  ⚠️ Low contrast warning: Scanning may be unreliable. Increase contrast between foreground and background.
                </div>
              )}

              <SliderField
                label="Margin (Quiet Zone)"
                value={el.margin ?? 2}
                onChange={(v) => update({ margin: v } as any)}
                min={0}
                max={10}
                unit=" cells"
              />
            </Section>
          );
        })()}

        {/* ── RECT PROPERTIES ── */}
        {element.type === 'rect' && (() => {
          const el = element as any;
          const mode = el.styleMode || (
            !el.fill || el.fill === 'transparent' || el.fill === 'none'
              ? 'outline'
              : (!el.stroke || el.stroke === 'transparent' || el.stroke === 'none' || el.strokeWidth === 0)
                ? 'fill'
                : 'both'
          );
          const defaultStroke = '#6366f1';
          const defaultFill = '#e0e7ff';

          return (
            <Section title="Appearance">
              {/* Style mode toggle */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Style Mode</label>
                <div className={styles.styleRow}>
                  {([['outline', 'Outline'], ['fill', 'Fill'], ['both', 'Fill + Stroke']] as const).map(([m, label]) => (
                    <button
                      key={m}
                      className={`${styles.styleBtn} ${mode === m ? styles.styleBtnActive : ''}`}
                      style={{ width: 'auto', flex: 1, fontSize: 9, padding: '0 4px' }}
                      onClick={() => {
                        const updates: any = { styleMode: m };
                        if (m === 'outline') {
                          if (!el.stroke || el.stroke === 'transparent' || el.stroke === 'none') updates.stroke = defaultStroke;
                          if (!el.strokeWidth || el.strokeWidth === 0) updates.strokeWidth = 2;
                        } else if (m === 'fill') {
                          if (!el.fill || el.fill === 'transparent' || el.fill === 'none') updates.fill = defaultFill;
                        } else if (m === 'both') {
                          if (!el.fill || el.fill === 'transparent' || el.fill === 'none') updates.fill = defaultFill;
                          if (!el.stroke || el.stroke === 'transparent' || el.stroke === 'none') updates.stroke = defaultStroke;
                          if (!el.strokeWidth || el.strokeWidth === 0) updates.strokeWidth = 2;
                        }
                        update(updates);
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
              {mode !== 'outline' && <ColorField label="Fill Color" value={(!el.fill || el.fill === 'transparent' || el.fill === 'none') ? defaultFill : el.fill} onChange={(v) => update({ fill: v } as any)} />}
              {mode !== 'fill' && <ColorField label="Border Color" value={(!el.stroke || el.stroke === 'transparent' || el.stroke === 'none') ? defaultStroke : el.stroke} onChange={(v) => update({ stroke: v } as any)} />}
              <div className={styles.fieldRow}>
                {mode !== 'fill' && <NumField label="Border Width" value={el.strokeWidth || 0} onChange={(v) => update({ strokeWidth: v } as any)} min={0} max={20} step={0.5} unit="px" />}
                <NumField label="Radius" value={el.borderRadius} onChange={(v) => update({ borderRadius: v } as any)} min={0} max={200} unit="px" />
              </div>
              <SliderField label="Opacity" value={Math.round((el.opacity ?? 1) * 100)} onChange={(v) => update({ opacity: v / 100 } as any)} min={0} max={100} unit="%" />
            </Section>
          );
        })()}

        {/* ── SVG SHAPE PROPERTIES (circle, triangle, star, hexagon, arrow) ── */}
        {(element.type === 'circle' || element.type === 'triangle' || element.type === 'star' || element.type === 'hexagon' || element.type === 'arrow' || element.type === 'diagonal-line' || element.type === 'wave' || element.type === 'l-shape' || element.type === 'right-triangle' || element.type === 'diamond' || element.type === 'pentagon' || element.type === 'four-star' || element.type === 'eight-star' || element.type === 'speech-rect' || element.type === 'speech-oval' || element.type === 'cloud' || element.type === 'heart' || element.type === 'lightning') && (() => {
          const el = element as any;
          const mode = el.styleMode || (
            !el.fill || el.fill === 'transparent' || el.fill === 'none'
              ? 'outline'
              : (!el.stroke || el.stroke === 'transparent' || el.stroke === 'none' || el.strokeWidth === 0)
                ? 'fill'
                : 'both'
          );

          let defaultStroke = '#6366f1';
          let defaultFill = '#e0e7ff';
          if (element.type === 'circle') { defaultStroke = '#3b82f6'; defaultFill = '#dbeafe'; }
          else if (element.type === 'triangle') { defaultStroke = '#f59e0b'; defaultFill = '#fef3c7'; }
          else if (element.type === 'star') { defaultStroke = '#eab308'; defaultFill = '#fef9c3'; }
          else if (element.type === 'hexagon') { defaultStroke = '#f43f5e'; defaultFill = '#ffe4e6'; }

          return (
            <Section title="Appearance">
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Style Mode</label>
                <div className={styles.styleRow}>
                  {([['outline', 'Outline'], ['fill', 'Fill'], ['both', 'Fill + Stroke']] as const).map(([m, label]) => (
                    <button
                      key={m}
                      className={`${styles.styleBtn} ${mode === m ? styles.styleBtnActive : ''}`}
                      style={{ width: 'auto', flex: 1, fontSize: 9, padding: '0 4px' }}
                      onClick={() => {
                        const updates: any = { styleMode: m };
                        if (m === 'outline') {
                          if (!el.stroke || el.stroke === 'transparent' || el.stroke === 'none') updates.stroke = defaultStroke;
                          if (!el.strokeWidth || el.strokeWidth === 0) updates.strokeWidth = 2;
                        } else if (m === 'fill') {
                          if (!el.fill || el.fill === 'transparent' || el.fill === 'none') updates.fill = defaultFill;
                        } else if (m === 'both') {
                          if (!el.fill || el.fill === 'transparent' || el.fill === 'none') updates.fill = defaultFill;
                          if (!el.stroke || el.stroke === 'transparent' || el.stroke === 'none') updates.stroke = defaultStroke;
                          if (!el.strokeWidth || el.strokeWidth === 0) updates.strokeWidth = 2;
                        }
                        update(updates);
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
              {mode !== 'outline' && <ColorField label="Fill Color" value={(!el.fill || el.fill === 'transparent' || el.fill === 'none') ? defaultFill : el.fill} onChange={(v) => update({ fill: v } as any)} />}
              {mode !== 'fill' && <ColorField label="Border Color" value={(!el.stroke || el.stroke === 'transparent' || el.stroke === 'none') ? defaultStroke : el.stroke} onChange={(v) => update({ stroke: v } as any)} />}
              {mode !== 'fill' && <NumField label="Border Width" value={el.strokeWidth || 0} onChange={(v) => update({ strokeWidth: v } as any)} min={0} max={20} step={0.5} unit="px" />}
              <SliderField label="Opacity" value={Math.round((el.opacity ?? 1) * 100)} onChange={(v) => update({ opacity: v / 100 } as any)} min={0} max={100} unit="%" />
            </Section>
          );
        })()}

        {/* ── LINE PROPERTIES ── */}
        {element.type === 'line' && (
          <Section title="Appearance">
            <ColorField label="Color" value={(element as any).stroke} onChange={(v) => update({ stroke: v } as any)} />
            <NumField label="Thickness" value={(element as any).strokeWidth} onChange={(v) => update({ strokeWidth: v } as any)} min={0.5} max={20} step={0.5} unit="px" />
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Orientation</label>
              <div className={styles.styleRow}>
                {(['horizontal', 'vertical'] as const).map((dir) => (
                  <button
                    key={dir}
                    className={`${styles.styleBtn} ${(element as any).orientation === dir ? styles.styleBtnActive : ''}`}
                    style={{ width: 'auto', padding: '0 12px', flex: 1 }}
                    onClick={() => update({ orientation: dir } as any)}
                  >
                    {dir === 'horizontal' ? '—' : '|'} {dir.charAt(0).toUpperCase() + dir.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ── STICKY PROPERTIES ── */}
        {element.type === 'sticky' && (
          <>
            <Section title="Content">
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Text</label>
                <textarea
                  className={styles.textarea}
                  value={(element as any).content}
                  onChange={(e) => update({ content: e.target.value } as any)}
                  rows={4}
                  placeholder="Write a note…"
                />
              </div>
            </Section>
            <Section title="Appearance">
              <ColorField label="Background" value={(element as any).background} onChange={(v) => update({ background: v } as any)} />
              <ColorField label="Text Color" value={(element as any).textColor} onChange={(v) => update({ textColor: v } as any)} />
              <div className={styles.fieldRow}>
                <NumField label="Font Size" value={(element as any).fontSize} onChange={(v) => update({ fontSize: v } as any)} min={6} max={48} unit="pt" />
                <NumField label="Padding" value={(element as any).padding} onChange={(v) => update({ padding: v } as any)} min={0} max={20} unit="mm" />
              </div>
              <NumField label="Border Radius" value={(element as any).borderRadius} onChange={(v) => update({ borderRadius: v } as any)} min={0} max={40} unit="px" />
              <SliderField label="Opacity" value={Math.round(((element as any).opacity ?? 1) * 100)} onChange={(v) => update({ opacity: v / 100 } as any)} min={0} max={100} unit="%" />
            </Section>
          </>
        )}

        {/* ── DRAWING PROPERTIES ── */}
        {element.type === 'drawing' && (
          <Section title="Drawing">
            <ColorField label="Color" value={(element as any).stroke} onChange={(v) => update({ stroke: v } as any)} />
            <NumField label="Stroke Width" value={(element as any).strokeWidth} onChange={(v) => update({ strokeWidth: v } as any)} min={0.5} max={20} step={0.5} unit="px" />
            <SliderField label="Opacity" value={Math.round(((element as any).opacity ?? 1) * 100)} onChange={(v) => update({ opacity: v / 100 } as any)} min={0} max={100} unit="%" />
          </Section>
        )}

        {/* ── TABLE PROPERTIES ── */}
        {element.type === 'table' && (
          <Section title="Table Style">
            <ColorField label="Header Background" value={(element as any).headerBackground} onChange={(v) => update({ headerBackground: v } as any)} />
            <ColorField label="Header Text Color" value={(element as any).headerTextColor} onChange={(v) => update({ headerTextColor: v } as any)} />
            <ColorField label="Text Color" value={(element as any).textColor} onChange={(v) => update({ textColor: v } as any)} />
            <ColorField label="Border Color" value={(element as any).borderColor} onChange={(v) => update({ borderColor: v } as any)} />
            <div className={styles.fieldRow}>
              <NumField label="Border Width" value={(element as any).borderWidth} onChange={(v) => update({ borderWidth: v } as any)} min={0} max={5} step={0.5} unit="px" />
              <NumField label="Font Size" value={(element as any).fontSize} onChange={(v) => update({ fontSize: v } as any)} min={6} max={24} unit="pt" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Header Row</label>
              <div className={styles.styleRow}>
                <button className={`${styles.styleBtn} ${(element as any).headerRow ? styles.styleBtnActive : ''}`} style={{ flex: 1, width: 'auto' }} onClick={() => update({ headerRow: !(element as any).headerRow } as any)}>
                  {(element as any).headerRow ? '✓ Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </Section>
        )}

        {/* ── CHART PROPERTIES ── */}
        {element.type === 'chart' && (() => {
          const el = element as ChartElement;
          return (
            <>
              {/* Type & Design */}
              <Section title="Chart Design">
                {/* Chart Type */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Chart Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {(['pie', 'bar', 'line'] as const).map((t) => (
                      <button
                        key={t}
                        className={`${styles.styleBtn} ${el.chartType === t ? styles.styleBtnActive : ''}`}
                        onClick={() => update({ chartType: t } as any)}
                        style={{ textTransform: 'capitalize', fontSize: 11 }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Design Preset */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Design Preset</label>
                  <select
                    className={styles.input}
                    value={el.designPreset || 'design-1'}
                    onChange={(e) => update({ designPreset: e.target.value } as any)}
                    style={{
                      width: '100%',
                      height: 32,
                      padding: '0 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-panel)',
                      background: 'var(--bg-panel-input)',
                      color: 'var(--text-panel)',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  >
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i} value={`design-${i + 1}`}>
                        Design {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </Section>

              {/* Display Controls */}
              <Section title="Display Settings">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-panel)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={el.showLegend !== false}
                      onChange={(e) => update({ showLegend: e.target.checked } as any)}
                      style={{ cursor: 'pointer' }}
                    />
                    Show Legend
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-panel)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={el.showValues !== false}
                      onChange={(e) => update({ showValues: e.target.checked } as any)}
                      style={{ cursor: 'pointer' }}
                    />
                    Show Values
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-panel)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={el.showLabels !== false}
                      onChange={(e) => update({ showLabels: e.target.checked } as any)}
                      style={{ cursor: 'pointer' }}
                    />
                    Show Labels
                  </label>
                </div>
              </Section>

              {/* Data Editing */}
              <Section title="Chart Data">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {el.data.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="text"
                        className={styles.input}
                        value={item.label}
                        onChange={(e) => {
                          const newData = [...el.data];
                          newData[index] = { ...newData[index], label: e.target.value };
                          update({ data: newData } as any);
                        }}
                        placeholder="Label"
                        style={{ flex: 2, height: 30, fontSize: 11 }}
                      />
                      <input
                        type="number"
                        className={styles.input}
                        value={item.value}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          const newData = [...el.data];
                          newData[index] = { ...newData[index], value: isNaN(val) ? 0 : val };
                          update({ data: newData } as any);
                        }}
                        placeholder="Value"
                        style={{ flex: 1.2, height: 30, fontSize: 11 }}
                      />
                      <button
                        onClick={() => {
                          const newData = el.data.filter((_, i) => i !== index);
                          update({ data: newData } as any);
                        }}
                        disabled={el.data.length <= 1}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: el.data.length <= 1 ? 'not-allowed' : 'pointer',
                          opacity: el.data.length <= 1 ? 0.35 : 1,
                          fontSize: 14,
                          padding: 4,
                        }}
                        title="Delete category"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newData = [...el.data, { label: `Category ${String.fromCharCode(65 + el.data.length)}`, value: 10 }];
                      update({ data: newData } as any);
                    }}
                    style={{
                      marginTop: 6,
                      height: 30,
                      background: 'var(--bg-panel-input, #f1f5f9)',
                      border: '1px dashed var(--border-panel, #cbd5e1)',
                      borderRadius: 6,
                      color: 'var(--text-panel, #0f172a)',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    + Add Section
                  </button>
                </div>
              </Section>
            </>
          );
        })()}

        {/* ── PAGE BACKGROUND (when no element but doc exists — not shown here, handled at page level) ── */}
      </div>
    </div>
  );
};
