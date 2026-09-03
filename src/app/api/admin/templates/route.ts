import { NextResponse } from 'next/server';

// Cloudflare Pages requires every non-static route to run on the Edge Runtime.
// The Edge Runtime has no filesystem and Cloudflare Pages is read-only.
// We remove the heavy templateRegistry import here to prevent exceeding
// Cloudflare's 4MB edge function size limit (10MB+ bundle otherwise).
export const runtime = 'edge';

const UNSUPPORTED_MESSAGE =
    'Template publishing/deletion is not supported on Cloudflare Pages: the Edge Runtime has no filesystem and the deploy is read-only. ' +
    'Edit templates in the repository with the local dev server and commit your changes.';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing template id' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Template retrieval via API is disabled on Edge. Use static registry.' }, { status: 404 });
}

export async function POST() {
    return NextResponse.json({ error: UNSUPPORTED_MESSAGE }, { status: 501 });
}

export async function DELETE() {
    return NextResponse.json({ error: UNSUPPORTED_MESSAGE }, { status: 501 });
}
