import React from 'react';

interface PreviewWatermarkProps {
  text?: string;
  opacity?: number;
}

export const PreviewWatermark: React.FC<PreviewWatermarkProps> = ({
  text = 'DOCXUME • PREVIEW',
  opacity = 0.06
}) => {
  // Use a repeated SVG pattern as a background image
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <text 
        x="0" 
        y="120" 
        fill="rgba(15, 23, 42, ${opacity})" 
        font-family="system-ui, sans-serif" 
        font-size="11" 
        font-weight="bold" 
        transform="rotate(-30 60 120)"
      >
        ${text}
      </text>
    </svg>
  `;

  // Encode SVG safely for CSS background usage (cross-platform URL encoding)
  const encodedSvg = encodeURIComponent(svgString.trim());
  const backgroundUrl = `url("data:image/svg+xml;utf8,${encodedSvg}")`;

  return (
    <div 
      className="preview-watermark-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 99,
        backgroundImage: backgroundUrl,
        backgroundRepeat: 'repeat',
      }}
    />
  );
};
