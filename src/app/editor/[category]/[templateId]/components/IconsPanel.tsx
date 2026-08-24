'use client';
import React, { useState } from 'react';
import { useCanvasStore } from '@/canvas/store';
import { X, Search } from 'lucide-react';
import { RESUME_ICONS } from '@/canvas/resumeIcons';

interface IconsPanelProps {
  onClose: () => void;
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ICON_COLORS = [
  { label: 'Navy Deep', value: '#0f172a' },
  { label: 'Muted Slate', value: '#64748b' },
  { label: 'Indigo Accent', value: '#6366f1' },
  { label: 'Cyan Teal', value: '#14b8a6' },
  { label: 'Success Green', value: '#10b981' },
  { label: 'Alert Gold', value: '#f59e0b' },
  { label: 'Danger Red', value: '#ef4444' },
];

export const IconsPanel: React.FC<IconsPanelProps> = ({ onClose }) => {
  const { document: doc, addElement } = useCanvasStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Contact' | 'Social' | 'Work' | 'Education' | 'General'>('All');
  const [iconColor, setIconColor] = useState('#64748b');

  const categories = ['All', 'Contact', 'Social', 'Work', 'Education', 'General'] as const;

  const svgToDataUri = (svgStr: string, color: string) => {
    // Replace currentColor with actual selected color hex
    const coloredSvg = svgStr.replace(/currentColor/g, color);
    return `data:image/svg+xml;utf8,${encodeURIComponent(coloredSvg)}`;
  };


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

      {/* Color picker */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-panel)', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-panel-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Icon Color</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {ICON_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => setIconColor(c.value)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: iconColor === c.value ? '2px solid var(--primary-color)' : '2px solid transparent',
                background: c.value,
                cursor: 'pointer',
                transition: 'border-color 0.12s',
                padding: 0,
                outline: 'none',
                boxShadow: iconColor === c.value ? '0 0 0 2px var(--bg-popover-active)' : 'none',
              }}
            />
          ))}
          <input
            type="color"
            value={iconColor}
            onChange={(e) => setIconColor(e.target.value)}
            title="Custom color"
            style={{ width: 22, height: 22, borderRadius: 6, border: 'none', padding: 0, cursor: 'pointer', background: 'transparent' }}
          />
        </div>
      </div>

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
