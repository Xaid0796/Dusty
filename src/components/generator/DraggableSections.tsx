'use client';

/**
 * DraggableSections — HTML5 drag-and-drop section list for the Resume Generator sidebar.
 * Only sections inside sections[] are rendered here.
 * Contact and Style are outside sections[] and rendered separately (not draggable).
 */

import React, { useState, useRef } from 'react';
import { GripVertical, ChevronDown, ChevronUp, Trash2, Eye, EyeOff } from 'lucide-react';
import { useGeneratorStore } from '@/hooks/useGeneratorStore';
import { SectionEditorContent } from './SectionEditors';
import type { ResumeSection } from '@/types/generator';

interface DraggableSectionsProps {
  sections: ResumeSection[];
  activeAccordion: string | null;
  onToggleAccordion: (id: string) => void;
}

export const DraggableSections: React.FC<DraggableSectionsProps> = ({
  sections,
  activeAccordion,
  onToggleAccordion,
}) => {
  const { reorderSections, removeSection, toggleSectionDisabled } = useGeneratorStore();

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Minimal drag ghost
    const ghost = document.createElement('div');
    ghost.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== overIndex) setOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      reorderSections(dragIndex, toIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  if (!sections.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {sections.map((section, index) => {
        const isActive = activeAccordion === section.id;
        const isDragging = dragIndex === index;
        const isOver = overIndex === index && dragIndex !== index;

        return (
          <div
            key={section.id}
            ref={isDragging ? dragNodeRef : undefined}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            style={{
              border: isOver ? '2px dashed #6366f1' : '1px solid var(--border-card, #e2e8f0)',
              borderRadius: '10px',
              overflow: 'hidden',
              opacity: isDragging ? 0.4 : (section.isDisabled ? 0.6 : 1),
              background: isOver ? 'var(--bg-btn-hover, #f0f4ff)' : 'var(--bg-card, #fff)',
              transition: 'border-color 0.15s, background 0.15s, opacity 0.15s',
            }}
          >
            {/* Section accordion header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 4px 0 0',
                background: isActive ? 'var(--bg-card-header, #f8fafc)' : 'transparent',
              }}
            >
              {/* Drag handle */}
              <div
                style={{
                  padding: '12px 6px 12px 10px',
                  cursor: 'grab',
                  color: 'var(--text-muted, #cbd5e1)',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
                title="Drag to reorder"
              >
                <GripVertical size={16} />
              </div>

              {/* Section label + expand toggle */}
              <button
                onClick={() => onToggleAccordion(section.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px 0',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: section.isDisabled ? 'var(--text-muted, #94a3b8)' : 'var(--text-primary, #1e293b)',
                    textDecoration: section.isDisabled ? 'line-through' : 'none',
                  }}
                >
                  {section.title}
                  {section.isDisabled && (
                    <span style={{ fontWeight: 400, fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic', marginLeft: '5px' }}>
                      (Disabled)
                    </span>
                  )}
                </span>
                {isActive ? (
                  <ChevronUp size={16} color="var(--text-muted, #94a3b8)" />
                ) : (
                  <ChevronDown size={16} color="var(--text-muted, #94a3b8)" />
                )}
              </button>

              {/* Disable/Enable Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSectionDisabled(section.id);
                }}
                title={section.isDisabled ? "Enable section" : "Disable section"}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: section.isDisabled ? '#dc2626' : 'var(--text-muted, #cbd5e1)',
                  padding: '8px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')}
                onMouseLeave={(e) => (e.currentTarget.style.color = section.isDisabled ? '#dc2626' : 'var(--text-muted, #cbd5e1)')}
              >
                {section.isDisabled ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>

              {/* Delete button — only for deletable sections */}
              {section.isDeletable && (
                <button
                  onClick={() => removeSection(section.id)}
                  title={`Remove ${section.title}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #cbd5e1)',
                    padding: '8px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted, #cbd5e1)')}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Accordion body — section editor */}
            {isActive && (
              <div
                style={{
                  padding: '12px 14px 16px',
                  borderTop: '1px solid var(--border-card, #f1f5f9)',
                }}
              >
                <SectionEditorContent section={section} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
