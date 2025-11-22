"use client";
import React, { useEffect, useState } from 'react';

type Category = {
  id: string;
  name: string;
  image_url?: string | null;
  description?: string | null;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(false);

  // form state
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}`);
      const json = await res.json();
      setCategories(json.categories ?? []);
    } catch (e) {
      console.error('fetchCategories error', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page]);

  async function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setPage(1);
      setQ((e.target as HTMLInputElement).value);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) return setError('Name is required');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), image_url: imageUrl.trim(), description: description.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to create category');
      setSuccess('Category added');
      setName('');
      setImageUrl('');
      setDescription('');
      // refresh list
      fetchCategories();
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Categories</h1>

      <section aria-labelledby="add-category" className="mb-6">
        <h2 id="add-category" className="text-lg font-medium">Add Category</h2>
        <form onSubmit={handleAdd} className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Add category form">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              aria-label="Category name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              aria-label="Image URL"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              aria-label="Description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>

          <div className="sm:col-span-3">
            <div className="flex items-center gap-3 mt-2">
              <button type="submit" className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded">Add Category</button>
              {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
              {success && <div role="status" className="text-sm text-green-600">{success}</div>}
            </div>
          </div>
        </form>
      </section>

      <section aria-labelledby="categories-list">
        <div className="flex items-center justify-between mb-4">
          <h2 id="categories-list" className="text-lg font-medium">All Categories</h2>
          <div className="flex items-center gap-2">
            <label className="sr-only">Search categories</label>
            <input
              type="search"
              placeholder="Search categories"
              aria-label="Search categories"
              onKeyDown={handleSearchKey}
              className="rounded-md border px-3 py-2"
            />
            <button onClick={() => { setPage(1); fetchCategories(); }} className="px-3 py-2 bg-gray-100 rounded">Search</button>
          </div>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.length === 0 && <div className="text-sm text-gray-600">No categories found.</div>}
            {categories.map((c) => (
              <article key={c.id} className="bg-white rounded shadow overflow-hidden">
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url} alt={c.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                )}
                <div className="p-3">
                  <h3 className="font-medium">{c.name}</h3>
                  {c.description && <p className="text-sm text-gray-600 mt-1">{c.description}</p>}
                  <div className="mt-3">
                    <a href={`/categories/${c.id}`} className="text-indigo-600 hover:underline">View details</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
