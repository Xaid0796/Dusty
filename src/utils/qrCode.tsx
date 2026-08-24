import React from 'react';
import QRCode from 'qrcode';
import { QRCodeDesignPreset } from '@/canvas/types';

// Helper to check luminance contrast for warning
export const checkQRContrast = (fg: string, bg: string): boolean => {
  const getLuminance = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    const a = [r, g, b].map((v) => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  try {
    const l1 = getLuminance(fg);
    const l2 = getLuminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return ratio >= 3.0; // standard contrast ratio limit for QR code scanning
  } catch {
    return true; // fallback
  }
};

interface QRRenderOptions {
  content: string;
  preset: QRCodeDesignPreset;
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
}

export const generateQRPathData = (options: QRRenderOptions) => {
  const { content, preset, foregroundColor, backgroundColor, margin } = options;

  let qr;
  try {
    qr = QRCode.create(content || 'https://example.com', { errorCorrectionLevel: 'M' });
  } catch (err) {
    // fallback if content is too long for M level
    qr = QRCode.create('https://example.com', { errorCorrectionLevel: 'L' });
  }

  const size = qr.modules.size;
  const quietZone = margin;
  const totalSize = size + quietZone * 2;

  const isFinder = (r: number, c: number): boolean => {
    if (r < 7 && c < 7) return true; // Top-left
    if (r < 7 && c >= size - 7) return true; // Top-right
    if (r >= size - 7 && c < 7) return true; // Bottom-left
    return false;
  };

  const getFinderSVG = (x: number, y: number): React.ReactNode[] => {
    const key = `${x}-${y}`;
    switch (preset) {
      case 'rounded':
      case 'modern':
      case 'elegant':
        return [
          <rect key={`${key}-o`} x={x} y={y} width="7" height="7" rx="1.8" ry="1.8" fill={foregroundColor} />,
          <rect key={`${key}-i`} x={x + 1} y={y + 1} width="5" height="5" rx="1.2" ry="1.2" fill={backgroundColor} />,
          <rect key={`${key}-c`} x={x + 2} y={y + 2} width="3" height="3" rx="0.6" ry="0.6" fill={foregroundColor} />
        ];
      case 'rounded-dots':
      case 'dots':
        return [
          <circle key={`${key}-o`} cx={x + 3.5} cy={y + 3.5} r="3.2" fill={foregroundColor} />,
          <circle key={`${key}-i`} cx={x + 3.5} cy={y + 3.5} r="2.2" fill={backgroundColor} />,
          <circle key={`${key}-c`} cx={x + 3.5} cy={y + 3.5} r="1.3" fill={foregroundColor} />
        ];
      case 'professional':
        return [
          <path key={`${key}-o`} d={`M ${x+2} ${y} L ${x+5} ${y} L ${x+7} ${y+2} L ${x+7} ${y+5} L ${x+5} ${y+7} L ${x+2} ${y+7} L ${x} ${y+5} L ${x} ${y+2} Z`} fill={foregroundColor} />,
          <path key={`${key}-i`} d={`M ${x+2.3} ${y+1} L ${x+4.7} ${y+1} L ${x+6} ${y+2.3} L ${x+6} ${y+4.7} L ${x+4.7} ${y+6} L ${x+2.3} ${y+6} L ${x+1} ${y+4.7} L ${x+1} ${y+2.3} Z`} fill={backgroundColor} />,
          <rect key={`${key}-c`} x={x + 2} y={y + 2} width="3" height="3" rx="0.5" ry="0.5" fill={foregroundColor} />
        ];
      case 'minimal':
        return [
          <rect key={`${key}-o`} x={x} y={y} width="7" height="7" fill="none" stroke={foregroundColor} strokeWidth="1" />,
          <rect key={`${key}-c`} x={x + 2} y={y + 2} width="3" height="3" fill={foregroundColor} />
        ];
      case 'bold':
        return [
          <rect key={`${key}-o`} x={x} y={y} width="7" height="7" rx="0.5" ry="0.5" fill={foregroundColor} />,
          <rect key={`${key}-i`} x={x + 1} y={y + 1} width="5" height="5" fill={backgroundColor} />,
          <rect key={`${key}-c`} x={x + 1.5} y={y + 1.5} width="4" height="4" fill={foregroundColor} />
        ];
      case 'framed':
        return [
          <rect key={`${key}-o`} x={x} y={y} width="7" height="7" fill="none" stroke={foregroundColor} strokeWidth="0.8" />,
          <rect key={`${key}-c`} x={x + 2} y={y + 2} width="3" height="3" fill={foregroundColor} />
        ];
      case 'classic':
      default:
        return [
          <rect key={`${key}-o`} x={x} y={y} width="7" height="7" fill={foregroundColor} />,
          <rect key={`${key}-i`} x={x + 1} y={y + 1} width="5" height="5" fill={backgroundColor} />,
          <rect key={`${key}-c`} x={x + 2} y={y + 2} width="3" height="3" fill={foregroundColor} />
        ];
    }
  };

  const drawModules = (): React.ReactNode[] => {
    const list: React.ReactNode[] = [];
    
    // 1. Draw the finder patterns
    list.push(...getFinderSVG(quietZone, quietZone));
    list.push(...getFinderSVG(quietZone + size - 7, quietZone));
    list.push(...getFinderSVG(quietZone, quietZone + size - 7));

    // 2. Draw the timing, data, and alignment modules
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (isFinder(r, c)) continue;
        if (qr.modules.get(r, c)) {
          const x = quietZone + c;
          const y = quietZone + r;
          const key = `cell-${r}-${c}`;

          switch (preset) {
            case 'dots':
            case 'rounded-dots':
              list.push(<circle key={key} cx={x + 0.5} cy={y + 0.5} r="0.36" fill={foregroundColor} />);
              break;
            case 'minimal':
              list.push(<rect key={key} x={x + 0.15} y={y + 0.15} width="0.7" height="0.7" fill={foregroundColor} />);
              break;
            case 'rounded':
            case 'modern':
              list.push(<rect key={key} x={x} y={y} width="1.02" height="1.02" rx="0.35" ry="0.35" fill={foregroundColor} />);
              break;
            case 'elegant':
              list.push(<circle key={key} cx={x + 0.5} cy={y + 0.5} r="0.28" fill={foregroundColor} />);
              break;
            case 'bold':
              list.push(<rect key={key} x={x - 0.05} y={y - 0.05} width="1.1" height="1.1" fill={foregroundColor} />);
              break;
            case 'classic':
            case 'professional':
            case 'framed':
            default:
              list.push(<rect key={key} x={x} y={y} width="1" height="1" fill={foregroundColor} />);
              break;
          }
        }
      }
    }
    return list;
  };

  return {
    totalSize,
    modules: drawModules(),
  };
};
