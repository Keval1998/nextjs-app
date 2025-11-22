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
    // pass optional filters
    const category = url.searchParams.get('category') ?? null;
    const vendor = url.searchParams.get('vendor') ?? null;

    const rpcRes = await supabaseAdmin.rpc('items_search', {
      p_limit: limit,
      p_offset: offset,
      p_search: q,
      p_category: category,
      p_vendor: vendor,
    });
    const { data, error } = rpcRes as any;

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price = 0, image_url = '', vendor_id, category_id, description = null, stock = 0 } = body;
    if (!vendor_id) return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
    if (!category_id) return NextResponse.json({ error: 'category_id is required' }, { status: 400 });
    // Validate auth: only vendor owner can create item for their vendor
    // Accept token via Authorization header Bearer or cookie 'sb-access-token'
    const authHeader = req.headers.get('authorization');
    let token: string | null = null;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.slice(7).trim();
    }
    if (!token) {
      // fallback to cookie
      token = req.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith('sb-access-token='))?.split('=')[1] ?? null;
    }

    if (!token) return NextResponse.json({ error: 'Unauthorized: missing token' }, { status: 401 });

    // Obtain user from token
    const userRes = await supabaseAdmin.auth.getUser(token);
    const user = (userRes as any)?.data?.user;
    if (!user) return NextResponse.json({ error: 'Unauthorized: invalid token' }, { status: 401 });

    // Verify vendor ownership
    const { data: vendorRow, error: vendorErr } = await supabaseAdmin
      .from('vendors')
      .select('id, owner_user_id')
      .eq('id', vendor_id)
      .limit(1)
      .maybeSingle();

    if (vendorErr || !vendorRow) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    if (vendorRow.owner_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: you do not own this vendor' }, { status: 403 });
    }

    // Use stored procedure to insert item (RPC will validate presence)
    const rpcRes = await supabaseAdmin.rpc('items_insert', {
      p_name: name,
      p_price: price,
      p_image_url: image_url,
      p_vendor_id: vendor_id,
      p_category_id: category_id,
      p_description: description,
      p_stock: stock,
    });
    const { data, error } = rpcRes as any;

    if (error) throw error;
    return NextResponse.json(data ?? {}, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
