import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/adminClient';

export async function GET(req: Request) {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost';
    const url = new URL(req.url, base);
    const q = url.searchParams.get('q') ?? '';
    const limit = Number(url.searchParams.get('limit') ?? '12');
    const page = Number(url.searchParams.get('page') ?? '1');
    const offset = (Math.max(1, page) - 1) * limit;

      const res = await supabaseAdmin.rpc('categories_search', {
        p_limit: limit,
        p_offset: offset,
        p_search: q,
      });

      const { data, error } = res as any;

    if (error) {
      console.error('/api/categories GET error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data ?? [] });
  } catch (err: any) {
    console.error('/api/categories unexpected error', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, image_url = null, description = null } = body;
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    const rpc = await supabaseAdmin.rpc('categories_create', {
      p_name: name,
      p_image_url: image_url,
      p_description: description,
    });
    const { data, error } = rpc as any;

    if (error) {
      console.error('/api/categories POST error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (err: any) {
    console.error('/api/categories POST unexpected error', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
