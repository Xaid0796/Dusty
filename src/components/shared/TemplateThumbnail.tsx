'use client';

import React, { useRef, useState, useEffect } from 'react';
import { TemplateDefinition } from '@/templates/index';
import { sampleTemplates } from '@/templates/registry';
import { ElementRenderer } from '@/components/shared/ElementRenderer';
import { mmToPx } from '@/canvas/utils';

interface ThumbnailProps {
  template: TemplateDefinition;
}

export const TemplateThumbnail: React.FC<ThumbnailProps> = ({ template }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.28);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.clientWidth;
      // Target width of standard A4 canvas is 794px
      const newScale = parentWidth / 794;
      setScale(newScale > 0 ? newScale : 0.28);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const TemplateComponent = template.Component;
  const canvasDoc = sampleTemplates[template.id];
  // Prefer the canvas document thumbnail (the source the Admin Builder updates
  // when a user uploads a new thumbnail). Fall back to the metadata registry path.
  const thumbnailSrc = canvasDoc?.thumbnail || template.thumbnail;

  if (thumbnailSrc) {
    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '280px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          userSelect: 'none',
        }}
      >
        <img
          src={thumbnailSrc}
          alt={template.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
          }}
        />
        {canvasDoc && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: '10px', fontWeight: 700, color: '#ffffff', background: '#22c55e', padding: '2px 8px', borderRadius: '4px', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
            {canvasDoc.pageCount || 1} {canvasDoc.pageCount === 1 ? 'PAGE' : 'PAGES'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '280px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: '794px',
          height: '1123px',
          flexShrink: 0,
          pointerEvents: 'none', // Prevent form fields inside thumbnail from stealing click/focus
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: '-397px',
          marginTop: '-561.5px',
          backgroundColor: canvasDoc ? canvasDoc.page.background : '#ffffff',
        }}
      >
        {canvasDoc ? (
          canvasDoc.elements.map((el) => {
            const pxX = mmToPx(el.x);
            const pxY = mmToPx(el.y);
            const pxW = mmToPx(el.width);
            const pxH = mmToPx(el.height);
            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: `${pxX}px`,
                  top: `${pxY}px`,
                  width: `${pxW}px`,
                  height: `${pxH}px`,
                  transform: `rotate(${el.rotation}deg)`,
                  zIndex: el.zIndex,
                  visibility: el.visible ? 'visible' : 'hidden',
                  boxSizing: 'border-box',
                }}
              >
                <ElementRenderer
                  key={el.id}
                  element={el}
                  isEditing={false}
                  onTextBlur={() => { }}
                  isThumbnail={true}
                />
              </div>
            );
          })
        ) : (
          <TemplateComponent data={template.defaultData} />
        )}
        {canvasDoc && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: '10px', fontWeight: 600, color: '#64748b', background: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: '4px', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            {canvasDoc.pageCount || 1} {canvasDoc.pageCount === 1 ? 'Page' : 'Pages'}
          </div>
        )}
      </div>
    </div>
  );
};
