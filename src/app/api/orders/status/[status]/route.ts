import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export async function GET(
  request: NextRequest,
  { params }: { params: { status: string } }
) {
  try {
    const status = params.status.toLowerCase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Valid statuses are: ' + VALID_STATUSES.join(', ') 
      }, { status: 400 });
    }

    // Get orders by status with count
    const { data: orders, error, count } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `, { count: 'exact' })
      .eq('status', status)
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
      status
    });
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
