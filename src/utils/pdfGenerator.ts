/**
 * Client-Side PDF Generation Service
 *
 * Strategy:
 * 1. Accepts the inner HTMLElement directly (the live canvas page)
 * 2. Synchronizes font rendering with document.fonts.ready
 * 3. Measures exact offsetWidth and offsetHeight of the source canvas element for 100% visual consistency
 * 4. Clones it into a clean off-screen container matching exact canvas dimensions
 * 5. Strips all watermark/editor overlays from the clone
 * 6. Uses html2canvas at 2x scale for retina-quality output
 * 7. Configures jsPDF with custom format [widthMm, heightMm] matching the canvas exactly to guarantee a single page with zero extra blank pages
 * 8. Downloads a valid PDF Blob and cleans up memory
 */

/**
 * Multi-page export: rasterizes each page slot independently and assembles
 * them into a single PDF with one page per slot. This guarantees clean page
 * boundaries (each stacked page becomes exactly one PDF page) even though the
 * editor renders them as one continuous vertical strip.
 */
export const generateMultiPagePDF = async (
  pageElements: HTMLElement[],
  filename: string
): Promise<void> => {
  if (typeof document === 'undefined') return;
  if (pageElements.length === 0) return;
  if (pageElements.length === 1) {
    await generatePDF(pageElements[0], filename);
    return;
  }

  await document.fonts?.ready;

  const { jsPDF } = await import('jspdf');
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default;

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const clones: HTMLElement[] = [];
  let widthMm = 210;
  let heightMm = 297;

  try {
    // Clone every page slot off-screen, stripping editor-only overlays.
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    wrapper.style.background = '#ffffff';
    document.body.appendChild(wrapper);

    pageElements.forEach((source) => {
      const clone = source.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(
        '[data-grid-overlay], [data-page-guide], [data-page-break], [class*="pageBadge"], [class*="selectionBox"], [class*="contextToolbar"]'
      ).forEach((el) => el.remove());

      // Force display:block on children hidden by the visible flag.
      Array.from(clone.children).forEach((child) => {
        const el = child as HTMLElement;
        if (el.style && el.style.display === 'none') {
          el.style.display = 'block';
        }
      });

      const wPx = source.offsetWidth || source.clientWidth || 794;
      const hPx = source.offsetHeight || source.clientHeight || 1123;

      clone.style.setProperty('width', `${wPx}px`, 'important');
      clone.style.setProperty('min-width', `${wPx}px`, 'important');
      clone.style.setProperty('max-width', `${wPx}px`, 'important');
      clone.style.setProperty('height', `${hPx}px`, 'important');
      clone.style.setProperty('min-height', `${hPx}px`, 'important');
      clone.style.setProperty('max-height', `${hPx}px`, 'important');
      clone.style.position = 'relative';
      clone.style.display = 'block';
      clone.style.boxShadow = 'none';
      clone.style.margin = '0';
      clone.style.overflow = 'hidden';
      clone.style.transform = 'none';
      clone.style.border = 'none';

      wrapper.appendChild(clone);
      clones.push(clone);

      widthMm = (wPx * 25.4) / 96;
      heightMm = (hPx * 25.4) / 96;
    });

    // Render each clone to canvas at 2x scale.
    const canvases = await Promise.all(
      clones.map((clone) =>
        html2canvas(clone, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: clone.offsetWidth || 794,
          height: clone.offsetHeight || 1123,
          windowWidth: clone.offsetWidth || 794,
          windowHeight: clone.offsetHeight || 1123,
        })
      )
    );

    const pdf = new jsPDF({
      orientation: widthMm > heightMm ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [widthMm, heightMm],
      compress: true,
    });

    canvases.forEach((canvas, index) => {
      if (index > 0) pdf.addPage([widthMm, heightMm], widthMm > heightMm ? 'landscape' : 'portrait');
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');
    });

    pdf.save(safeFilename);
  } finally {
    const wrapper = document.body.querySelector('div[style*="-9999px"]');
    if (wrapper && wrapper.parentNode === document.body) {
      document.body.removeChild(wrapper);
    }
  }
};

export const generatePDF = async (
  sourceElement: HTMLElement,
  filename: string
): Promise<void> => {
  console.log("generatePDF: entering function with html2pdf.js", { filename });

  // 1. Synchronize Font Rendering: Ensure document.fonts.ready resolves entirely before starting PDF conversion
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }

  // Dynamic import to avoid SSR errors
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default;

  console.log("generatePDF: html2pdf.js dynamically imported");

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Clone only the actual canvas resume document element
  const clone = sourceElement.cloneNode(true) as HTMLElement;

  // Remove grid overlays, page guides/gaps, and selection indicators from the clone before PDF generation
  clone.querySelectorAll('[data-grid-overlay], [data-page-guide], [class*="selectionBox"], [class*="contextToolbar"]').forEach((el) => el.remove());

  // Force display:block on any direct children that have display:none so they appear in the PDF.
  Array.from(clone.children).forEach((child) => {
    const el = child as HTMLElement;
    if (el.style && el.style.display === 'none') {
      el.style.display = 'block';
    }
  });

  // Measure exact dimensions of source element to maintain 100% visual consistency with the canvas
  const widthPx = sourceElement.offsetWidth || sourceElement.clientWidth || 794;
  const heightPx = sourceElement.offsetHeight || sourceElement.clientHeight || 1123;

  console.log("generatePDF measured dimensions for exact canvas match:", { widthPx, heightPx });

  // Apply styling overrides matching source element dimensions exactly
  clone.style.setProperty('width', `${widthPx}px`, 'important');
  clone.style.setProperty('min-width', `${widthPx}px`, 'important');
  clone.style.setProperty('max-width', `${widthPx}px`, 'important');
  clone.style.setProperty('height', `${heightPx}px`, 'important');
  clone.style.setProperty('min-height', `${heightPx}px`, 'important');
  clone.style.setProperty('max-height', `${heightPx}px`, 'important');
  clone.style.position = 'relative';
  clone.style.display = 'block';
  clone.style.boxShadow = 'none';
  clone.style.margin = '0';
  clone.style.overflow = 'hidden';
  clone.style.transform = 'none';
  clone.style.border = 'none';

  // Temporarily append clone in an off-screen container matching exact dimensions
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.width = `${widthPx}px`;
  wrapper.style.height = `${heightPx}px`;
  wrapper.style.background = '#ffffff';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Convert dimensions to mm for exact single-page format in jsPDF (preventing blank pages)
  const widthMm = (widthPx * 25.4) / 96;
  const heightMm = (heightPx * 25.4) / 96;

  const opt = {
    margin: 0,
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2, // High-definition rendering
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: widthPx,
      height: heightPx,
      windowWidth: widthPx,
      windowHeight: heightPx
    },
    jsPDF: {
      unit: 'mm',
      format: [widthMm, heightMm],
      orientation: widthMm > heightMm ? 'landscape' : 'portrait',
      compress: true
    },
    pagebreak: { mode: 'avoid' }
  };

  try {
    console.log("generatePDF: invoking html2pdf with link annotations");
    const worker = html2pdf().from(clone).set(opt);
    const pdf = await worker.toPdf().get('pdf');

    const linkElements = clone.querySelectorAll('[data-url]');
    linkElements.forEach((el) => {
      const url = el.getAttribute('data-url');
      if (url) {
        const rect = el.getBoundingClientRect();
        const cloneRect = clone.getBoundingClientRect();
        const leftPx = rect.left - cloneRect.left;
        const topPx = rect.top - cloneRect.top;
        const wPx = rect.width;
        const hPx = rect.height;

        const xMm = (leftPx * 25.4) / 96;
        const yMm = (topPx * 25.4) / 96;
        const wMm = (wPx * 25.4) / 96;
        const hMm = (hPx * 25.4) / 96;

        pdf.link(xMm, yMm, wMm, hMm, { url });
      }
    });

    await worker.save();
    console.log("generatePDF: html2pdf save completed");
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
};
