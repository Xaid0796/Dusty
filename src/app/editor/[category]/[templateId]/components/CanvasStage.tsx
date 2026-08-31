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
  previewMode?: boolean;
}

interface LassoState {
  startX: number; startY: number; currentX: number; currentY: number; active: boolean;
  /** Page slot element the lasso was initiated on (multi-page aware). */
  pageEl?: HTMLElement | null;
  /** ID of the page slot element for easy rendering-side matching. */
  pageId?: string;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  pageRef, showGrid = false, previewMode = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    document: doc, selectedId, selectedIds, isTextEditing, croppingId,
    selectElement, setSelectedIds, setTextEditing, updateElement, deleteSelected,
    zoom, saveHistory, activeTool, setActiveTool, snapToGrid, pageCount,
  } = useCanvasStore();

  const selectedIdsRef = useRef(selectedIds);
  const drawingIdRef = useRef<string | null>(null);
  const pointersRef = useRef<Map<number, PointerEvent>>(new Map());
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleResizeStart = () => setIsResizing(true);
    const handleResizeEnd = () => setIsResizing(false);
    window.addEventListener('canvas-resizing-start', handleResizeStart);
    window.addEventListener('canvas-resizing-end', handleResizeEnd);
    return () => {
      window.removeEventListener('canvas-resizing-start', handleResizeStart);
      window.removeEventListener('canvas-resizing-end', handleResizeEnd);
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      pointersRef.current.set(e.pointerId, e);
    };
    const onPointerUpOrCancel = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUpOrCancel);
    window.addEventListener('pointercancel', onPointerUpOrCancel);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUpOrCancel);
      window.removeEventListener('pointercancel', onPointerUpOrCancel);
    };
  }, []);
  const [lasso, setLasso] = useState<LassoState | null>(null);
  const [smartGuides, setSmartGuides] = useState<GuideLineData[]>([]);
  const [longPressedId, setLongPressedId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Setup canvasRef if needed
    if (!canvasRef.current) canvasRef.current = document.getElementById('canvas-a4-page') as HTMLDivElement;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Exclusively handle single-pointer panning by translating canvas based on delta (e.clientX, e.clientY)
    // Only allow panning if not actively dragging/moving an element, not during marquee (lasso), not during text editing, and not during resizing
    if (e.buttons === 1 && !longPressedId && !lasso && !isTextEditing && !isResizing) {
      const pane = document.querySelector(`.${styles.canvasPane}`) as HTMLDivElement;
      if (pane) {
        pane.scrollLeft -= e.movementX;
        pane.scrollTop -= e.movementY;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
  };

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

  const pagePointFromEvent = (e: PointerEvent | React.PointerEvent<HTMLDivElement>, pageEl?: HTMLElement | null) => {
    const page = pageEl || pageRef.current;
    if (!page) return { x: 0, y: 0 };
    const rect = page.getBoundingClientRect();
    const z = zoom / 100;
    return { x: pxToMm((e.clientX - rect.left) / z), y: pxToMm((e.clientY - rect.top) / z) };
  };

  const pagePointPxFromEvent = (e: PointerEvent | React.PointerEvent<HTMLDivElement>, pageEl?: HTMLElement | null) => {
    const page = pageEl || pageRef.current;
    if (!page) return { x: 0, y: 0 };
    const rect = page.getBoundingClientRect();
    const z = zoom / 100;
    return { x: (e.clientX - rect.left) / z, y: (e.clientY - rect.top) / z };
  };

  // Resolve the page slot element that sits under a client point (for page-aware marquee math).
  const pageElementFromClient = (clientX: number, clientY: number): HTMLElement | null => {
    const slots = Array.from(document.querySelectorAll<HTMLElement>('[id^="canvas-a4-page"]'));
    for (const slot of slots) {
      const r = slot.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return slot;
    }
    return pageRef.current;
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

  // Drawing tool (page-aware for multi-page)
  const createDrawingAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const pageEl = pageElementFromClient(e.clientX, e.clientY);
    const p = pagePointFromEvent(e, pageEl);
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
      const point = pagePointFromEvent(ev, pageEl);
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

  // Lasso selection (on mobile/touch devices, selection requires a double-tap and drag gesture)
  const lastTapTimeRef = useRef<number>(0);
  const lastTapPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const startLasso = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isTouchOrMobile = isMobile || e.pointerType === 'touch';
    const isSelectTool = activeTool === 'select';

    const now = Date.now();
    const dt = now - lastTapTimeRef.current;
    const dist = Math.hypot(e.clientX - lastTapPosRef.current.x, e.clientY - lastTapPosRef.current.y);
    const isDoubleTap = dt < 400 && dist < 30;

    lastTapTimeRef.current = now;
    lastTapPosRef.current = { x: e.clientX, y: e.clientY };

    if (isTouchOrMobile && isSelectTool && !isDoubleTap) {
      selectElement(null);
      return; // Prevent single tap/click from starting lasso on mobile/touch devices, but clear selection
    }

    // Multi-page aware: resolve the page slot the pointer started on so marquee
    // coordinates are computed relative to that page (not always page 1).
    const pageEl = pageElementFromClient(e.clientX, e.clientY);
    const lassoPageId = pageEl?.id || 'canvas-a4-page';

    const { x, y } = pagePointPxFromEvent(e, pageEl);
    const start = { x, y };
    const pointerId = e.pointerId;
    let lassoInitiated = !isTouchOrMobile || !isSelectTool || isDoubleTap;

    if (lassoInitiated) {
      try { target.setPointerCapture(pointerId); } catch { }
      selectElement(null);
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = Date.now();
    let exceeded = false;
    let timer: any = null;

    // ── Auto-scroll during marquee (when pointer nears viewport edge) ──
    const pane = document.querySelector(`.${styles.canvasPane}`) as HTMLDivElement | null;
    const lastClient = { x: startX, y: startY };
    let autoScrollRAF: number | null = null;
    const EDGE = 60;       // px proximity to edge to start auto-scrolling
    const MAX_SPEED = 20;  // px per frame at the very edge

    const stopAutoScroll = () => {
      if (autoScrollRAF !== null) {
        cancelAnimationFrame(autoScrollRAF);
        autoScrollRAF = null;
      }
    };

    const autoScrollTick = () => {
      if (!lassoInitiated || !pane) return;
      const rect = pane.getBoundingClientRect();
      let vx = 0;
      let vy = 0;
      if (lastClient.y > rect.bottom - EDGE) vy = MAX_SPEED * Math.min(1, (lastClient.y - (rect.bottom - EDGE)) / EDGE);
      else if (lastClient.y < rect.top + EDGE) vy = -MAX_SPEED * Math.min(1, (rect.top + EDGE - lastClient.y) / EDGE);
      if (lastClient.x > rect.right - EDGE) vx = MAX_SPEED * Math.min(1, (lastClient.x - (rect.right - EDGE)) / EDGE);
      else if (lastClient.x < rect.left + EDGE) vx = -MAX_SPEED * Math.min(1, (rect.left + EDGE - lastClient.x) / EDGE);
      if (vx !== 0 || vy !== 0) {
        pane.scrollLeft += vx;
        pane.scrollTop += vy;
        // Keep the lasso's moving edge synced with the (now scrolled) pointer position
        const pt = pagePointPxFromEvent({ clientX: lastClient.x, clientY: lastClient.y } as any, pageEl);
        setLasso({ startX: start.x, startY: start.y, currentX: pt.x, currentY: pt.y, active: true, pageEl, pageId: lassoPageId });
      }
      autoScrollRAF = requestAnimationFrame(autoScrollTick);
    };

    const startAutoScroll = () => {
      if (autoScrollRAF === null) autoScrollRAF = requestAnimationFrame(autoScrollTick);
    };

    const initiateLasso = () => {
      if (lassoInitiated) return;
      lassoInitiated = true;
      if (timer) { clearTimeout(timer); timer = null; }
      try { target.setPointerCapture(pointerId); } catch { }
      selectElement(null);
    };

    if (!lassoInitiated) {
      timer = setTimeout(() => {
        if (!exceeded && !lassoInitiated) initiateLasso();
      }, 150);
    }

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const dx = Math.abs(ev.clientX - startX);
      const dy = Math.abs(ev.clientY - startY);

      if (!lassoInitiated) {
        if (dx > 10 || dy > 10) {
          exceeded = true;
          if (timer) { clearTimeout(timer); timer = null; }
          target.removeEventListener('pointermove', onMove);
          target.removeEventListener('pointerup', onUp);
          target.removeEventListener('pointercancel', onUp);
          return;
        }
        if (Date.now() - startTime >= 150) initiateLasso();
        else return;
      }

      lastClient.x = ev.clientX;
      lastClient.y = ev.clientY;
      const pt = pagePointPxFromEvent(ev, pageEl);
      setLasso({ startX: start.x, startY: start.y, currentX: pt.x, currentY: pt.y, active: true, pageEl, pageId: lassoPageId });
      startAutoScroll();
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      stopAutoScroll();
      if (timer) { clearTimeout(timer); timer = null; }
      try { target.releasePointerCapture(pointerId); } catch { }
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);

      if (lassoInitiated) {
        const pt = pagePointPxFromEvent(ev, pageEl);
        const minX = pxToMm(Math.min(start.x, pt.x));
        const maxX = pxToMm(Math.max(start.x, pt.x));
        const minY = pxToMm(Math.min(start.y, pt.y));
        const maxY = pxToMm(Math.max(start.y, pt.y));
        const state = useCanvasStore.getState();
        // Page-aware: add the page slot's vertical offset (in mm) to the marquee
        // bounds so page-2+ element coordinates (absolute doc y) are matched.
        const pageTopMm = pageEl ? pxToMm(pageEl.getBoundingClientRect().top - (pageRef.current?.getBoundingClientRect().top ?? 0)) : 0;
        const selected = (state.document?.elements || []).filter((el) => el.visible && !el.locked && el.x < maxX && el.x + el.width > minX && el.y < maxY + pageTopMm && el.y + el.height > minY + pageTopMm).map((el) => el.id);
        if (selected.length > 0) setSelectedIds(selected);
      } else if (!exceeded) {
        selectElement(null);
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
    if (activeTool === 'select' && e.button === 0) {
      if (isMobile || e.pointerType === 'touch') {
        e.preventDefault();
      }
      startLasso(e);
      return;
    }
    selectElement(null);
  };

  // Element drag with smart guides
  const handleElementPointerDown = (e: React.PointerEvent<HTMLDivElement>, el: CanvasElement) => {
    if (previewMode || activeTool === 'draw' || pointersRef.current.size >= 2) return;
    if (isTextEditing && selectedId === el.id) {
      e.stopPropagation();
      return;
    }
    if (e.button === 2 || el.locked || croppingId === el.id) return;
    e.stopPropagation();

    const target = e.currentTarget;
    const pointerId = e.pointerId;
    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = Date.now();
    let selectionInitiated = false;
    let exceeded = false;
    let timer: any = null;

    let dragData: {
      ids: string[];
      positions: Map<string, { x: number; y: number }>;
      historySaved: boolean;
      moved: boolean;
    } | null = null;

    const z = zoom / 100;

    const initiateSelection = (ev: PointerEvent | React.PointerEvent) => {
      if (selectionInitiated || pointersRef.current.size >= 2) return;
      selectionInitiated = true;
      if (timer) { clearTimeout(timer); timer = null; }

      setLongPressedId(el.id);

      const additive = ev.ctrlKey || ev.metaKey || ev.shiftKey;
      if (additive) {
        useCanvasStore.getState().toggleSelection(el.id);
      } else {
        if (!selectedIdsRef.current.includes(el.id)) selectElement(el.id);
      }

      const ids = selectedIdsRef.current.includes(el.id) ? [...selectedIdsRef.current] : [el.id];
      const positions = new Map(doc.elements.filter((item) => ids.includes(item.id)).map((item) => [item.id, { x: item.x, y: item.y }]));

      dragData = { ids, positions, historySaved: false, moved: false };
      try { target.setPointerCapture(pointerId); } catch { }
    };

    // If mouse, trigger immediately. If touch, use 500ms delay.
    if (e.pointerType === 'mouse') {
      initiateSelection(e);
    } else {
      timer = setTimeout(() => {
        if (!exceeded && !selectionInitiated && pointersRef.current.size < 2 && e.pointerType === 'touch') initiateSelection(e);
      }, 500); // 500ms = 0.5 seconds
    }

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId || pointersRef.current.size >= 2) return;
      const dx_px = Math.abs(ev.clientX - startX);
      const dy_px = Math.abs(ev.clientY - startY);

      if (!selectionInitiated) {
        if (dx_px > 10 || dy_px > 10) {
          exceeded = true;
          if (timer) { clearTimeout(timer); timer = null; }
          setLongPressedId(null);
          target.removeEventListener('pointermove', move);
          target.removeEventListener('pointerup', up);
          target.removeEventListener('pointercancel', up);
          return;
        }
        // Only initiate if long press timer was reached
        return;
      }

      if (selectionInitiated && dragData) {
        const dx = pxToMm((ev.clientX - startX) / z);
        const dy = pxToMm((ev.clientY - startY) / z);
        if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) return;
        dragData.moved = true;
        if (!dragData.historySaved) { saveHistory(); dragData.historySaved = true; }

        const state = useCanvasStore.getState();
        const primaryEl = state.document?.elements.find((item) => item.id === dragData!.ids[0]);
        const others = (state.document?.elements || []).filter((item) => !dragData!.ids.includes(item.id) && item.visible && !item.locked);
        let snappedDx = dx;
        let snappedDy = dy;

        if (primaryEl && dragData.ids.length === 1 && !snapToGrid) {
          const start = dragData.positions.get(dragData.ids[0]);
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

        dragData.ids.forEach((id) => {
          const start = dragData!.positions.get(id);
          const current = state.document?.elements.find((item) => item.id === id);
          if (!start || !current || current.locked) return;
          const snap = (value: number) => snapToGrid ? Math.round(value / 2) * 2 : value;
          state.updateElement(id, { x: snap(start.x + snappedDx), y: snap(start.y + snappedDy) }, true);
        });
      }
    };

    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (timer) { clearTimeout(timer); timer = null; }
      setLongPressedId(null);
      try { target.releasePointerCapture(pointerId); } catch { }
      setSmartGuides([]);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);

      if (!selectionInitiated && !exceeded && pointersRef.current.size < 2) {
        // Allow selection ONLY if it was a long press, otherwise do nothing (scrolling is handled natively)
        return;
      }
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
    } else if (el.type === 'frame' && (el as any).src) {
      useCanvasStore.getState().setCroppingId(el.id);
    }
  };

  const pageGapPx = 24; // spacing between stacked page slots (px, in unscaled canvas space)
  const effectivePageCount = Math.max(1, pageCount || doc.pageCount || 1);

  const canvasHeight = useMemo(() => {
    const pagePx = mmToPx(doc.page.height || 297);
    return pagePx * effectivePageCount + pageGapPx * (effectivePageCount - 1);
  }, [doc.page.height, effectivePageCount]);

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
  // The lasso is rendered at the container level (above the master elements overlay)
  // so the selection rectangle is never hidden behind full-page element backgrounds.
  // lasso.startX/startY are relative to the page slot, so we offset by the slot's top.
  const lassoPageTopPx = (() => {
    if (!lasso) return 0;
    const id = lasso.pageId || 'canvas-a4-page';
    let pageIdx = 0;
    if (id !== 'canvas-a4-page') {
      const m = /canvas-a4-page-(\d+)/.exec(id);
      pageIdx = m ? parseInt(m[1], 10) - 1 : 0;
    }
    return pageIdx * (mmToPx(doc.page.height) + pageGapPx);
  })();
  const lassoStyle: React.CSSProperties | null = lasso ? { left: `${Math.min(lasso.startX, lasso.currentX)}px`, top: `${lassoPageTopPx + Math.min(lasso.startY, lasso.currentY)}px`, width: `${Math.abs(lasso.currentX - lasso.startX)}px`, height: `${Math.abs(lasso.currentY - lasso.startY)}px` } : null;

  return (
    <div
      className={styles.canvasOuter}
      style={{ position: 'relative' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Canvas content */}
      <div style={{ marginTop: 0, marginLeft: 0 }}>
        <div style={zoomStyle}>
          {/* Stacked A4 page slots (multi-page background layout) */}
          {Array.from({ length: effectivePageCount }).map((_, pageIndex) => {
            const pageTopMm = pageIndex * (doc.page.height + pxToMm(pageGapPx));
            const pagePxTop = mmToPx(pageTopMm);
            const pagePxHeight = mmToPx(doc.page.height);
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === effectivePageCount - 1;
            return (
              <React.Fragment key={pageIndex}>
                <div
                  ref={isFirstPage ? pageRef : undefined}
                  id={isFirstPage ? 'canvas-a4-page' : `canvas-a4-page-${pageIndex + 1}`}
                  className={styles.canvasA4Page}
                  style={{
                    width: `${mmToPx(doc.page.width)}px`,
                    height: `${pagePxHeight}px`,
                    backgroundColor: doc.page.background,
                    position: 'absolute',
                    top: `${pagePxTop}px`,
                    left: 0,
                    overflow: 'hidden',
                    cursor: previewMode ? 'default' : activeTool === 'draw' ? 'crosshair' : 'default',
                    touchAction: (isMobile && activeTool === 'select') ? 'none' : 'auto',
                    zIndex: 1,
                  }}
                  onPointerDown={handleEmptyPointerDown}
                >
                  {showGrid && !previewMode && <div className={styles.gridOverlay} data-grid-overlay />}

                  {/* Page number badge (desktop, editing mode) */}
                  {!previewMode && !isMobile && (
                    <div className={styles.pageBadge}>Page {pageIndex + 1}</div>
                  )}
                </div>

                {/* Page break indicator between slots */}
                {!isLastPage && (
                  <div
                    className={previewMode ? styles.previewPageGap : styles.pageBreakIndicator}
                    style={{ top: `${pagePxTop + pagePxHeight + pageGapPx / 2}px`, zIndex: 50 }}
                    data-page-break
                  >
                    <span className={styles.pageBreakLabel}>Page {pageIndex + 1} ends · Page {pageIndex + 2} begins</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Master Elements Overlay for seamless cross-page dragging (like Microsoft Word) */}
          {/* Each element is clipped to its A4 page band so content never bleeds into the gap or adjacent pages. */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
            {sortedElements.map((el) => {
              const isLongPressed = longPressedId === el.id;
              // Determine which A4 page band the element's center falls in, then clip to that page's vertical bounds.
              const pageBandMm = doc.page.height + pxToMm(pageGapPx);
              const elCenterMm = el.y + el.height / 2;
              const pageIdx = Math.min(effectivePageCount - 1, Math.max(0, Math.floor(elCenterMm / pageBandMm)));
              const pageTopMm = pageIdx * pageBandMm;
              const pageBottomMm = pageTopMm + doc.page.height;
              const clipTopMm = Math.max(0, pageTopMm - el.y);
              const clipBottomMm = Math.max(0, (el.y + el.height) - pageBottomMm);
              const needsClip = clipTopMm > 0 || clipBottomMm > 0;
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${mmToPx(el.x)}px`,
                    top: `${mmToPx(el.y)}px`,
                    width: `${mmToPx(el.width)}px`,
                    height: `${mmToPx(el.height)}px`,
                    transform: `rotate(${el.rotation}deg)${isLongPressed ? ' scale(1.03)' : ''}`,
                    transition: isLongPressed ? 'transform 0.15s ease' : 'none',
                    zIndex: el.zIndex,
                    display: (!previewMode && !el.visible) ? 'none' : 'block',
                    boxSizing: 'border-box',
                    cursor: previewMode ? 'default' : el.locked ? 'default' : 'move',
                    boxShadow: isLongPressed ? '0 0 12px rgba(59, 130, 246, 0.6)' : 'none',
                    borderRadius: isLongPressed ? '4px' : '0px',
                    // Locked elements are non-interactive on the canvas: they must not
                    // swallow pointer events (e.g. a full-page background rect), otherwise
                    // marquee selection and click-to-deselect on "empty" space break.
                    // Unlock happens via the Layers panel (or admin builder), so the
                    // element remains visible but lets events pass through to the page.
                    pointerEvents: el.locked ? 'none' : 'auto',
                    // Clip to page band so elements don't visually bleed between pages
                    clipPath: needsClip ? `inset(${mmToPx(clipTopMm)}px 0 ${mmToPx(clipBottomMm)}px 0)` : undefined,
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
              );
            })}
          </div>
          {/* Smart guides (first page layer) */}
          {!previewMode && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 150 }}>
              <SmartGuides guides={smartGuides} pageWidthMm={doc.page.width} pageHeightMm={doc.page.height} />
            </div>
          )}

          {/* Marquee/lasso rectangle — rendered at container level (above the master
    elements overlay) so it is never hidden behind full-page element backgrounds
    such as the cover-letter page-bg rects. */}
          {!previewMode && lassoStyle && (
            <div className={styles.lassoBox} style={lassoStyle} />
          )}


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

      {/* Mobile-only bottom-center floating toolbar for landscape orientation with incremental zoom */}
      <div className={styles.landscapeZoomBar}>
        <button
          className={styles.landscapeZoomBtn}
          onClick={() => {
            const newZoom = Math.max(20, zoom - 10);
            useCanvasStore.getState().setZoom(newZoom);
          }}
          title="Zoom Out"
        >
          -
        </button>
        <span className={styles.landscapeZoomText}>{zoom}%</span>
        <button
          className={styles.landscapeZoomBtn}
          onClick={() => {
            const newZoom = Math.min(500, zoom + 10);
            useCanvasStore.getState().setZoom(newZoom);
          }}
          title="Zoom In"
        >
          +
        </button>
      </div>
    </div>
  );
};
