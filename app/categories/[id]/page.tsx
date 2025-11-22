import { supabaseAdmin } from '@/lib/supabase/adminClient';
import Link from 'next/link';
import AddItemLink from '@/app/components/AddItemLink';

type Props = { params: { id: string } };

export default async function CategoryPage({ params }: Props) {
  const id = params.id;

  const { data: category } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('id', id)
    .limit(1)
    .maybeSingle();

  // fetch items in this category via RPC
  const rpc = await supabaseAdmin.rpc('items_search', {
    p_limit: 50,
    p_offset: 0,
    p_search: null,
    p_category: id,
    p_vendor: null,
  });

  const items = (rpc as any).data ?? [];

  if (!category) {
    return (
      <main className="max-w-5xl mx-auto p-4">
        <h1>Category not found</h1>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-4">
        {category.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={category.image_url} alt={category.name} className="w-36 h-36 object-cover rounded" />
        ) : (
          <div className="w-36 h-36 bg-gray-100 flex items-center justify-center">No image</div>
        )}
        <div>
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-medium mb-3">Items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.length === 0 && <div className="text-sm text-gray-600">No items in this category yet.</div>}
          {items.map((it: any) => (
            <article key={it.id} className="bg-white rounded shadow p-3">
              {it.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image_url} alt={it.name} className="w-full h-36 object-cover mb-2" />
              ) : null}
              <h3 className="font-medium">{it.name}</h3>
              <p className="text-sm text-gray-600">₹{it.price}</p>
              <div className="mt-2">
                <Link href={`/items/${it.id}`} className="text-indigo-600 hover:underline">View</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Vendor Actions</h2>
        <p className="text-sm text-gray-600">If you are a vendor you can add items for this category.</p>
        <div className="mt-3">
          {/* Show link only for vendors */}
          {/* Client component will check role and vendor record */}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <AddItemLink categoryId={id} />
        </div>
      </section>
    </main>
  );
}
