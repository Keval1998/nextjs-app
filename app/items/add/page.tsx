"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AddItemPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name) return setError('Name required');
    setLoading(true);
    try {
      // Call server API to create item; server will use admin client/DB
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: Number(price || 0), image_url: image }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      router.push(`/items/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Add Item</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm">Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm">Image URL</label>
          <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full border rounded p-2" />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Adding…' : 'Add Item'}</button>
        </div>
      </form>
    </div>
  );
}
