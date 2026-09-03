import { NextResponse } from 'next/server'

export const runtime = 'edge';

export async function POST() {
    const response = NextResponse.json({ message: 'Logged out' }, { status: 200 })

    response.cookies.set('admin_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    })

    return response
}
