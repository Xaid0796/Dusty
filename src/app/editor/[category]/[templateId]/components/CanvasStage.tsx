'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCanvasStore } from '@/canvas/store';
import { ElementRenderer } from './ElementRenderer';
import { SelectionBox } from './SelectionBox';
import { ContextToolbar } from './ContextToolbar';
import { SmartGuides, GuideLineData, computeSmartGuides } from './SmartGuides';
import { mmToPx, pxToMm } from '@/canvas/utils';
import { CanvasDocument, CanvasElement, DrawingElement } from '@/canvas/types';
import styles from '../editor.module.css';

interface CanvasStageProps {
  pageRef: React.RefObject<HTMLDivElement | null>;
  showGrid?: boolean;
  showRulers?: boolean;
  previewMode?: boolean;
}

interface LassoState {
  startX: number; startY: number; currentX: number; currentY: number; active: boolean;
}

const RULER_SIZE = 20; // px width/height of rulers

// ── Ruler component ──────────────────────────────────────────
const RulerH: React.FC<{ widthMm: number; zoom: number }> = ({ widthMm, zoom }) => {
  const widthPx = mmToPx(widthMm) * (zoom / 100);
  const tickEvery = zoom > 120 ? 5 : zoom > 80 ? 10 : 20; // mm between ticks
  const ticks: React.ReactNode[] = [];
  for (let mm = 0; mm <= widthMm; mm += tickEvery) {
    const x = mmToPx(mm) * (zoom / 100);
    ticks.push(
      <line key={mm} x1={x} y1={RULER_SIZE - 6} x2={x} y2={RULER_SIZE} stroke="rgba(148,163,184,0.6)" strokeWidth={1} />,
      <text key={`t${mm}`} x={x + 2} y={RULER_SIZE - 8} fontSize={7} fill="rgba(100,116,139,0.9)" fontFamily="Inter,sans-serif">{mm}</text>
    );
  }
  return (
    <svg width={widthPx + 20} height={RULER_SIZE} style={{ display: 'block', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', userSelect: 'none', flexShrink: 0 }}>
      {ticks}
    </svg>
  );
};

const RulerV: React.FC<{ heightMm: number; zoom: number }> = ({ heightMm, zoom }) => {
  const heightPx = mmToPx(heightMm) * (zoom / 100);
  const tickEvery = zoom > 120 ? 5 : zoom > 80 ? 10 : 20;
  const ticks: React.ReactNode[] = [];
  for (let mm = 0; mm <= heightMm; mm += tickEvery) {
    const y = mmToPx(mm) * (zoom / 100);
    ticks.push(
      <line key={mm} x1={RULER_SIZE - 6} y1={y} x2={RULER_SIZE} y2={y} stroke="rgba(148,163,184,0.6)" strokeWidth={1} />,
      <text key={`t${mm}`} x={1} y={y + 4} fontSize={7} fill="rgba(100,116,139,0.9)" fontFamily="Inter,sans-serif" transform={`rotate(-90, 7, ${y})`}>{mm}</text>
    );
  }
  return (
    <svg width={RULER_SIZE} height={heightPx + 20} style={{ display: 'block', background: '#f1f5f9', borderRight: '1px solid #e2e8f0', userSelect: 'none', flexShrink: 0 }}>
      {ticks}
    </svg>
  );
};

export const CanvasStage: React.FC<CanvasStageProps> = ({
  pageRef, showGrid = false, showRulers = false, previewMode = false,
}) => {
  const {
    document: doc, selectedId, selectedIds, isTextEditing, croppingId,
    selectElement, setSelectedIds, setTextEditing, updateElement, deleteSelected,
    zoom, saveHistory, activeTool, setActiveTool, snapToGrid,
  } = useCanvasStore();

  const selectedIdsRef = useRef(selectedIds);
  const drawingIdRef = useRef<string | null>(null);
  const [lasso, setLasso] = useState<LassoState | null>(null);
  const [smartGuides, setSmartGuides] = useState<GuideLineData[]>([]);

  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);

  const sortedElements = useMemo(
    () => (doc ? [...doc.elements].sort((a, b) => a.zIndex - b.zIndex) : []),
    [doc]
  );

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const state = useCanvasStore.getState();
      const target = e.target as HTMLElement | null;
      const isField = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      const meta = e.ctrlKey || e.metaKey;

      if (activeTool === 'draw' && e.key === 'Escape') { setActiveTool('select'); return; }
      if (isField) return;

      if (meta && e.key.toLowerCase() === 'a') { e.preventDefault(); state.selectAll(); return; }
      if (meta && e.key.toLowerCase() === 'c') { e.preventDefault(); state.copySelected(); return; }
      if (meta && e.key.toLowerCase() === 'x') { e.preventDefault(); state.cutSelected(); return; }
      if (meta && e.key.toLowerCase() === 'v') { e.preventDefault(); state.pasteClipboard(); return; }
      if (meta && e.key.toLowerCase() === 'd') { e.preventDefault(); state.duplicateSelected(); return; }
      if (meta && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? state.redo() : state.undo(); return; }
      if (meta && e.key.toLowerCase() === 'y') { e.preventDefault(); state.redo(); return; }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'c') { e.preventDefault(); state.copyStyle(); return; }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'v') { e.preventDefault(); state.pasteStyle(); return; }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'g') { e.preventDefault(); state.ungroupSelected(); return; }
      if (meta && e.key.toLowerCase() === 'g') { e.preventDefault(); state.groupSelected(); return; }

      if (e.key === 'Escape') {
        if (isTextEditing) setTextEditing(false);
        else if (croppingId) state.setCroppingId(null);
        else selectElement(null);
        return;
      }
      if (!isField && (e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length) { e.preventDefault(); deleteSelected(); return; }
      if (!isField && selectedIds.length && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        state.moveSelected(dx, dy);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTool, croppingId, deleteSelected, isTextEditing, selectedIds.length, selectElement, setActiveTool, setTextEditing]);

  if (!doc) return null;

  const pagePointFromEvent = (e: PointerEvent | React.PointerEvent<HTMLDivElement>) => {
    const page = pageRef.current;
    if (!page) return { x: 0, y: 0 };
    const rect = page.getBoundingClientRect();
    const z = zoom / 100;
    return { x: pxToMm((e.clientX - rect.left) / z), y: pxToMm((e.clientY - rect.top) / z) };
  };

  const pagePointPxFromEvent = (e: PointerEvent | React.PointerEvent<HTMLDivElement>) => {
    const page = pageRef.current;
    if (!page) return { x: 0, y: 0 };
    const rect = page.getBoundingClientRect();
    const z = zoom / 100;
    return { x: (e.clientX - rect.left) / z, y: (e.clientY - rect.top) / z };
  };

  const handleTextBlur = (id: string, text: string, finalHeightMm?: number) => {
    const el = doc.elements.find((item) => item.id === id);
    if (!el || (el.type !== 'text' && el.type !== 'sticky')) return;
    const changed = (el as any).content !== text || (finalHeightMm !== undefined && Math.abs(el.height - finalHeightMm) > 0.1);
    if (changed) updateElement(id, { content: text, ...(finalHeightMm !== undefined ? { height: finalHeightMm } : {}) } as any, true);
    setTextEditing(false);
  };

  const handleTableBlur = (id: string, cells: string[][]) => {
    saveHistory();
    updateElement(id, { cells } as any, true);
    setTextEditing(false);
  };

  // Drawing tool
  const createDrawingAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const p = pagePointFromEvent(e);
    const id = `drawing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const drawing: DrawingElement = {
      id, type: 'drawing', label: 'Drawing',
      x: p.x, y: p.y, width: 0.5, height: 0.5,
      rotation: 0, zIndex: 1, visible: true, locked: false,
      points: [p, { x: p.x + 0.01, y: p.y + 0.01 }], stroke: '#1e293b', strokeWidth: 2.4, opacity: 1,
      lineCap: 'round', lineJoin: 'round',
    };
    useCanvasStore.getState().addElement(drawing);
    selectElement(null);
    drawingIdRef.current = id;
    target.setPointerCapture(e.pointerId);

    const updateDrawing = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      const point = pagePointFromEvent(ev);
      const current = useCanvasStore.getState().document?.elements.find((item) => item.id === id);
      if (!current || current.type !== 'drawing') return;

      // Smoothing: Midpoint-based quadratic Bézier interpolation
      // We keep raw points for history/document structure as requested
      const points = [...current.points, point];

      // Calculate bounds for the new set of points
      const minX = Math.min(...points.map((pt) => pt.x));
      const maxX = Math.max(...points.map((pt) => pt.x));
      const minY = Math.min(...points.map((pt) => pt.y));
      const maxY = Math.max(...points.map((pt) => pt.y));

      useCanvasStore.getState().updateElement(id, {
        x: minX,
        y: minY,
        width: Math.max(0.1, maxX - minX),
        height: Math.max(0.1, maxY - minY),
        points
      } as any, true);
    };
    const finish = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      try { target.releasePointerCapture(ev.pointerId); } catch { }
      target.removeEventListener('pointermove', updateDrawing);
      target.removeEventListener('pointerup', finish);
      target.removeEventListener('pointercancel', finish);
      drawingIdRef.current = null;
      saveHistory();
    };
    target.addEventListener('pointermove', updateDrawing);
    target.addEventListener('pointerup', finish);
    target.addEventListener('pointercancel', finish);
  };

  // Lasso selection
  const startLasso = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { x, y } = pagePointPxFromEvent(e);
    const start = { x, y };
    target.setPointerCapture(e.pointerId);
    selectElement(null);
    let current = { x, y };
    let active = false;

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      const pt = pagePointPxFromEvent(ev);
      current = pt; active = true;
      setLasso({ startX: start.x, startY: start.y, currentX: pt.x, currentY: pt.y, active: true });
    };
    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      try { target.releasePointerCapture(e.pointerId); } catch { }
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);
      if (active) {
        const minX = pxToMm(Math.min(start.x, current.x));
        const maxX = pxToMm(Math.max(start.x, current.x));
        const minY = pxToMm(Math.min(start.y, current.y));
        const maxY = pxToMm(Math.max(start.y, current.y));
        const state = useCanvasStore.getState();
        const selected = (state.document?.elements || []).filter((el) => el.visible && !el.locked && el.x < maxX && el.x + el.width > minX && el.y < maxY && el.y + el.height > minY).map((el) => el.id);
        if (selected.length > 0) setSelectedIds(selected);
      }
      setLasso(null);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
  };

  const handleEmptyPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (previewMode) return;
    if (activeTool === 'draw') { e.preventDefault(); createDrawingAt(e); return; }
    if (activeTool === 'select' && e.button === 0) { startLasso(e); return; }
    selectElement(null);
  };

  // Element drag with smart guides
  const handleElementPointerDown = (e: React.PointerEvent<HTMLDivElement>, el: CanvasElement) => {
    if (previewMode || activeTool === 'draw') return;
    if (isTextEditing && selectedId === el.id) {
      e.stopPropagation();
      return;
    }
    if (e.button === 2 || el.locked || croppingId === el.id) return;
    e.stopPropagation();

    const additive = e.ctrlKey || e.metaKey || e.shiftKey;
    if (additive) { useCanvasStore.getState().toggleSelection(el.id); return; }
    if (!selectedIdsRef.current.includes(el.id)) selectElement(el.id);

    const ids = selectedIdsRef.current.includes(el.id) ? [...selectedIdsRef.current] : [el.id];
    const positions = new Map(doc.elements.filter((item) => ids.includes(item.id)).map((item) => [item.id, { x: item.x, y: item.y }]));
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const pointerId = e.pointerId;
    const startX = e.clientX;
    const startY = e.clientY;
    const z = zoom / 100;
    let historySaved = false;
    let moved = false;

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const dx = pxToMm((ev.clientX - startX) / z);
      const dy = pxToMm((ev.clientY - startY) / z);
      if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) return;
      moved = true;
      if (!historySaved) { saveHistory(); historySaved = true; }

      const state = useCanvasStore.getState();
      const primaryEl = state.document?.elements.find((item) => item.id === ids[0]);
      const others = (state.document?.elements || []).filter((item) => !ids.includes(item.id) && item.visible && !item.locked);
      let snappedDx = dx;
      let snappedDy = dy;

      // Smart guides for single-element drag
      if (primaryEl && ids.length === 1 && !snapToGrid) {
        const start = positions.get(ids[0]);
        if (start) {
          const tentative = { x: start.x + dx, y: start.y + dy, width: primaryEl.width, height: primaryEl.height };
          const { guides, snapX, snapY } = computeSmartGuides(tentative, others, doc.page.width, doc.page.height, 2.5);
          setSmartGuides(guides);
          snappedDx = snapX - start.x;
          snappedDy = snapY - start.y;
        }
      } else {
        setSmartGuides([]);
      }

      ids.forEach((id) => {
        const start = positions.get(id);
        const current = state.document?.elements.find((item) => item.id === id);
        if (!start || !current || current.locked) return;
        const snap = (value: number) => snapToGrid ? Math.round(value / 2) * 2 : value;
        state.updateElement(id, { x: snap(start.x + snappedDx), y: snap(start.y + snappedDy) }, true);
      });
    };

    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      try { target.releasePointerCapture(pointerId); } catch { }
      setSmartGuides([]);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>, el: CanvasElement) => {
    if (previewMode) return;
    e.stopPropagation();
    if (el.locked) return;
    if (el.type === 'text' || el.type === 'sticky' || el.type === 'table') {
      selectElement(el.id); saveHistory(); setTextEditing(true);
    } else if (el.type === 'image') {
      useCanvasStore.getState().setCroppingId(el.id);
    }
  };

  const canvasHeight = useMemo(() => {
    return mmToPx(doc.page.height || 297);
  }, [doc.page.height]);

  const zoomStyle: React.CSSProperties = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
    width: `${mmToPx(doc.page.width)}px`,
    height: `${canvasHeight}px`,
    position: 'relative',
  };

  // primaryEl is the first selected element — used for context toolbar.
  // We set it for ANY selection size so the toolbar renders for both single & multi-select.
  const primaryEl = selectedIds.length > 0 ? doc.elements.find((el) => el.id === selectedIds[0]) || null : null;
  const lassoStyle: React.CSSProperties | null = lasso ? { left: `${Math.min(lasso.startX, lasso.currentX)}px`, top: `${Math.min(lasso.startY, lasso.currentY)}px`, width: `${Math.abs(lasso.currentX - lasso.startX)}px`, height: `${Math.abs(lasso.currentY - lasso.startY)}px` } : null;

  const rulerOffset = showRulers ? RULER_SIZE : 0;

  return (
    <div className={styles.canvasOuter} style={{ position: 'relative' }}>
      {/* Rulers */}
      {showRulers && (
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 50, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
          {/* Corner square */}
          <div style={{ width: RULER_SIZE, height: RULER_SIZE, background: '#e2e8f0', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', flexShrink: 0 }} />
          <RulerV heightMm={doc.page.height} zoom={zoom} />
        </div>
      )}
      {showRulers && (
        <div style={{ position: 'absolute', top: 0, left: RULER_SIZE, zIndex: 50, pointerEvents: 'none' }}>
          <RulerH widthMm={doc.page.width} zoom={zoom} />
        </div>
      )}

      {/* Canvas content */}
      <div style={{ marginTop: rulerOffset, marginLeft: rulerOffset }}>
        <div style={zoomStyle}>
          {/* A4 Page */}
          <div
            ref={pageRef}
            id="canvas-a4-page"
            className={styles.canvasA4Page}
            style={{
              width: `${mmToPx(doc.page.width)}px`,
              height: `${canvasHeight}px`,
              backgroundColor: doc.page.background,
              position: 'absolute', top: 0, left: 0,
              overflow: 'hidden',
              cursor: previewMode ? 'default' : activeTool === 'draw' ? 'crosshair' : 'default',
            }}
            onPointerDown={handleEmptyPointerDown}
          >
            {showGrid && !previewMode && <div className={styles.gridOverlay} data-grid-overlay />}
            {Array.from({ length: Math.max(0, Math.floor(canvasHeight / mmToPx(297)) - 1) }).map((_, i) => (
              <div
                key={i}
                className={previewMode ? styles.previewPageGap : styles.pageGuideLine}
                style={{ top: `${(i + 1) * mmToPx(297)}px` }}
                data-page-guide
              />
            ))}

            {sortedElements.map((el) => (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: `${mmToPx(el.x)}px`, top: `${mmToPx(el.y)}px`,
                  width: `${mmToPx(el.width)}px`, height: `${mmToPx(el.height)}px`,
                  transform: `rotate(${el.rotation}deg)`,
                  zIndex: el.zIndex,
                  // In preview mode (and PDF export which clones the DOM), ALL elements render
                  // regardless of the visible flag. The visible flag only hides elements
                  // from the workspace canvas during editing.
                  display: (!previewMode && !el.visible) ? 'none' : 'block',
                  boxSizing: 'border-box',
                  cursor: previewMode ? 'default' : el.locked ? 'default' : 'move',
                }}
                onPointerDown={(e) => handleElementPointerDown(e, el)}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => handleDoubleClick(e, el)}
              >
                <ElementRenderer
                  element={el}
                  isEditing={selectedId === el.id && isTextEditing}
                  onTextBlur={handleTextBlur}
                  onTableBlur={handleTableBlur}
                />
              </div>
            ))}

            {/* Smart guides */}
            {!previewMode && (
              <SmartGuides guides={smartGuides} pageWidthMm={doc.page.width} pageHeightMm={doc.page.height} />
            )}

            {/* Lasso */}
            {lassoStyle && <div className={styles.lassoBox} style={lassoStyle} />}
          </div>

          {/* Selection + context (outside page, in scaled container) */}
          {!previewMode && selectedIds.map((id) => {
            const element = doc.elements.find((el) => el.id === id);
            // Show selection box only for visible elements in workspace
            return element && element.visible ? <SelectionBox key={id} element={element} zoom={zoom} /> : null;
          })}
          {/* ContextToolbar: show for any selection (single OR multi-select) so Group/Ungroup buttons appear */}
          {!previewMode && primaryEl && !croppingId && (
            <ContextToolbar element={primaryEl} zoom={zoom} />
          )}
        </div>
      </div>
    </div>
  );
};
