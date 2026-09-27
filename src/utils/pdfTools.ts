import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PdfToolId = 'merge' | 'compress' | 'watermark' | 'split' | 'rotate' | 'encrypt' | 'imagetopdf';

export type CompressionLevel = 'low' | 'medium' | 'high';
export type EncryptionPermission = 'all' | 'modification' | 'copy' | 'assembly' | 'printing';

export type RotationAngle = 90 | 180 | 270 | 360;
export type PageRange = string; // e.g., "1", "1-3", "1,3,5"

export type WatermarkType = 'center' | 'diagonal' | 'horizontal' | 'corner' | 'tiled';

export interface WatermarkOptions {
    text: string;
    opacity: number;
    fontSize: number;
    color: string;
    type: WatermarkType;
}

export interface SplitOptions {
    fromPage: number;
    toPage: number;
}

export interface EncryptionOptions {
    userPassword: string;
    ownerPassword: string;
    permissions: EncryptionPermission[];
    encryptionKeyLength?: number;
}

export interface ImageToPdfOptions {
    pageSize: 'a4' | 'letter' | 'image' | 'custom' | [number, number];
    orientation: 'portrait' | 'landscape';
    margin?: [number, number, number, number]; // top, right, bottom, left
}

export interface PdfToolResult {
    blob: Blob;
    pageCount: number;
    fileName: string;
}

// ─── Merge ───────────────────────────────────────────────────────────────────

export async function mergePdfs(files: File[]): Promise<PdfToolResult> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageIndices = Array.from({ length: pdf.getPageCount() }, (_, i) => i);
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const bytes = await mergedPdf.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    return { blob, pageCount: mergedPdf.getPageCount(), fileName: 'merged-document.pdf' };
}

// ─── Compress ────────────────────────────────────────────────────────────────

export async function compressPdf(file: Blob | File, level: CompressionLevel = 'medium'): Promise<PdfToolResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    const { jsPDF } = await import('jspdf');
    let pdf: any = null;

    // Quality and scale settings based on compression level
    let scale = 1.0;
    let quality = 0.5;

    if (level === 'low') {
        scale = 1.0;
        quality = 0.7;
    } else if (level === 'medium') {
        scale = 0.9;
        quality = 0.55;
    } else if (level === 'high') {
        scale = 0.75;
        quality = 0.35;
    }

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context!,
            viewport: viewport
        }).promise;

        const imgData = canvas.toDataURL('image/jpeg', quality);
        const imgWidthMm = (viewport.width / scale) * 0.352778;
        const imgHeightMm = (viewport.height / scale) * 0.352778;
        const orientation = imgWidthMm > imgHeightMm ? 'landscape' : 'portrait';

        if (i === 1) {
            pdf = new jsPDF({
                orientation,
                unit: 'mm',
                format: [imgWidthMm, imgHeightMm],
                compress: true
            });
        } else {
            pdf.addPage([imgWidthMm, imgHeightMm], orientation);
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthMm, imgHeightMm, undefined, 'FAST');
    }

    const blob = pdf.output('blob');
    return {
        blob,
        pageCount,
        fileName: 'compressed-document.pdf'
    };
}

// ─── Encrypt (Password Protection) ───────────────────────────────────────────

export async function encryptPdf(file: Blob | File, options: EncryptionOptions): Promise<PdfToolResult> {
    if (!options.userPassword || options.userPassword.length < 4) {
        throw new Error('Password must be at least 4 characters');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    const { jsPDF } = await import('jspdf');
    let pdf: any = null;

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context!,
            viewport: viewport
        }).promise;

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidthMm = (viewport.width / 2) * 0.352778;
        const imgHeightMm = (viewport.height / 2) * 0.352778;
        const orientation = imgWidthMm > imgHeightMm ? 'landscape' : 'portrait';

        if (i === 1) {
            pdf = new jsPDF({
                orientation,
                unit: 'mm',
                format: [imgWidthMm, imgHeightMm],
                encryption: {
                    userPassword: options.userPassword,
                    ownerPassword: options.ownerPassword || options.userPassword,
                    userPermissions: ["print", "modify", "copy", "annot-forms"]
                }
            });
        } else {
            pdf.addPage([imgWidthMm, imgHeightMm], orientation);
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthMm, imgHeightMm, undefined, 'FAST');
    }

    const blob = pdf.output('blob');
    return {
        blob,
        pageCount,
        fileName: 'protected-document.pdf'
    };
}

// ─── Image to PDF ───────────────────────────────────────────────────────────

export async function imagesToPdf(images: File[], options: ImageToPdfOptions): Promise<PdfToolResult> {
    const pdfDoc = await PDFDocument.create();
    await pdfDoc.registerFontkit(fontkit);
    const { pageSize, orientation, margin = [0, 0, 0, 0] } = options;

    let pageWidth: number, pageHeight: number;

    if (typeof pageSize === 'string') {
        const pageSizes: Record<string, [number, number]> = {
            a4: [595.28, 841.89],
            letter: [612, 792],
        };
        [pageWidth, pageHeight] = pageSizes[pageSize];
    } else if (Array.isArray(pageSize)) {
        [pageWidth, pageHeight] = pageSize;
    } else {
        [pageWidth, pageHeight] = [595.28, 841.89];
    }

    if (orientation === 'landscape') {
        [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }

    for (const imageFile of images) {
        try {
            let imageBytes: ArrayBuffer;

            if (imageFile.size > 10 * 1024 * 1024) {
                try {
                    const imageCompression = (await import('browser-image-compression')).default;
                    const comprOptions: any = {
                        maxSizeMB: (imageFile.size / (1024 * 1024)) * 0.7,
                        initialQuality: 0.7,
                    };
                    const compressedFile = await imageCompression(imageFile, comprOptions);
                    imageBytes = await compressedFile.arrayBuffer();
                } catch (comprError) {
                    console.warn(`Image compression failed, using original:`, comprError);
                    imageBytes = await imageFile.arrayBuffer();
                }
            } else {
                imageBytes = await imageFile.arrayBuffer();
            }

            const pageWidthWithMargin = pageWidth - margin[1] - margin[3];
            const pageHeightWithMargin = pageHeight - margin[0] - margin[2];

            const page = pdfDoc.addPage([pageWidthWithMargin, pageHeightWithMargin]);

            if (imageFile.type.includes('jpeg') || imageFile.type.includes('jpg')) {
                const pdfImage = await pdfDoc.embedJpg(imageBytes);
                const { width, height } = pdfImage.scaleToFit(pageWidthWithMargin, pageHeightWithMargin);

                page.drawImage(pdfImage, {
                    x: margin[3],
                    y: margin[0],
                    width,
                    height
                });
            } else if (imageFile.type.includes('png')) {
                const pdfImage = await pdfDoc.embedPng(imageBytes);
                const { width, height } = pdfImage.scaleToFit(pageWidthWithMargin, pageHeightWithMargin);

                page.drawImage(pdfImage, {
                    x: margin[3],
                    y: margin[0],
                    width,
                    height
                });
            } else if (imageFile.type.includes('webp')) {
                try {
                    const webpBlob = new Blob([imageBytes]);
                    const imgBitmap = await createImageBitmap(webpBlob);
                    const tempCanvas = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
                    const tempCtx = tempCanvas.getContext('2d');
                    if (tempCtx) {
                        tempCtx.drawImage(imgBitmap, 0, 0);
                        const pngBytes = await tempCanvas.convertToBlob({ type: 'image/png' }) as Blob;
                        const pngArrayBuffer = await pngBytes.arrayBuffer();
                        const pdfImage = await pdfDoc.embedPng(pngArrayBuffer);
                        const { width, height } = pdfImage.scaleToFit(pageWidthWithMargin, pageHeightWithMargin);

                        page.drawImage(pdfImage, {
                            x: margin[3],
                            y: margin[0],
                            width,
                            height
                        });
                    }
                } catch (webpError) {
                    console.warn(`WebP conversion failed:`, webpError);
                }
            }
        } catch (err) {
            console.warn(`Failed to process image ${imageFile.name}:`, err);
        }
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    return {
        blob,
        pageCount: pdfDoc.getPageCount(),
        fileName: 'converted-images.pdf'
    };
}

// ─── Watermark ───────────────────────────────────────────────────────────────

export async function watermarkPdf(file: Blob | File, options: WatermarkOptions): Promise<PdfToolResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? rgb(parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255)
            : rgb(0.7, 0.7, 0.7);
    };

    const color = hexToRgb(options.color);
    const pages = pdf.getPages();
    const watermarkType = options.type || 'diagonal';

    for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
        const textHeight = font.heightAtSize(options.fontSize);

        if (watermarkType === 'tiled') {
            const xStep = Math.max(textWidth + 80, 250);
            const yStep = Math.max(textHeight + 80, 200);
            for (let yCoord = 50; yCoord < height; yCoord += yStep) {
                for (let xCoord = 50; xCoord < width; xCoord += xStep) {
                    page.drawText(options.text, {
                        x: xCoord,
                        y: yCoord,
                        size: options.fontSize,
                        font,
                        color,
                        opacity: options.opacity,
                        rotate: degrees(30),
                    });
                }
            }
        } else if (watermarkType === 'corner') {
            const x = width - textWidth - 50;
            const y = height - textHeight - 50;
            page.drawText(options.text, {
                x,
                y,
                size: options.fontSize,
                font,
                color,
                opacity: options.opacity,
            });
        } else if (watermarkType === 'diagonal') {
            const x = (width - textWidth) / 2;
            const y = (height - textHeight) / 2;
            page.drawText(options.text, {
                x,
                y,
                size: options.fontSize,
                font,
                color,
                opacity: options.opacity,
                rotate: degrees(45),
            });
        } else if (watermarkType === 'horizontal') {
            const x = (width - textWidth) / 2;
            const y = (height - textHeight) / 2;
            page.drawText(options.text, {
                x,
                y,
                size: options.fontSize,
                font,
                color,
                opacity: options.opacity,
            });
        } else {
            // 'center'
            const x = (width - textWidth) / 2;
            const y = (height - textHeight) / 2;
            page.drawText(options.text, {
                x,
                y,
                size: options.fontSize,
                font,
                color,
                opacity: options.opacity,
            });
        }
    }

    const bytes = await pdf.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    return { blob, pageCount: pdf.getPageCount(), fileName: 'watermarked-document.pdf' };
}

// ─── Split ───────────────────────────────────────────────────────────────────

export async function splitPdf(file: Blob | File, options: SplitOptions): Promise<PdfToolResult> {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = sourcePdf.getPageCount();

    const from = Math.max(1, Math.min(options.fromPage, totalPages));
    const to = Math.max(from, Math.min(options.toPage, totalPages));

    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i);
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const bytes = await newPdf.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    return { blob, pageCount: newPdf.getPageCount(), fileName: `extracted-pages-${from}-to-${to}.pdf` };
}

// ─── Rotate ──────────────────────────────────────────────────────────────────

export async function rotatePdf(file: Blob | File, angle: RotationAngle, pages: PageRange = 'all'): Promise<PdfToolResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    if (pages === 'all' || !pages.trim()) {
        const allPageIndices = Array.from({ length: pdf.getPageCount() }, (_, i) => i);
        for (const index of allPageIndices) {
            const currentRotation = pdf.getPage(index).getRotation().angle;
            pdf.getPage(index).setRotation(degrees((currentRotation + angle) % 360));
        }
    } else {
        const pageIndices = parsePageRange(pages, pdf.getPageCount());
        for (const index of pageIndices) {
            const currentRotation = pdf.getPage(index).getRotation().angle;
            pdf.getPage(index).setRotation(degrees((currentRotation + angle) % 360));
        }
    }

    const bytes = await pdf.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    return { blob, pageCount: pdf.getPageCount(), fileName: 'rotated-document.pdf' };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export function parsePageRange(input: string, totalPages: number): number[] {
    const result: number[] = [];
    const pages = input.split(',').map(p => p.trim());

    for (const page of pages) {
        if (!page) continue;

        if (page.includes('-')) {
            const [start, end] = page.split('-').map(n => parseInt(n.trim()));
            const startNum = Math.max(1, Math.min(start, totalPages));
            const endNum = Math.max(startNum, Math.min(end, totalPages));

            for (let i = startNum; i <= endNum; i++) {
                if (!result.includes(i - 1)) {
                    result.push(i - 1);
                }
            }
        } else {
            const pageNum = Math.max(1, Math.min(parseInt(page), totalPages));
            const pageIndex = pageNum - 1;
            if (!result.includes(pageIndex)) {
                result.push(pageIndex);
            }
        }
    }

    return result.sort((a, b) => a - b);
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
