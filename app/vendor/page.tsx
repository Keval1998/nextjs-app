"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Vendor = { id: string; name: string; created_at?: string };
type Category = { id: string; name: string; image_url?: string | null; description?: string | null };

export default function VendorPage() {
  const [role, setRole] = useState<string | null>(null);
  const [vendorRow, setVendorRow] = useState<any>(null);

  // vendors (for admin)
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsQ, setVendorsQ] = useState('');
  const [vendorsPage, setVendorsPage] = useState(1);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  // categories (for vendors/customers)
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsQ, setCatsQ] = useState('');
  const [catsPage, setCatsPage] = useState(1);
  const [catsLoading, setCatsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser();
        const uid = (data as any)?.user?.id;
        if (!uid) return;
        const res = await fetch(`/api/users?uid=${uid}`);
        const json = await res.json();
        if (!mounted) return;
        setRole(json?.user?.role ?? 'customer');
        setVendorRow(json?.vendor ?? null);
      } catch (e) {
        // ignore
      }
    }
    loadUser();
    return () => { mounted = false; };
  }, []);

  useEffect(() => { if (role === 'admin') fetchVendors(); }, [role, vendorsPage]);
  useEffect(() => { if (role) fetchCategories(); }, [role, catsPage]);

  async function fetchVendors() {
    setVendorsLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('limit', '10');
      qs.set('page', String(vendorsPage));
      if (vendorsQ) qs.set('q', vendorsQ);
      const res = await fetch('/api/vendors?' + qs.toString());
      const json = await res.json();
      setVendors(json.vendors ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setVendorsLoading(false);
    }
  }

  async function fetchCategories() {
    setCatsLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('limit', '12');
      qs.set('page', String(catsPage));
      if (catsQ) qs.set('q', catsQ);
      const res = await fetch('/api/categories?' + qs.toString());
      const json = await res.json();
      setCategories(json.categories ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setCatsLoading(false);
    }
  }

  function onVendorsSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setVendorsPage(1);
      fetchVendors();
    }
  }

  function onCatsSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setCatsPage(1);
      fetchCategories();
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Vendor Dashboard</h1>
      <p className="text-sm text-gray-600 mb-4">Manage your items and view orders.</p>

      {role === 'admin' ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Vendors</h2>
            <div className="flex items-center gap-2">
              <input value={vendorsQ} onChange={(e) => setVendorsQ(e.target.value)} onKeyDown={onVendorsSearchKey} placeholder="Search vendors" className="rounded-md border px-3 py-2" />
              <button onClick={() => { setVendorsPage(1); fetchVendors(); }} className="px-3 py-2 bg-gray-100 rounded">Search</button>
            </div>
          </div>

          {vendorsLoading ? <div>Loading vendors…</div> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vendors.map(v => (
                <article key={v.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium">{v.name}</h3>
                  <p className="text-sm text-gray-600">Created: {new Date(v.created_at || '').toLocaleString()}</p>
                  <div className="mt-3">
                    <a href={`/vendors/${v.id}`} className="text-indigo-600 hover:underline">View vendor</a>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button onClick={() => setVendorsPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
            <span className="px-3 py-1">Page {vendorsPage}</span>
            <button onClick={() => setVendorsPage((p) => p + 1)} className="px-3 py-1 border rounded">Next</button>
          </div>
        </section>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Categories</h2>
            <div className="flex items-center gap-2">
              <input value={catsQ} onChange={(e) => setCatsQ(e.target.value)} onKeyDown={onCatsSearchKey} placeholder="Search categories" className="rounded-md border px-3 py-2" />
              <button onClick={() => { setCatsPage(1); fetchCategories(); }} className="px-3 py-2 bg-gray-100 rounded">Search</button>
            </div>
          </div>

          {catsLoading ? <div>Loading categories…</div> : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.map(c => (
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
                    <div className="mt-3 flex gap-2">
                      <a href={`/categories/${c.id}`} className="text-indigo-600 hover:underline">View</a>
                      {/* show add item link only for vendors */}
                      {vendorRow && (
                        <a href={`/categories/${c.id}/add-item`} className="inline-block px-3 py-1 bg-emerald-600 text-white rounded">Add item</a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button onClick={() => setCatsPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
            <span className="px-3 py-1">Page {catsPage}</span>
            <button onClick={() => setCatsPage((p) => p + 1)} className="px-3 py-1 border rounded">Next</button>
          </div>
        </section>
      )}
    </main>
  );
}
