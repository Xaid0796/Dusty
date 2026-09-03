'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Layers, Lock, Eye, EyeOff, LogOut } from 'lucide-react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/admin/auth/check')
            if (res.ok) {
                setIsAuthenticated(true)
            } else {
                setIsAuthenticated(false)
            }
        } catch {
            setIsAuthenticated(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/auth/logout', { method: 'POST' })
            setIsAuthenticated(false)
            setPassword('')
            router.refresh()
        } catch {
            // ignore
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            if (res.ok) {
                setIsAuthenticated(true)
            } else {
                const data = await res.json()
                setError(data.error || 'Invalid password')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Loading state
    if (isAuthenticated === null) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
            }}>
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e2e8f0',
                        borderTopColor: '#6366f1',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px',
                    }} />
                    <p>Checking authentication...</p>
                </div>
                <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        )
    }

    // Not authenticated ΓÇö show login
    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                padding: '20px',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                    padding: '40px 36px',
                }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #1e1b4b, #6366f1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}>
                            <Layers size={24} color="#ffffff" />
                        </div>
                        <h1 style={{
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 6px 0',
                        }}>
                            Admin Access
                        </h1>
                        <p style={{
                            fontSize: '0.9rem',
                            color: '#64748b',
                            margin: 0,
                        }}>
                            Enter the admin password to continue
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#475569',
                                marginBottom: '6px',
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock
                                    size={16}
                                    color="#94a3b8"
                                    style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                    }}
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '12px 44px 12px 40px',
                                        borderRadius: '10px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        background: '#f8fafc',
                                        color: '#0f172a',
                                        fontFamily: 'inherit',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#94a3b8',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                padding: '10px 14px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                color: '#991b1b',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                marginBottom: '16px',
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !password.trim()}
                            style={{
                                width: '100%',
                                padding: '13px 24px',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                color: '#ffffff',
                                background: 'linear-gradient(135deg, #1e1b4b, #6366f1)',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: isLoading || !password.trim() ? 'not-allowed' : 'pointer',
                                opacity: isLoading || !password.trim() ? 0.6 : 1,
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {isLoading ? 'Verifying...' : 'Enter Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    // Authenticated ΓÇö render children with logout button
    return (
        <>
            {/* Floating Logout Button */}
            <button
                onClick={handleLogout}
                title="Logout"
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = '#dc2626'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.borderColor = '#dc2626'
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = '#fef2f2'
                    e.currentTarget.style.color = '#dc2626'
                    e.currentTarget.style.borderColor = '#fecaca'
                }}
            >
                <LogOut size={15} />
                Logout
            </button>
            {children}
        </>
    )
}
