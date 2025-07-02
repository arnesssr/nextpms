import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get inventory summary from inventory_items table
    const { data: inventoryItems, error } = await supabase
      .from('inventory_items')
      .select('quantity_on_hand, unit_cost, min_stock_level, location_id')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching inventory items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inventory summary' },
        { status: 500 }
      );
    }

    const items = inventoryItems || [];
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.quantity_on_hand * item.unit_cost), 0);
    const lowStockCount = items.filter(item => item.quantity_on_hand <= item.min_stock_level).length;
    const outOfStockCount = items.filter(item => item.quantity_on_hand <= 0).length;
    const totalLocations = new Set(items.map(item => item.location_id)).size;

    return NextResponse.json({
      total_items: totalItems,
      total_value: parseFloat(totalValue.toFixed(2)),
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      total_locations: totalLocations
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
