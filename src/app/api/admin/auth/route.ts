import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { password } = body

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 })
        }

        const adminPassword = process.env.ADMIN_PASSWORD
        if (!adminPassword) {
            return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 })
        }

        if (password !== adminPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
        }

        // Set an httpOnly cookie with a signed token
        const response = NextResponse.json({ message: 'Authenticated' }, { status: 200 })

        // Simple token: base64 encoded with expiry (24 hours)
        const expiry = Date.now() + 24 * 60 * 60 * 1000
        const token = Buffer.from(`${adminPassword}:${expiry}`).toString('base64')

        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60, // 24 hours
        })

        return response
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
