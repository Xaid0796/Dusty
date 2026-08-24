import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { templateRegistry } from '@/templates/registry';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const category = url.searchParams.get('category') || 'resume';

    if (!id) {
        return NextResponse.json({ error: 'Missing template id' }, { status: 400 });
    }

    try {
        const categoryDir = path.join(process.cwd(), 'src', 'templates', category);
        if (fs.existsSync(categoryDir)) {
            const files = fs.readdirSync(categoryDir);
            for (const f of files) {
                if (f === 'index.ts') continue;
                const filePath = path.join(categoryDir, f);
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes(`id: "${id}"`) || content.includes(`id: '${id}'`) || f.includes(id)) {
                    const jsonMatch = content.match(/=\s*({[\s\S]*});?\s*$/);
                    if (jsonMatch) {
                        const parsed = Function(`return ${jsonMatch[1]}`)();
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
        const { filename, exportName, templateId, category, displayName, document } = body;

        // Validation
        if (!filename || !exportName || !templateId || !category || !displayName || !document) {
            return NextResponse.json(
                { error: 'Missing required fields: filename, exportName, templateId, category, displayName, document.' },
                { status: 400 }
            );
        }

        // Smart Update / Overwrite if template already exists
        const categories = ['resume', 'biodata', 'cv', 'cover-letter'];
        for (const cat of categories) {
            const catDir = path.join(process.cwd(), 'src', 'templates', cat);
            if (!fs.existsSync(catDir)) continue;
            const files = fs.readdirSync(catDir);
            for (const f of files) {
                if (f === 'index.ts') continue;
                const filePath = path.join(catDir, f);
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes(`id: "${templateId}"`) || content.includes(`id: '${templateId}'`) || content.includes(templateId)) {
                    const constMatch = content.match(/export\s+const\s+(\w+)\s*:/);
                    const constName = constMatch ? constMatch[1] : null;
                    try {
                        fs.unlinkSync(filePath);
                    } catch (e) { }

                    const indexPath = path.join(catDir, 'index.ts');
                    if (fs.existsSync(indexPath)) {
                        let indexContent = fs.readFileSync(indexPath, 'utf8');
                        if (constName) {
                            const importRegex = new RegExp(`import\\s+\\{\\s*${constName}\\s*\\}\\s+from\\s+['\"].*?['\"];?\\s*\\n?`, 'g');
                            indexContent = indexContent.replace(importRegex, '');
                        }
                        const entryRegex = new RegExp(`['"]?${templateId}['"]?\\s*:\\s*\\w+,?\\s*\\n?`, 'g');
                        indexContent = indexContent.replace(entryRegex, '');
                        fs.writeFileSync(indexPath, indexContent, 'utf8');
                    }
                }
            }
        }

        const cleanFilename = filename.endsWith('.ts') ? filename : `${filename}.ts`;
        const baseName = cleanFilename.replace(/\.ts$/, '');
        const categoryDir = path.join(process.cwd(), 'src', 'templates', category);

        if (!fs.existsSync(categoryDir)) {
            return NextResponse.json(
                { error: `Category directory "${category}" does not exist.` },
                { status: 400 }
            );
        }

        // 1. Write template file
        const filePath = path.join(categoryDir, cleanFilename);
        const fileContent = `import { CanvasDocument } from '@/canvas/types';

export const ${exportName}: CanvasDocument = ${JSON.stringify(
            {
                ...document,
                id: templateId,
                name: displayName,
                category: category,
            },
            null,
            2
        )};
`;

        fs.writeFileSync(filePath, fileContent, 'utf8');

        // 2. Update category index.ts safely
        const indexPath = path.join(categoryDir, 'index.ts');
        if (fs.existsSync(indexPath)) {
            let indexContent = fs.readFileSync(indexPath, 'utf8');

            // Add import statement after CanvasDocument import
            const importStatement = `import { ${exportName} } from './${baseName}';`;
            if (indexContent.includes("import { CanvasDocument } from '@/canvas/types';")) {
                indexContent = indexContent.replace(
                    "import { CanvasDocument } from '@/canvas/types';",
                    `import { CanvasDocument } from '@/canvas/types';\n${importStatement}`
                );
            } else {
                indexContent = importStatement + '\n' + indexContent;
            }

            // Add template entry into the record object
            const targetStr = `export const ${category}Templates: Record<string, CanvasDocument> = {`;
            if (indexContent.includes(targetStr)) {
                const entryString = `\n  '${templateId}': ${exportName},`;
                indexContent = indexContent.replace(targetStr, targetStr + entryString);
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

        const categoryDir = path.join(process.cwd(), 'src', 'templates', category);
        let targetFilename = filename;
        let constName: string | null = null;

        if (fs.existsSync(categoryDir)) {
            if (!targetFilename) {
                const files = fs.readdirSync(categoryDir);
                for (const f of files) {
                    if (f === 'index.ts') continue;
                    const filePath = path.join(categoryDir, f);
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (
                            content.includes(`id: "${templateId}"`) ||
                            content.includes(`id: '${templateId}'`) ||
                            f.includes(templateId) ||
                            content.includes(templateId)
                        ) {
                            targetFilename = f;
                            break;
                        }
                    } catch (e) { }
                }
            }

            if (targetFilename) {
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
                    if (constName) {
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
                if (tf.includes(templateId) || (filename && tf.includes(filename.replace(/\.ts$/, '')))) {
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
