import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/services/database';
import { DatabaseError } from '@/types/errors';

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

    const db = await getDatabase();
    
    // Get orders by status
    const orders = await db.all(`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.status = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [status, limit, offset]);

    // Get total count for pagination
    const countResult = await db.get(`
      SELECT COUNT(*) as total
      FROM orders
      WHERE status = ?
    `, [status]);

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
      status
    });
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
