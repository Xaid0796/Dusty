'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useCanvasStore } from '@/canvas/store';
import { ImageElement } from '@/canvas/types';
import styles from '../../../../generator/generator.module.css'; // Reuse generator styles for exact match

export const ImageCropModal: React.FC = () => {
  const { document: doc, croppingId, setCroppingId, updateElement, saveHistory } = useCanvasStore();
  const element = doc?.elements.find((el) => el.id === croppingId) as any;

  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  // Calculate cropping window/frame size based on selected element's aspect ratio
  const frameGeometry = React.useMemo(() => {
    if (!element) return { width: 160, height: 160 };
    const elementRatio = element.width / Math.max(1, element.height);
    let width = 160;
    let height = 160;
    if (elementRatio > 1) {
      height = 160 / elementRatio;
    } else {
      width = 160 * elementRatio;
    }
    return { width, height };
  }, [element]);

  // Load/reset state when modal opens
  useEffect(() => {
    if (element) {
      setCropZoom(1);
      setCropOffset({ x: 0, y: 0 });
      setNaturalSize({ width: 0, height: 0 });
      setDisplaySize({ width: 0, height: 0 });
    }
  }, [element?.id]);

  // Lock background scroll + suppress pull-to-refresh while the crop modal is open (mobile)
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  if (!element || (element.type !== 'image' && element.type !== 'frame')) return null;

  const imageSource = (element as any).originalSrc || (element as any).src;

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });

    // Scale image to cover the frame (object-fit: cover logic)
    const baseScale = Math.max(frameGeometry.width / naturalWidth, frameGeometry.height / naturalHeight);
    const displayW = naturalWidth * baseScale;
    const displayH = naturalHeight * baseScale;

    setDisplaySize({ width: displayW, height: displayH });

    // Centered initially
    setCropOffset({
      x: (frameGeometry.width - displayW) / 2,
      y: (frameGeometry.height - displayH) / 2
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - cropOffset.x, y: clientY - cropOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !displaySize.width) return;
    if ('touches' in e) e.preventDefault(); // stop background scroll / pull-to-refresh while dragging
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const nextX = clientX - dragStart.x;
    const nextY = clientY - dragStart.y;

    // Enforce cover constraints (image cannot slide out of the frame)
    const dw = displaySize.width * cropZoom;
    const dh = displaySize.height * cropZoom;

    const minX = frameGeometry.width - dw;
    const minY = frameGeometry.height - dh;

    // Since minX/minY is negative or 0, we clamp between minX and 0
    const clampedX = Math.max(minX, Math.min(0, nextX));
    const clampedY = Math.max(minY, Math.min(0, nextY));

    setCropOffset({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Enforce boundaries when zooming
  const handleZoomChange = (newZoom: number) => {
    const nextZoom = Math.max(1, Math.min(4, newZoom));
    setCropZoom(nextZoom);

    // Re-clamp offsets with the new size
    const dw = displaySize.width * nextZoom;
    const dh = displaySize.height * nextZoom;

    const minX = frameGeometry.width - dw;
    const minY = frameGeometry.height - dh;

    setCropOffset((prev) => ({
      x: Math.max(minX, Math.min(0, prev.x)),
      y: Math.max(minY, Math.min(0, prev.y))
    }));
  };

  const handleApply = () => {
    if (!naturalSize.width || !displaySize.width) return;

    const img = new Image();
    img.onload = () => {
      // 1. Compute how the rendered image maps to the natural image
      const dw = displaySize.width * cropZoom;
      const dh = displaySize.height * cropZoom;

      // Calculate crop box coords in the scaled frame space
      const dx = -cropOffset.x;
      const dy = -cropOffset.y;

      // Scale factor from scaled frame space back to natural image space
      const sf = naturalSize.width / dw;

      const sx = dx * sf;
      const sy = dy * sf;
      const sw = frameGeometry.width * sf;
      const sh = frameGeometry.height * sf;

      // Clamp dimensions to make sure we don't go out of bounds on natural image
      const clampedSx = Math.max(0, Math.min(naturalSize.width, sx));
      const clampedSy = Math.max(0, Math.min(naturalSize.height, sy));
      const clampedSw = Math.max(1, Math.min(naturalSize.width - clampedSx, sw));
      const clampedSh = Math.max(1, Math.min(naturalSize.height - clampedSy, sh));

      // 2. Draw cropped region to canvas at high resolution
      const canvas = document.createElement('canvas');
      canvas.width = clampedSw;
      canvas.height = clampedSh;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        if (element.backgroundColor) {
          ctx.fillStyle = element.backgroundColor;
          ctx.fillRect(0, 0, clampedSw, clampedSh);
        }
        ctx.drawImage(img, clampedSx, clampedSy, clampedSw, clampedSh, 0, 0, clampedSw, clampedSh);
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.90);

        saveHistory();
        updateElement(element.id, {
          src: croppedDataUrl,
          originalSrc: imageSource, // Retain/cache original for future re-crops
          cropX: 50,
          cropY: 50,
          zoom: 1
        });

        setCroppingId(null);
      }
    };
    img.src = imageSource;
  };

  return (
    <div className={styles.modalOverlay} style={{ zIndex: 99999, overscrollBehavior: 'none' }}>
      <div className={styles.modalContent} style={{ maxWidth: 360, maxHeight: '85vh', overflowY: 'auto', overscrollBehavior: 'none', background: 'var(--bg-panel)', color: 'var(--text-panel)', border: '1px solid var(--border-panel)', padding: 14 }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: 16, fontWeight: 700, color: 'var(--text-panel)' }}>Adjust Photo</h3>

        <div
          style={{
            width: frameGeometry.width,
            height: frameGeometry.height,
            overflow: 'hidden',
            borderRadius: (element.shape === 'circle' || element.shape === 'ellipse')
              ? '50%'
              : (element.borderRadius > 50 ? '50%' : `${element.borderRadius}px`),
            border: '2px solid var(--border-panel)',
            margin: '10px auto',
            position: 'relative',
            cursor: isDragging ? 'grabbing' : 'grab',
            background: '#0f172a',
            touchAction: 'none',
            overscrollBehavior: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSource}
            alt="Crop preview"
            draggable={false}
            onLoad={onImageLoad}
            style={{
              position: 'absolute',
              left: cropOffset.x,
              top: cropOffset.y,
              width: displaySize.width ? displaySize.width * cropZoom : 'auto',
              height: displaySize.height ? displaySize.height * cropZoom : 'auto',
              pointerEvents: 'none',
              userSelect: 'none',
              transform: `scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* Zoom control */}
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            style={{ background: 'var(--bg-panel-btn)', border: 'none', color: 'var(--text-panel)', padding: 6, borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
            onClick={() => handleZoomChange(cropZoom - 0.1)}
          >
            <ZoomOut size={14} />
          </button>
          <input
            type="range"
            min="1"
            max="4"
            step="0.05"
            value={cropZoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--primary-color)', cursor: 'pointer' }}
          />
          <button
            style={{ background: 'var(--bg-panel-btn)', border: 'none', color: 'var(--text-panel)', padding: 6, borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
            onClick={() => handleZoomChange(cropZoom + 0.1)}
          >
            <ZoomIn size={14} />
          </button>
        </div>

        <div className={styles.modalActions} style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            style={{ background: 'transparent', border: '1px solid var(--border-panel)', color: 'var(--text-panel)', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
            onClick={() => setCroppingId(null)}
          >
            Cancel
          </button>
          <button
            style={{ background: 'var(--primary-color)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
            onClick={handleApply}
          >
            Save Crop
          </button>
        </div>
      </div>
    </div>
  );
};
