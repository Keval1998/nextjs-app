import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/adminClient';
import Role from '@/lib/constants/roles';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, email, role = Role.CUSTOMER, full_name = null } = body;

    if (!id || !email) return NextResponse.json({ error: 'Missing id or email' }, { status: 400 });

    // Insert into users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ id, email, full_name, role }])
      .select()
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    let vendor = null;
    if (role === Role.VENDOR) {
      // create a lightweight vendor record owned by this user
      const v = await supabaseAdmin
        .from('vendors')
        .insert([{ owner_user_id: id, name: `${email}-vendor` }])
        .select()
        .limit(1)
        .maybeSingle();
      if (v.error) throw v.error;
      vendor = v.data;
    }

    return NextResponse.json({ user: data, vendor }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost';
    const url = new URL(req.url, base);
    const userId = url.searchParams.get('uid');
    if (!userId) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    // If this user is a vendor, also return the vendor row owned by them (if any)
    let vendor = null;
    try {
      if (data?.role === 'vendor') {
        const v = await supabaseAdmin.from('vendors').select('*').eq('owner_user_id', userId).limit(1).maybeSingle();
        if (!v.error) vendor = v.data ?? null;
      }
    } catch (e) {
      // ignore vendor fetch errors
    }

    return NextResponse.json({ user: data, vendor });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, full_name, phone, role } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ user: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
