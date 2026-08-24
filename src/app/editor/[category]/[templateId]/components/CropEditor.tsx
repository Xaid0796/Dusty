import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImageElement } from '@/canvas/types';
import { mmToPx } from '@/canvas/utils';
import { useCanvasStore } from '@/canvas/store';

interface CropEditorProps {
  element: ImageElement;
}

export const CropEditor: React.FC<CropEditorProps> = ({ element }) => {
  const updateElement = useCanvasStore((state) => state.updateElement);
  const setCroppingId = useCanvasStore((state) => state.setCroppingId);
  const saveHistory = useCanvasStore((state) => state.saveHistory);
  const imgRef = useRef<HTMLImageElement>(null);
  const historySavedRef = useRef(false);
  const initialRef = useRef({ cropX: element.cropX ?? 50, cropY: element.cropY ?? 50, zoom: element.zoom ?? 1 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    initialRef.current = { cropX: element.cropX ?? 50, cropY: element.cropY ?? 50, zoom: element.zoom ?? 1 };
    historySavedRef.current = false;
  }, [element.id]);

  const geometry = useMemo(() => {
    const frameW = mmToPx(element.width);
    const frameH = mmToPx(element.height);
    const naturalW = naturalSize.width || frameW;
    const naturalH = naturalSize.height || frameH;
    const imageRatio = naturalW / Math.max(naturalH, 1);
    const frameRatio = frameW / Math.max(frameH, 1);
    const scale = Math.max(1, element.zoom || 1);
    let renderedW = frameW;
    let renderedH = frameH;
    if (imageRatio > frameRatio) {
      renderedH = frameH * scale;
      renderedW = renderedH * imageRatio;
    } else {
      renderedW = frameW * scale;
      renderedH = renderedW / imageRatio;
    }
    return { frameW, frameH, renderedW, renderedH, panRangeX: Math.max(0, renderedW - frameW), panRangeY: Math.max(0, renderedH - frameH) };
  }, [element.width, element.height, element.zoom, element.src, naturalSize.width, naturalSize.height]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const target = e.currentTarget;
    const pointerId = e.pointerId;
    const startX = e.clientX;
    const startY = e.clientY;
    const initialCropX = element.cropX ?? 50;
    const initialCropY = element.cropY ?? 50;
    target.setPointerCapture(pointerId);

    if (!historySavedRef.current) {
      saveHistory();
      historySavedRef.current = true;
    }

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      let nextX = initialCropX;
      let nextY = initialCropY;
      if (geometry.panRangeX > 0) nextX = initialCropX - ((ev.clientX - startX) / geometry.panRangeX) * 100;
      if (geometry.panRangeY > 0) nextY = initialCropY - ((ev.clientY - startY) / geometry.panRangeY) * 100;
      if (geometry.panRangeX <= 0) nextX = 50;
      if (geometry.panRangeY <= 0) nextY = 50;
      updateElement(element.id, { cropX: Number(Math.max(0, Math.min(100, nextX)).toFixed(2)), cropY: Number(Math.max(0, Math.min(100, nextY)).toFixed(2)), zoom: Math.max(1, element.zoom || 1) }, true);
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

  const cancel = () => {
    updateElement(element.id, initialRef.current as any, true);
    setCroppingId(null);
  };

  const done = () => setCroppingId(null);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible', zIndex: 1000 }}>
      {/* Inner container for clipping */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: element.borderRadius, background: '#0f172a' }}>
        {/* Dark mask */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', boxShadow: 'inset 0 0 0 9999px rgba(15,23,42,.55)' }} />
        {/* Draggable image area */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'auto', cursor: 'grab' }} onPointerDown={handlePointerDown}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={element.src}
            alt="Crop preview"
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${element.cropX ?? 50}% ${element.cropY ?? 50}%`, transform: `scale(${Math.max(1, element.zoom || 1)})`, transformOrigin: 'center center', pointerEvents: 'none', userSelect: 'none' }}
            onLoad={(event) => setNaturalSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
          />
        </div>
      </div>
      
      {/* Crop frame border */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, border: '2px solid rgba(255,255,255,.85)', borderRadius: element.borderRadius, pointerEvents: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,.15)' }} />
      
      {/* Action buttons (top right) */}
      <div style={{ position: 'absolute', right: 0, top: -38, zIndex: 7, display: 'flex', gap: 6 }}>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); cancel(); }}
          style={{ border: '1px solid rgba(255,255,255,.35)', background: 'rgba(15,23,42,.8)', backdropFilter: 'blur(4px)', color: '#e2e8f0', padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.03em' }}
        >
          Cancel
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); done(); }}
          style={{ border: 'none', background: 'linear-gradient(135deg, #14b8a6, #0f766e)', color: '#fff', padding: '5px 14px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(20,184,166,.4)', letterSpacing: '0.03em' }}
        >
          Done
        </button>
      </div>
      
      {/* Zoom control floating below */}
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        style={{ position: 'absolute', bottom: -45, left: '50%', transform: 'translateX(-50%)', zIndex: 8, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(15,23,42,0.85)', padding: '6px 12px', borderRadius: 20, backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', width: 'max-content' }}
      >
        <span style={{ color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }} onClick={() => updateElement(element.id, { zoom: Math.max(1, (element.zoom || 1) - 0.1) }, true)}>-</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={element.zoom || 1}
          onChange={(e) => updateElement(element.id, { zoom: parseFloat(e.target.value) }, true)}
          style={{ width: 100, accentColor: '#14b8a6', cursor: 'pointer' }}
        />
        <span style={{ color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }} onClick={() => updateElement(element.id, { zoom: Math.min(3, (element.zoom || 1) + 0.1) }, true)}>+</span>
      </div>
    </div>
  );
};

