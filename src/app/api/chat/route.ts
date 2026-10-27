import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { FAQ_DATA } from '@/data/faq';

// Force dynamic execution for this API route (never pre-rendered at build time)
export const dynamic = 'force-dynamic';

// Model configuration matching the existing setup
const MODEL_NAME = 'openai/gpt-oss-20b';
const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES_COUNT = 15;
const MAX_TOTAL_CHARS = 4000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 20;

// System prompt with DocXume AI identity and knowledge base
const SYSTEM_PROMPT = `You are DocXume AI, the official AI assistant for DocXume, a 100% free resume, CV builder, and comprehensive free PDF tools platform (supporting PDF compression, watermarking, image-to-PDF conversion, merging, splitting, rotation, and encryption).
Knowledge base:
${FAQ_DATA.map((item, idx) => `${idx + 1}. Q: ${item.q}\n   A: ${item.a}`).join('\n\n')}

CRITICAL INSTRUCTIONS:
- You are DocXume AI. When asked who you are, your name, or your identity, ALWAYS answer: "I am DocXume AI" or "Main DocXume AI hoon".
- Match the user's language: If the user asks in Hinglish or Hindi, reply in Hinglish/Hindi. If the user asks in English, reply in English. Match whichever language or script the user uses in their prompt.
- DocXume FULLY supports watermark features, image-to-PDF conversion, PDF compression, merging, splitting, and all other listed PDF tools. Never claim that DocXume lacks watermark or image-to-PDF capabilities.
- Give short, direct answers in clean plain text.
- Do NOT use any markdown formatting, asterisks (*), bold (**), or bullet lists.
- MAXIMUM LENGTH: Strictly keep your response under 4 to 5 lines (maximum 1 compact paragraph). Do not write long essays.
- Conserve tokens to stay well within TPM limits.
- When answering questions about editing, selecting, or interacting with elements, ALWAYS specify the difference between desktop (single click) and mobile/touch (double tap) interactions.`;

// In-memory rate limiting map: IP -> { count, resetTime }
interface RateLimitRecord {
    count: number;
    resetTime: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = ipRateLimits.get(ip);

    // Periodic cleanup if the map grows
    if (ipRateLimits.size > 1000) {
        for (const [key, value] of ipRateLimits.entries()) {
            if (value.resetTime < now) {
                ipRateLimits.delete(key);
            }
        }
    }

    if (!record || record.resetTime < now) {
        ipRateLimits.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS,
        });
        return true;
    }

    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }

    record.count += 1;
    return true;
}

export async function POST(req: NextRequest) {
    // 1. Basic payload size check via Content-Length header
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 32768) {
        return NextResponse.json(
            { error: 'Payload too large. Maximum size is 32KB.' },
            { status: 413 }
        );
    }

    // 2. Abuse protection: rate limiting per client IP
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = (forwarded ? forwarded.split(',')[0].trim() : null) || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment before sending another message.' },
            { status: 429 }
        );
    }

    // 3. Verify server-side GROQ_API_KEY configuration
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error('[DocXume AI Server Error] GROQ_API_KEY environment variable is missing.');
        return NextResponse.json(
            { error: 'AI service is temporarily unavailable. Please try again later.' },
            { status: 503 }
        );
    }

    // 4. Validate incoming request body
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON request body.' },
            { status: 400 }
        );
    }

    if (!body || typeof body !== 'object' || !('messages' in body)) {
        return NextResponse.json(
            { error: 'Missing "messages" in request body.' },
            { status: 400 }
        );
    }

    const { messages } = body as { messages: unknown };
    if (!Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json(
            { error: '"messages" must be a non-empty array.' },
            { status: 400 }
        );
    }

    if (messages.length > MAX_MESSAGES_COUNT) {
        return NextResponse.json(
            { error: `Too many messages in history. Maximum allowed is ${MAX_MESSAGES_COUNT}.` },
            { status: 400 }
        );
    }

    // 5. Validate individual messages (role & content)
    let totalChars = 0;
    const validatedMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (!msg || typeof msg !== 'object') {
            return NextResponse.json(
                { error: `Message at index ${i} is invalid.` },
                { status: 400 }
            );
        }

        const { role, content } = msg as Record<string, unknown>;

        // Disallow 'system' role or arbitrary roles from client
        if (role !== 'user' && role !== 'assistant') {
            return NextResponse.json(
                { error: `Invalid role at message index ${i}. Only 'user' or 'assistant' roles are allowed.` },
                { status: 400 }
            );
        }

        if (typeof content !== 'string') {
            return NextResponse.json(
                { error: `Invalid content at message index ${i}. Content must be a string.` },
                { status: 400 }
            );
        }

        const trimmed = content.trim();
        if (!trimmed) {
            return NextResponse.json(
                { error: `Message content at index ${i} cannot be empty.` },
                { status: 400 }
            );
        }

        if (trimmed.length > MAX_MESSAGE_LENGTH) {
            return NextResponse.json(
                { error: `Message at index ${i} exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.` },
                { status: 400 }
            );
        }

        totalChars += trimmed.length;
        if (totalChars > MAX_TOTAL_CHARS) {
            return NextResponse.json(
                { error: `Conversation history exceeds maximum limit of ${MAX_TOTAL_CHARS} characters.` },
                { status: 400 }
            );
        }

        validatedMessages.push({ role, content: trimmed });
    }

    // Ensure the last message is from the user
    if (validatedMessages[validatedMessages.length - 1].role !== 'user') {
        return NextResponse.json(
            { error: 'The latest message must be from the user.' },
            { status: 400 }
        );
    }

    // 6. Execute Groq completion with strict error isolation
    try {
        const groq = new Groq({ apiKey });

        const completion = await groq.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...validatedMessages,
            ],
            temperature: 0.2,
            max_tokens: 256,
            reasoning_effort: 'low',
        });

        const choiceMessage = completion.choices?.[0]?.message;
        const answerText = (choiceMessage?.content ?? choiceMessage?.reasoning ?? '').trim();

        if (!answerText) {
            return NextResponse.json(
                { error: 'DocXume AI did not generate a reply. Please try again.' },
                { status: 502 }
            );
        }

        return NextResponse.json({
            content: answerText,
        });
    } catch (err: unknown) {
        // Log details securely on the server without leaking sensitive info to client
        console.error('[DocXume AI Server Error] Groq API call failed:', err);

        if (err instanceof Groq.RateLimitError) {
            return NextResponse.json(
                { error: 'DocXume AI is currently experiencing high demand. Please wait a moment and try again.' },
                { status: 429 }
            );
        }

        if (err instanceof Groq.AuthenticationError) {
            console.error('[DocXume AI Server Error] Authentication failed. Check GROQ_API_KEY in environment variables.');
            return NextResponse.json(
                { error: 'AI service configuration error. Please contact support.' },
                { status: 500 }
            );
        }

        if (err instanceof Groq.APIConnectionError || err instanceof Groq.APIConnectionTimeoutError) {
            return NextResponse.json(
                { error: 'Unable to connect to AI service. Please check your network and try again.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'An unexpected error occurred while communicating with the AI service. Please try again.' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { error: 'Method Not Allowed' },
        { status: 405 }
    );
}
