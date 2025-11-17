// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/adminClient';

type OrderItem = { item_id: string; quantity: number; price: number };
type Body = { buyer_id?: string; items: OrderItem[] };

export async function POST(req: NextRequest) {
  try {
    const body: Body = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required' },
        { status: 400 }
      );
    }

    const apiKeyHeader = req.headers.get('x-service-role');
    if (!apiKeyHeader || apiKeyHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const total = body.items.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    // 1. Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        buyer_id: body.buyer_id ?? null,
        total,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 2. Create order_items
    const orderItemsPayload = body.items.map((i) => ({
      order_id: order.id,
      item_id: i.item_id,
      quantity: i.quantity,
      price: i.price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
      await supabaseAdmin.from('orders').delete().eq('id', order.id); // rollback
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json(
      { order_id: order.id, total, status: 'pending' },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Unexpected POST /api/orders/create error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
