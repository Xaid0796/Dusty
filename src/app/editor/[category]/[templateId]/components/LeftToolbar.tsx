'use client';
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  MousePointer2, PenTool, Type, ImagePlus, Shapes, Smile,
  Maximize2, Layers, Grid2X2,
  Ruler, Eye, Signature, Sparkles, Keyboard, BarChart3,
  Frame, QrCode, List,
} from 'lucide-react';
import { useCanvasStore } from '@/canvas/store';
import { CanvasElement } from '@/canvas/types';
import { ShapesPanel } from './ShapesPanel';
import { ChartsPanel } from './ChartsPanel';
import { FramesPanel } from './FramesPanel';
import { QRCodesPanel } from './QRCodesPanel';
import { IconsPanel } from './IconsPanel';
import { DesignPanel } from './DesignPanel';
import { CanvasPanel } from './CanvasPanel';
import { ShortcutsPanel } from './ShortcutsPanel';
import { SignatureModal } from './SignatureModal';
import styles from '../editor.module.css';

interface LeftToolbarProps {
  onUploadRasterImage: () => void;
  onUploadSVG: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showRulers: boolean;
  onToggleRulers: () => void;
  previewMode: boolean;
  onTogglePreview: () => void;
}

type SlidePanel = 'shapes' | 'charts' | 'frames' | 'qrcodes' | 'icons' | 'design' | 'canvas' | 'shortcuts' | null;

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  onUploadRasterImage, onUploadSVG, snapToGrid, onToggleSnap,
  showGrid, onToggleGrid, showRulers, onToggleRulers,
  previewMode, onTogglePreview,
}) => {
  const {
    document: doc,
    activeTool, setActiveTool,
    addElement,
    selectedIds, bringToFront, sendToBack,
  } = useCanvasStore();

  const [slidePanel, setSlidePanel] = useState<SlidePanel>(null);
  // Preserve scroll position — prevents jump-to-top on re-render
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);

  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const [renderedPanel, setRenderedPanel] = useState<SlidePanel>(null);

  // Add Image type selection popover state
  const [showImagePopover, setShowImagePopover] = useState(false);
  const imageBtnRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close image popover on outside click
  useEffect(() => {
    if (!showImagePopover) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedBtn = imageBtnRef.current && imageBtnRef.current.contains(target);
      const clickedPopover = popoverRef.current && popoverRef.current.contains(target);
      if (!clickedBtn && !clickedPopover) {
        setShowImagePopover(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showImagePopover]);

  // Sync rendered panel with a delay on close to allow slide-out animation to complete
  useEffect(() => {
    if (slidePanel) {
      setRenderedPanel(slidePanel);
    } else {
      const timer = setTimeout(() => {
        setRenderedPanel(null);
      }, 220); // matches editor.module.css transition duration
      return () => clearTimeout(timer);
    }
  }, [slidePanel]);

  // Close panel when clicking outside of the sidebar container
  useEffect(() => {
    if (!slidePanel) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (leftSidebarRef.current && !leftSidebarRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        // Ignore clicks inside signature canvas modal, color picker overlays, etc.
        if (target.closest('[class*="modalOverlay"]') || target.closest('[class*="colorSwatch"]')) {
          return;
        }
        setSlidePanel(null);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [slidePanel]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Restore saved position after render
    el.scrollTop = scrollPosRef.current;
  });

  const handleScroll = () => {
    if (scrollRef.current) scrollPosRef.current = scrollRef.current.scrollTop;
  };

  // Close panels when preview mode activates
  useEffect(() => {
    if (previewMode) {
      setSlidePanel(null);
    }
  }, [previewMode]);

  const center = (w: number, h: number) => ({
    x: Math.max(8, ((doc?.page.width || 210) / 2) - w / 2),
    y: Math.max(8, ((doc?.page.height || 297) / 2) - h / 2),
  });

  const addText = () => {
    if (!doc) return;
    const size = { width: 80, height: 12 };
    const p = center(size.width, size.height);
    addElement({
      id: uid('text'), type: 'text', label: 'Text', ...p, ...size,
      rotation: 0, zIndex: 1, visible: true, locked: false,
      content: 'Type your text',
      style: {
        fontFamily: 'Inter', fontSize: 13, fontWeight: 'normal',
        fontStyle: 'normal', textDecoration: 'none', color: '#111827',
        textAlign: 'left', lineHeight: 1.4, letterSpacing: 0, padding: 1,
      },
    });
  };

  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const addSignature = (dataUrl: string, width: number = 64, height: number = 24) => {
    if (!doc) return;
    const p = center(width, height);
    addElement({
      id: uid('signature'), type: 'image', label: 'Signature', ...p, width, height,
      rotation: 0, zIndex: 1, visible: true, locked: false,
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

  const togglePanel = (panel: SlidePanel) =>
    setSlidePanel((prev) => (prev === panel ? null : panel));

  const isSelect = activeTool === 'select';
  const isDraw = activeTool === 'draw';
  const hasSel = selectedIds.length > 0;

  // Button component — disabled when preview mode is active (except for view-only controls)
  const SidebarBtn: React.FC<{
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    disabledInPreview?: boolean; // if true, also disable when previewMode=true
    tooltip: string;
    dimmed?: boolean;
    children: React.ReactNode;
  }> = ({ onClick, active, disabled, disabledInPreview = false, tooltip, dimmed, children }) => {
    const isDisabled = disabled || (disabledInPreview && previewMode);
    return (
      <button
        className={`${styles.sidebarBtn} ${active ? styles.sidebarBtnActive : ''}`}
        onClick={isDisabled ? undefined : onClick}
        data-tooltip={tooltip}
        title={isDisabled && previewMode ? `${tooltip} — disabled in Preview` : tooltip}
        disabled={isDisabled}
        style={
          (dimmed || (disabledInPreview && previewMode))
            ? { opacity: 0.32, cursor: 'not-allowed', pointerEvents: 'none' }
            : undefined
        }
      >
        {children}
      </button>
    );
  };

  return (
    <aside ref={leftSidebarRef} className={styles.leftSidebarContainer}>
      <div className={styles.leftSidebar} ref={scrollRef} onScroll={handleScroll}>
        {/* ── Tools ─────────────────────────────────── */}
        <SidebarBtn
          onClick={() => setActiveTool('select')}
          active={isSelect}
          disabledInPreview
          tooltip="Select (V)"
        >
          <MousePointer2 size={19} />
          <span className={styles.sidebarBtnLabel}>Select</span>
        </SidebarBtn>

        <SidebarBtn
          onClick={() => setActiveTool(isDraw ? 'select' : 'draw')}
          active={isDraw}
          disabledInPreview
          tooltip="Freehand Draw (D)"
        >
          <PenTool size={19} />
          <span className={styles.sidebarBtnLabel}>Draw</span>
        </SidebarBtn>

        <div className={styles.leftSidebarDivider} />

        {/* ── Add Elements ──────────────────────────── */}
        <SidebarBtn onClick={addText} disabled={!doc} disabledInPreview tooltip="Add Text (T)">
          <Type size={19} />
          <span className={styles.sidebarBtnLabel}>Text</span>
        </SidebarBtn>

        <div ref={imageBtnRef} style={{ position: 'relative' }}>
          <SidebarBtn
            onClick={() => setShowImagePopover(!showImagePopover)}
            active={showImagePopover}
            disabledInPreview
            tooltip="Upload Image"
          >
            <ImagePlus size={19} />
            <span className={styles.sidebarBtnLabel}>Image</span>
          </SidebarBtn>
        </div>

        {/* Charts → slide-out panel */}
        <SidebarBtn
          onClick={() => togglePanel('charts')}
          active={slidePanel === 'charts'}
          disabledInPreview
          tooltip="Charts Gallery"
        >
          <BarChart3 size={19} />
          <span className={styles.sidebarBtnLabel}>Charts</span>
        </SidebarBtn>

        {/* Frames → slide-out panel */}
        <SidebarBtn
          onClick={() => togglePanel('frames')}
          active={slidePanel === 'frames'}
          disabledInPreview
          tooltip="Frames"
        >
          <Frame size={19} />
          <span className={styles.sidebarBtnLabel}>Frames</span>
        </SidebarBtn>

        {/* Shapes → slide-out panel */}
        <SidebarBtn
          onClick={() => togglePanel('shapes')}
          active={slidePanel === 'shapes'}
          disabledInPreview
          tooltip="Shapes"
        >
          <Shapes size={19} />
          <span className={styles.sidebarBtnLabel}>Shapes</span>
        </SidebarBtn>

        {/* QR Codes → slide-out panel */}
        <SidebarBtn
          onClick={() => togglePanel('qrcodes')}
          active={slidePanel === 'qrcodes'}
          disabledInPreview
          tooltip="QR Codes"
        >
          <QrCode size={19} />
          <span className={styles.sidebarBtnLabel}>QR Codes</span>
        </SidebarBtn>

        {/* Design → slide-out panel */}
        <SidebarBtn
          onClick={() => togglePanel('design')}
          active={slidePanel === 'design'}
          disabledInPreview
          tooltip="Design Presets"
        >
          <Sparkles size={19} style={{ color: '#d4af37' }} />
          <span className={styles.sidebarBtnLabel}>Design</span>
        </SidebarBtn>

        {/* Elements / Icons → slide-out panel */}
        <SidebarBtn
          onClick={() => togglePanel('icons')}
          active={slidePanel === 'icons'}
          disabledInPreview
          tooltip="Elements & Icons"
        >
          <Smile size={19} />
          <span className={styles.sidebarBtnLabel}>Elements</span>
        </SidebarBtn>

        {/* Signature Tool */}
        <SidebarBtn
          onClick={() => setShowSignatureModal(true)}
          disabledInPreview
          tooltip="Add Signature"
        >
          <Signature size={19} />
          <span className={styles.sidebarBtnLabel}>Signature</span>
        </SidebarBtn>

        <div className={styles.leftSidebarDivider} />

        {/* ── Canvas Size ───────────────────────────── */}
        <SidebarBtn
          onClick={() => togglePanel('canvas')}
          active={slidePanel === 'canvas'}
          disabledInPreview
          tooltip="Canvas Size"
        >
          <Maximize2 size={19} />
          <span className={styles.sidebarBtnLabel}>Canvas</span>
        </SidebarBtn>

        {/* Bring to Front / Send to Back */}
        <SidebarBtn onClick={() => bringToFront()} dimmed={!hasSel} disabledInPreview tooltip="Bring to Front">
          <Layers size={19} />
          <span className={styles.sidebarBtnLabel}>Front</span>
        </SidebarBtn>

        <SidebarBtn onClick={() => sendToBack()} dimmed={!hasSel} disabledInPreview tooltip="Send to Back">
          <Layers size={19} style={{ transform: 'scaleY(-1)' }} />
          <span className={styles.sidebarBtnLabel}>Back</span>
        </SidebarBtn>

        <div className={styles.leftSidebarDivider} />

        {/* ── View options ──────────────────────────── */}
        <SidebarBtn onClick={onToggleSnap} active={snapToGrid} tooltip={snapToGrid ? 'Snap: ON' : 'Snap: OFF'}>
          <Grid2X2 size={19} />
          <span className={styles.sidebarBtnLabel}>Snap</span>
        </SidebarBtn>

        <SidebarBtn onClick={onToggleGrid} active={showGrid} tooltip={showGrid ? 'Grid: ON' : 'Grid: OFF'}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          <span className={styles.sidebarBtnLabel}>Grid</span>
        </SidebarBtn>

        <SidebarBtn onClick={onToggleRulers} active={showRulers} tooltip="Rulers">
          <Ruler size={19} />
          <span className={styles.sidebarBtnLabel}>Rulers</span>
        </SidebarBtn>

        {/* Keyboard Shortcuts panel */}
        <SidebarBtn
          onClick={() => togglePanel('shortcuts')}
          active={slidePanel === 'shortcuts'}
          tooltip="Keyboard Shortcuts"
        >
          <Keyboard size={19} />
          <span className={styles.sidebarBtnLabel}>Shortcuts</span>
        </SidebarBtn>

        {/* Preview — always enabled so user can exit preview */}
        <SidebarBtn onClick={onTogglePreview} active={previewMode} tooltip={previewMode ? 'Exit Preview' : 'Preview Mode'}>
          <Eye size={19} />
          <span className={styles.sidebarBtnLabel}>Preview</span>
        </SidebarBtn>
      </div>

      {/* ── Slide-out panels container with smooth transitions ── */}
      <div
        className={`${styles.slidePanelWrapper} ${slidePanel ? styles.slidePanelWrapperOpen : ''}`}
        style={{
          '--panel-width': slidePanel === 'shortcuts' ? '300px' : '290px',
        } as React.CSSProperties}
      >
        {renderedPanel === 'shapes' && <ShapesPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'charts' && <ChartsPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'frames' && <FramesPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'qrcodes' && <QRCodesPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'icons' && <IconsPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'design' && <DesignPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'canvas' && <CanvasPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'shortcuts' && <ShortcutsPanel onClose={() => setSlidePanel(null)} />}
      </div>

      {/* ── Image/SVG Choice Popover (positioned outside scroll container) ── */}
      {showImagePopover && !previewMode && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            left: 78,
            top: 192, // aligned with the Image button vertically
            background: 'var(--bg-popover, #ffffff)',
            border: '1px solid var(--border-popover, #e2e8f0)',
            borderRadius: 10,
            padding: '6px 8px',
            display: 'flex',
            gap: 6,
            boxShadow: 'var(--shadow-popover, 0 4px 12px rgba(0,0,0,0.15))',
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => {
              onUploadRasterImage();
              setShowImagePopover(false);
            }}
            style={{
              padding: '6px 12px',
              background: 'var(--bg-panel-input, #f1f5f9)',
              color: 'var(--text-panel, #0f172a)',
              border: '1px solid var(--border-panel, #cbd5e1)',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-panel-btn-hover, #e2e8f0)';
              e.currentTarget.style.borderColor = 'var(--primary-color, #6366f1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-panel-input, #f1f5f9)';
              e.currentTarget.style.borderColor = 'var(--border-panel, #cbd5e1)';
            }}
          >
            IMAGE
          </button>
          <button
            onClick={() => {
              onUploadSVG();
              setShowImagePopover(false);
            }}
            style={{
              padding: '6px 12px',
              background: 'var(--bg-panel-input, #f1f5f9)',
              color: 'var(--text-panel, #0f172a)',
              border: '1px solid var(--border-panel, #cbd5e1)',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-panel-btn-hover, #e2e8f0)';
              e.currentTarget.style.borderColor = 'var(--primary-color, #6366f1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-panel-input, #f1f5f9)';
              e.currentTarget.style.borderColor = 'var(--border-panel, #cbd5e1)';
            }}
          >
            SVG
          </button>
        </div>
      )}

      {/* ── Signature Modal ───────────────────────── */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onAddSignature={addSignature}
      />
    </aside>
  );
};
