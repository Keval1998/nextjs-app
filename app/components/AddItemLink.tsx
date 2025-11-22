"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function AddItemLink({ categoryId }: { categoryId: string }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const { data } = await supabase.auth.getUser();
        const uid = (data as any)?.user?.id;
        if (!uid) return;
        const res = await fetch(`/api/users?uid=${uid}`);
        const json = await res.json();
        // allow only if user is vendor and has vendor record
        if (json?.user?.role === 'vendor' && json?.vendor?.id) {
          if (mounted) setAllowed(true);
          return;
        }
        if (mounted) setAllowed(false);
      } catch (e) {
        if (mounted) setAllowed(false);
      }
    }
    check();
    return () => { mounted = false; };
  }, [categoryId]);

  if (!allowed) return null;
  return (
    <Link href={`/categories/${categoryId}/add-item`} className="inline-block px-3 py-2 bg-emerald-600 text-white rounded">Add item to this category</Link>
  );
}
