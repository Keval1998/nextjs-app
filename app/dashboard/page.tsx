import React from 'react';

export default async function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Customer Dashboard</h1>
      <p className="text-sm text-gray-600 mb-4">Browse categories, vendors and items.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow flex flex-col">
          <h3 className="font-medium">Categories</h3>
          <p className="text-sm text-gray-600 flex-1">Browse by category.</p>
          <div className="mt-3">
            <a href="/categories" className="inline-block px-3 py-2 bg-indigo-600 text-white rounded">Browse Categories</a>
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow flex flex-col">
          <h3 className="font-medium">Vendors</h3>
          <p className="text-sm text-gray-600 flex-1">Explore vendors and items.</p>
          <div className="mt-3">
            <a href="/vendors" className="inline-block px-3 py-2 bg-indigo-600 text-white rounded">Explore Vendors</a>
          </div>
        </div>
      </div>
    </div>
  );
}
