'use client';
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  MousePointer2, PenTool, Type, ImagePlus, Shapes, Smile,
  Maximize2,
  Signature, Sparkles, Keyboard, BarChart3,
  Frame, QrCode, List, Grid3x3, Magnet,
} from 'lucide-react';
import { useCanvasStore } from '@/canvas/store';
import { CanvasElement } from '@/canvas/types';
import { useIsMobileOrTouch } from '@/utils/device';
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
  previewMode?: boolean;
  mobileVisible?: boolean;
  onReset?: () => void;
  showGrid?: boolean;
  snapToGrid?: boolean;
  onToggleGrid?: () => void;
  onToggleSnap?: () => void;
}

type SlidePanel = 'charts' | 'frames' | 'qrcodes' | 'icons' | 'design' | 'canvas' | 'shortcuts' | null;

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  onUploadRasterImage, onUploadSVG,
  previewMode = false,
  mobileVisible = false,
  onReset,
  showGrid = false,
  snapToGrid = false,
  onToggleGrid,
  onToggleSnap,
}) => {
  const isMobileOrTouch = useIsMobileOrTouch();

  const {
    document: doc,
    activeTool, setActiveTool,
    addElement,
    selectedIds,
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
      isSignature: true,
      signatureColor: '#000000',
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
    mobileHidden?: boolean; // if true, hide this item on mobile viewports
    children: React.ReactNode;
  }> = ({ onClick, active, disabled, disabledInPreview = false, tooltip, dimmed, mobileHidden = false, children }) => {
    const isDisabled = disabled || (disabledInPreview && previewMode);
    return (
      <button
        className={`${styles.sidebarBtn} ${active ? styles.sidebarBtnActive : ''} ${mobileHidden ? styles.mobileHidden : ''}`}
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
    <aside ref={leftSidebarRef} className={`${styles.leftSidebarContainer} ${mobileVisible ? styles.mobileVisible : ''}`}>
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

        {!isMobileOrTouch && (
          <SidebarBtn
            onClick={() => setActiveTool(isDraw ? 'select' : 'draw')}
            active={isDraw}
            disabledInPreview
            tooltip="Freehand Draw (D)"
          >
            <PenTool size={19} />
            <span className={styles.sidebarBtnLabel}>Draw</span>
          </SidebarBtn>
        )}

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
        {!isMobileOrTouch && (
          <SidebarBtn
            onClick={() => setShowSignatureModal(true)}
            disabledInPreview
            tooltip="Add Signature"
          >
            <Signature size={19} />
            <span className={styles.sidebarBtnLabel}>Signature</span>
          </SidebarBtn>
        )}

        <div className={styles.leftSidebarDivider} />

        {/* ── Canvas Size ───────────────────────────── */}
        {!isMobileOrTouch && (
          <SidebarBtn
            onClick={() => togglePanel('canvas')}
            active={slidePanel === 'canvas'}
            disabledInPreview
            tooltip="Canvas Size"
          >
            <Maximize2 size={19} />
            <span className={styles.sidebarBtnLabel}>Canvas</span>
          </SidebarBtn>
        )}

        {/* ── View Toggles: Grid, Snap (admin only) ─────────────── */}
        {!isMobileOrTouch && (onToggleGrid || onToggleSnap) && (
          <>
            <div className={styles.leftSidebarDivider} />
            <SidebarBtn
              onClick={onToggleGrid}
              active={showGrid}
              tooltip={showGrid ? 'Hide Grid' : 'Show Grid'}
            >
              <Grid3x3 size={19} />
              <span className={styles.sidebarBtnLabel}>Grid</span>
            </SidebarBtn>
            <SidebarBtn
              onClick={onToggleSnap}
              active={snapToGrid}
              tooltip={snapToGrid ? 'Snap to Grid: ON' : 'Snap to Grid: OFF'}
            >
              <Magnet size={19} />
              <span className={styles.sidebarBtnLabel}>Snap</span>
            </SidebarBtn>
          </>
        )}

        <div className={styles.leftSidebarDivider} />

        {/* Keyboard Shortcuts panel */}
        {!isMobileOrTouch && (
          <SidebarBtn
            onClick={() => togglePanel('shortcuts')}
            active={slidePanel === 'shortcuts'}
            tooltip="Keyboard Shortcuts"
          >
            <Keyboard size={19} />
            <span className={styles.sidebarBtnLabel}>Shortcuts</span>
          </SidebarBtn>
        )}
      </div>

      {/* ── Slide-out panels container with smooth transitions ── */}
      <div
        className={`${styles.slidePanelWrapper} ${slidePanel ? styles.slidePanelWrapperOpen : ''}`}
        style={{
          '--panel-width': slidePanel === 'shortcuts' ? '300px' : '290px',
        } as React.CSSProperties}
      >

        {renderedPanel === 'charts' && <ChartsPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'frames' && <FramesPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'qrcodes' && <QRCodesPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'icons' && <IconsPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'design' && <DesignPanel onClose={() => setSlidePanel(null)} />}
        {renderedPanel === 'canvas' && <CanvasPanel onClose={() => setSlidePanel(null)} onReset={onReset} />}
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
