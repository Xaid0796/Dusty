import React, { useEffect, useRef, useState } from 'react';
import { CanvasElement, TableElement, DrawingElement, ChartElement } from '@/canvas/types';
import { mmToPx } from '@/canvas/utils';
import { useCanvasStore } from '@/canvas/store';
import { ChartRenderer } from '@/components/shared/ChartRenderer';
import { generateQRPathData } from '@/utils/qrCode';

interface ElementRendererProps {
  element: CanvasElement;
  isEditing: boolean;
  onTextBlur: (id: string, text: string, finalHeightMm?: number) => void;
  onTableBlur?: (id: string, cells: string[][]) => void;
}

const textBase = (element: any): React.CSSProperties => ({
  width: '100%',
  height: '100%',
  fontFamily: element.style?.fontFamily || 'Inter, sans-serif',
  fontSize: `${element.style?.fontSize ?? 12}pt`,
  fontWeight: element.style?.fontWeight || 'normal',
  fontStyle: element.style?.fontStyle || 'normal',
  textDecoration: element.style?.textDecoration || 'none',
  color: element.style?.color || '#111827',
  textAlign: element.style?.textAlign || 'left',
  lineHeight: element.style?.lineHeight || 1.3,
  letterSpacing: `${element.style?.letterSpacing || 0}px`,
  padding: `${element.style?.padding || 0}mm`,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  boxSizing: 'border-box',
  outline: 'none',
});

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isEditing, onTextBlur, onTableBlur }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const editableTableRef = useRef<string[][]>([]);
  const updateElement = useCanvasStore((state) => state.updateElement);
  const [tableEditing, setTableEditing] = useState(false);

  const lastExternalContentRef = useRef((element as any).content || '');

  // Keep lastExternalContentRef updated when not editing
  useEffect(() => {
    if (!isEditing) {
      lastExternalContentRef.current = (element as any).content || '';
    }
  }, [isEditing, (element as any).content]);

  // Sync content when external content changes (e.g. via Undo/Redo)
  useEffect(() => {
    const desired = (element as any).content || '';
    if (desired !== lastExternalContentRef.current) {
      lastExternalContentRef.current = desired;
      if (textRef.current && textRef.current.textContent !== desired) {
        textRef.current.textContent = desired;

        // Restore caret at the end of the text if editing
        if (isEditing && document.activeElement === textRef.current) {
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(textRef.current);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    }
  }, [isEditing, (element as any).content]);

  // ── Always sync text content from props when not editing ───
  useEffect(() => {
    if (textRef.current && !isEditing) {
      const desired = (element as any).content || '';
      if (textRef.current.textContent !== desired) {
        textRef.current.textContent = desired;
      }
    }
  }, [(element as any).content, isEditing]);

  // ── When entering edit mode: focus and position caret ───
  useEffect(() => {
    if (isEditing && textRef.current) {
      if (textRef.current.textContent !== (element as any).content) {
        textRef.current.textContent = (element as any).content || '';
      }
      textRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(textRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing, element.id]);

  const pageElementStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  };

  switch (element.type) {
    case 'text': {
      const style = textBase(element);
      const hasUrl = element.url && !isEditing;
      const linkProps = hasUrl
        ? {
          href: element.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: { textDecoration: 'underline', color: style.color, cursor: 'pointer' },
          'data-url': element.url,
        }
        : {};

      return (
        <div style={pageElementStyle}>
          {hasUrl ? (
            <a {...linkProps}>
              <div
                ref={textRef}
                contentEditable={false}
                suppressContentEditableWarning
                style={{
                  ...style,
                  cursor: 'pointer',
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                {element.content}
              </div>
            </a>
          ) : (
            <div
              ref={textRef}
              contentEditable={isEditing}
              suppressContentEditableWarning
              style={{
                ...style,
                cursor: isEditing ? 'text' : 'inherit',
                height: isEditing ? 'auto' : '100%',
                overflow: 'hidden',
              }}
              onBlur={(e) => {
                const node = e.currentTarget;
                const text = node.textContent || '';
                const contentHeightPx = node.scrollHeight;
                const nextMm = Number((contentHeightPx / (96 / 25.4) + 0.1).toFixed(2));
                onTextBlur(element.id, text, Math.max(4, nextMm));
              }}
              onInput={(e) => {
                if (!isEditing) return;
                const node = e.currentTarget;
                const text = node.textContent || '';
                const contentHeightPx = node.scrollHeight;
                const nextMm = Number((contentHeightPx / (96 / 25.4) + 0.1).toFixed(2));

                const updates: Partial<CanvasElement> = { content: text };
                if (Math.abs(nextMm - element.height) > 0.1) {
                  updates.height = Math.max(4, nextMm);
                }
                updateElement(element.id, updates, true);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') e.currentTarget.blur();
              }}
            />
          )}
        </div>
      );
    }


    case 'image': {
      const imgEl = element as any;

      // Handle ornaments with custom color
      if (imgEl.isOrnament && imgEl.ornamentColor && imgEl.ornamentSvgContent) {
        // Extract the SVG content and replace stroke color
        const svgContent = imgEl.ornamentSvgContent;
        const colorizedSvg = svgContent.replace(/stroke="#([^"]+)"/g, `stroke="${imgEl.ornamentColor}"`)
          .replace(/fill="#([^"]+)"/g, `fill="${imgEl.ornamentColor}"`)
          .replace(/stroke='#([^']+)'/g, `stroke='${imgEl.ornamentColor}'`)
          .replace(/fill='#([^']+)'/g, `fill='${imgEl.ornamentColor}'`);

        return (
          <div style={{
            ...pageElementStyle,
            overflow: 'visible',
            opacity: element.opacity,
          }}>
            <div
              dangerouslySetInnerHTML={{ __html: colorizedSvg }}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </div>
        );
      }

      const transform = `scale(${element.zoom || 1}) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`;
      const filter = [
        `brightness(${element.brightness ?? 1})`,
        `contrast(${element.contrast ?? 1})`,
        `saturate(${element.saturation ?? 1})`,
        `blur(${element.blur ?? 0}px)`,
      ].join(' ');
      return (
        <div style={{
          ...pageElementStyle,
          overflow: 'hidden',
          borderRadius: `${element.borderRadius}px`,
          opacity: element.opacity,
          backgroundColor: imgEl.backgroundColor || 'transparent'
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={element.src}
            alt={element.label || 'Canvas Image'}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: element.objectFit,
              objectPosition: element.objectPosition,
              transform,
              transformOrigin: `${element.cropX ?? 50}% ${element.cropY ?? 50}%`,
              filter,
              transition: 'none',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>
      );
    }

    case 'rect':
    case 'circle':
    case 'triangle':
    case 'star':
    case 'hexagon':
    case 'arrow':
    case 'arrow-left':
    case 'arrow-up':
    case 'arrow-down':
    case 'diagonal-line':
    case 'wave':
    case 'l-shape':
    case 'right-triangle':
    case 'diamond':
    case 'pentagon':
    case 'four-star':
    case 'eight-star':
    case 'speech-rect':
    case 'speech-oval':
    case 'cloud':
    case 'heart':
    case 'lightning':
    case 'floral-branch':
    case 'elegant-corner':
    case 'divider-diamond':
    case 'badge-star':
    case 'arch-accent':
    case 'wave-accent': {
      const opacity = (element as any).opacity ?? 1;
      const styleMode = (element as any).styleMode || 'both';
      const fill = styleMode === 'outline' ? 'transparent' : ((element as any).fill || 'transparent');
      const stroke = styleMode === 'fill' ? 'none' : ((element as any).strokeWidth > 0 ? (element as any).stroke : 'none');
      const strokeWidth = styleMode === 'fill' ? 0 : ((element as any).strokeWidth || 0);

      if (element.type === 'rect' || element.type === 'circle') {
        const common: React.CSSProperties = {
          width: '100%',
          height: '100%',
          background: fill,
          border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : 'none',
          opacity,
        };
        if (element.type === 'rect') common.borderRadius = `${(element as any).borderRadius ?? 0}px`;
        if (element.type === 'circle') common.borderRadius = '50%';
        return <div style={common} />;
      }

      // SVG shapes: triangle, star, hexagon, arrow, etc.
      let pathD = '';
      let viewBox = '0 0 100 100';

      if (element.type === 'triangle') {
        pathD = 'M 50,0 L 100,100 L 0,100 Z';
      } else if (element.type === 'star') {
        pathD = 'M 50,0 L 65,35 L 100,35 L 73,57 L 85,95 L 50,70 L 15,95 L 27,57 L 0,35 L 35,35 Z';
      } else if (element.type === 'hexagon') {
        pathD = 'M 50,0 L 100,25 L 100,75 L 50,100 L 0,75 L 0,25 Z';
      } else if (element.type === 'arrow') {
        pathD = 'M 0,37.5 L 58.3,37.5 L 58.3,12.5 L 100,50 L 58.3,87.5 L 58.3,62.5 L 0,62.5 Z';
      } else if (element.type === 'arrow-left') {
        pathD = 'M 100,37.5 L 41.7,37.5 L 41.7,12.5 L 0,50 L 41.7,87.5 L 41.7,62.5 L 100,62.5 Z';
      } else if (element.type === 'arrow-up') {
        pathD = 'M 37.5,100 L 37.5,41.7 L 12.5,41.7 L 50,0 L 87.5,41.7 L 62.5,41.7 L 62.5,100 Z';
      } else if (element.type === 'arrow-down') {
        pathD = 'M 37.5,0 L 37.5,58.3 L 12.5,58.3 L 50,100 L 87.5,58.3 L 62.5,58.3 L 62.5,0 Z';
      } else if (element.type === 'diagonal-line') {
        pathD = 'M 5,5 L 95,95';
      } else if (element.type === 'wave') {
        pathD = 'M 5,50 C 25,10 45,10 50,50 C 55,90 75,90 95,50';
      } else if (element.type === 'l-shape') {
        pathD = 'M 5,5 L 30,5 L 30,70 L 95,70 L 95,95 L 5,95 Z';
      } else if (element.type === 'right-triangle') {
        pathD = 'M 5,5 L 5,95 L 95,95 Z';
      } else if (element.type === 'diamond') {
        pathD = 'M 50,5 L 95,50 L 50,95 L 5,50 Z';
      } else if (element.type === 'pentagon') {
        pathD = 'M 50,5 L 95,38 L 78,95 L 22,95 L 5,38 Z';
      } else if (element.type === 'four-star') {
        pathD = 'M 50,5 Q 50,50 95,50 Q 50,50 50,95 Q 50,50 5,50 Q 50,50 50,5 Z';
      } else if (element.type === 'eight-star') {
        pathD = 'M 50,5 L 59,32 L 82,18 L 68,43 L 95,50 L 68,57 L 82,82 L 59,68 L 50,95 L 41,68 L 18,82 L 32,57 L 5,50 L 32,43 L 18,18 L 41,32 Z';
      } else if (element.type === 'speech-rect') {
        pathD = 'M 15,5 H 85 A 10,10 0 0 1 95,15 V 65 A 10,10 0 0 1 85,75 H 35 L 15,95 V 75 A 10,10 0 0 1 5,65 V 15 A 10,10 0 0 1 15,5 Z';
      } else if (element.type === 'speech-oval') {
        pathD = 'M 50,5 C 74.8,5 95,23 95,45 C 95,67 74.8,85 50,85 C 43.8,85 37.9,83.8 32.5,81.7 L 14,95 L 19,77.7 C 10.5,70.2 5,58.7 5,45 C 5,23 25.2,5 50,5 Z';
      } else if (element.type === 'cloud') {
        pathD = 'M 70.8,62.5 A 16.7,16.7 0 0 0 81.3,32.9 A 18.8,18.8 0 0 0 60.4,3.8 A 22.9,22.9 0 0 0 25.6,13.8 A 16.7,16.7 0 0 0 10.4,34.6 A 16.7,16.7 0 0 0 20.8,57.1 L 14.6,73.8 L 33.3,63.3 A 25,25 0 0 0 70.8,62.5 Z';
      } else if (element.type === 'heart') {
        pathD = 'M 50,89 L 44,83.5 C 22.5,64 8,51.3 8,35.5 C 8,22.7 18,12.7 30.8,12.7 C 38.1,12.7 45.1,16.1 50,21.5 C 54.9,16.1 61.9,12.7 69.2,12.7 C 82,12.7 92,22.7 92,35.5 C 92,51.3 77.5,64 56,83.6 L 50,89 Z';
      } else if (element.type === 'lightning') {
        pathD = 'M 58.3,8.3 L 16.7,54.2 L 45.8,54.2 L 41.7,91.7 L 83.3,45.8 L 54.2,45.8 Z';
      } else if (element.type === 'floral-branch') {
        pathD = 'M10,90 Q 30,70 50,10 M30,70 Q 20,55 10,60 Q 25,60 30,70 M 35,55 Q 50,45 65,50 Q 45,55 35,55 M42,40 Q 30,30 25,35 Q 35,35 42,40 M46,25 Q 60,15 70,22 Q 55,22 46,25';
      } else if (element.type === 'elegant-corner') {
        pathD = 'M 10,10 L 90,10 M 10,10 L 10,90 M 10,30 C 30,30 30,10 10,10 M 10,50 C 50,50 50,10 10,10 M 10,70 C 70,70 70,10 10,10';
      } else if (element.type === 'divider-diamond') {
        pathD = 'M 5,50 L 40,50 L 45,45 L 50,50 L 55,45 L 60,50 L 95,50 M 50,55 L 45,50 L 50,45 L 55,50 Z';
      } else if (element.type === 'badge-star') {
        pathD = 'M 50,5 L 85,25 L 85,75 L 50,95 L 15,75 L 15,25 Z M 50,12 L 78,28 L 78,72 L 50,88 L 22,72 L 22,28 Z';
      } else if (element.type === 'arch-accent') {
        pathD = 'M 20,90 L 20,50 A 30,30 0 0,1 80,50 L 80,90 M 30,90 L 30,50 A 20,20 0 0,1 70,50 L 70,90 M 40,90 L 40,50 A 10,10 0 0,1 60,50 L 60,90';
      } else if (element.type === 'wave-accent') {
        pathD = 'M 10,30 Q 30,15 50,30 T 90,30 M 10,50 Q 30,35 50,50 T 90,50 M 10,70 Q 30,55 50,70 T 90,70';
      }

      const isLineLike = element.type === 'diagonal-line' || element.type === 'wave' || element.type === 'floral-branch' || element.type === 'elegant-corner' || element.type === 'divider-diamond' || element.type === 'arch-accent' || element.type === 'wave-accent';

      return (
        <div style={{ ...pageElementStyle, position: 'relative', opacity }}>
          <svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <path
              d={pathD}
              fill={isLineLike ? 'none' : fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    }

    case 'group': {
      const group = element as any;
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
          {group.elements.map((child: any) => (
            <div
              key={child.id}
              style={{
                position: 'absolute',
                left: `${mmToPx(child.x)}px`,
                top: `${mmToPx(child.y)}px`,
                width: `${mmToPx(child.width)}px`,
                height: `${mmToPx(child.height)}px`,
                transform: `rotate(${child.rotation}deg)`,
                zIndex: child.zIndex,
                display: child.visible ? 'block' : 'none',
                boxSizing: 'border-box',
              }}
            >
              <ElementRenderer
                element={child}
                isEditing={false}
                onTextBlur={onTextBlur}
                onTableBlur={onTableBlur}
              />
            </div>
          ))}
        </div>
      );
    }

    case 'line':
      return (
        <div style={{ ...pageElementStyle, position: 'relative' }}>
          <div
            style={element.orientation === 'horizontal'
              ? { position: 'absolute', left: 0, right: 0, top: '50%', borderTop: `${element.strokeWidth}px solid ${element.stroke}` }
              : { position: 'absolute', top: 0, bottom: 0, left: '50%', borderLeft: `${element.strokeWidth}px solid ${element.stroke}` }}
          />
        </div>
      );

    case 'sticky': {
      const sticky = element;
      return (
        <div
          style={{
            ...pageElementStyle,
            background: sticky.background,
            color: sticky.textColor,
            borderRadius: `${sticky.borderRadius}px`,
            padding: `${sticky.padding}mm`,
            fontSize: `${sticky.fontSize}pt`,
            fontWeight: sticky.fontWeight,
            lineHeight: 1.35,
            boxShadow: '0 6px 18px rgba(15,23,42,.12)',
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onTextBlur(sticky.id, e.currentTarget.textContent || '')}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {sticky.content}
        </div>
      );
    }

    case 'table': {
      const table = element as TableElement;
      editableTableRef.current = table.cells.map((row) => [...row]);
      return (
        <div style={{ ...pageElementStyle, overflow: 'hidden', background: '#fff' }}>
          <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontFamily: table.fontFamily, fontSize: `${table.fontSize}pt`, color: table.textColor }}>
            <tbody>
              {Array.from({ length: table.rows }).map((_, r) => (
                <tr key={r}>
                  {Array.from({ length: table.columns }).map((_, c) => {
                    const isHeader = table.headerRow && r === 0;
                    return (
                      <td
                        key={c}
                        contentEditable={isEditing || tableEditing}
                        suppressContentEditableWarning
                        onFocus={() => setTableEditing(true)}
                        onInput={(e) => {
                          editableTableRef.current[r][c] = e.currentTarget.textContent || '';
                        }}
                        onBlur={() => {
                          if (!onTableBlur) return;
                          onTableBlur(table.id, editableTableRef.current.map((row) => [...row]));
                          setTableEditing(false);
                        }}
                        style={{
                          border: `${table.borderWidth}px solid ${table.borderColor}`,
                          padding: `${table.cellPadding}mm`,
                          background: isHeader ? table.headerBackground : '#fff',
                          color: isHeader ? table.headerTextColor : table.textColor,
                          fontWeight: isHeader ? 700 : 400,
                          verticalAlign: 'middle',
                          outline: 'none',
                          overflow: 'hidden',
                        }}
                      >
                        {table.cells[r]?.[c] ?? ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'drawing': {
      const drawing = element as DrawingElement;
      const widthPx = Math.max(1, mmToPx(drawing.width));
      const heightPx = Math.max(1, mmToPx(drawing.height));

      // Smoothing: Midpoint-based quadratic Bézier interpolation
      // We render raw points as smooth curves using SVG Q commands
      let pathData = '';
      if (drawing.points.length > 0) {
        const pts = drawing.points;
        const startX = mmToPx(pts[0].x - drawing.x);
        const startY = mmToPx(pts[0].y - drawing.y);
        pathData = `M ${startX},${startY}`;

        if (pts.length === 2) {
          const p1X = mmToPx(pts[1].x - drawing.x);
          const p1Y = mmToPx(pts[1].y - drawing.y);
          pathData += ` L ${p1X},${p1Y}`;
        } else if (pts.length > 2) {
          let i;
          for (i = 1; i < pts.length - 2; i++) {
            const pcurrX = mmToPx(pts[i].x - drawing.x);
            const pcurrY = mmToPx(pts[i].y - drawing.y);
            const pnextX = mmToPx(pts[i + 1].x - drawing.x);
            const pnextY = mmToPx(pts[i + 1].y - drawing.y);
            const xc = (pcurrX + pnextX) / 2;
            const yc = (pcurrY + pnextY) / 2;
            pathData += ` Q ${pcurrX},${pcurrY} ${xc},${yc}`;
          }
          // For the last 2 points
          const plast1X = mmToPx(pts[i].x - drawing.x);
          const plast1Y = mmToPx(pts[i].y - drawing.y);
          const plast2X = mmToPx(pts[i + 1].x - drawing.x);
          const plast2Y = mmToPx(pts[i + 1].y - drawing.y);
          pathData += ` Q ${plast1X},${plast1Y} ${plast2X},${plast2Y}`;
        }
      }

      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${widthPx} ${heightPx}`} style={{ overflow: 'visible' }}>
          <path
            d={pathData}
            fill="none"
            stroke={drawing.stroke}
            strokeWidth={drawing.strokeWidth}
            strokeLinecap={drawing.lineCap}
            strokeLinejoin={drawing.lineJoin}
            opacity={drawing.opacity}
          />
        </svg>
      );
    }

    case 'group': {
      const group = element as any;
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
          {group.elements.map((child: any) => (
            <div
              key={child.id}
              style={{
                position: 'absolute',
                left: `${mmToPx(child.x)}px`,
                top: `${mmToPx(child.y)}px`,
                width: `${mmToPx(child.width)}px`,
                height: `${mmToPx(child.height)}px`,
                transform: `rotate(${child.rotation}deg)`,
                zIndex: child.zIndex,
                display: child.visible ? 'block' : 'none',
                boxSizing: 'border-box',
              }}
            >
              <ElementRenderer
                element={child}
                isEditing={false}
                onTextBlur={onTextBlur}
                onTableBlur={onTableBlur}
              />
            </div>
          ))}
        </div>
      );
    }

    case 'chart': {
      return (
        <div style={pageElementStyle}>
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
        ...pageElementStyle,
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
            draggable={false}
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
        <div style={{ ...pageElementStyle, backgroundColor: qrEl.backgroundColor || '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
