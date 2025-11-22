"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AddItemToCategory({ params }: { params: { id: string } }) {
  const categoryId = params.id;
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Get current user and fetch vendor id from app users table
    const { data: userRes } = await supabase.auth.getUser();
    const uid = (userRes as any)?.user?.id;
    if (!uid) return setError('Not authenticated');

    let vendorId: string | null = null;
    try {
      const res = await fetch(`/api/users?uid=${uid}`);
      const json = await res.json();
      if (json?.user?.role === 'vendor' && json?.vendor) vendorId = json.vendor.id;
    } catch (e) {
      // ignore
    }

    if (!vendorId) return setError('You are not a vendor or no vendor record found');
    if (!name.trim()) return setError('Name required');

    try {
      const body = {
        name: name.trim(),
        price: Number(price) || 0,
        image_url: imageUrl.trim(),
        vendor_id: vendorId,
        category_id: categoryId,
        stock: Number(stock) || 0,
      };
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to add item');
      setSuccess('Item added');
      setName('');
      setPrice('');
      setImageUrl('');
      setStock('1');
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold">Add item to category</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded border p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" className="mt-1 block w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Image URL</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 block w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Stock</label>
          <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" className="mt-1 block w-24 rounded border p-2" />
        </div>
        <div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded">Add Item</button>
        </div>
        {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
        {success && <div role="status" className="text-sm text-green-600">{success}</div>}
      </form>
    </main>
  );
}
