// ============================================================
//  CANVAS UTILITIES
//  Handles mm-to-pixel coordinate conversions for rendering.
//  At standard 96 DPI: 1 inch = 25.4 mm, so 1 mm = 96 / 25.4 pixels.
// ============================================================

export const MM_TO_PX = 96 / 25.4; // ~3.7795

export const mmToPx = (mm: number): number => {
  return mm * MM_TO_PX;
};

export const pxToMm = (px: number): number => {
  return px / MM_TO_PX;
};
