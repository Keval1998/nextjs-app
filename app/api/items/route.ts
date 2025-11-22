import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/adminClient';

export async function GET(req: Request) {
  try {
    // req.url may be a relative path when called from server code; provide a base fallback
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost';
    const url = new URL(req.url, base);
    const q = url.searchParams.get('q') ?? '';
    const limit = Number(url.searchParams.get('limit') ?? '10');
    const page = Number(url.searchParams.get('page') ?? '1');
    const offset = (Math.max(1, page) - 1) * limit;

    // Call stored procedure if present, otherwise simple select
    const { data, error } = await supabaseAdmin.rpc('items_search', {
      p_limit: limit,
      p_offset: offset,
      p_search: q,
    }).then(r => ({ data: (r as any).data, error: (r as any).error }));

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price = 0, image_url = '' } = body;
    // Use stored procedure to insert item
    const { data, error } = await supabaseAdmin.rpc('items_insert', {
      p_name: name,
      p_price: price,
      p_image_url: image_url,
    }).then(r => ({ data: (r as any).data, error: (r as any).error }));

    if (error) throw error;
    return NextResponse.json(data ?? {}, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
