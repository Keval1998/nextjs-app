"use client";
import React from 'react';
import Link from 'next/link';

type Item = {
  id: string;
  name: string;
  price: string | number;
  stock?: number;
  is_active?: boolean;
  image_url?: string;
};

export default function ItemsTable({ items, onSort, sortBy }:
  { items: Item[]; onSort?: (col: string) => void; sortBy?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Stock</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Active</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((it) => (
            <tr key={it.id}>
              <td className="px-4 py-2 text-sm text-gray-700">{it.name}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{it.price}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{it.stock ?? '-'}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{it.is_active ? 'Yes' : 'No'}</td>
              <td className="px-4 py-2 text-sm text-gray-700">
                <Link href={`/items/${it.id}`} className="text-indigo-600 hover:underline">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
