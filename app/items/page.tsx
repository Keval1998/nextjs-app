"use client";
import { useEffect, useState } from 'react';
import ItemsTable from './components/ItemsTable';
import Link from 'next/link';

type Item = { id: string; name: string; price: number; stock?: number; is_active?: boolean };

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('limit', '10');
      qs.set('page', String(page));
      if (query) qs.set('q', query);
      const res = await fetch('/api/items?' + qs.toString());
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Items</h2>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items"
            className="border rounded px-2 py-1"
          />
          <button onClick={() => { setPage(1); load(); }} className="px-3 py-1 bg-indigo-600 text-white rounded">Search</button>
          <Link href="/items/add" className="px-3 py-1 bg-green-600 text-white rounded">Add Item</Link>
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <ItemsTable items={items} />
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
        <span className="px-3 py-1">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
}
