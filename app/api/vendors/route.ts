import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/adminClient';

export async function GET(req: Request) {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost';
    const url = new URL(req.url, base);
    const q = url.searchParams.get('q') ?? '';
    const limit = Number(url.searchParams.get('limit') ?? '10');
    const page = Number(url.searchParams.get('page') ?? '1');
    const offset = (Math.max(1, page) - 1) * limit;

    const rpc = await supabaseAdmin.rpc('vendors_search', {
      p_limit: limit,
      p_offset: offset,
      p_search: q,
    });

    if (rpc.error) {
      console.error('/api/vendors RPC error:', rpc.error);
      return NextResponse.json({ error: rpc.error.message }, { status: 500 });
    }

    const vendors = rpc.data ?? [];
    return NextResponse.json({ vendors }, { status: 200 });
  } catch (err: any) {
    console.error('/api/vendors unexpected error:', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
