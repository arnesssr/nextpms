import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Search orders by order number or shipping address details
    const { data: orders, error, count } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `, { count: 'exact' })
      .or(`order_number.ilike.%${query}%,shipping_name.ilike.%${query}%,shipping_address.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      limit,
      offset,
      query
    });
  } catch (error) {
    console.error('Error searching orders:', error);
    return NextResponse.json({ error: 'Failed to search orders' }, { status: 500 });
  }
}
