import React from 'react';

export default async function VendorDetails({ params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base.replace(/\/$/, '')}/api/vendors/${id}`);
    const json = await res.json();
    const vendor = json?.vendor ?? null;
    if (!vendor) return (
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-xl font-semibold">Vendor not found</h1>
      </main>
    );
    return (
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-semibold">{vendor.name}</h1>
        {vendor.type && <p className="text-sm text-gray-600">Type: {vendor.type}</p>}
        {vendor.address && <p className="text-sm text-gray-600">Address: {vendor.address}</p>}
        <div className="mt-4">
          <a href={`/items/add?vendor_id=${vendor.id}&return_to=${encodeURIComponent(`/vendors/${vendor.id}`)}`} className="inline-block px-3 py-2 bg-emerald-600 text-white rounded">Add Item</a>
        </div>
      </main>
    );
  } catch (e) {
    return (
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-xl font-semibold">Error loading vendor</h1>
      </main>
    );
  }
}
