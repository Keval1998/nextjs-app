"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Header() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setEmail(data.user?.email ?? null);
      } catch (e) {
        // ignore
      }
    }
    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
    setLoading(false);
    router.push('/signin');
  }

  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold text-gray-900">
              My First NextJS App
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/items" className="text-sm text-gray-700 hover:text-gray-900">
              Items
            </Link>

            {email ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:inline">{email}</span>
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:opacity-60"
                >
                  {loading ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            ) : (
              <Link href="/signin" className="text-sm text-indigo-600 hover:underline">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
