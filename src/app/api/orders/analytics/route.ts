import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/services/database';
import { DatabaseError } from '@/types/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDatabase();

    // Build date filter
    let dateFilter = '';
    const dateParams: string[] = [];
    if (startDate) {
      dateFilter += ' AND created_at >= ?';
      dateParams.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND created_at <= ?';
      dateParams.push(endDate);
    }

    // Get total orders count
    const totalOrdersResult = await db.get(`
      SELECT COUNT(*) as total_orders
      FROM orders
      WHERE 1=1 ${dateFilter}
    `, dateParams);

    // Get total revenue
    const totalRevenueResult = await db.get(`
      SELECT SUM(total_amount) as total_revenue
      FROM orders
      WHERE 1=1 ${dateFilter}
    `, dateParams);

    // Get orders by status
    const ordersByStatus = await db.all(`
      SELECT status, COUNT(*) as count
      FROM orders
      WHERE 1=1 ${dateFilter}
      GROUP BY status
    `, dateParams);

    // Get average order value
    const avgOrderValueResult = await db.get(`
      SELECT AVG(total_amount) as avg_order_value
      FROM orders
      WHERE 1=1 ${dateFilter}
    `, dateParams);

    // Get top customers
    const topCustomers = await db.all(`
      SELECT 
        c.id,
        c.name,
        c.email,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_spent
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1 ${dateFilter}
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT 5
    `, dateParams);

    // Get orders trend (daily for last 30 days or specified period)
    const ordersTrend = await db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as daily_revenue
      FROM orders
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, dateParams);

    // Get revenue by payment method
    const revenueByPaymentMethod = await db.all(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM orders
      WHERE 1=1 ${dateFilter}
      GROUP BY payment_method
    `, dateParams);

    return NextResponse.json({
      analytics: {
        total_orders: totalOrdersResult.total_orders || 0,
        total_revenue: totalRevenueResult.total_revenue || 0,
        average_order_value: avgOrderValueResult.avg_order_value || 0,
        orders_by_status: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {} as Record<string, number>),
        top_customers: topCustomers,
        orders_trend: ordersTrend.reverse(), // Return in chronological order
        revenue_by_payment_method: revenueByPaymentMethod.reduce((acc, item) => {
          acc[item.payment_method || 'unknown'] = {
            count: item.count,
            total: item.total
          };
          return acc;
        }, {} as Record<string, { count: number; total: number }>)
      },
      filters: {
        start_date: startDate,
        end_date: endDate
      }
    });
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
