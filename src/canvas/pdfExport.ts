import { generatePDF, generateMultiPagePDF } from '@/utils/pdfGenerator';

/**
 * Collects every sequential A4 page slot rendered on the canvas stage.
 * The first page uses the legacy id `canvas-a4-page`, subsequent pages use
 * `canvas-a4-page-2`, `canvas-a4-page-3`, etc.
 */
const getPageSlots = (pageElement: HTMLElement): HTMLElement[] => {
  if (typeof document === 'undefined') return [pageElement];
  const all = Array.from(document.querySelectorAll<HTMLElement>('[id^="canvas-a4-page"]'));
  if (all.length === 0) return [pageElement];

  all.sort((a, b) => {
    const numA = a.id === 'canvas-a4-page' ? 1 : parseInt(a.id.replace('canvas-a4-page-', ''), 10) || 1;
    const numB = b.id === 'canvas-a4-page' ? 1 : parseInt(b.id.replace('canvas-a4-page-', ''), 10) || 1;
    return numA - numB;
  });
  return all;
};

/**
 * Exports the generic canvas A4 document to a high-quality PDF.
 * Single-page documents keep the existing html2pdf path. Multi-page documents
 * are rasterized page-by-page into one combined jsPDF file.
 */
export const exportCanvasToPDF = async (
  pageElement: HTMLElement,
  filename: string
): Promise<void> => {
  if (!pageElement) {
    throw new Error('Canvas page element not found.');
  }

  const pages = getPageSlots(pageElement);
  if (pages.length <= 1) {
    await generatePDF(pageElement, filename || 'document');
    return;
  }

  await generateMultiPagePDF(pages, filename || 'document');
};
