'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import styles from './FAQBot.module.css';

interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    /** Full reply text, kept while the typewriter animation is streaming `content`. */
    fullContent?: string;
    /** True while the typewriter animation is revealing this message. */
    isStreaming?: boolean;
}

const CHAT_API_URL = '/api/chat';

/* ── Typewriter tuning ── */
const TYPE_INTERVAL_MS = 16; // ~60fps tick for a snappy feel
const TARGET_TICKS = 130;    // long answers still finish within ~2s

const QUICK_QUESTIONS = [
    'Is DocXume free?',
    'How is my data protected?',
    'Can I download a PDF?',
    'Do I need an account?',
    'Is it ATS friendly?',
    'Can I use it offline?',
];

export function FAQBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 0,
            role: 'assistant',
            content: 'Hi! 👋 Ask me anything about DocXume. I give quick, concise answers!',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const idCounter = useRef(1);
    const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const streamingIdRef = useRef<number | null>(null);

    useEffect(() => {
        // Track typing so we can follow along instantly while text streams in,
        // and glide smoothly when whole messages appear.
        const isTyping = messages.some((m) => m.isStreaming);
        messagesEndRef.current?.scrollIntoView({ behavior: isTyping ? 'auto' : 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    // Never leak the typing interval if the component unmounts mid-animation.
    useEffect(() => {
        return () => {
            if (typeTimerRef.current) clearInterval(typeTimerRef.current);
        };
    }, []);

    /** Reveal `fullText` inside message `botId` a few characters per frame. */
    const startTypewriter = useCallback((botId: number, fullText: string) => {
        // Adaptive speed: short replies type out in well under a second,
        // long replies cap at ~TARGET_TICKS frames so they never drag.
        const charsPerTick = Math.max(1, Math.ceil(fullText.length / TARGET_TICKS));
        let shown = 0;
        streamingIdRef.current = botId;

        typeTimerRef.current = setInterval(() => {
            shown = Math.min(shown + charsPerTick, fullText.length);
            const done = shown >= fullText.length;
            const slice = fullText.slice(0, shown);

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === botId ? { ...m, content: slice, isStreaming: !done } : m
                )
            );

            if (done) {
                if (typeTimerRef.current) clearInterval(typeTimerRef.current);
                typeTimerRef.current = null;
                streamingIdRef.current = null;
            }
        }, TYPE_INTERVAL_MS);
    }, []);

    const handleSend = useCallback(async (text?: string) => {
        const query = (text ?? input).trim();
        if (!query || loading) return;

        // If a previous reply is still typing, snap it to its final text.
        if (typeTimerRef.current) {
            clearInterval(typeTimerRef.current);
            typeTimerRef.current = null;
            streamingIdRef.current = null;
        }
        const finalized = messages.map((m) =>
            m.isStreaming && m.fullContent
                ? { ...m, content: m.fullContent, isStreaming: false }
                : m
        );

        const userMsg: ChatMessage = { id: idCounter.current++, role: 'user', content: query };
        // Keep last 4 conversations (8 messages: 4 user + 4 assistant)
        const newMessages = [...finalized.slice(-7), userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(CHAT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        ...finalized.slice(-7).map((m) => ({ role: m.role, content: m.content })),
                        { role: 'user', content: query },
                    ],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.error || `Request failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const answerText = (data?.content || '').trim();

            if (!answerText) {
                throw new Error('Empty response from AI service');
            }

            const botId = idCounter.current++;
            const botMsg: ChatMessage = {
                id: botId,
                role: 'assistant',
                content: '',
                fullContent: answerText,
                isStreaming: true,
            };

            setMessages((prev) => [...prev, botMsg]);
            startTypewriter(botId, answerText);
        } catch (err: any) {
            console.error('Chat error:', err);
            const errorMsg: ChatMessage = {
                id: idCounter.current++,
                role: 'assistant',
                content: `Sorry, I encountered an error connecting to the AI service: ${err.message || 'Unknown error'}. Please try again.`,
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, startTypewriter]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating toggle button */}
            <button
                className={styles.fab}
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Close FAQ assistant' : 'Open FAQ assistant'}
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>

            {/* Chat panel */}
            {open && (
                <div className={styles.panel}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <Bot size={20} />
                            <span className={styles.headerTitle}>DocXume AI</span>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className={styles.messages}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : styles.botRow}`}
                            >
                                {msg.role === 'assistant' && (
                                    <span className={styles.avatar}><Bot size={14} /></span>
                                )}
                                <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.botBubble}`}>
                                    {msg.content}
                                    {msg.isStreaming && <span className={styles.caret} aria-hidden="true" />}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className={`${styles.messageRow} ${styles.botRow}`}>
                                <span className={styles.avatar}><Bot size={14} /></span>
                                <div className={styles.typingIndicator}>
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick questions */}
                    {messages.length <= 1 && (
                        <div className={styles.quickQuestions}>
                            {QUICK_QUESTIONS.map((q) => (
                                <button key={q} className={styles.quickChip} onClick={() => handleSend(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className={styles.inputRow}>
                        <textarea
                            ref={inputRef}
                            className={styles.input}
                            rows={1}
                            placeholder="Ask a quick question…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            aria-label="Chat input"
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            aria-label="Send"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
