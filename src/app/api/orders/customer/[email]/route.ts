import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/services/database';
import { DatabaseError } from '@/types/errors';

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

    const db = await getDatabase();
    
    // Get customer by email
    const customer = await db.get(`
      SELECT id, name, email
      FROM customers
      WHERE email = ?
    `, [email]);

    if (!customer) {
      return NextResponse.json({ 
        error: 'Customer not found',
        orders: [],
        total: 0,
        limit,
        offset,
        customer_email: email
      });
    }

    // Get orders for this customer
    const orders = await db.all(`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [customer.id, limit, offset]);

    // Get total count for pagination
    const countResult = await db.get(`
      SELECT COUNT(*) as total
      FROM orders
      WHERE customer_id = ?
    `, [customer.id]);

    // Parse JSON fields
    const formattedOrders = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      shipping_address: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address,
      billing_address: typeof order.billing_address === 'string' ? JSON.parse(order.billing_address) : order.billing_address,
      metadata: order.metadata ? (typeof order.metadata === 'string' ? JSON.parse(order.metadata) : order.metadata) : null
    }));

    return NextResponse.json({
      orders: formattedOrders,
      total: countResult.total,
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
    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
