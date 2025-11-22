'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CallbackPage() {
    const router = useRouter()
    const [message, setMessage] = useState('Processing authentication callback...')

    useEffect(() => {
        if (typeof window === 'undefined') return

        const params = new URLSearchParams(window.location.search)
        const type = params.get('type') // e.g. "signup", "magiclink", "recovery"
        const email = params.get('email')
        const error = params.get('error') || params.get('error_description')

        if (error) {
            setMessage(decodeURIComponent(error))
            return
        }

        // If Supabase returned tokens (common when email confirmation signs a user in),
        // clear sensitive tokens from the URL and treat as a confirmed signup.
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        if (accessToken || refreshToken) {
            // remove sensitive token params from the URL so they are not leaked
            const cleanUrl = new URL(window.location.href)
            cleanUrl.searchParams.delete('access_token')
            cleanUrl.searchParams.delete('refresh_token')
            cleanUrl.searchParams.delete('expires_in')
            cleanUrl.searchParams.delete('provider_token')
            cleanUrl.searchParams.delete('token_type')
            // keep other useful params like `type` or `email` if you want; here we keep email/type intact
            window.history.replaceState({}, '', cleanUrl.toString())

            setMessage('Email confirmed — signing you in and redirecting...')
            const target = `/auth/signin${email ? `?email=${encodeURIComponent(email)}&confirmed=1` : '?confirmed=1'}`
            setTimeout(() => router.replace(target), 700)
            return
        }

        // If this callback is from a sign-up flow, send user to the sign-in page so they
        // can sign in after completing the password setup / confirming email.
        if (type === 'signup') {
            const target = `/auth/signin${email ? `?email=${encodeURIComponent(email)}&confirmed=1` : '?confirmed=1'}`
            // short delay so user sees the message and any browser finishes processing the callback URL
            setTimeout(() => {
                router.replace(target)
            }, 700)
            setMessage('Sign-up confirmed — redirecting to sign in...')
            return
        }

        // Fallback: go to sign-in preserving email if provided
        const fallback = `/auth/signin${email ? `?email=${encodeURIComponent(email)}` : ''}`
        setTimeout(() => router.replace(fallback), 700)
        setMessage('Redirecting to sign in...')
    }, [router])

    return (
        <main style={{ height: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
                <p>{message}</p>
                <div style={{ marginTop: 12 }}>
                    <button
                        onClick={() => router.push('/auth/signin')}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid #ccc',
                            background: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        Go to sign in
                    </button>
                </div>
            </div>
        </main>
    )
}