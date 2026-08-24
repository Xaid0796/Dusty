import { generatePDF } from '@/utils/pdfGenerator';

/**
 * Exports the generic canvas A4 document to a high-quality PDF.
 * It hides any cursor caret or selection highlights by targeting the clean page element.
 */
export const exportCanvasToPDF = async (
  pageElement: HTMLElement,
  filename: string
): Promise<void> => {
  if (!pageElement) {
    throw new Error('Canvas page element not found.');
  }
  
  // Call the robust pdfGenerator utility
  await generatePDF(pageElement, filename || 'document');
};
