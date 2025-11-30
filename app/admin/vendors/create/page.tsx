"use client";
import React, { useState } from 'react';

export default function CreateVendorPage() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  // read optional return_to from query string so we can navigate back after creation
  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const rt = sp.get('return_to');
      if (rt) setReturnTo(rt);
    } catch (e) {
      // ignore
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) return setError('Name required');
    setLoading(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type: type.trim(), address: address.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to create vendor');
      const created = json.vendor;
      setSuccess('Vendor created');
      setName(''); setType(''); setAddress('');
      if (returnTo && created?.id) {
        const sep = returnTo.includes('?') ? '&' : '?';
        const url = `${returnTo}${sep}vendor_id=${encodeURIComponent(created.id)}&vendor_name=${encodeURIComponent(created.name)}`;
        window.location.href = url;
        return;
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Create Vendor</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Type</label>
          <input value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded">{loading ? 'Creating…' : 'Create Vendor'}</button>
        </div>
        {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
        {success && <div role="status" className="text-sm text-green-600">{success}</div>}
      </form>
    </main>
  );
}
