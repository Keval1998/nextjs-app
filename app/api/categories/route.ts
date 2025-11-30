import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/adminClient';
import Role from '@/lib/constants/roles';

async function extractTokenFromRequest(req: Request) {
  const authHeader = req.headers.get('authorization');
  let token: string | null = null;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) token = authHeader.slice(7).trim();
  if (!token) {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('sb-access-token='));
      if (match) token = match.split('=')[1];
    }
  }
  return token;
}

async function requireAdmin(req: Request) {
  const token = await extractTokenFromRequest(req);
  if (!token) return { ok: false, status: 401, message: 'Unauthorized: missing token' };
  const userRes = await supabaseAdmin.auth.getUser(token);
  const user = (userRes as any)?.data?.user;
  if (!user) return { ok: false, status: 401, message: 'Unauthorized: invalid token' };
  const { data: appUser, error } = await supabaseAdmin.from('users').select('role').eq('id', user.id).limit(1).maybeSingle();
  if (error) return { ok: false, status: 500, message: 'Failed to fetch app user' };
  const role = (appUser as any)?.role ?? null;
  if (role !== Role.ADMIN) return { ok: false, status: 403, message: 'Forbidden: admin only' };
  return { ok: true, user };
}

export async function GET(req: Request) {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost';
    const url = new URL(req.url, base);
    const searchQuery = url.searchParams.get('q') ?? '';
    const limit = Number(url.searchParams.get('limit') ?? '12');
    const page = Number(url.searchParams.get('page') ?? '1');
    const offset = (Math.max(1, page) - 1) * limit;

      const res = await supabaseAdmin.rpc('categories_search', {
        p_limit: limit,
        p_offset: offset,
        p_search: searchQuery,
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
    // Only admins may create categories
    const adminCheck = await requireAdmin(req);
    if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status });

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
