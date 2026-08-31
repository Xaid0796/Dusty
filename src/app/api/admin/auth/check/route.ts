import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('admin_token')?.value

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        const adminPassword = process.env.ADMIN_PASSWORD
        if (!adminPassword) {
            return NextResponse.json({ authenticated: false }, { status: 500 })
        }

        try {
            const decoded = Buffer.from(token, 'base64').toString('utf-8')
            const [password, expiryStr] = decoded.split(':')
            const expiry = parseInt(expiryStr, 10)

            if (password !== adminPassword || Date.now() > expiry) {
                return NextResponse.json({ authenticated: false }, { status: 401 })
            }

            return NextResponse.json({ authenticated: true }, { status: 200 })
        } catch {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }
    } catch (err) {
        return NextResponse.json({ authenticated: false }, { status: 500 })
    }
}
