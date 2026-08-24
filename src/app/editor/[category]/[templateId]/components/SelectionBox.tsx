'use client';
import React, { useRef, useEffect } from 'react';
import { CanvasElement } from '@/canvas/types';
import { mmToPx, pxToMm } from '@/canvas/utils';
import { useCanvasStore } from '@/canvas/store';
import styles from '../editor.module.css';

interface SelectionBoxProps {
  element: CanvasElement;
  zoom: number;
}

type Handle = 'tl' | 'tc' | 'tr' | 'ml' | 'mr' | 'bl' | 'bc' | 'br';

export const SelectionBox: React.FC<SelectionBoxProps> = ({ element, zoom }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);
  const saveHistory = useCanvasStore((state) => state.saveHistory);
  const isTextEditing = useCanvasStore((state) => state.isTextEditing);
  const croppingId = useCanvasStore((state) => state.croppingId);
  const setCroppingId = useCanvasStore((state) => state.setCroppingId);
  const selectedIds = useCanvasStore((state) => state.selectedIds);

  const isCropping = croppingId === element.id;
  const initialCropRef = useRef({ x: (element as any).cropX ?? 50, y: (element as any).cropY ?? 50, zoom: (element as any).zoom ?? 1 });

  useEffect(() => {
    if (isCropping) {
      initialCropRef.current = {
        x: (element as any).cropX ?? 50,
        y: (element as any).cropY ?? 50,
        zoom: (element as any).zoom ?? 1,
      };
    }
  }, [isCropping, element.id]);

  const pxX = mmToPx(element.x);
  const pxY = mmToPx(element.y);
  const pxW = mmToPx(element.width);
  const pxH = mmToPx(element.height);

  const handleCancelCrop = () => {
    if (element.type !== 'image') return;
    updateElement(element.id, {
      cropX: initialCropRef.current.x,
      cropY: initialCropRef.current.y,
      zoom: initialCropRef.current.zoom,
    } as any, true);
    setCroppingId(null);
  };

  const handleDoneCrop = () => setCroppingId(null);

  // ── Resize handler ────────────────────────────────────────
  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>, handle: Handle) => {
    e.stopPropagation();
    e.preventDefault();
    if (element.locked || isTextEditing || isCropping) return;

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const pointerId = e.pointerId;
    const startX = e.clientX;
    const startY = e.clientY;
    const initX = element.x;
    const initY = element.y;
    const initW = element.width;
    const initH = element.height;
    const rotation = element.rotation || 0;
    const zoomFactor = zoom / 100;
    let historySaved = false;

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const dx = pxToMm((ev.clientX - startX) / zoomFactor);
      const dy = pxToMm((ev.clientY - startY) / zoomFactor);
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const localDx = dx * cos + dy * sin;
      const localDy = -dx * sin + dy * cos;
      const minSize = 4;

      let newX = initX, newY = initY, newW = initW, newH = initH;

      const isFrameProportional = element.type === 'frame' && ((element as any).shape === 'circle' || (element as any).shape === 'square');

      if (isFrameProportional && ['tl', 'tr', 'bl', 'br'].includes(handle)) {
        const ratio = 1.0;
        if (handle === 'br' || handle === 'tr') {
          newW = Math.max(minSize, initW + localDx);
        } else {
          newW = Math.max(minSize, initW - localDx);
        }
        newH = newW * ratio;

        if (handle === 'tl') {
          newX = initX + (initW - newW) * cos - (initH - newH) * sin;
          newY = initY + (initW - newW) * sin + (initH - newH) * cos;
        } else if (handle === 'tr') {
          newX = initX - (initH - newH) * sin;
          newY = initY + (initH - newH) * cos;
        } else if (handle === 'bl') {
          newX = initX + (initW - newW) * cos;
          newY = initY + (initW - newW) * sin;
        }
      } else if (element.type === 'image' && handle === 'br') {
        const ratio = initH / Math.max(initW, 0.01);
        newW = Math.max(minSize, initW + localDx);
        newH = Math.max(minSize, newW * ratio);
      } else {
        switch (handle) {
          case 'tl':
            newW = Math.max(minSize, initW - localDx);
            newH = Math.max(minSize, initH - localDy);
            newX = initX + (initW - newW) * cos - (initH - newH) * sin;
            newY = initY + (initW - newW) * sin + (initH - newH) * cos;
            break;
          case 'tc':
            newH = Math.max(minSize, initH - localDy);
            newX = initX - (initH - newH) * sin;
            newY = initY + (initH - newH) * cos;
            break;
          case 'tr':
            newW = Math.max(minSize, initW + localDx);
            newH = Math.max(minSize, initH - localDy);
            newX = initX - (initH - newH) * sin;
            newY = initY + (initH - newH) * cos;
            break;
          case 'ml':
            newW = Math.max(minSize, initW - localDx);
            newX = initX + (initW - newW) * cos;
            newY = initY + (initW - newW) * sin;
            break;
          case 'mr':
            newW = Math.max(minSize, initW + localDx);
            break;
          case 'bl':
            newW = Math.max(minSize, initW - localDx);
            newH = Math.max(minSize, initH + localDy);
            newX = initX + (initW - newW) * cos;
            newY = initY + (initW - newW) * sin;
            break;
          case 'bc':
            newH = Math.max(minSize, initH + localDy);
            break;
          case 'br':
            newW = Math.max(minSize, initW + localDx);
            newH = Math.max(minSize, initH + localDy);
            break;
        }
      }

      if (!historySaved) { saveHistory(); historySaved = true; }
      updateElement(element.id, {
        x: Number(newX.toFixed(2)),
        y: Number(newY.toFixed(2)),
        width: Number(newW.toFixed(2)),
        height: Number(newH.toFixed(2)),
      }, true);
    };

    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      try { target.releasePointerCapture(pointerId); } catch { /* no-op */ }
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  };

  // ── Rotate handler ────────────────────────────────────────
  const handleRotateStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (element.locked || isTextEditing || isCropping) return;

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const pointerId = e.pointerId;

    const pageEl = document.getElementById('canvas-a4-page');
    const container = pageEl?.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const zoomFactor = zoom / 100;
    const cx = rect.left + (pxX + pxW / 2) * zoomFactor;
    const cy = rect.top + (pxY + pxH / 2) * zoomFactor;
    let historySaved = false;

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const angle = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
      const normalized = ((angle % 360) + 360) % 360;
      if (!historySaved) { saveHistory(); historySaved = true; }
      updateElement(element.id, { rotation: Math.round(normalized * 10) / 10 }, true);
    };

    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      try { target.releasePointerCapture(pointerId); } catch { /* no-op */ }
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  };

  const isLocked = element.locked;
  const isMulti = selectedIds.length > 1;

  // Outline style
  const outlineCls = isCropping
    ? styles.selectionOutlineCrop
    : isLocked
    ? styles.selectionOutlineLocked
    : styles.selectionOutline;

  const boxStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${pxX}px`,
    top: `${pxY}px`,
    width: `${pxW}px`,
    height: `${pxH}px`,
    transform: `rotate(${element.rotation}deg)`,
    zIndex: 9999,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  };

  // Resize handles config
  const handles: { key: Handle; style: React.CSSProperties; cursor: string }[] = [
    { key: 'tl', style: { left: 0,         top: 0          }, cursor: 'nwse-resize' },
    { key: 'tc', style: { left: '50%',      top: 0          }, cursor: 'ns-resize'   },
    { key: 'tr', style: { left: '100%',     top: 0          }, cursor: 'nesw-resize' },
    { key: 'ml', style: { left: 0,          top: '50%'      }, cursor: 'ew-resize'   },
    { key: 'mr', style: { left: '100%',     top: '50%'      }, cursor: 'ew-resize'   },
    { key: 'bl', style: { left: 0,          top: '100%'     }, cursor: 'nesw-resize' },
    { key: 'bc', style: { left: '50%',      top: '100%'     }, cursor: 'ns-resize'   },
    { key: 'br', style: { left: '100%',     top: '100%'     }, cursor: 'nwse-resize' },
  ];

  // Images: only show br handle; Proportional frames: only show corner handles (tl, tr, bl, br)
  const visibleHandles = handles.filter((h) => {
    if (element.type === 'image') return h.key === 'br';
    if (element.type === 'frame' && ((element as any).shape === 'circle' || (element as any).shape === 'square')) {
      return ['tl', 'tr', 'bl', 'br'].includes(h.key);
    }
    return true;
  });

  return (
    <div style={boxStyle}>
      {/* Selection outline */}
      <div className={outlineCls} />

      {/* Crop button */}
      {element.type === 'image' && !isCropping && !isLocked && (
        <button
          className={styles.cropBtn}
          style={{ position: 'absolute', top: -38, right: 0 }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setCroppingId(element.id); }}
        >
          ✂ Crop
        </button>
      )}

      {/* Crop Done / Cancel handled entirely by CropEditor */}

      {/* Multi-selection badge */}
      {isMulti && (
        <div style={{
          position: 'absolute', top: -22, left: 0,
          background: '#6366f1', color: '#fff',
          padding: '2px 7px', fontSize: 9, fontWeight: 700,
          borderRadius: 5, whiteSpace: 'nowrap', pointerEvents: 'none',
          letterSpacing: '0.05em',
        }}>
          {selectedIds.length} selected
        </div>
      )}

      {/* Resize handles */}
      {!isLocked && !isTextEditing && !isCropping &&
        visibleHandles.map((h) => (
          <div
            key={h.key}
            className={styles.handle}
            style={{ ...h.style, cursor: h.cursor, pointerEvents: 'auto' }}
            onPointerDown={(e) => handleResizeStart(e, h.key)}
          />
        ))
      }

      {/* Rotate handle (center-top, 28px above element) */}
      {!isLocked && !isTextEditing && !isCropping && (
        <div
          className={styles.rotateHandle}
          style={{ left: '50%', top: -28, pointerEvents: 'auto' }}
          onPointerDown={handleRotateStart}
          title="Rotate"
        >
          {/* Rotation icon */}
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </div>
      )}
    </div>
  );
};
