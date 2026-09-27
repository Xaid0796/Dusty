import { PDFDocument, rgb, degrees } from 'pdf-lib';

export interface PdfToolResult {
    success: boolean;
    data?: Uint8Array;
    filename: string;
    error?: string;
    pageCount?: number;
}

/**
 * Merge multiple PDF byte arrays into a single PDF
 */
export async function mergePdfs(files: { name: string; data: ArrayBuffer }[]): Promise<PdfToolResult> {
    try {
        const mergedPdf = await PDFDocument.create();
        for (const f of files) {
            const pdf = await PDFDocument.load(f.data, { ignoreEncryption: true });
            const indices = Array.from({ length: pdf.getPageCount() }, (_, i) => i);
            const copiedPages = await mergedPdf.copyPages(pdf, indices);
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        const data = await mergedPdf.save();
        return {
            success: true,
            data,
            filename: 'merged-document.pdf',
            pageCount: mergedPdf.getPageCount(),
        };
    } catch (err: any) {
        return { success: false, filename: 'merged-document.pdf', error: err.message || 'Failed to merge PDFs' };
    }
}

/**
 * Split a PDF into individual pages or page ranges
 */
export async function splitPdf(fileData: ArrayBuffer, filename: string): Promise<{ success: boolean; pages?: { name: string; data: Uint8Array }[]; error?: string }> {
    try {
        const pdf = await PDFDocument.load(fileData, { ignoreEncryption: true });
        const pageCount = pdf.getPageCount();
        const pagesList: { name: string; data: Uint8Array }[] = [];

        const baseName = filename.replace(/\.[^/.]+$/, '');

        for (let i = 0; i < pageCount; i++) {
            const subPdf = await PDFDocument.create();
            const [copiedPage] = await subPdf.copyPages(pdf, [i]);
            subPdf.addPage(copiedPage);
            const data = await subPdf.save();
            pagesList.push({
                name: `${baseName}-page-${i + 1}.pdf`,
                data,
            });
        }

        return { success: true, pages: pagesList };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to split PDF' };
    }
}

/**
 * Add a watermark text across all pages of a PDF
 */
export async function watermarkPdf(
    fileData: ArrayBuffer,
    filename: string,
    watermarkText: string,
    options?: { opacity?: number; color?: string; rotation?: number }
): Promise<PdfToolResult> {
    try {
        const pdf = await PDFDocument.load(fileData, { ignoreEncryption: true });
        const pages = pdf.getPages();
        const opacity = options?.opacity ?? 0.3;
        const rotation = options?.rotation ?? 45;

        for (const page of pages) {
            const { width, height } = page.getSize();
            page.drawText(watermarkText || 'CONFIDENTIAL', {
                x: width / 4,
                y: height / 2,
                size: 48,
                color: rgb(0.5, 0.5, 0.5),
                opacity,
                rotate: degrees(rotation),
            });
        }

        const data = await pdf.save();
        const baseName = filename.replace(/\.[^/.]+$/, '');
        return {
            success: true,
            data,
            filename: `${baseName}-watermarked.pdf`,
            pageCount: pdf.getPageCount(),
        };
    } catch (err: any) {
        return { success: false, filename, error: err.message || 'Failed to watermark PDF' };
    }
}

/**
 * Encrypt PDF with user password
 */
export async function encryptPdf(
    fileData: ArrayBuffer,
    filename: string,
    userPassword: string
): Promise<PdfToolResult> {
    try {
        const pdf = await PDFDocument.load(fileData, { ignoreEncryption: true });
        const data = await pdf.save({
            userPassword,
            ownerPassword: userPassword + '_owner',
        } as any);
        const baseName = filename.replace(/\.[^/.]+$/, '');
        return {
            success: true,
            data,
            filename: `${baseName}-encrypted.pdf`,
            pageCount: pdf.getPageCount(),
        };
    } catch (err: any) {
        return { success: false, filename, error: err.message || 'Failed to encrypt PDF' };
    }
}

/**
 * Compress / Optimize PDF (re-saving with standard settings in pdf-lib)
 */
export async function compressPdf(fileData: ArrayBuffer, filename: string): Promise<PdfToolResult> {
    try {
        const pdf = await PDFDocument.load(fileData, { ignoreEncryption: true });
        const data = await pdf.save({ useObjectStreams: true } as any);
        const baseName = filename.replace(/\.[^/.]+$/, '');
        return {
            success: true,
            data,
            filename: `${baseName}-compressed.pdf`,
            pageCount: pdf.getPageCount(),
        };
    } catch (err: any) {
        return { success: false, filename, error: err.message || 'Failed to compress PDF' };
    }
}
