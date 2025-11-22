"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: 'https://legendary-space-engine-pgg5xwgjj7xc7pr6-3000.app.github.dev/auth/callback',
        },
        });

      if (signError) throw signError;

      // If a session is returned immediately (no email confirmation required), set cookie and redirect.
      const accessToken = (data as any)?.session?.access_token;
      if (accessToken) {
        // Set a simple client-side cookie for middleware detection (non-HttpOnly).
        document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        const from = searchParams?.get('from') ?? '/';
        router.push(from);
        return;
      }

      setMessage(
        "Check your email for a confirmation link (if email confirmations are enabled)."
      );
      setEmail("");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-2">Create account</h1>
        <p className="text-sm text-gray-600 mb-6">Create an account to start ordering.</p>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign up form">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              aria-label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              aria-label="Password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              aria-label="Confirm password"
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
            />
          </div>

          {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
          {message && <div role="status" className="text-sm text-green-600">{message}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/signin" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
