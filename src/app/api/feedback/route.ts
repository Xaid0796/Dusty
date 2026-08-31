import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { message, rating, name, category } = body

        if (!message || !rating) {
            return NextResponse.json(
                { error: 'Message and rating are required' },
                { status: 400 }
            )
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('feedback')
            .insert({
                message,
                rating,
                name: name || 'Anonymous',
                category: category || 'general',
                status: 'new',
            })
            .select()

        if (error) {
            console.error('Supabase insert error:', error)
            return NextResponse.json(
                { error: 'Failed to submit feedback' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: 'Feedback submitted successfully', data },
            { status: 201 }
        )
    } catch (err) {
        console.error('API error:', err)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase select error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch feedback' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data }, { status: 200 })
    } catch (err) {
        console.error('API error:', err)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
