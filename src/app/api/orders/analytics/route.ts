import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');


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
const totalOrdersResult = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .match({ 'created_at': dateFilter })
      .range(0, 1);

    // Get total revenue
    const totalRevenueResult = await supabase
      .from('orders')
      .select('SUM(total_amount) as total_revenue')
      .match({ 'created_at': dateFilter });

    // Get orders by status
    const ordersByStatus = await supabase
      .from('orders')
      .select('status, COUNT(*) as count')
      .match({ 'created_at': dateFilter })
      .group('status');

    // Get average order value
    const avgOrderValueResult = await supabase
      .from('orders')
      .select('AVG(total_amount) as avg_order_value')
      .match({ 'created_at': dateFilter });

    // Get top customers
    const topCustomers = await supabase
      .from('orders')
      .select(`
        c.id,
        c.name,
        c.email,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_spent
      `)
      .match({ 'created_at': dateFilter })
      .join('customers c', { on: 'o.customer_id', to: 'c.id' })
      .group('c.id')
      .order('total_spent', { ascending: false })
      .range(0, 4);

    // Get orders trend (daily for last 30 days or specified period)
    const ordersTrend = await supabase
      .from('orders')
      .select(`
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as daily_revenue
      `)
      .match({ 'created_at': dateFilter })
      .group('DATE(created_at)')
      .order('date', { ascending: false })
      .range(0, 29);

    // Get revenue by payment method
    const revenueByPaymentMethod = await supabase
      .from('orders')
      .select(`
        payment_method,
        COUNT(*) as count,
        SUM(total_amount) as total
      `)
      .match({ 'created_at': dateFilter })
      .group('payment_method');

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
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
