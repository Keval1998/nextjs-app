// app/api/items/create/route.ts
export const runtime = 'nodejs';
export const preferredRegion = 'auto';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/adminClient';

type Body = {
  vendor_id: string;
  title: string;
  description?: string;
  price?: number;
  status?: 'draft' | 'published' | 'under_review';
};

export async function POST(req: NextRequest) {
  try {
    const body: Body = await req.json();

    if (!body.vendor_id || !body.title) {
      return NextResponse.json(
        { error: 'vendor_id and title are required' },
        { status: 400 }
      );
    }

    // Temporary protection - only allow server-to-server
    const apiKeyHeader = req.headers.get('x-service-role');
    if (!apiKeyHeader || apiKeyHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insertPayload = {
      vendor_id: body.vendor_id,
      title: body.title,
      description: body.description ?? null,
      price: body.price ?? 0,
      status: body.status ?? 'draft',
    };

    const { data, error } = await supabaseAdmin
      .from('items')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('POST /api/items/create error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err: any) {
    console.error('Unexpected POST /api/items/create error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
