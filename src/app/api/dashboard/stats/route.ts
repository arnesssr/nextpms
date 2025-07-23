import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get total products count
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get total orders count
    const { count: ordersCount, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    // Default to 0 if there's an error (e.g., table doesn't exist)
    const totalOrdersCount = ordersError ? 0 : ordersCount;

    // Get low stock items count
    const { data: inventoryItems } = await supabase
      .from('inventory_items')
      .select('quantity_available, min_stock_level')
      .gt('min_stock_level', 0);

    // Filter items where quantity is less than or equal to min stock level
    const lowStockItems = (inventoryItems || []).filter(item => 
      item.quantity_available <= item.min_stock_level
    );
    const lowStockCount = lowStockItems.length;

    // Calculate total revenue (sum of all inventory value)
    const { data: inventoryValue } = await supabase
      .from('inventory_items')
      .select('quantity_available, unit_cost');

    const totalRevenue = inventoryValue?.reduce((sum, item) => {
      return sum + (item.quantity_available * item.unit_cost);
    }, 0) || 0;

    // Calculate percentage changes (mock for now since we don't have historical data)
    const lastMonthProducts = Math.floor((productsCount || 0) * 0.88);
    const productsChange = lastMonthProducts > 0 
      ? Math.round(((productsCount || 0) - lastMonthProducts) / lastMonthProducts * 100)
      : 0;

    return NextResponse.json({
      totalProducts: {
        value: productsCount || 0,
        change: productsChange,
        changeType: productsChange >= 0 ? 'increase' : 'decrease'
      },
      totalOrders: {
        value: totalOrdersCount || 0,
        change: 0, // No change since we're starting fresh
        changeType: 'increase'
      },
      revenue: {
        value: totalRevenue,
        change: 15, // Mock change
        changeType: 'increase'
      },
      lowStockItems: {
        value: lowStockCount,
        change: -5, // Mock change
        changeType: 'decrease'
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
