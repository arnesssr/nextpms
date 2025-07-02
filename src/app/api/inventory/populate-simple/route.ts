import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting simple inventory population...');

    // Get products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json({ error: 'Failed to fetch products', details: productsError }, { status: 500 });
    }

    console.log(`Found ${products?.length || 0} products`);

    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No products found', created: 0 });
    }

    // First, let's see what columns exist in inventory_items
    const { data: existingColumns, error: columnsError } = await supabase
      .from('inventory_items')
      .select('*')
      .limit(1);

    console.log('Existing inventory_items structure check:', { existingColumns, columnsError });

    let createdItems = [];
    
    // Try to create a simple inventory item for each product
    for (const product of products) {
      try {
        console.log(`Creating simple inventory for: ${product.name}`);
        
        // Use minimal required fields
        const inventoryData = {
          product_id: product.id,
          location_id: 'main_warehouse',
          location_name: 'Main Warehouse',
          quantity_on_hand: product.stock_quantity || 0,
          min_stock_level: product.min_stock_level || 0,
          unit_cost: product.cost_price || 0,
          status: 'active'
        };

        const { data: newItem, error: createError } = await supabase
          .from('inventory_items')
          .insert(inventoryData)
          .select()
          .single();

        if (createError) {
          console.error(`Error creating inventory for ${product.name}:`, createError);
          
          // If there's a column issue, try with even fewer fields
          if (createError.message?.includes('column')) {
            console.log('Trying with minimal fields...');
            const minimalData = {
              product_id: product.id,
              quantity_on_hand: product.stock_quantity || 0
            };
            
            const { data: newItemMinimal, error: minimalError } = await supabase
              .from('inventory_items')
              .insert(minimalData)
              .select()
              .single();
              
            if (!minimalError && newItemMinimal) {
              createdItems.push(newItemMinimal);
              console.log(`Created minimal inventory for: ${product.name}`);
            } else {
              console.error(`Minimal create also failed for ${product.name}:`, minimalError);
            }
          }
          continue;
        }

        if (newItem) {
          createdItems.push(newItem);
          console.log(`Successfully created inventory for: ${product.name}`);
        }
      } catch (error) {
        console.error(`Exception processing ${product.name}:`, error);
      }
    }

    console.log(`Simple population completed. Created: ${createdItems.length}`);

    return NextResponse.json({
      message: 'Simple inventory population completed',
      created: createdItems.length,
      total_products: products.length,
      items: createdItems,
      debug: {
        productsFound: products.map(p => ({ id: p.id, name: p.name, stock_quantity: p.stock_quantity })),
        createdItems: createdItems.length,
        tableName: 'inventory_items'
      }
    });
  } catch (error) {
    console.error('Unexpected error in simple population:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
