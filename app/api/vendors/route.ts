// app/api/vendors/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('id, name, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/vendors error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vendors: data }, { status: 200 });
  } catch (err: any) {
    console.error('Unexpected GET /api/vendors error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
