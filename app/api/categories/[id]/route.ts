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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', id)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ category: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  // admin-only
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status });

  try {
    const id = params.id;
    const body = await req.json();
    const { name = null, image_url = null, description = null } = body;

    const rpc = await supabaseAdmin.rpc('categories_update', {
      p_id: id,
      p_name: name,
      p_image_url: image_url,
      p_description: description,
    });
    const { data, error } = rpc as any;
    if (error) throw error;
    return NextResponse.json({ category: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // admin-only
  const adminCheck = await requireAdmin(req);
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status });

  try {
    const id = params.id;
    const rpc = await supabaseAdmin.rpc('categories_delete', { p_id: id });
    const { data, error } = rpc as any;
    if (error) throw error;
    return NextResponse.json({ deleted_id: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
