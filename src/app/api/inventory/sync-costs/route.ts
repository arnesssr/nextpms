import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting cost sync operation...');

    // First, let's get all inventory items with their product information
    const { data: inventoryItems, error: fetchError } = await supabase
      .from('inventory_items')
      .select(`
        id,
        product_id,
        unit_cost,
        products (
          cost_price,
          selling_price
        )
      `)
      .eq('status', 'active');

    if (fetchError) {
      console.error('Error fetching inventory items:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch inventory items' },
        { status: 500 }
      );
    }

    console.log(`Found ${inventoryItems?.length || 0} inventory items to process`);

    let updatedCount = 0;
    const updates = [];

    // Process each inventory item
    for (const item of inventoryItems || []) {
      const productCostPrice = item.products?.cost_price;
      const productSellingPrice = item.products?.selling_price;
      
      // Determine the best cost value to use
      let newUnitCost = item.unit_cost;
      
      if (productCostPrice && productCostPrice > 0) {
        newUnitCost = productCostPrice;
      } else if (productSellingPrice && productSellingPrice > 0 && (!item.unit_cost || item.unit_cost === 0)) {
        // Use selling price as fallback if no cost is available
        newUnitCost = productSellingPrice;
      }

      // Only update if the cost has changed
      if (newUnitCost !== item.unit_cost) {
        updates.push({
          id: item.id,
          unit_cost: newUnitCost
        });
      }
    }

    console.log(`Preparing to update ${updates.length} inventory items`);

    // Perform batch updates
    if (updates.length > 0) {
      // Update in batches to avoid overwhelming the database
      const batchSize = 50;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        for (const update of batch) {
          const { error: updateError } = await supabase
            .from('inventory_items')
            .update({ unit_cost: update.unit_cost })
            .eq('id', update.id);

          if (updateError) {
            console.error(`Error updating inventory item ${update.id}:`, updateError);
          } else {
            updatedCount++;
          }
        }
      }
    }

    console.log(`Cost sync completed. Updated ${updatedCount} items.`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced costs for ${updatedCount} inventory items`,
      totalProcessed: inventoryItems?.length || 0,
      updated: updatedCount
    });

  } catch (error) {
    console.error('Unexpected error during cost sync:', error);
    return NextResponse.json(
      { error: 'Internal server error during cost sync' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get summary of cost sync status
    const { data: summary, error } = await supabase
      .from('inventory_items')
      .select(`
        id,
        unit_cost,
        products (
          cost_price,
          selling_price
        )
      `)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching summary:', error);
      return NextResponse.json(
        { error: 'Failed to fetch summary' },
        { status: 500 }
      );
    }

    const totalItems = summary?.length || 0;
    const itemsWithZeroCost = summary?.filter(item => !item.unit_cost || item.unit_cost === 0).length || 0;
    const itemsWithCost = totalItems - itemsWithZeroCost;
    const itemsNeedingSync = summary?.filter(item => {
      const productCostPrice = item.products?.cost_price;
      const productSellingPrice = item.products?.selling_price;
      const currentCost = item.unit_cost || 0;
      
      return (productCostPrice && productCostPrice > 0 && productCostPrice !== currentCost) ||
             ((!currentCost || currentCost === 0) && productSellingPrice && productSellingPrice > 0);
    }).length || 0;

    return NextResponse.json({
      totalItems,
      itemsWithCost,
      itemsWithZeroCost,
      itemsNeedingSync,
      syncRecommended: itemsNeedingSync > 0
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
