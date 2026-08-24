'use client';
import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsPanelProps {
  onClose: () => void;
}

interface ShortcutEntry {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  items: ShortcutEntry[];
}

const SHORTCUTS: ShortcutSection[] = [
  {
    title: 'Tools',
    items: [
      { keys: ['V'], description: 'Select tool' },
      { keys: ['D'], description: 'Freehand Draw tool' },
      { keys: ['Esc'], description: 'Exit draw / Deselect / Close text editing' },
    ],
  },
  {
    title: 'Selection',
    items: [
      { keys: ['Ctrl', 'A'], description: 'Select all elements' },
      { keys: ['Click'], description: 'Select element' },
      { keys: ['Shift', 'Click'], description: 'Add / remove from selection' },
      { keys: ['Drag'], description: 'Lasso multi-select' },
    ],
  },
  {
    title: 'Clipboard',
    items: [
      { keys: ['Ctrl', 'C'], description: 'Copy selected' },
      { keys: ['Ctrl', 'X'], description: 'Cut selected' },
      { keys: ['Ctrl', 'V'], description: 'Paste' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selected' },
    ],
  },
  {
    title: 'Editing',
    items: [
      { keys: ['Delete'], description: 'Delete selected element(s)' },
      { keys: ['Backspace'], description: 'Delete selected element(s)' },
      { keys: ['↑ ↓ ← →'], description: 'Nudge (0.5 mm)' },
      { keys: ['Shift', '↑↓←→'], description: 'Nudge (2 mm)' },
      { keys: ['Dbl-Click'], description: 'Edit text in-place' },
    ],
  },
  {
    title: 'History',
    items: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo (alternate)' },
    ],
  },
  {
    title: 'Grouping',
    items: [
      { keys: ['Ctrl', 'G'], description: 'Group selected elements' },
      { keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup selected group' },
    ],
  },
  {
    title: 'Style Copy',
    items: [
      { keys: ['Ctrl', 'Shift', 'C'], description: 'Copy style from selected' },
      { keys: ['Ctrl', 'Shift', 'V'], description: 'Paste style to selected' },
    ],
  },
  {
    title: 'View & App',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Open command palette' },
    ],
  },
  {
    title: 'UI Buttons (click)',
    items: [
      { keys: ['Group'], description: 'Group selected (toolbar button)' },
      { keys: ['Ungroup'], description: 'Ungroup selected group (toolbar button)' },
      { keys: ['Preview'], description: 'Toggle Preview mode (sidebar)' },
      { keys: ['Eye icon'], description: 'Hide/show element (properties panel)' },
    ],
  },
];

const Key: React.FC<{ label: string }> = ({ label }) => (
  <kbd
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 22,
      height: 20,
      padding: '0 5px',
      borderRadius: 5,
      background: 'var(--bg-panel-input)',
      border: '1px solid var(--border-panel)',
      color: 'var(--text-panel)',
      fontSize: 10,
      fontFamily: 'monospace',
      fontWeight: 700,
      letterSpacing: 0,
      boxShadow: '0 1px 0 var(--border-panel)',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </kbd>
);

export const ShortcutsPanel: React.FC<ShortcutsPanelProps> = ({ onClose }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--border-panel)',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: 'var(--text-panel)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Keyboard size={14} style={{ color: 'var(--primary-color)' }} />
          Keyboard Shortcuts
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--text-panel-muted)', cursor: 'pointer', padding: 4,
            borderRadius: 5, display: 'flex',
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SHORTCUTS.map((section) => (
          <div key={section.title}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: 'var(--text-panel-muted)',
              letterSpacing: '0.07em', textTransform: 'uppercase',
              marginBottom: 6, paddingBottom: 4,
              borderBottom: '1px solid var(--border-panel)',
            }}>
              {section.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {section.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 8,
                }}>
                  <span style={{
                    fontSize: 11, color: 'var(--text-panel)', flex: 1,
                    lineHeight: 1.3,
                  }}>
                    {item.description}
                  </span>
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {item.keys.map((k, ki) => (
                      <React.Fragment key={ki}>
                        {ki > 0 && (
                          <span style={{ color: 'var(--text-panel-muted)', fontSize: 10, alignSelf: 'center' }}>+</span>
                        )}
                        <Key label={k} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer hint */}
        <div style={{
          marginTop: 4, padding: '10px 12px',
          background: 'var(--bg-panel-input)',
          borderRadius: 8, border: '1px solid var(--border-panel)',
          fontSize: 10, color: 'var(--text-panel-muted)', lineHeight: 1.5,
        }}>
          💡 <strong style={{ color: 'var(--text-panel)' }}>Tip:</strong> Group / Ungroup buttons also appear
          in the floating context toolbar above selected elements.
        </div>
      </div>
    </div>
  );
};
