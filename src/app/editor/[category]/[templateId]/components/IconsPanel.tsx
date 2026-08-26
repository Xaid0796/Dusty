'use client';

import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '@/canvas/store';
import { X, Search } from 'lucide-react';
import { RESUME_ICONS } from '@/canvas/resumeIcons';
import { AdvancedColorPickerPopup } from './AdvancedColorPickerPopup';
import styles from '../editor.module.css';

interface IconsPanelProps {
  onClose: () => void;
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const IconsPanel: React.FC<IconsPanelProps> = ({ onClose }) => {
  const { document: doc, addElement, selectedIds, updateElement } = useCanvasStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Contact' | 'Social' | 'Work' | 'Education' | 'General'>('All');
  const [iconColor, setIconColor] = useState('#64748b');
  const [showColorPopup, setShowColorPopup] = useState(false);

  const categories = ['All', 'Contact', 'Social', 'Work', 'Education', 'General'] as const;

  const svgToDataUri = (svgStr: string, color: string) => {
    // Replace currentColor with actual selected color hex/rgb/hsl
    const coloredSvg = svgStr.replace(/currentColor/g, color);
    return `data:image/svg+xml;utf8,${encodeURIComponent(coloredSvg)}`;
  };

  // Real-time update for selected canvas icon elements when iconColor changes
  useEffect(() => {
    if (!doc) return;
    selectedIds.forEach((id) => {
      const el = doc.elements.find((e) => e.id === id);
      if (el && el.type === 'image' && el.src && el.src.startsWith('data:image/svg+xml')) {
        const matchedIcon = RESUME_ICONS.find((i) => i.name === el.label);
        if (matchedIcon) {
          const newSrc = svgToDataUri(matchedIcon.svg, iconColor);
          if (el.src !== newSrc) {
            updateElement(id, { src: newSrc });
          }
        }
      }
    });
  }, [iconColor, selectedIds, doc, updateElement]);

  const addIcon = (iconId: string) => {
    if (!doc) return;
    const iconObj = RESUME_ICONS.find((i) => i.id === iconId);
    if (!iconObj) return;

    const cx = doc.page.width / 2;
    const cy = doc.page.height / 2;
    const width = 16;
    const height = 16;

    const maxZ = doc.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);

    const dataUrl = svgToDataUri(iconObj.svg, iconColor);

    addElement({
      id: uid('icon'),
      type: 'image',
      label: iconObj.name,
      x: cx - width / 2,
      y: cy - height / 2,
      width,
      height,
      rotation: 0,
      zIndex: maxZ + 1,
      visible: true,
      locked: false,
      src: dataUrl,
      objectFit: 'contain',
      objectPosition: '50% 50%',
      cropX: 50,
      cropY: 50,
      zoom: 1,
      borderRadius: 0,
      opacity: 1,
    });
  };

  const filteredIcons = RESUME_ICONS.filter((icon) => {
    const matchesQuery = icon.name.toLowerCase().includes(query.toLowerCase()) || icon.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'All' || icon.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border-panel)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-panel)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Elements & Icons
          </span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-panel-muted)', cursor: 'pointer', padding: 4, borderRadius: 5, display: 'flex' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-panel-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search icons…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              height: 32,
              background: 'var(--bg-panel-input)',
              border: '1px solid var(--border-panel)',
              borderRadius: 8,
              paddingLeft: 28,
              paddingRight: 10,
              fontSize: 12,
              color: 'var(--text-panel)',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary-color)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-panel)'; }}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px', overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid var(--border-panel)' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              flexShrink: 0,
              padding: '4px 10px',
              borderRadius: 6,
              border: activeCategory === cat ? '1px solid var(--primary-color)' : '1px solid var(--border-panel)',
              background: activeCategory === cat ? 'var(--bg-popover-active)' : 'transparent',
              color: activeCategory === cat ? 'var(--text-popover-active)' : 'var(--text-panel-muted)',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.12s',
              letterSpacing: '0.03em',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Advanced Color Selection Tool */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-panel)', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-panel-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          Element Color (HEX, RGB, HSL)
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Visual color swatch triggering advanced picker popup */}
          <button
            onClick={() => setShowColorPopup(true)}
            title="Open Advanced Color Picker"
            style={{
              width: 32,
              height: 28,
              borderRadius: 6,
              backgroundColor: iconColor,
              border: '1px solid var(--border-panel)',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          />
          {/* Direct text input supporting HEX, RGB, HSL */}
          <input
            type="text"
            value={iconColor}
            onChange={(e) => setIconColor(e.target.value)}
            placeholder="#64748b, rgb(...), hsl(...)"
            style={{
              flex: 1,
              height: 28,
              background: 'var(--bg-panel-input)',
              border: '1px solid var(--border-panel)',
              borderRadius: 6,
              padding: '0 8px',
              fontSize: 11,
              color: 'var(--text-panel)',
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {showColorPopup && (
        <AdvancedColorPickerPopup
          color={iconColor}
          onChange={(newCol) => setIconColor(newCol)}
          onClose={() => setShowColorPopup(false)}
        />
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {filteredIcons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-panel-muted)', fontSize: 12 }}>
            No icons match "{query}"
          </div>
        ) : (
          <>
            {/* Group by category */}
            {(activeCategory === 'All'
              ? [...new Set(filteredIcons.map((i) => i.category))]
              : [activeCategory]
            ).map((cat) => {
              const catIcons = filteredIcons.filter((i) => i.category === cat);
              if (catIcons.length === 0) return null;
              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-panel-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>
                    {cat}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                    {catIcons.map((icon) => (
                      <button
                        key={icon.id}
                        title={icon.name}
                        onClick={() => addIcon(icon.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          padding: '8px 3px 6px',
                          background: 'var(--bg-panel-input)',
                          border: '1px solid var(--border-panel)',
                          borderRadius: 8,
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel-btn-hover)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary-color)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel-input)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-panel)';
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={svgToDataUri(icon.svg, iconColor)}
                          alt={icon.name}
                          width={20}
                          height={20}
                          style={{ display: 'block' }}
                        />
                        <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-panel)', lineHeight: 1.2, textAlign: 'center', letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', padding: '0 2px' }}>
                          {icon.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer tip */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-panel)', flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: 'var(--text-panel-muted)', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
          Click any icon to add it to canvas · Drag to reposition
        </p>
      </div>
    </div>
  );
};
