import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/adminClient';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { data, error } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json(data ?? null);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
