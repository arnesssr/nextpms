import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      defaultMinLevel = 10, 
      defaultMaxLevel = 100, 
      updateOnlyZero = true 
    } = body;

    console.log('Starting stock levels update...', { defaultMinLevel, defaultMaxLevel, updateOnlyZero });

    // Build the query based on updateOnlyZero flag
    let query = supabase
      .from('inventory_items')
      .select('id, min_stock_level, max_stock_level, quantity_on_hand')
      .eq('status', 'active');

    if (updateOnlyZero) {
      // Only update items where min_stock_level is 0 or null
      query = query.or('min_stock_level.is.null,min_stock_level.eq.0');
    }

    const { data: inventoryItems, error: fetchError } = await query;

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
      const currentQty = item.quantity_on_hand || 0;
      
      // Calculate intelligent min/max based on current quantity
      const calculatedMin = Math.max(defaultMinLevel, Math.floor(currentQty * 0.2)); // 20% of current as minimum
      const calculatedMax = Math.max(defaultMaxLevel, Math.floor(currentQty * 2)); // 200% of current as maximum
      
      let needsUpdate = false;
      const updateData: any = { id: item.id };

      // Update min_stock_level if needed
      if (updateOnlyZero) {
        if (!item.min_stock_level || item.min_stock_level === 0) {
          updateData.min_stock_level = calculatedMin;
          needsUpdate = true;
        }
        if (!item.max_stock_level) {
          updateData.max_stock_level = calculatedMax;
          needsUpdate = true;
        }
      } else {
        updateData.min_stock_level = calculatedMin;
        updateData.max_stock_level = calculatedMax;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updates.push(updateData);
      }
    }

    console.log(`Preparing to update ${updates.length} inventory items`);

    // Perform batch updates
    if (updates.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        for (const update of batch) {
          const { id, ...updateFields } = update;
          const { error: updateError } = await supabase
            .from('inventory_items')
            .update(updateFields)
            .eq('id', id);

          if (updateError) {
            console.error(`Error updating inventory item ${id}:`, updateError);
          } else {
            updatedCount++;
          }
        }
      }
    }

    console.log(`Stock levels update completed. Updated ${updatedCount} items.`);

    return NextResponse.json({
      success: true,
      message: `Successfully updated stock levels for ${updatedCount} inventory items`,
      totalProcessed: inventoryItems?.length || 0,
      updated: updatedCount,
      settings: {
        defaultMinLevel,
        defaultMaxLevel,
        updateOnlyZero
      }
    });

  } catch (error) {
    console.error('Unexpected error during stock levels update:', error);
    return NextResponse.json(
      { error: 'Internal server error during stock levels update' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get summary of stock levels status
    const { data: summary, error } = await supabase
      .from('inventory_items')
      .select('id, min_stock_level, max_stock_level, quantity_on_hand')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching summary:', error);
      return NextResponse.json(
        { error: 'Failed to fetch summary' },
        { status: 500 }
      );
    }

    const totalItems = summary?.length || 0;
    const itemsWithoutMinLevel = summary?.filter(item => !item.min_stock_level || item.min_stock_level === 0).length || 0;
    const itemsWithoutMaxLevel = summary?.filter(item => !item.max_stock_level).length || 0;
    const itemsWithBothLevels = summary?.filter(item => 
      item.min_stock_level && item.min_stock_level > 0 && item.max_stock_level
    ).length || 0;

    return NextResponse.json({
      totalItems,
      itemsWithBothLevels,
      itemsWithoutMinLevel,
      itemsWithoutMaxLevel,
      setupRecommended: itemsWithoutMinLevel > 0 || itemsWithoutMaxLevel > 0
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
