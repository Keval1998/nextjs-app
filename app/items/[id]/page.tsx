import React from 'react';

type Props = { params: { id: string } };

export default async function ItemDetailPage({ params }: Props) {
  const id = params.id;

  // Fetch server-side via API route. Provide a safe base fallback so relative path doesn't break.
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base.replace(/\/$/, '')}/api/items/${id}`);
  const data = await res.json();

  const item = data || null;

  if (!item) return <div className="p-4">Item not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-2">{item.name}</h2>
      <p className="text-sm text-gray-600 mb-4">Price: {item.price}</p>
      {item.image_url ? (
        <div className="mb-4">
          <img src={item.image_url} alt={item.name} className="max-w-full h-auto rounded" />
        </div>
      ) : null}
      <p className="text-sm text-gray-700">{item.description}</p>
    </div>
  );
}
