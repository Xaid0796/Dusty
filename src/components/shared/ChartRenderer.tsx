'use client';
import React from 'react';
import { ChartElement } from '@/canvas/types';

interface ChartRendererProps {
  element: ChartElement;
}

// Color palettes for the 10 designs
const PALETTES: Record<string, string[]> = {
  'design-1': ['#3b82f6', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'], // Classic Minimal
  'design-2': ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'], // Donut Tech
  'design-3': ['#38bdf8', '#f43f5e', '#a855f7', '#fbbf24', '#34d399', '#f472b6'], // Neon Dark / Cyberpunk
  'design-4': ['#c2410c', '#15803d', '#b45309', '#1e3a8a', '#701a75', '#a21caf'], // Warm Earthy
  'design-5': ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'], // Elegant Monochromatic
  'design-6': ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.85)'], // Glassmorphism / Frost
  'design-7': ['#dc2626', '#eab308', '#2563eb', '#16a34a', '#d97706', '#9333ea'], // Comic Bold
  'design-8': ['#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'], // Slate Corporate
  'design-9': ['#f43f5e', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'], // Material / Soft Shadow
  'design-10': ['#818cf8', '#34d399', '#fb7185', '#fb923c', '#60a5fa', '#c084fc'], // Pastel Luxe
};

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const getDonutPath = (cx: number, cy: number, rOut: number, rIn: number, startAngle: number, endAngle: number) => {
  let angle = endAngle - startAngle;
  if (angle >= 360) angle = 359.99;
  const end = startAngle + angle;
  const startOuter = polarToCartesian(cx, cy, rOut, startAngle);
  const endOuter = polarToCartesian(cx, cy, rOut, end);
  const startInner = polarToCartesian(cx, cy, rIn, startAngle);
  const endInner = polarToCartesian(cx, cy, rIn, end);
  const largeArc = angle > 180 ? 1 : 0;
  return `
    M ${startOuter.x} ${startOuter.y}
    A ${rOut} ${rOut} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}
    L ${endInner.x} ${endInner.y}
    A ${rIn} ${rIn} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}
    Z
  `;
};

export const ChartRenderer: React.FC<{ element: ChartElement }> = ({ element }) => {
  const { chartType, designPreset = 'design-1', data = [], showLegend = true, showValues = true, showLabels = true } = element;

  // Cast preset to string to avoid literal narrowing compile errors
  const preset = (PALETTES[designPreset] ? designPreset : 'design-1') as string;
  const colors = PALETTES[preset];

  // Specific Design Features
  const isNeonDark = preset === 'design-3';
  const isComic = preset === 'design-7';
  const isGlass = preset === 'design-6';
  const isSlate = preset === 'design-8';
  const hasShadow = preset === 'design-9';

  // Card Background & Typography Style
  const chartBg = isGlass ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
  const fontStyle = isComic ? 'Impact, sans-serif' : isNeonDark ? 'Courier New, monospace' : 'inherit';
  const textFill = isGlass ? '#ffffff' : '#0f172a';
  const strokeColor = isComic ? '#000000' : isGlass ? 'rgba(255,255,255,0.4)' : '#ffffff';
  const strokeWidth = isComic ? 2.5 : isGlass ? 0.75 : 1;

  // Filter out invalid items
  const validData = data.filter((d) => d && typeof d.value === 'number');
  const totalValue = validData.reduce((sum, d) => sum + d.value, 0) || 1;
  const maxValue = Math.max(...validData.map((d) => d.value), 1);

  // Render Pie
  const renderPie = () => {
    let currentAngle = 0;

    // Only presets 2, 5, 6, 10 use Donut style. Preset 1 (default) and others use standard Pie chart!
    const isDonut = ['design-2', 'design-5', 'design-6', 'design-10'].includes(preset);
    const hasGaps = preset === 'design-7' || preset === 'design-4';

    return validData.map((item, index) => {
      const sliceAngle = (item.value / totalValue) * 360;
      const startAngle = currentAngle;
      const endAngle = startAngle + sliceAngle;
      currentAngle = endAngle;

      const color = colors[index % colors.length];

      const rOut = 40;
      const rIn = isDonut ? 24 : 0;

      const gapAngle = hasGaps ? 2.5 : 0;
      const adjustedStart = startAngle + gapAngle;
      const adjustedEnd = endAngle - gapAngle;

      let dPath = '';
      if (rIn > 0) {
        dPath = getDonutPath(50, 50, rOut, rIn, adjustedStart, adjustedEnd);
      } else {
        const startPt = polarToCartesian(50, 50, rOut, adjustedStart);
        const endPt = polarToCartesian(50, 50, rOut, adjustedEnd);
        const largeArc = sliceAngle > 180 ? 1 : 0;
        dPath = `M 50 50 L ${startPt.x} ${startPt.y} A ${rOut} ${rOut} 0 ${largeArc} 1 ${endPt.x} ${endPt.y} Z`;
      }

      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = isDonut ? 32 : 24;
      const labelPt = polarToCartesian(50, 50, labelRadius, midAngle);

      return (
        <g key={item.label + index}>
          <path
            d={dPath}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            filter={hasShadow ? 'url(#chart-shadow)' : undefined}
          />
          {showLabels && sliceAngle > 20 && (
            <text
              x={labelPt.x}
              y={labelPt.y}
              fill={isGlass ? '#ffffff' : isNeonDark ? '#ffffff' : '#ffffff'}
              fontSize="3.5"
              fontWeight="bold"
              fontFamily={fontStyle}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {item.label}
            </text>
          )}
          {showValues && sliceAngle > 20 && !showLabels && (
            <text
              x={labelPt.x}
              y={labelPt.y}
              fill={isGlass ? '#ffffff' : isNeonDark ? '#ffffff' : '#ffffff'}
              fontSize="3.5"
              fontWeight="bold"
              fontFamily={fontStyle}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {item.value}
            </text>
          )}
        </g>
      );
    });
  };

  // Render Bar
  const renderBar = () => {
    // Preset 4 uses horizontal bars, preset 8 uses slate columns, preset 3 uses neon sticks, etc.
    const isHorizontal = preset === 'design-4';
    const isMinimal = preset === 'design-3';

    const count = validData.length;
    const padding = 15;
    const chartArea = 70;

    return validData.map((item, index) => {
      const color = colors[index % colors.length];

      if (isHorizontal) {
        // Horizontal Bar layout
        const barHeight = Math.max(3, (chartArea / count) * 0.6);
        const y = padding + index * (chartArea / count) + (chartArea / count - barHeight) / 2;
        const barWidth = (item.value / maxValue) * chartArea;
        const x = 15;

        // Round corners for design-2 and design-10
        const rx = ['design-2', 'design-10'].includes(preset) ? 2.5 : 0;
        const barPath = rx > 0
          ? `M ${x} ${y} L ${x + barWidth - rx} ${y} Q ${x + barWidth} ${y} ${x + barWidth} ${y + rx} L ${x + barWidth} ${y + barHeight - rx} Q ${x + barWidth} ${y + barHeight} ${x + barWidth - rx} ${y + barHeight} L ${x} ${y + barHeight} Z`
          : `M ${x} ${y} L ${x + barWidth} ${y} L ${x + barWidth} ${y + barHeight} L ${x} ${y + barHeight} Z`;

        return (
          <g key={item.label + index}>
            <path
              d={barPath}
              fill={color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              filter={hasShadow ? 'url(#chart-shadow)' : undefined}
            />
            {showLabels && (
              <text
                x="12"
                y={y + barHeight / 2}
                fill={textFill}
                fontSize="3.2"
                fontFamily={fontStyle}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {item.label}
              </text>
            )}
            {showValues && (
              <text
                x={x + barWidth + 3}
                y={y + barHeight / 2}
                fill={textFill}
                fontSize="3.2"
                fontWeight="bold"
                fontFamily={fontStyle}
                textAnchor="start"
                dominantBaseline="middle"
              >
                {item.value}
              </text>
            )}
          </g>
        );
      } else {
        // Vertical Bar layout
        const barWidth = Math.max(3, (chartArea / count) * 0.6);
        const x = padding + index * (chartArea / count) + (chartArea / count - barWidth) / 2;
        const barHeight = (item.value / maxValue) * 55;
        const baseLine = 80;
        const y = baseLine - barHeight;

        // Custom rounded tops
        const ry = ['design-2', 'design-8', 'design-9', 'design-10'].includes(preset) ? 3 : 0;
        const barPath = ry > 0
          ? `M ${x} ${baseLine} L ${x} ${y + ry} Q ${x} ${y} ${x + ry} ${y} L ${x + barWidth - ry} ${y} Q ${x + barWidth} ${y} ${x + barWidth} ${y + ry} L ${x + barWidth} ${baseLine} Z`
          : `M ${x} ${baseLine} L ${x} ${y} L ${x + barWidth} ${y} L ${x + barWidth} ${baseLine} Z`;

        return (
          <g key={item.label + index}>
            {isMinimal ? (
              // Minimal neon sticks
              <>
                <line
                  x1={x + barWidth / 2}
                  y1={baseLine}
                  x2={x + barWidth / 2}
                  y2={y}
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx={x + barWidth / 2} cy={y} r="4" fill={color} />
              </>
            ) : (
              <path
                d={barPath}
                fill={color}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                filter={hasShadow ? 'url(#chart-shadow)' : undefined}
              />
            )}
            {showLabels && (
              <text
                x={x + barWidth / 2}
                y={baseLine + 4}
                fill={textFill}
                fontSize="3.2"
                fontFamily={fontStyle}
                textAnchor="middle"
                dominantBaseline="hanging"
              >
                {item.label}
              </text>
            )}
            {showValues && (
              <text
                x={x + barWidth / 2}
                y={y - 3.5}
                fill={textFill}
                fontSize="3.2"
                fontWeight="bold"
                fontFamily={fontStyle}
                textAnchor="middle"
              >
                {item.value}
              </text>
            )}
          </g>
        );
      }
    });
  };

  // Render Line
  const renderLine = () => {
    const count = validData.length;
    const padding = 15;
    const chartArea = 70;
    const baseLine = 80;

    const points = validData.map((item, index) => {
      const x = padding + index * (chartArea / (count - 1 || 1));
      const y = baseLine - (item.value / maxValue) * 55;
      return { x, y, label: item.label, value: item.value };
    });

    if (points.length === 0) return null;

    const isSmooth = ['design-1', 'design-3', 'design-6', 'design-9', 'design-10'].includes(preset);
    const isStep = preset === 'design-2';
    const isArea = ['design-3', 'design-5', 'design-6'].includes(preset);

    // Path construction
    let pathD = '';
    if (isStep) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i - 1].y} L ${points[i].x} ${points[i].y}`;
      }
    } else if (isSmooth && points.length > 2) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
    } else {
      pathD = `M ${points[0].x} ${points[0].y}` + points.slice(1).map((p) => ` L ${p.x} ${p.y}`).join('');
    }

    const lineColor = colors[0];
    let areaPathD = '';
    if (isArea) {
      areaPathD = `${pathD} L ${points[points.length - 1].x} ${baseLine} L ${points[0].x} ${baseLine} Z`;
    }

    return (
      <g>
        {isArea && (
          <path
            d={areaPathD}
            fill={isGlass ? 'rgba(255,255,255,0.12)' : `url(#line-area-grad-${preset})`}
            stroke="none"
          />
        )}

        {/* Retro offset shadow line for Comic design */}
        {isComic && (
          <path
            d={pathD}
            fill="none"
            stroke="#000000"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(1.5, 1.5)"
          />
        )}

        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth={isComic ? '3' : preset === 'design-8' ? '1.5' : '2.5'}
          strokeDasharray={preset === 'design-8' ? '3 3' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={hasShadow ? 'url(#chart-shadow)' : undefined}
        />

        {points.map((pt, index) => {
          const pointColor = colors[index % colors.length] || lineColor;
          return (
            <g key={index}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isComic ? '4.5' : '3'}
                fill={isComic ? '#ffffff' : pointColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              {showLabels && (
                <text
                  x={pt.x}
                  y={baseLine + 4}
                  fill={textFill}
                  fontSize="3.2"
                  fontFamily={fontStyle}
                  textAnchor="middle"
                  dominantBaseline="hanging"
                >
                  {pt.label}
                </text>
              )}
              {showValues && (
                <text
                  x={pt.x}
                  y={pt.y - 4}
                  fill={textFill}
                  fontSize="3.2"
                  fontWeight="bold"
                  fontFamily={fontStyle}
                  textAnchor="middle"
                >
                  {pt.value}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  // Render Legend
  const renderLegend = () => {
    if (!showLegend) return null;

    // Distinct legend layout based on preset (Comic gets boxed legend, Glass gets frosted, Slate gets list)
    const legendStyle: React.CSSProperties = isComic
      ? { border: '2px solid #000', padding: '6px 12px', background: '#fff', borderRadius: '4px', boxShadow: '3px 3px 0 #000' }
      : isSlate
      ? { background: '#f8fafc', padding: '6px 10px', borderRadius: '4px' }
      : isGlass
      ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '8px' }
      : {};

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '8px',
          fontSize: '7pt',
          color: textFill,
          fontFamily: fontStyle,
          width: '90%',
          boxSizing: 'border-box',
          ...legendStyle,
        }}
      >
        {validData.map((item, index) => {
          const color = colors[index % colors.length];
          return (
            <div key={item.label + index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: isComic ? '0' : '50%',
                  backgroundColor: color,
                  border: isComic ? '1.5px solid #000' : 'none',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontWeight: isComic ? 900 : 500 }}>{item.label}</span>
              <span style={{ opacity: 0.6, fontSize: '6.5pt' }}>({item.value})</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: chartBg,
        boxSizing: 'border-box',
        padding: '8px',
        borderRadius: isGlass ? '12px' : isComic ? '4px' : '8px',
        border: isComic ? '2.5px solid #000' : isGlass ? '1px solid rgba(255,255,255,0.25)' : 'none',
        backdropFilter: isGlass ? 'blur(12px)' : 'none',
        boxShadow: isComic ? '5px 5px 0 rgba(0,0,0,0.15)' : isGlass ? '0 8px 32px rgba(31, 38, 135, 0.05)' : undefined,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ flex: 1, overflow: 'visible' }}
      >
        <defs>
          {/* Drop shadow filter for Preset 9 */}
          <filter id="chart-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity="0.1" />
          </filter>

          {/* Area Gradients */}
          <linearGradient id="line-area-grad-design-3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line-area-grad-design-5" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {chartType === 'pie' && <g>{renderPie()}</g>}
        {chartType === 'bar' && (
          <g>
            {/* Axis Baseline grid line */}
            <line
              x1="12"
              y1="80"
              x2="90"
              y2="80"
              stroke="#cbd5e1"
              strokeWidth="0.5"
            />
            {renderBar()}
          </g>
        )}
        {chartType === 'line' && (
          <g>
            {/* Background grid lines */}
            <line x1="15" y1="25" x2="85" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="15" y1="52.5" x2="85" y2="52.5" stroke="#f1f5f9" strokeWidth="0.5" />
            <line
              x1="15"
              y1="80"
              x2="85"
              y2="80"
              stroke="#cbd5e1"
              strokeWidth="0.5"
            />
            {renderLine()}
          </g>
        )}
      </svg>
      {renderLegend()}
    </div>
  );
};
