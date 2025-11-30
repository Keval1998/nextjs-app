"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Role from '@/lib/constants/roles';

// Simple vendor search modal used by admins to pick a vendor
function VendorPicker({ onPick, onClose }: { onPick: (vendor: any) => void; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Autocomplete: fetch suggestions as the user types. When the input is empty,
  // fetch the first 10 vendors to show as suggestions.
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('limit', '10');
        params.set('page', '1');
        if (searchQuery && searchQuery.trim().length > 0) {
          params.set('q', searchQuery.trim());
        }
        const res = await fetch('/api/vendors?' + params.toString());
        const json = await res.json();
        if (!mounted) return;
        setResults(json.vendors ?? []);
      } catch (e) {
        console.error('vendor autocomplete failed', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 200); // debounce 200ms

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Immediate fetch helper used by the Search button (no debounce)
  async function fetchSuggestions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '10');
      params.set('page', '1');
      if (searchQuery && searchQuery.trim().length > 0) {
        params.set('q', searchQuery.trim());
      }
      const res = await fetch('/api/vendors?' + params.toString());
      const json = await res.json();
      setResults(json.vendors ?? []);
    } catch (e) {
      console.error('vendor autocomplete failed', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-4 w-full max-w-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Select vendor</h3>
          <button onClick={onClose} className="text-sm text-gray-600">Close</button>
        </div>
        <div className="mt-3 flex gap-2">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search vendors" className="flex-1 border rounded p-2" />
          <button onClick={fetchSuggestions} className="px-3 py-2 bg-gray-100 rounded">Search</button>
        </div>
        <div className="mt-3 max-h-64 overflow-auto">
          {loading ? <div>Searching…</div> : (
            results.map(v => (
              <div key={v.id} className="p-2 border-b flex items-center justify-between">
                <div>
                  <div className="font-medium">{v.name}</div>
                  <div className="text-sm text-gray-600">{v.type ?? ''}</div>
                </div>
                <div>
                  <button onClick={() => { onPick(v); }} className="px-3 py-1 bg-emerald-600 text-white rounded">Pick</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-3 text-right">
          <button onClick={() => { window.location.href = '/admin/vendors/create?return_to=' + encodeURIComponent(window.location.href); }} className="text-sm text-indigo-600 underline">Create new vendor</button>
        </div>
      </div>
    </div>
  );
}

export default function AddItemPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorLocked, setVendorLocked] = useState(false);
  const [vendorName, setVendorName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name) return setError('Name required');
    if (!categoryId) return setError('Category is required');
    setLoading(true);
    try {
      // Call server API to create item; include vendor_id
      const payload: any = { name, price: Number(price || 0), image_url: image };
      if (vendorId) payload.vendor_id = vendorId;
      if (categoryId) payload.category_id = categoryId;
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (returnTo) {
        // returnTo may be a full URL or path — navigate back there
        window.location.href = returnTo;
      } else {
        router.push(`/items/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Read role and vendor id from cookies (set at sign-in/signup) to avoid extra API calls.
    function getCookie(name: string) {
      const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='));
      if (!match) return null;
      return decodeURIComponent(match.split('=')[1] || '');
    }
    const roleFromCookie = getCookie('app-role');
    const vendorIdFromCookie = getCookie('app-vendor-id');
    if (roleFromCookie) setRole(roleFromCookie);
    if (vendorIdFromCookie) setVendorId(vendorIdFromCookie);
    // If a vendor_id query param is present, prefill and lock vendor selection.
    try {
      const sp = new URLSearchParams(window.location.search);
      const vq = sp.get('vendor_id');
      const vn = sp.get('vendor_name');
      const rt = sp.get('return_to');
      if (rt) setReturnTo(rt);
      if (vq) {
        setVendorId(vq);
        setVendorLocked(true);
        if (vn) {
          setVendorName(vn);
        } else {
          // fetch vendor name
          (async () => {
            try {
              const res = await fetch('/api/vendors/' + encodeURIComponent(vq));
              const json = await res.json();
              if (json?.vendor?.name) setVendorName(json.vendor.name);
            } catch (e) {
              // ignore
            }
          })();
        }
      }
    } catch (e) {
      // ignore in SSR
    }
    // Fetch categories for selection
    (async function loadCategories() {
      try {
        const res = await fetch('/api/categories?limit=100&page=1');
        const json = await res.json();
        setCategories(json.categories ?? []);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

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
        <div>
          <label className="block text-sm">Vendor</label>
          {vendorLocked ? (
            <input value={vendorName ?? vendorId ?? ''} readOnly className="w-full border rounded p-2 bg-gray-100" />
          ) : role === Role.ADMIN ? (
            <div className="flex items-center gap-2">
              <input value={vendorName ?? vendorId ?? ''} readOnly placeholder="Select vendor" className="flex-1 border rounded p-2 bg-gray-50" />
              <button type="button" onClick={() => setShowPicker(true)} className="px-3 py-2 bg-gray-100 rounded">Select</button>
            </div>
          ) : (
            <input value={vendorName ?? vendorId ?? ''} readOnly placeholder="Will use your vendor id" className="w-full border rounded p-2 bg-gray-50" />
          )}
        </div>
        <div>
          <label className="block text-sm">Category</label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value || null)}
            required
            className="w-full border rounded p-2"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Adding…' : 'Add Item'}</button>
        </div>
      </form>
      {showPicker && (
        <VendorPicker
          onPick={(v) => { setVendorId(v.id); setVendorName(v.name ?? null); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
