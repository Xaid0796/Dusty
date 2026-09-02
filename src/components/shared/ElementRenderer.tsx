'use client';

import React, { useEffect, useRef } from 'react';
import { CanvasElement, ChartElement } from '@/canvas/types';
import { mmToPx, pxToMm } from '@/canvas/utils';
import { useCanvasStore } from '@/canvas/store';
import { ChartRenderer } from '@/components/shared/ChartRenderer';
import { generateQRPathData } from '@/utils/qrCode';

interface ElementRendererProps {
  element: CanvasElement;
  isEditing: boolean;
  onTextBlur: (id: string, text: string, finalHeightMm?: number) => void;
  onTextFocus?: (id: string) => void;
  isThumbnail?: boolean;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isEditing,
  onTextBlur,
  onTextFocus,
  isThumbnail = false,
}) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && textRef.current) {
      if (element.type === 'text') {
        textRef.current.textContent = element.content;
      }
      if (document.activeElement !== textRef.current) {
        textRef.current.focus();
      }
    }
  }, [isEditing, element]);

  // Align height automatically to fit content when not editing
  useEffect(() => {
    if (!isEditing && !isThumbnail && textRef.current) {
      const scrollHeight = textRef.current.scrollHeight;
      const measuredHeightMm = pxToMm(scrollHeight);
      if (Math.abs(measuredHeightMm - element.height) > 0.2) {
        useCanvasStore.getState().updateElement(element.id, { height: Number(measuredHeightMm.toFixed(2)) }, true);
      }
    }
  }, [element, isEditing, isThumbnail]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const scrollHeight = e.currentTarget.scrollHeight;
    const measuredHeightMm = pxToMm(scrollHeight);
    useCanvasStore.getState().updateElement(element.id, { height: Number(measuredHeightMm.toFixed(2)) }, true);
  };

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  };

  switch (element.type) {
    case 'text': {
      const textStyle: React.CSSProperties = {
        width: '100%',
        height: isEditing ? '100%' : 'auto',
        minHeight: '100%',
        fontFamily: element.style.fontFamily,
        fontSize: `${element.style.fontSize}pt`,
        fontWeight: element.style.fontWeight,
        fontStyle: element.style.fontStyle,
        textDecoration: element.style.textDecoration,
        color: element.style.color,
        textAlign: element.style.textAlign,
        lineHeight: element.style.lineHeight,
        letterSpacing: `${element.style.letterSpacing}px`,
        padding: `${element.style.padding}mm`,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent:
          element.style.verticalAlign === 'middle'
            ? 'center'
            : element.style.verticalAlign === 'bottom'
              ? 'flex-end'
              : 'flex-start',
      };

      const hasUrl = element.url && !isEditing;
      const linkProps = hasUrl
        ? {
          href: element.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: { textDecoration: 'underline', color: element.style.color, cursor: 'pointer' },
          'data-url': element.url,
        }
        : {};

      if (isEditing) {
        return (
          <div style={baseStyle}>
            <div
              ref={textRef}
              contentEditable
              suppressContentEditableWarning
              style={{ ...textStyle, cursor: 'text' }}
              onBlur={(e) => {
                const scrollHeight = e.currentTarget.scrollHeight;
                const measuredHeightMm = pxToMm(scrollHeight);
                onTextBlur(element.id, e.currentTarget.textContent || '', Number(measuredHeightMm.toFixed(2)));
              }}
              onInput={handleInput}
              onKeyDown={(e) => {
                // Prevent canvas delete handler from firing when typing backspace/delete
                e.stopPropagation();
                if (e.key === 'Escape') {
                  e.currentTarget.blur();
                }
              }}
            />
          </div>
        );
      }

      if (hasUrl) {
        return (
          <div style={baseStyle}>
            <a {...linkProps}>
              <div ref={textRef} style={{ ...textStyle, cursor: 'pointer' }}>
                {element.content}
              </div>
            </a>
          </div>
        );
      }

      return (
        <div style={baseStyle}>
          <div ref={textRef} style={textStyle}>
            {element.content}
          </div>
        </div>
      );
    }

    case 'image': {
      // Look for a custom zoom factor or default to 1.
      const zoomFactor = element.zoom !== undefined ? element.zoom : 1;
      const cropX = element.cropX !== undefined ? element.cropX : 50;
      const cropY = element.cropY !== undefined ? element.cropY : 50;
      const objectPosition = `${cropX}% ${cropY}%`;

      const imgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: element.objectFit,
        objectPosition: objectPosition,
        opacity: element.opacity,
        borderRadius: `${element.borderRadius}px`,
        transform: `scale(${zoomFactor}) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
        filter: `brightness(${element.brightness ?? 1}) contrast(${element.contrast ?? 1}) saturate(${element.saturation ?? 1}) blur(${element.blur ?? 0}px)`,
        transition: 'transform 0.1s ease',
        userSelect: 'none',
        pointerEvents: 'none', // Prevents browser image dragging
      };

      return (
        <div
          style={{
            ...baseStyle,
            overflow: 'hidden',
            borderRadius: `${element.borderRadius}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={element.src}
            alt={element.label || 'Canvas Image'}
            style={imgStyle}
          />
        </div>
      );
    }

    case 'circle': {
      return <div style={{ ...baseStyle, backgroundColor: element.fill, border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.stroke}` : 'none', borderRadius: '50%', opacity: element.opacity }} />;
    }

    case 'triangle': {
      return (
        <div style={{ ...baseStyle, position: 'relative' }}>
          <div style={{ width: 0, height: 0, margin: '0 auto', borderLeft: `${mmToPx(element.width) / 2}px solid transparent`, borderRight: `${mmToPx(element.width) / 2}px solid transparent`, borderBottom: `${mmToPx(element.height)}px solid ${element.fill}`, opacity: element.opacity }} />
        </div>
      );
    }

    case 'sticky': {
      return <div style={{ ...baseStyle, background: element.background, color: element.textColor, borderRadius: `${element.borderRadius}px`, padding: `${element.padding}mm`, fontSize: `${element.fontSize}pt`, fontWeight: element.fontWeight, opacity: element.opacity, boxShadow: '0 3px 8px rgba(15,23,42,.12)', whiteSpace: 'pre-wrap' }}>{element.content}</div>;
    }

    case 'table': {
      return (
        <table style={{ ...baseStyle, width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontFamily: element.fontFamily, fontSize: `${element.fontSize}pt`, color: element.textColor }}>
          <tbody>
            {Array.from({ length: element.rows }).map((_, r) => <tr key={r}>{Array.from({ length: element.columns }).map((_, c) => <td key={c} style={{ border: `${element.borderWidth}px solid ${element.borderColor}`, padding: `${element.cellPadding}mm`, background: element.headerRow && r === 0 ? element.headerBackground : '#fff', color: element.headerRow && r === 0 ? element.headerTextColor : element.textColor }}>{element.cells[r]?.[c] ?? ''}</td>)}</tr>)}
          </tbody>
        </table>
      );
    }

    case 'drawing': {
      const points = element.points.map((p) => `${mmToPx(p.x - element.x)},${mmToPx(p.y - element.y)}`).join(' ');
      return <svg width="100%" height="100%" viewBox={`0 0 ${mmToPx(Math.max(element.width, 1))} ${mmToPx(Math.max(element.height, 1))}`}><polyline points={points} fill="none" stroke={element.stroke} strokeWidth={element.strokeWidth} strokeLinecap={element.lineCap} strokeLinejoin={element.lineJoin} opacity={element.opacity} /></svg>;
    }

    case 'rect': {
      const rectStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: element.fill,
        border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.stroke}` : 'none',
        borderRadius: `${element.borderRadius}px`,
        opacity: element.opacity,
      };

      return (
        <div style={baseStyle}>
          <div style={rectStyle} />
        </div>
      );
    }

    case 'line': {
      const isHorizontal = element.orientation === 'horizontal';
      const lineStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        borderBottom: isHorizontal ? `${element.strokeWidth}px solid ${element.stroke}` : 'none',
        borderLeft: !isHorizontal ? `${element.strokeWidth}px solid ${element.stroke}` : 'none',
      };

      return (
        <div style={baseStyle}>
          <div style={lineStyle} />
        </div>
      );
    }

    case 'chart': {
      return (
        <div style={baseStyle}>
          <ChartRenderer element={element as ChartElement} />
        </div>
      );
    }

    case 'frame': {
      const frameEl = element as any;
      const borderStyle = frameEl.borderEnabled && frameEl.borderWidth > 0
        ? `${frameEl.borderWidth}px ${frameEl.borderStyle || 'solid'} ${frameEl.borderColor || '#cbd5e1'}`
        : 'none';
      const isRound = frameEl.shape === 'circle' || frameEl.shape === 'ellipse';
      const borderRadius = isRound ? '50%' : '0';

      const containerStyle: React.CSSProperties = {
        ...baseStyle,
        overflow: 'hidden',
        borderRadius,
        border: borderStyle,
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: frameEl.opacity ?? 1,
      };

      if (!frameEl.src) {
        return (
          <div style={containerStyle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        );
      }

      const transform = `scale(${frameEl.zoom || 1})`;
      const objectPosition = `${frameEl.cropX ?? 50}% ${frameEl.cropY ?? 50}%`;

      return (
        <div style={{ ...containerStyle, backgroundColor: frameEl.backgroundColor || 'transparent' }}>
          <img
            src={frameEl.src}
            alt={frameEl.label || 'Frame Image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: frameEl.objectFit || 'cover',
              objectPosition,
              transform,
              transformOrigin: `${frameEl.cropX ?? 50}% ${frameEl.cropY ?? 50}%`,
              transition: 'none',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>
      );
    }

    case 'qr-code': {
      const qrEl = element as any;
      const { totalSize, modules } = generateQRPathData({
        content: qrEl.content,
        preset: qrEl.designPreset,
        foregroundColor: qrEl.foregroundColor || '#0f172a',
        backgroundColor: qrEl.backgroundColor || '#ffffff',
        margin: qrEl.margin ?? 2,
      });

      return (
        <div style={{ ...baseStyle, backgroundColor: qrEl.backgroundColor || '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${totalSize} ${totalSize}`}
            style={{ display: 'block', shapeRendering: 'crispEdges' }}
          >
            <rect x="0" y="0" width={totalSize} height={totalSize} fill={qrEl.backgroundColor || '#ffffff'} />
            {modules}
          </svg>
        </div>
      );
    }

    default:
      return null;
  }
};
