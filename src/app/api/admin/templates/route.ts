import { NextResponse } from 'next/server';
import { templateRegistry } from '@/templates/registry';

// Cloudflare Pages (via @cloudflare/next-on-pages) requires EVERY non-static
// route to run on the Edge Runtime. The Edge Runtime has no filesystem and
// Cloudflare Pages is read-only after the build, so this route CANNOT use
// Node.js `fs`/`path` to mutate source .ts files at runtime. Template
// publishing/deletion must be done in the repository (local dev) and committed.
// The GET handler below serves templates from the in-memory registry (build-time
// data), which works fully on the Edge.
export const runtime = 'edge';

const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;
const CATEGORIES = new Set(['resume', 'cv', 'cover-letter']);

const UNSUPPORTED_MESSAGE =
    'Template publishing/deletion is not supported on Cloudflare Pages: the Edge Runtime has no filesystem and the deploy is read-only. ' +
    'Edit templates in the repository with the local dev server and commit your changes.';

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

    const template = templateRegistry[id];
    if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json(template);
}

export async function POST() {
    return NextResponse.json({ error: UNSUPPORTED_MESSAGE }, { status: 501 });
}

export async function DELETE() {
    return NextResponse.json({ error: UNSUPPORTED_MESSAGE }, { status: 501 });
}
