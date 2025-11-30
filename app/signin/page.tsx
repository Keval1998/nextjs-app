"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase/client";
import Role from '@/lib/constants/roles';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // If we received a session, set a client cookie so middleware can detect session presence.
      // NOTE: this is a non-HttpOnly cookie set from the client. For production, prefer setting a
      // secure HttpOnly cookie from a server endpoint.
      const accessToken = (data as any)?.session?.access_token;
      const userId = (data as any)?.user?.id ?? (data as any)?.session?.user?.id;
      if (accessToken) {
        // Set cookie for 7 days
        document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }

      setMessage("Signed in successfully.");

      // Decide where to send the user: prefer `from` query param (if present), else use role
      const from = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('from') : null;

      // If we have an auth user id, try to fetch app user row to determine role
      let role: string | null = null;
      if (userId) {
        try {
          const res = await fetch(`/api/users?uid=${userId}`);
          const json = await res.json();
          if (json?.user?.role) role = json.user.role;
          else {
            // Create a default customer user row if missing
            const createRes = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: userId, email, role: Role.CUSTOMER }),
            });
            const createJson = await createRes.json();
            role = createJson?.user?.role ?? 'customer';
          }

          // Persist app-level role and vendor id in cookies for UI convenience
          if (role) {
            document.cookie = `app-role=${role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          }
          if (json?.vendor?.id) {
            document.cookie = `app-vendor-id=${json.vendor.id}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          } else {
            // clear any previous vendor cookie
            document.cookie = `app-vendor-id=; path=/; max-age=0; SameSite=Lax`;
          }
        } catch (e) {
          console.warn('Could not fetch/create app user row', e);
        }
      }

      const rolePath = role === Role.ADMIN ? '/admin' : role === Role.VENDOR ? '/vendor' : '/dashboard';
      router.push(from ?? rolePath);
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign in form">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          New here?{' '}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
