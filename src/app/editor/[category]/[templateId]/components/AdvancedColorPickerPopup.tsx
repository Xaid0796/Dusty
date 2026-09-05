'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from '../editor.module.css';

interface AdvancedColorPickerPopupProps {
    color: string; // initial color in hex, rgb, or hsl string
    onChange: (color: string) => void;
    onClose: () => void;
}

// Helper functions to convert between color spaces
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b]
        .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
        .join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
        s: number,
        l: number = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h *= 60;
    }
    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
        r: Math.round(255 * f(0)),
        g: Math.round(255 * f(8)),
        b: Math.round(255 * f(4)),
    };
}

function parseColorString(color: string): { r: number; g: number; b: number; a: number } {
    // Try to parse as hex
    if (color.startsWith('#')) {
        const rgb = hexToRgb(color);
        return { ...rgb, a: 1 };
    }
    // Try to parse as rgb() or rgba()
    const rgbMatch = color.match(
        /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/
    );
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
        return { r, g, b, a };
    }
    // Try to parse as hsl() or hsla()
    const hslMatch = color.match(
        /^hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/
    );
    if (hslMatch) {
        const h = parseFloat(hslMatch[1]);
        const s = parseFloat(hslMatch[2]);
        const l = parseFloat(hslMatch[3]);
        const a = hslMatch[4] !== undefined ? parseFloat(hslMatch[4]) : 1;
        const rgb = hslToRgb(h, s, l);
        return { ...rgb, a };
    }
    // Default to black
    return { r: 0, g: 0, b: 0, a: 1 };
}

function formatColorString(r: number, g: number, b: number, a: number): string {
    // If alpha is 1, return hex without alpha
    if (Math.round(a * 100) / 100 === 1) {
        return rgbToHex(r, g, b);
    }
    // Otherwise return rgba
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const AdvancedColorPickerPopup: React.FC<AdvancedColorPickerPopupProps> = ({
    color,
    onChange,
    onClose,
}) => {
    const [internalColor, setInternalColor] = useState(() => parseColorString(color));
    const [hex, setHex] = useState(rgbToHex(internalColor.r, internalColor.g, internalColor.b));
    const [rgbInput, setRgbInput] = useState(
        `${internalColor.r}, ${internalColor.g}, ${internalColor.b}`
    );
    const [hslInput, setHslInput] = useState(() => {
        const hsl = rgbToHsl(internalColor.r, internalColor.g, internalColor.b);
        return `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    });
    const [alpha, setAlpha] = useState(Math.round(internalColor.a * 100));

    // Update internal color from hex
    useEffect(() => {
        if (hex) {
            const rgb = hexToRgb(hex);
            setInternalColor({ ...rgb, a: internalColor.a });
            setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            setHslInput(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
            setAlpha(Math.round(internalColor.a * 100));
        }
    }, [hex]);

    // Update internal color from rgb input
    useEffect(() => {
        const rgb = rgbInput
            .split(',')
            .map((x) => parseInt(x.trim(), 10))
            .filter((x) => !isNaN(x));
        if (rgb.length === 3) {
            setInternalColor({ r: rgb[0], g: rgb[1], b: rgb[2], a: internalColor.a });
            setHex(rgbToHex(rgb[0], rgb[1], rgb[2]));
            const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
            setHslInput(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
        }
    }, [rgbInput]);

    // Update internal color from hsl input
    useEffect(() => {
        const hsl = hslInput
            .split(',')
            .map((x) => parseFloat(x.trim()))
            .filter((x) => !isNaN(x));
        if (hsl.length === 3) {
            const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
            setInternalColor({ ...rgb, a: internalColor.a });
            setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
            setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
    }, [hslInput]);

    // Update internal color from alpha
    useEffect(() => {
        setInternalColor((prev) => ({ ...prev, a: alpha / 100 }));
    }, [alpha]);

    // Call onChange when internal color changes
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        const colorString = formatColorString(
            internalColor.r,
            internalColor.g,
            internalColor.b,
            internalColor.a
        );
        onChangeRef.current(colorString);
    }, [internalColor]);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHex(e.target.value);
    };

    const handleRgbInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRgbInput(e.target.value);
    };

    const handleHslInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHslInput(e.target.value);
    };

    const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAlpha(parseInt(e.target.value, 10) || 0);
    };

    return (
        <div className={styles.modalOverlay} style={{ zIndex: 99999 }}>
            <div
                className={styles.modalContent}
                style={{
                    maxWidth: 400,
                    width: '100%',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    background: 'var(--bg-panel)',
                    color: 'var(--text-panel)',
                    border: '1px solid var(--border-panel)',
                    padding: '24px',
                    borderRadius: 16,
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.15)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        Advanced Color Picker
                    </h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-panel-muted)', cursor: 'pointer', padding: 4 }}>
                        <span style={{ fontSize: 18 }}>×</span>
                    </button>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-panel)', marginRight: 8 }}>Color:</span>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                backgroundColor: formatColorString(
                                    internalColor.r,
                                    internalColor.g,
                                    internalColor.b,
                                    internalColor.a
                                ),
                                borderRadius: 4,
                                border: '1px solid var(--border-panel)',
                                marginRight: 12,
                            }}
                        />
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--text-panel-muted)', marginBottom: 2 }}>HEX</div>
                            <input
                                type="text"
                                value={hex}
                                onChange={handleHexChange}
                                placeholder="#ff0000"
                                style={{
                                    width: 80,
                                    padding: '4px 6px',
                                    border: '1px solid var(--border-panel)',
                                    borderRadius: 4,
                                    background: 'var(--bg-panel-input)',
                                    color: 'var(--text-panel)',
                                    fontFamily: 'monospace',
                                }}
                            />
                            <div style={{ fontSize: 12, color: 'var(--text-panel-muted)', marginTop: 8, marginBottom: 2 }}>RGB</div>
                            <input
                                type="text"
                                value={rgbInput}
                                onChange={handleRgbInputChange}
                                placeholder="255, 0, 0"
                                style={{
                                    width: 80,
                                    padding: '4px 6px',
                                    border: '1px solid var(--border-panel)',
                                    borderRadius: 4,
                                    background: 'var(--bg-panel-input)',
                                    color: 'var(--text-panel)',
                                    fontFamily: 'monospace',
                                }}
                            />
                            <div style={{ fontSize: 12, color: 'var(--text-panel-muted)', marginTop: 8, marginBottom: 2 }}>HSL</div>
                            <input
                                type="text"
                                value={hslInput}
                                onChange={handleHslInputChange}
                                placeholder="0, 100%, 50%"
                                style={{
                                    width: 80,
                                    padding: '4px 6px',
                                    border: '1px solid var(--border-panel)',
                                    borderRadius: 4,
                                    background: 'var(--bg-panel-input)',
                                    color: 'var(--text-panel)',
                                    fontFamily: 'monospace',
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-panel-muted)', marginBottom: 8 }}>Preset Colors</div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
                        {[
                            '#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B',
                            '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#EC4899'
                        ].map((presetColor) => (
                            <div
                                key={presetColor}
                                onClick={() => setHex(presetColor)}
                                style={{
                                    width: 22,
                                    height: 22,
                                    backgroundColor: presetColor,
                                    borderRadius: 4,
                                    border: '1px solid var(--border-panel)',
                                    cursor: 'pointer',
                                }}
                                title={presetColor}
                            />
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className={styles.fieldGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <label className={styles.fieldLabel}>Hue</label>
                            <span className={styles.sliderValue}>{rgbToHsl(internalColor.r, internalColor.g, internalColor.b).h}°</span>
                        </div>
                        <div className={styles.sliderRow}>
                            <input
                                type="range"
                                className={styles.slider}
                                min="0"
                                max="360"
                                value={rgbToHsl(internalColor.r, internalColor.g, internalColor.b).h}
                                onChange={(e) => {
                                    const h = parseInt(e.target.value, 10);
                                    const { s, l } = rgbToHsl(internalColor.r, internalColor.g, internalColor.b);
                                    const rgb = hslToRgb(h, s, l);
                                    setInternalColor({ ...rgb, a: internalColor.a });
                                    setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
                                    setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
                                    setHslInput(`${h}, ${s}%, ${l}%`);
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.fieldGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <label className={styles.fieldLabel}>Saturation</label>
                            <span className={styles.sliderValue}>{rgbToHsl(internalColor.r, internalColor.g, internalColor.b).s}%</span>
                        </div>
                        <div className={styles.sliderRow}>
                            <input
                                type="range"
                                className={styles.slider}
                                min="0"
                                max="100"
                                value={rgbToHsl(internalColor.r, internalColor.g, internalColor.b).s}
                                onChange={(e) => {
                                    const s = parseInt(e.target.value, 10);
                                    const { h, l } = rgbToHsl(internalColor.r, internalColor.g, internalColor.b);
                                    const rgb = hslToRgb(h, s, l);
                                    setInternalColor({ ...rgb, a: internalColor.a });
                                    setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
                                    setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
                                    setHslInput(`${h}, ${s}%, ${l}%`);
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.fieldGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <label className={styles.fieldLabel}>Lightness</label>
                            <span className={styles.sliderValue}>{rgbToHsl(internalColor.r, internalColor.g, internalColor.b).l}%</span>
                        </div>
                        <div className={styles.sliderRow}>
                            <input
                                type="range"
                                className={styles.slider}
                                min="0"
                                max="100"
                                value={rgbToHsl(internalColor.r, internalColor.g, internalColor.b).l}
                                onChange={(e) => {
                                    const l = parseInt(e.target.value, 10);
                                    const { h, s } = rgbToHsl(internalColor.r, internalColor.g, internalColor.b);
                                    const rgb = hslToRgb(h, s, l);
                                    setInternalColor({ ...rgb, a: internalColor.a });
                                    setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
                                    setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
                                    setHslInput(`${h}, ${s}%, ${l}%`);
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.fieldGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <label className={styles.fieldLabel}>Alpha</label>
                            <span className={styles.sliderValue}>{alpha}%</span>
                        </div>
                        <div className={styles.sliderRow}>
                            <input
                                type="range"
                                className={styles.slider}
                                min="0"
                                max="100"
                                value={alpha}
                                onChange={handleAlphaChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};