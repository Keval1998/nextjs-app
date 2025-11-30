"use client";
import React, { useEffect, useState } from 'react';

type Vendor = {
  id: string;
  name: string;
  type?: string | null;
  address?: string | null;
  created_at?: string | null;
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'name' | 'type' | 'created_at'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  async function fetchVendors() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('limit', String(limit));
      qs.set('page', String(page));
      if (searchQuery) qs.set('q', searchQuery);
      const res = await fetch('/api/vendors?' + qs.toString());
      const json = await res.json();
      setVendors(json.vendors ?? []);
    } catch (e) {
      console.error('fetchVendors error', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchVendors(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [searchQuery, page]);

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setPage(1);
      setSearchQuery((e.target as HTMLInputElement).value);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingVendor) return;
    setError(null);
    try {
      const res = await fetch(`/api/vendors/${editingVendor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name: editingVendor.name, type: editingVendor.type, address: editingVendor.address }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to update vendor');
      setSuccess('Vendor updated');
      setShowEditModal(false);
      fetchVendors();
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  async function handleDeleteVendor(id: string) {
    if (!confirm('Delete this vendor? This cannot be undone.')) return;
    setDeletingVendorId(id);
    setError(null);
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: 'DELETE', credentials: 'same-origin' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to delete vendor');
      setSuccess('Vendor deleted');
      fetchVendors();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setDeletingVendorId(null);
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Vendors</h1>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">All Vendors</h2>
          <div className="flex items-center gap-2">
            <label className="sr-only">Search vendors</label>
            <input
              type="search"
              placeholder="Search vendors"
              aria-label="Search vendors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={onSearchKey}
              className="rounded-md border px-3 py-2"
            />
            <button onClick={() => { setPage(1); fetchVendors(); }} className="px-3 py-2 bg-gray-100 rounded">Search</button>
            <button onClick={() => { window.location.href = '/admin/vendors/create?return_to=' + encodeURIComponent(window.location.href); }} className="ml-3 inline-flex items-center px-3 py-2 bg-emerald-600 text-white rounded">Add Vendor</button>
          </div>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Address</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Created</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-sm text-gray-600">No vendors found.</td></tr>
                )}
                {vendors
                  .slice()
                  .sort((a, b) => {
                    const dir = sortDir === 'asc' ? 1 : -1;
                    const ka = (a as any)[sortKey] ?? '';
                    const kb = (b as any)[sortKey] ?? '';
                    return String(ka).localeCompare(String(kb)) * dir;
                  })
                  .map((v) => (
                    <tr key={v.id}>
                      <td className="px-4 py-3 text-sm text-blue-600">
                        <a href={`/vendors/${v.id}`} className="hover:underline">{v.name}</a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.type ?? ''}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.address ?? ''}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{v.created_at ? new Date(v.created_at).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button onClick={() => { setEditingVendor(v); setShowEditModal(true); setError(null); setSuccess(null); }} className="ml-3 text-sm px-2 py-1 bg-yellow-400 text-white rounded">Edit</button>
                        <button onClick={() => handleDeleteVendor(v.id)} disabled={deletingVendorId===v.id} className="ml-2 text-sm px-2 py-1 bg-red-600 text-white rounded">{deletingVendorId===v.id ? 'Deleting…' : 'Delete'}</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
          <span className="px-3 py-1">Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </section>
      {showEditModal && editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded p-4 w-full max-w-lg">
            <h3 className="font-medium mb-2">Edit Vendor</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-sm">Name</label>
                <input value={editingVendor.name} onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm">Type</label>
                <input value={editingVendor.type ?? ''} onChange={(e) => setEditingVendor({ ...editingVendor, type: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm">Address</label>
                <input value={editingVendor.address ?? ''} onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" className="px-3 py-2 bg-emerald-600 text-white rounded">Save</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
                {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
                {success && <div role="status" className="text-sm text-green-600">{success}</div>}
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
