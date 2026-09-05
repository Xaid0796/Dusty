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

  const liveMasterOverlay = document.getElementById('master-elements-overlay');

  try {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    wrapper.style.background = '#ffffff';
    document.body.appendChild(wrapper);

    pageElements.forEach((source, pageIndex) => {
      const clone = source.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(
        '[data-grid-overlay], [data-page-guide], [data-page-break], [class*="pageBadge"], [class*="selectionBox"], [class*="contextToolbar"]'
      ).forEach((el) => el.remove());

      const wPx = source.offsetWidth || 794;
      const hPx = source.offsetHeight || 1123;

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

      if (liveMasterOverlay) {
        const pageTopPx = pageIndex * (hPx + 24);
        const pageBottomPx = pageTopPx + hPx;

        Array.from(liveMasterOverlay.children).forEach((elChild) => {
          const htmlChild = elChild as HTMLElement;
          const topPx = parseFloat(htmlChild.style.top) || 0;
          const heightElPx = parseFloat(htmlChild.style.height) || 0;
          if (topPx + heightElPx > pageTopPx && topPx < pageBottomPx) {
            const elClone = htmlChild.cloneNode(true) as HTMLElement;
            elClone.style.top = `${topPx - pageTopPx}px`;
            elClone.style.pointerEvents = 'none';
            elClone.querySelectorAll('[class*="selectionBox"], [class*="contextToolbar"]').forEach(e => e.remove());
            clone.appendChild(elClone);
          }
        });
      }

      wrapper.appendChild(clone);
      clones.push(clone);

      widthMm = (wPx * 25.4) / 96;
      heightMm = (hPx * 25.4) / 96;
    });

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
  if (typeof document === 'undefined') return;
  await document.fonts?.ready;

  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default;

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const clone = sourceElement.cloneNode(true) as HTMLElement;

  clone.querySelectorAll('[data-grid-overlay], [data-page-guide], [class*="selectionBox"], [class*="contextToolbar"]').forEach((el) => el.remove());

  const widthPx = sourceElement.offsetWidth || 794;
  const heightPx = sourceElement.offsetHeight || 1123;

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

  const liveMasterOverlay = document.getElementById('master-elements-overlay');
  if (liveMasterOverlay) {
    Array.from(liveMasterOverlay.children).forEach((elChild) => {
      const htmlChild = elChild as HTMLElement;
      const topPx = parseFloat(htmlChild.style.top) || 0;
      const heightElPx = parseFloat(htmlChild.style.height) || 0;
      if (topPx + heightElPx > 0 && topPx < heightPx) {
        const elClone = htmlChild.cloneNode(true) as HTMLElement;
        elClone.style.top = `${topPx}px`;
        elClone.style.pointerEvents = 'none';
        elClone.querySelectorAll('[class*="selectionBox"], [class*="contextToolbar"]').forEach(e => e.remove());
        clone.appendChild(elClone);
      }
    });
  }

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.width = `${widthPx}px`;
  wrapper.style.height = `${heightPx}px`;
  wrapper.style.background = '#ffffff';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const widthMm = (widthPx * 25.4) / 96;
  const heightMm = (heightPx * 25.4) / 96;

  const opt = {
    margin: 0,
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
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
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
};
