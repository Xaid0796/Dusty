import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { templateRegistry } from '@/templates/registry';

// This route uses Node.js filesystem APIs (fs) to read/write template files on
// the server. Declaring the Node.js runtime is REQUIRED for serverless
// deployments (e.g. Vercel) ΓÇö without it the route fails at runtime because the
// Edge runtime does not provide fs/path.
export const runtime = 'nodejs';

// Restrict template IDs / filenames to safe URL+file friendly characters to
// prevent path traversal and arbitrary file writes.
const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;
const SAFE_NAME = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const SAFE_FILENAME = /^[a-z0-9][a-z0-9-]*\.ts$/;
const CATEGORIES = new Set(['resume', 'cv', 'cover-letter']);

/** Parse a template JSON object from a TypeScript file without using eval(). */
const parseTemplateJson = (content: string): Record<string, unknown> | null => {
    // Match the JSON object after `=`:  export const name: CanvasDocument = { ... };
    const jsonMatch = content.match(/=\s*({[\s\S]*?});?\s*$/);
    if (!jsonMatch) return null;
    try {
        const parsed = JSON.parse(jsonMatch[1]);
        return parsed;
    } catch {
        // Fallback: if the template data contains a trailing comma we can't parse,
        // try to strip trailing commas before the closing brace.
        try {
            const cleaned = jsonMatch[1].replace(/,\s*([}\]])/g, '$1');
            return JSON.parse(cleaned);
        } catch {
            return null;
        }
    }
};

const isTemplateFile = (content: string, templateId: string): boolean => {
    const idPattern = new RegExp(`"id"\\s*:\\s*["']${templateId}["']`);
    const idPatternSingle = new RegExp(`'id'\\s*:\\s*["']${templateId}["']`);
    return idPattern.test(content) || idPatternSingle.test(content);
};

/** Convert a kebab-case / snake_case slug to a camelCase identifier (e.g. "my-template" -> "myTemplate"). */
const toCamelCase = (value: string): string =>
    value.replace(/-+([a-z0-9])/g, (_, c: string) => c.toUpperCase()).replace(/-+/g, '');

/**
 * Resolve the ACTUAL named export of a template file. Template files created by
 * this API export `<camelCaseId>Template` (or the bare camelCase id). This keeps
 * the global `src/templates/index.ts` import in sync regardless of which naming
 * convention a file uses, so the "edit template from admin" flow never produces
 * `ts(2724)` "has no exported member" errors again.
 */
const resolveTemplateExport = (fileContent: string, templateId: string): string | null => {
    const constMatch = fileContent.match(/export\s+const\s+(\w+)\s*:/);
    if (constMatch) return constMatch[1];

    // Fallback: derive the conventional export name from the template id.
    const camel = toCamelCase(templateId.replace(/^resume-/, ''));
    return `${camel}Template`;
};

/** Resolve a template file path safely (no path traversal) and return absolute path. */
const safeResolve = (category: string, filename: string): string | null => {
    if (!CATEGORIES.has(category)) return null;
    if (!SAFE_FILENAME.test(filename)) return null;
    const dir = path.join(process.cwd(), 'src', 'templates', category);
    const full = path.join(dir, filename);
    // Ensure the resolved path stays inside the category directory.
    if (!full.startsWith(dir + path.sep)) return null;
    return full;
};

export async function GET(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const category = url.searchParams.get('category') || 'resume';

    if (!id) {
        return NextResponse.json({ error: 'Missing template id' }, { status: 400 });
    }
    if (!SAFE_ID.test(id) || !CATEGORIES.has(category)) {
        return NextResponse.json({ error: 'Invalid template id or category.' }, { status: 400 });
    }

    try {
        const categoryDir = path.join(process.cwd(), 'src', 'templates', category);
        if (fs.existsSync(categoryDir)) {
            const files = fs.readdirSync(categoryDir);
            for (const f of files) {
                if (f === 'index.ts') continue;
                if (!/\.ts$/.test(f)) continue;
                const filePath = path.join(categoryDir, f);
                const content = fs.readFileSync(filePath, 'utf8');
                if (isTemplateFile(content, id) || f === `resume-${id}.ts` || f === `${id}.ts`) {
                    const parsed = parseTemplateJson(content);
                    if (parsed) {
                        return NextResponse.json(parsed);
                    }
                }
            }
        }
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { filename, exportName, templateId, category, displayName, isPremium, document, thumbnail } = body;
        // Prefer an explicitly provided thumbnail (admin page sends both the
        // top-level `thumbnail` and `document.thumbnail`); fall back to the
        // document's embedded value so we never drop an uploaded image.
        const resolvedThumbnail = thumbnail || (document && document.thumbnail) || undefined;
        document.thumbnail = resolvedThumbnail;

        // Validation
        if (!filename || !exportName || !templateId || !category || !displayName || !document) {
            return NextResponse.json(
                { error: 'Missing required fields: filename, exportName, templateId, category, displayName, document.' },
                { status: 400 }
            );
        }

        // ΓöÇΓöÇ Input sanitization (prevents path traversal & arbitrary writes) ΓöÇΓöÇ
        if (!CATEGORIES.has(category)) {
            return NextResponse.json({ error: `Invalid category "${category}".` }, { status: 400 });
        }
        if (!SAFE_ID.test(templateId)) {
            return NextResponse.json(
                { error: 'templateId may only contain lowercase letters, numbers, and hyphens.' },
                { status: 400 }
            );
        }
        if (!SAFE_NAME.test(exportName)) {
            return NextResponse.json(
                { error: 'exportName must be a valid TypeScript identifier.' },
                { status: 400 }
            );
        }
        const cleanFilename = filename.endsWith('.ts') ? filename : `${filename}.ts`;
        const baseName = cleanFilename.replace(/\.ts$/, '');
        if (!SAFE_FILENAME.test(cleanFilename) || !SAFE_ID.test(baseName)) {
            return NextResponse.json(
                { error: 'filename must be a safe lowercase slug ending in .ts (e.g. my-template.ts).' },
                { status: 400 }
            );
        }

        // Basic shape validation of the incoming CanvasDocument payload.
        if (!document.page || typeof document.page.width !== 'number' || typeof document.page.height !== 'number' || !Array.isArray(document.elements)) {
            return NextResponse.json(
                { error: 'document must be a valid CanvasDocument (page.width, page.height, and elements[] are required).' },
                { status: 400 }
            );
        }

        // ΓöÇΓöÇ Resolve an existing template file for this templateId (if any) ΓöÇΓöÇ
        // IMPORTANT: We do NOT blindly delete-and-recreate. That "disappears" the
        // original design whenever the admin canvas isn't an exact copy of the
        // saved template (stale GET, partial metadata-sync, blank canvas for a
        // template missing from the registry, etc.) and can also break the
        // category index when the export name differs. Instead we load the current
        // file so we can PRESERVE its real page/elements design and only patch
        // safe metadata (name, category, isPremium, thumbnail) below.
        let existingFilePath: string | null = null;
        let existingCategory: string | null = null;
        let existingExportName: string | null = null;
        let existingContent: string | null = null;
        for (const cat of CATEGORIES) {
            const catDir = path.join(process.cwd(), 'src', 'templates', cat);
            if (!fs.existsSync(catDir)) continue;
            const files = fs.readdirSync(catDir);
            for (const f of files) {
                if (f === 'index.ts' || !/\.ts$/.test(f)) continue;
                const filePath = path.join(catDir, f);
                const content = fs.readFileSync(filePath, 'utf8');
                if (isTemplateFile(content, templateId) || f === `resume-${templateId}.ts` || f === `${templateId}.ts`) {
                    if (f !== cleanFilename) {
                        // The template exists but under a different filename.
                        // Require explicit confirmation before we rename/move it.
                        if (body.overwriteConfirmation !== true && body.overwriteConfirmation !== 'true') {
                            return NextResponse.json({
                                error: `Template "${templateId}" already exists as file "${f}". Set overwriteConfirmation=true to overwrite with "${cleanFilename}".`,
                                existingFile: f,
                            }, { status: 409 });
                        }
                    }
                    // Prefer the file matching cleanFilename; fallback to first match.
                    if (!existingFilePath || f === cleanFilename) {
                        existingFilePath = filePath;
                        existingCategory = cat;
                        existingContent = content;
                        const constMatch = content.match(/export\s+const\s+(\w+)\s*:/);
                        existingExportName = constMatch ? constMatch[1] : null;
                    }
                }
            }
        }

        const categoryDir = path.join(process.cwd(), 'src', 'templates', category);

        if (!fs.existsSync(categoryDir)) {
            return NextResponse.json(
                { error: `Category directory "${category}" does not exist.` },
                { status: 400 }
            );
        }

        // 0. Persist an uploaded thumbnail as a static file so the template keeps a
        // stable, lightweight URL. A base64 data URL from the Admin Builder would
        // otherwise bloat the .ts file and is not a usable <img> src across rebuilds.
        let thumbnailRef: string | undefined;
        if (typeof document.thumbnail === 'string' && document.thumbnail.startsWith('data:image')) {
            try {
                const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');
                if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });
                const extMatch = document.thumbnail.match(/^data:image\/(png|jpeg|webp);base64,/);
                const ext = extMatch && extMatch[1] === 'jpeg' ? 'jpg' : extMatch && extMatch[1] === 'webp' ? 'webp' : 'png';
                const base64 = document.thumbnail.replace(/^data:image\/\w+;base64,/, '');
                // Remove any old thumbnail files for this template first
                for (const tf of fs.readdirSync(thumbnailsDir)) {
                    if (tf === `${templateId}.png` || tf === `${templateId}.jpg` || tf === `${templateId}.webp`) {
                        try { fs.unlinkSync(path.join(thumbnailsDir, tf)); } catch (e) { }
                    }
                }
                const thumbPath = path.join(thumbnailsDir, `${templateId}.${ext}`);
                fs.writeFileSync(thumbPath, Buffer.from(base64, 'base64'));
                // Cache-busting: a re-uploaded thumbnail reuses the same static path
                // (e.g. /thumbnails/my-template.png), so browsers/hosting caches would
                // keep serving the old image. Appending a fresh version query param
                // guarantees the new thumbnail is always fetched after publish.
                thumbnailRef = `/thumbnails/${templateId}.${ext}?v=${Date.now()}`;
            } catch (e) {
                console.error('Failed to persist thumbnail file:', e);
            }
        }

        // ΓöÇΓöÇ Design-preserving merge ΓöÇΓöÇ
        // If an existing template file was found and the incoming canvas document
        // is effectively empty (blank editor, thumbnail-only update, or a template
        // the registry failed to load into the admin canvas), keep the EXISTING
        // page/elements design and only apply the new metadata + thumbnail.
        // This guarantees a push NEVER wipes out the saved layout.
        const existingParsed = existingContent ? parseTemplateJson(existingContent) : null;
        const existingElements = (existingParsed && Array.isArray((existingParsed as any).elements) ? (existingParsed as any).elements : []) as unknown[];
        const incomingHasElements = Array.isArray(document.elements) && document.elements.length > 0;
        const preserveDesign = existingElements.length > 0 && !incomingHasElements;

        let finalDoc: Record<string, unknown>;
        if (preserveDesign) {
            finalDoc = {
                ...(existingParsed as Record<string, unknown>),
                id: templateId,
                name: displayName,
                category: category,
                isPremium: typeof isPremium === 'boolean' ? isPremium : document.isPremium,
                thumbnail: thumbnailRef || resolvedThumbnail || (existingParsed as any).thumbnail,
            };
        } else {
            finalDoc = {
                ...document,
                id: templateId,
                name: displayName,
                category: category,
                isPremium: typeof isPremium === 'boolean' ? isPremium : document.isPremium,
                thumbnail: thumbnailRef || document.thumbnail,
            };
        }

        // If the existing file lives in a DIFFERENT category or filename than the
        // target (a confirmed move/rename), remove the old file + its index entry
        // now that the new file will be written below.
        if (existingFilePath && existingCategory && existingFilePath !== path.join(categoryDir, cleanFilename)) {
            try {
                fs.unlinkSync(existingFilePath);
                const oldIndexPath = path.join(process.cwd(), 'src', 'templates', existingCategory, 'index.ts');
                if (fs.existsSync(oldIndexPath)) {
                    let oldIndexContent = fs.readFileSync(oldIndexPath, 'utf8');
                    if (existingExportName && SAFE_NAME.test(existingExportName)) {
                        const oldImportRegex = new RegExp(`import\\s+\\{\\s*${existingExportName}\\s*\\}\\s+from\\s+['\"].*?['\"];?\\s*\\n?`, 'g');
                        oldIndexContent = oldIndexContent.replace(oldImportRegex, '');
                        const oldAltImportRegex = new RegExp(`import\\s+.*?from\\s+['\"]\\.\\/${path.basename(existingFilePath).replace(/\.ts$/, '')}['\"].*?;?\\s*\\n?`, 'g');
                        oldIndexContent = oldIndexContent.replace(oldAltImportRegex, '');
                    }
                    const oldEntryRegex = new RegExp(`['"]?${templateId}['"]?\\s*:\\s*\\w+,?\\s*\\n?`, 'g');
                    oldIndexContent = oldIndexContent.replace(oldEntryRegex, '');
                    fs.writeFileSync(oldIndexPath, oldIndexContent, 'utf8');
                }
            } catch (e) { }
        }

        // 1. Write template file
        const filePath = path.join(categoryDir, cleanFilename);
        // Compatibility alias: the global src/templates/index.ts historically imports
        // the bare camelCase id (e.g. coverLetterBoldGeometric), while the category
        // index.ts imports the `Template`-suffixed name (e.g. coverLetterBoldGeometricTemplate).
        // Exporting BOTH keeps every importer valid after an admin edit/re-publish.
        const compatAlias = toCamelCase(templateId.replace(/^resume-/, ''));
        const aliasExportLine =
            compatAlias && compatAlias !== exportName
                ? `\nexport { ${exportName} as ${compatAlias} };\n`
                : '';
        const fileContent = `import { CanvasDocument } from '@/canvas/types';

export const ${exportName}: CanvasDocument = ${JSON.stringify(
            finalDoc,
            null,
            2
        )};${aliasExportLine}`;

        fs.writeFileSync(filePath, fileContent, 'utf8');

        // 2. Update category index.ts safely
        const indexPath = path.join(categoryDir, 'index.ts');
        if (fs.existsSync(indexPath)) {
            let indexContent = fs.readFileSync(indexPath, 'utf8');

            // Remove any stale import pointing at this same file under a previous
            // const name (e.g. after a re-publish that changed the export name).
            const staleImportRegex = new RegExp(`import\\s+\\{[^}]*\\}\\s+from\\s+['\"]\\.\\/${baseName}['\"];?\\s*\\n?`, 'g');
            indexContent = indexContent.replace(staleImportRegex, '');

            // Add import statement only if it doesn't already exist
            const importStatement = `import { ${exportName} } from './${baseName}';`;
            if (!indexContent.includes(`import { ${exportName} } from './${baseName}'`)) {
                if (indexContent.includes("import { CanvasDocument } from '@/canvas/types';")) {
                    indexContent = indexContent.replace(
                        "import { CanvasDocument } from '@/canvas/types';",
                        `import { CanvasDocument } from '@/canvas/types';\n${importStatement}`
                    );
                } else {
                    indexContent = importStatement + '\n' + indexContent;
                }
            }

            // Add template entry into the record object only if it doesn't already exist
            const targetStr = `export const ${category}Templates: Record<string, CanvasDocument> = {`;
            if (indexContent.includes(targetStr)) {
                const entryPattern = new RegExp(`['"]?${templateId}['"]?\\s*:\\s*${exportName}`);
                if (!entryPattern.test(indexContent)) {
                    const existingEntryPattern = new RegExp(`(['"]?${templateId}['"]?\\s*:\\s*)\\w+,?`);
                    if (existingEntryPattern.test(indexContent)) {
                        indexContent = indexContent.replace(existingEntryPattern, `$1${exportName},`);
                    } else {
                        const entryString = `\n  '${templateId}': ${exportName},`;
                        indexContent = indexContent.replace(targetStr, targetStr + entryString);
                    }
                }
            }

            fs.writeFileSync(indexPath, indexContent, 'utf8');
        }

        return NextResponse.json({
            success: true,
            message: `Template "${displayName}" successfully published to category "${category}"!`,
        });
    } catch (error: any) {
        console.error('Error publishing template:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error while publishing template.' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { templateId, category, filename } = body;

        if (!templateId || !category) {
            return NextResponse.json({ error: 'Missing templateId or category.' }, { status: 400 });
        }

        if (!CATEGORIES.has(category) || !SAFE_ID.test(templateId)) {
            return NextResponse.json({ error: 'Invalid templateId or category.' }, { status: 400 });
        }

        const categoryDir = path.join(process.cwd(), 'src', 'templates', category);
        let targetFilename = filename;
        let constName: string | null = null;

        if (fs.existsSync(categoryDir)) {
            if (!targetFilename) {
                const files = fs.readdirSync(categoryDir);
                for (const f of files) {
                    if (f === 'index.ts') continue;
                    if (!/\.ts$/.test(f)) continue;
                    const filePath = path.join(categoryDir, f);
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (isTemplateFile(content, templateId) || f === `resume-${templateId}.ts` || f === `${templateId}.ts`) {
                            targetFilename = f;
                            break;
                        }
                    } catch (e) { }
                }
            }

            if (targetFilename && SAFE_FILENAME.test(targetFilename)) {
                const filePath = path.join(categoryDir, targetFilename);
                if (fs.existsSync(filePath)) {
                    try {
                        const fileContent = fs.readFileSync(filePath, 'utf8');
                        const constMatch = fileContent.match(/export\s+const\s+(\w+)\s*:/);
                        constName = constMatch ? constMatch[1] : null;
                        fs.unlinkSync(filePath);
                    } catch (e) { }
                }
            }

            // Clean up category index.ts
            const indexPath = path.join(categoryDir, 'index.ts');
            if (fs.existsSync(indexPath)) {
                try {
                    let indexContent = fs.readFileSync(indexPath, 'utf8');
                    if (constName && SAFE_NAME.test(constName)) {
                        const importRegex = new RegExp(`import\\s+\\{\\s*${constName}\\s*\\}\\s+from\\s+['\"].*?['\"];?\\s*\\n?`, 'g');
                        indexContent = indexContent.replace(importRegex, '');
                    }
                    if (targetFilename) {
                        const baseName = targetFilename.replace(/\.ts$/, '');
                        const altImportRegex = new RegExp(`import\\s+.*?from\\s+['\"]\\.\\/${baseName}['\"].*?;?\\s*\\n?`, 'g');
                        indexContent = indexContent.replace(altImportRegex, '');
                    }
                    const entryRegex = new RegExp(`['"]?${templateId}['"]?\\s*:\\s*\\w+,?\\s*\\n?`, 'g');
                    indexContent = indexContent.replace(entryRegex, '');

                    fs.writeFileSync(indexPath, indexContent, 'utf8');
                } catch (e) { }
            }
        }

        // Clean up global src/templates/index.ts (templateMetadataRegistry)
        const globalIndexPath = path.join(process.cwd(), 'src', 'templates', 'index.ts');
        if (fs.existsSync(globalIndexPath)) {
            try {
                let globalContent = fs.readFileSync(globalIndexPath, 'utf8');
                const lines = globalContent.split('\n');
                let newLines: string[] = [];
                let skipping = false;
                let braceCount = 0;

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (!skipping) {
                        const startPattern = new RegExp(`^\\s*['"]?${templateId}['"]?\\s*:\\s*\\{`);
                        if (startPattern.test(line)) {
                            skipping = true;
                            braceCount = 0;
                            for (const char of line) {
                                if (char === '{') braceCount++;
                                if (char === '}') braceCount--;
                            }
                            if (braceCount === 0) {
                                skipping = false;
                            }
                            continue;
                        }
                        newLines.push(line);
                    } else {
                        for (const char of line) {
                            if (char === '{') braceCount++;
                            if (char === '}') braceCount--;
                        }
                        if (braceCount <= 0) {
                            skipping = false;
                        }
                    }
                }
                globalContent = newLines.join('\n');
                fs.writeFileSync(globalIndexPath, globalContent, 'utf8');
            } catch (e) { }
        }

        // Delete thumbnail if it exists in public/thumbnails/
        const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');
        if (fs.existsSync(thumbnailsDir)) {
            const thumbFiles = fs.readdirSync(thumbnailsDir);
            for (const tf of thumbFiles) {
                if (tf === `${templateId}.png` || tf === `resume-${templateId}.png` || (filename && SAFE_FILENAME.test(filename) && tf === `${filename.replace(/\.ts$/, '')}.png`)) {
                    try {
                        fs.unlinkSync(path.join(thumbnailsDir, tf));
                    } catch (e) { }
                }
            }
        }

        return NextResponse.json({ success: true, message: `Template "${templateId}" and all associated files/registry entries deleted successfully.` });
    } catch (error: any) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: error.message || 'Internal server error while deleting template.' }, { status: 500 });
    }
}
