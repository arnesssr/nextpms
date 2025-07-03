import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting inventory population...');

    // First, check if we have products in the database
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, sku, stock_quantity, min_stock_level, cost_price')
      .eq('is_active', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        message: 'No products found to populate inventory',
        created: 0
      });
    }

    console.log(`Found ${products.length} products to process`);

    // Check if inventory_items table exists
    const { data: testInventory, error: testInventoryError } = await supabase
      .from('inventory_items')
      .select('id')
      .limit(1);

    if (testInventoryError) {
      console.error('Inventory table not accessible:', testInventoryError);
      return NextResponse.json({
        error: 'Inventory table not found. Please run the migration first.',
        details: testInventoryError.message
      }, { status: 400 });
    }

    const createdItems = [];
    let skippedItems = 0;

    // Create inventory items for each product
    for (const product of products) {
      try {
        console.log(`Processing product: ${product.name} (ID: ${product.id})`);
        
        // Check if inventory item already exists for this product
        const { data: existingItem, error: checkError } = await supabase
          .from('inventory_items')
          .select('id')
          .eq('product_id', product.id)
          .eq('location_id', 'main_warehouse')
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`Error checking existing item for product ${product.id}:`, checkError);
          continue;
        }

        if (existingItem) {
          console.log(`Skipping product ${product.name} - already exists`);
          skippedItems++;
          continue;
        }

        console.log(`Creating inventory item for product: ${product.name}`);
        

        // Create new inventory item
        const inventoryData = {
          product_id: product.id,
          location_id: 'main_warehouse',
          location_name: 'Main Warehouse',
          quantity_on_hand: product.stock_quantity || 0,
          quantity_reserved: 0,
          quantity_allocated: 0,
          quantity_incoming: 0,
          min_stock_level: product.min_stock_level || 0,
          reorder_point: product.min_stock_level || 0,
          reorder_quantity: (product.min_stock_level || 0) * 2,
          unit_cost: product.cost_price || 0,
          status: 'active',
          is_tracked: true,
          is_serialized: false,
          is_perishable: false,
          requires_quality_check: false,
          created_by: 'system'
        };

        const { data: newItem, error: createError } = await supabase
          .from('inventory_items')
          .insert(inventoryData)
          .select()
          .single();

        if (createError) {
          console.error(`Error creating inventory for product ${product.id}:`, createError);
          continue;
        }

        if (newItem) {
          createdItems.push(newItem);
          console.log(`Created inventory item for product: ${product.name}`);
        }
      } catch (itemError) {
        console.error(`Failed to process product ${product.id}:`, itemError);
        continue;
      }
    }

    console.log(`Inventory population completed. Created: ${createdItems.length}, Skipped: ${skippedItems}`);

    return NextResponse.json({
      message: 'Inventory population completed',
      created: createdItems.length,
      skipped: skippedItems,
      total_products: products.length,
      items: createdItems
    });
  } catch (error) {
    console.error('Unexpected error during inventory population:', error);
    return NextResponse.json(
      { error: 'Internal server error during inventory population' },
      { status: 500 }
    );
  }
}
