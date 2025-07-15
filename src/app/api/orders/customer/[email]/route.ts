import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Get customer by email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, email')
      .eq('email', email)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ 
        error: 'Customer not found',
        orders: [],
        total: 0,
        limit,
        offset,
        customer_email: email
      });
    }

    // Get orders for this customer with count
    const { data: orders, error: ordersError, count } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `, { count: 'exact' })
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersError) {
      throw ordersError;
    }

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      limit,
      offset,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      }
    });
  } catch (error) {
    console.error('Error fetching orders by customer:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
