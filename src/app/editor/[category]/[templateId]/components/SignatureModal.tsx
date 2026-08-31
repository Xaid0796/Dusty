'use client';
import React, { useRef, useState, useEffect } from 'react';
import { X, Edit2, Type } from 'lucide-react';
import styles from '../editor.module.css';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSignature: (dataUrl: string, width: number, height: number) => void;
}

const COLOR_PRESETS = [
  { label: 'Black', value: '#0f172a' },
  { label: 'Blue', value: '#1e3a8a' },
  { label: 'Red', value: '#b91c1c' },
  { label: 'Purple', value: '#6d28d9' },
];

const SIGNATURE_FONTS = [
  'Alex Brush',
  'Dancing Script',
  'Great Vibes',
  'Mrs Saint Delafield',
  'Monsieur La Doulaise',
  'Pinyon Script',
];

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onAddSignature,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type'>('draw');
  const [selectedColor, setSelectedColor] = useState('#0f172a');
  const [selectedFont, setSelectedFont] = useState('Great Vibes');
  const [typedName, setTypedName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas with correct sizing
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2; // high-DPI scaling
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = 2.4;
      }
    }
  }, [activeTab, isOpen]);

  // Sync color changes to canvas context
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.strokeStyle = selectedColor;
    }
  }, [selectedColor]);

  if (!isOpen) return null;

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSave = () => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;

      // Trim empty space around signature
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
      let hasContent = false;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const alpha = imgData.data[(y * canvas.width + x) * 4 + 3];
          if (alpha > 10) {
            hasContent = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (!hasContent) return; // Empty canvas

      // Add padding
      const pad = 12;
      minX = Math.max(0, minX - pad);
      maxX = Math.min(canvas.width, maxX + pad);
      minY = Math.max(0, minY - pad);
      maxY = Math.min(canvas.height, maxY + pad);

      const tw = maxX - minX;
      const th = maxY - minY;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = tw;
      tempCanvas.height = th;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, minX, minY, tw, th, 0, 0, tw, th);
        const dataUrl = tempCanvas.toDataURL('image/png');
        onAddSignature(dataUrl, Number((tw / 6).toFixed(1)), Number((th / 6).toFixed(1)));
        onClose();
        clearCanvas();
      }
    } else if (activeTab === 'type' && typedName.trim()) {
      // Render text preset to PNG
      const text = typedName.trim();
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 600;
      tempCanvas.height = 150;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'middle';
        ctx.fillStyle = selectedColor;
        ctx.font = `normal italic 72px "${selectedFont}", cursive`;

        const measure = ctx.measureText(text);
        const textWidth = Math.ceil(measure.width);

        // Resize canvas to text dimension with padding
        const pad = 24;
        tempCanvas.width = textWidth + pad * 2;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = selectedColor;
        ctx.font = `normal italic 72px "${selectedFont}", cursive`;
        ctx.fillText(text, pad, 75);

        const dataUrl = tempCanvas.toDataURL('image/png');
        onAddSignature(dataUrl, Number(((textWidth + pad * 2) / 6).toFixed(1)), 25);
        onClose();
        setTypedName('');
      }
    }
  };

  return (
    <div className={styles.modalOverlay} style={{ zIndex: 99999 }}>
      <div className={`${styles.modalContent} ${styles.signatureModalContent}`} style={{ maxWidth: 440, background: 'var(--bg-panel)', color: 'var(--text-panel)', border: '1px solid var(--border-panel)', padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Edit2 size={18} style={{ color: 'var(--primary-color)' }} />
            Add Signature
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-panel-muted)', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, background: 'var(--bg-panel-input)', padding: 4, borderRadius: 8, marginBottom: 16, border: '1px solid var(--border-panel)' }}>
          <button
            onClick={() => setActiveTab('draw')}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: activeTab === 'draw' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'draw' ? '#fff' : 'var(--text-panel-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Edit2 size={14} />
            Draw
          </button>
          <button
            onClick={() => setActiveTab('type')}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: activeTab === 'type' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'type' ? '#fff' : 'var(--text-panel-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Type size={14} />
            Type
          </button>
        </div>

        {/* Presets Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-panel-muted)', fontWeight: 600 }}>Ink Color</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                style={{
                  width: 22, height: 22, borderRadius: '50%', border: selectedColor === color.value ? '2px solid var(--text-panel)' : '1px solid var(--border-panel)',
                  background: color.value, cursor: 'pointer', transition: 'all 0.1s ease', transform: selectedColor === color.value ? 'scale(1.1)' : 'scale(1)'
                }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'draw' ? (
          <div>
            <div style={{ position: 'relative', border: '1px solid var(--border-panel)', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
              <canvas
                ref={canvasRef}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
                className={styles.signatureCanvas}
              />
              <button
                onClick={clearCanvas}
                style={{
                  position: 'absolute', right: 8, bottom: 8,
                  background: 'rgba(15,23,42,0.8)', color: '#fff', border: 'none',
                  borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', transition: 'background 0.15s'
                }}
              >
                Clear
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-panel-muted)', marginTop: 6, margin: '6px 0 0 0', textAlign: 'center' }}>
              Sign inside the white box above using mouse or touch.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="Type your name..."
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                style={{
                  width: '100%', background: 'var(--bg-panel-input)', border: '1px solid var(--border-panel)',
                  borderRadius: 6, padding: '10px 12px', color: 'var(--text-panel)', fontSize: 14, outline: 'none'
                }}
                maxLength={25}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', border: '1px solid var(--border-panel)', borderRadius: 8, padding: 6, background: 'var(--bg-panel-input)' }}>
                {SIGNATURE_FONTS.map((font) => (
                  <button
                    key={font}
                    onClick={() => setSelectedFont(font)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', border: 'none', borderRadius: 6, cursor: 'pointer',
                      background: selectedFont === font ? 'var(--bg-popover-active)' : 'transparent',
                      color: selectedFont === font ? 'var(--text-popover-active)' : 'var(--text-panel)',
                      transition: 'all 0.1s ease', textAlign: 'left', width: '100%'
                    }}
                  >
                    <span style={{ fontFamily: font, fontSize: 20 }}>
                      {typedName.trim() || 'Signature Preview'}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-panel-muted)', fontFamily: 'Inter' }}>{font}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border-panel)', color: 'var(--text-panel)',
              padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={activeTab === 'type' && !typedName.trim()}
            style={{
              background: 'var(--primary-color)', border: 'none', color: '#fff',
              padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
              boxShadow: '0 2px 8px rgba(99,102,241,0.2)', opacity: (activeTab === 'type' && !typedName.trim()) ? 0.5 : 1
            }}
          >
            Add to Canvas
          </button>
        </div>
      </div>
    </div>
  );
};
