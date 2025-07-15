import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/services/database';
import { DatabaseError } from '@/types/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Search orders by order number, customer name, or customer email
    const orders = await db.all(`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.order_number LIKE ? 
        OR c.name LIKE ? 
        OR c.email LIKE ?
        OR o.shipping_address LIKE ?
        OR o.billing_address LIKE ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, limit, offset]);

    // Get total count for pagination
    const countResult = await db.get(`
      SELECT COUNT(*) as total
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.order_number LIKE ? 
        OR c.name LIKE ? 
        OR c.email LIKE ?
        OR o.shipping_address LIKE ?
        OR o.billing_address LIKE ?
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);

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
      query
    });
  } catch (error) {
    console.error('Error searching orders:', error);
    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to search orders' }, { status: 500 });
  }
}
