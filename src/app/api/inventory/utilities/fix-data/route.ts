import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting inventory data fix...');

    // Get all inventory items that need fixing
    const { data: items, error: fetchError } = await supabase
      .from('inventory_items')
      .select(`
        id,
        unit_cost,
        min_stock_level,
        max_stock_level,
        quantity_on_hand,
        products (
          cost_price,
          selling_price
        )
      `)
      .eq('status', 'active');

    if (fetchError) {
      console.error('Error fetching items:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }

    let updatedCount = 0;

    // Fix each item
    for (const item of items || []) {
      const updates: any = {};
      let needsUpdate = false;

      // Fix cost pricing
      if (!item.unit_cost || item.unit_cost === 0) {
        const productCostPrice = item.products?.cost_price;
        const productSellingPrice = item.products?.selling_price;
        
        if (productCostPrice && productCostPrice > 0) {
          updates.unit_cost = productCostPrice;
          needsUpdate = true;
        } else if (productSellingPrice && productSellingPrice > 0) {
          updates.unit_cost = productSellingPrice;
          needsUpdate = true;
        }
      }

      // Fix min/max stock levels
      if (!item.min_stock_level || item.min_stock_level === 0) {
        const currentQty = item.quantity_on_hand || 0;
        // Set min to 20% of current stock or minimum of 5
        updates.min_stock_level = Math.max(5, Math.floor(currentQty * 0.2));
        needsUpdate = true;
      }

      if (!item.max_stock_level) {
        const currentQty = item.quantity_on_hand || 0;
        // Set max to 200% of current stock or minimum of 50
        updates.max_stock_level = Math.max(50, Math.floor(currentQty * 2));
        needsUpdate = true;
      }

      // Apply updates if needed
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update(updates)
          .eq('id', item.id);

        if (updateError) {
          console.error(`Error updating item ${item.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`Updated item ${item.id}:`, updates);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${updatedCount} inventory items`,
      totalProcessed: items?.length || 0,
      updated: updatedCount
    });

  } catch (error) {
    console.error('Error fixing inventory data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
