import React from 'react';

export default async function AdminPage() {
  // Minimal placeholder admin dashboard
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <p className="text-sm text-gray-600 mb-4">Overview: manage vendors and view reports.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow flex flex-col">
          <h3 className="font-medium">Categories</h3>
          <p className="text-sm text-gray-600 flex-1">Create, edit and delete categories. Add image URLs for cards.</p>
          <div className="mt-3">
            <a href="/admin/categories" className="inline-block px-3 py-2 bg-emerald-600 text-white rounded">Manage Categories</a>
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow flex flex-col">
          <h3 className="font-medium">Vendors</h3>
          <p className="text-sm text-gray-600 flex-1">View and manage vendors.</p>
          <div className="mt-3">
            <a href="/vendors" className="inline-block px-3 py-2 bg-indigo-600 text-white rounded">Vendors</a>
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow flex flex-col">
          <h3 className="font-medium">Reports</h3>
          <p className="text-sm text-gray-600 flex-1">Sales, orders and usage summaries.</p>
          <div className="mt-3">
            <a href="/reports" className="inline-block px-3 py-2 bg-indigo-600 text-white rounded">View reports</a>
          </div>
        </div>
      </div>
    </div>
  );
}
