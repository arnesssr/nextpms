import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching low stock items...');
    
    // First, try to get low stock items with product details via join
    let { data: lowStockItems, error } = await supabase
      .from('inventory_items')
      .select(`
        id,
        quantity_available,
        min_stock_level,
        product_id,
        products (
          name,
          sku
        )
      `)
      .gt('min_stock_level', 0)
      .order('quantity_available', { ascending: true })
      .limit(50);

    // If join fails, try fetching inventory items without join
    if (error || !lowStockItems) {
      console.log('Join query failed, trying without join...');
      const { data: inventoryData, error: invError } = await supabase
        .from('inventory_items')
        .select('*')
        .gt('min_stock_level', 0)
        .order('quantity_available', { ascending: true })
        .limit(50);
      
      if (invError) {
        console.error('Failed to fetch inventory items:', invError);
        return NextResponse.json(
          { error: 'Failed to fetch inventory items', details: invError.message },
          { status: 500 }
        );
      }

      // If we have inventory data, manually fetch product details
      if (inventoryData && inventoryData.length > 0) {
        const productIds = inventoryData.map(item => item.product_id).filter(Boolean);
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, sku')
          .in('id', productIds);
        
        // Map products to inventory items
        const productsMap = new Map(productsData?.map(p => [p.id, p]) || []);
        lowStockItems = inventoryData.map(item => ({
          ...item,
          products: productsMap.get(item.product_id) || null
        }));
      } else {
        lowStockItems = inventoryData || [];
      }
    }

    console.log(`Fetched ${lowStockItems?.length || 0} inventory items`);

    // Filter for items where quantity is less than or equal to min stock level
    const filteredLowStock = (lowStockItems || []).filter(item => 
      item.quantity_available <= item.min_stock_level
    );

    console.log(`Filtered to ${filteredLowStock.length} low stock items`);

    // Transform the data
    const transformedItems = filteredLowStock.map(item => ({
      id: item.id,
      name: item.products?.name || 'Unknown Product',
      sku: item.products?.sku || 'N/A',
      current_stock: item.quantity_available,
      threshold: item.min_stock_level
    })).slice(0, 5); // Limit to 5 items

    console.log('Returning transformed items:', transformedItems);

    return NextResponse.json({
      items: transformedItems,
      total: transformedItems.length
    });
  } catch (error) {
    console.error('Low stock items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock items' },
      { status: 500 }
    );
  }
}
