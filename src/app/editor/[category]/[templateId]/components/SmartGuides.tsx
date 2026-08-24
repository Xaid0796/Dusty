'use client';
import React from 'react';
import { mmToPx } from '@/canvas/utils';

export interface GuideLineData {
  orientation: 'h' | 'v'; // horizontal or vertical
  position: number; // mm position
  type: 'edge' | 'center' | 'page-center';
}

interface SmartGuidesProps {
  guides: GuideLineData[];
  pageWidthMm: number;
  pageHeightMm: number;
}

export const SmartGuides: React.FC<SmartGuidesProps> = ({ guides, pageWidthMm, pageHeightMm }) => {
  const pageW = mmToPx(pageWidthMm);
  const pageH = mmToPx(pageHeightMm);

  if (guides.length === 0) return null;

  return (
    <>
      {guides.map((guide, i) => {
        const color = guide.type === 'page-center' ? '#10b981' : guide.type === 'center' ? '#f97316' : '#6366f1';
        if (guide.orientation === 'h') {
          const top = mmToPx(guide.position);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                top: `${top}px`,
                width: `${pageW}px`,
                height: 1,
                background: color,
                opacity: 0.8,
                pointerEvents: 'none',
                zIndex: 9990,
                boxShadow: `0 0 4px ${color}`,
              }}
            />
          );
        } else {
          const left = mmToPx(guide.position);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: `${left}px`,
                width: 1,
                height: `${pageH}px`,
                background: color,
                opacity: 0.8,
                pointerEvents: 'none',
                zIndex: 9990,
                boxShadow: `0 0 4px ${color}`,
              }}
            />
          );
        }
      })}
    </>
  );
};

/**
 * Compute smart guides for a dragged element vs all other elements.
 * Returns guides to show and snapped x/y coordinates.
 */
export const computeSmartGuides = (
  movingEl: { x: number; y: number; width: number; height: number },
  others: Array<{ x: number; y: number; width: number; height: number }>,
  pageWidth: number,
  pageHeight: number,
  threshold: number = 2.5 // mm threshold for snapping
): { guides: GuideLineData[]; snapX: number; snapY: number } => {
  const guides: GuideLineData[] = [];
  let snapX = movingEl.x;
  let snapY = movingEl.y;
  let bestDX = threshold;
  let bestDY = threshold;

  const elLeft = movingEl.x;
  const elRight = movingEl.x + movingEl.width;
  const elCX = movingEl.x + movingEl.width / 2;
  const elTop = movingEl.y;
  const elBottom = movingEl.y + movingEl.height;
  const elCY = movingEl.y + movingEl.height / 2;

  // Page center guides
  const pageCX = pageWidth / 2;
  const pageCY = pageHeight / 2;

  const checkX = (pos: number, type: GuideLineData['type'], elEdge: 'left' | 'center' | 'right') => {
    const d = Math.abs(elEdge === 'left' ? elLeft - pos : elEdge === 'center' ? elCX - pos : elRight - pos);
    if (d < bestDX) {
      bestDX = d;
      snapX = elEdge === 'left' ? pos : elEdge === 'center' ? pos - movingEl.width / 2 : pos - movingEl.width;
      // Remove any existing vertical guide at same type+position
      const idx = guides.findIndex((g) => g.orientation === 'v');
      if (idx !== -1) guides.splice(idx, 1);
      guides.push({ orientation: 'v', position: pos, type });
    }
  };

  const checkY = (pos: number, type: GuideLineData['type'], elEdge: 'top' | 'center' | 'bottom') => {
    const d = Math.abs(elEdge === 'top' ? elTop - pos : elEdge === 'center' ? elCY - pos : elBottom - pos);
    if (d < bestDY) {
      bestDY = d;
      snapY = elEdge === 'top' ? pos : elEdge === 'center' ? pos - movingEl.height / 2 : pos - movingEl.height;
      const idx = guides.findIndex((g) => g.orientation === 'h');
      if (idx !== -1) guides.splice(idx, 1);
      guides.push({ orientation: 'h', position: pos, type });
    }
  };

  // Page center
  checkX(pageCX, 'page-center', 'center');
  checkY(pageCY, 'page-center', 'center');

  // Other elements
  for (const other of others) {
    const oLeft = other.x;
    const oRight = other.x + other.width;
    const oCX = other.x + other.width / 2;
    const oTop = other.y;
    const oBottom = other.y + other.height;
    const oCY = other.y + other.height / 2;

    // X-axis (vertical guide lines)
    checkX(oLeft, 'edge', 'left');
    checkX(oLeft, 'edge', 'right');
    checkX(oRight, 'edge', 'left');
    checkX(oRight, 'edge', 'right');
    checkX(oCX, 'center', 'center');

    // Y-axis (horizontal guide lines)
    checkY(oTop, 'edge', 'top');
    checkY(oTop, 'edge', 'bottom');
    checkY(oBottom, 'edge', 'top');
    checkY(oBottom, 'edge', 'bottom');
    checkY(oCY, 'center', 'center');
  }

  return { guides, snapX, snapY };
};
