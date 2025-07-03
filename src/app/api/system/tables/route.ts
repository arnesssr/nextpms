import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tables: {}
    };

    // Check products table
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku, stock_quantity')
        .limit(5);
      
      results.tables.products = {
        exists: !productsError,
        error: productsError?.message,
        count: products?.length || 0,
        sample: products?.slice(0, 3) || []
      };
    } catch (error) {
      results.tables.products = { exists: false, error: 'Table access failed' };
    }

    // Check inventory_items table
    try {
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('id, product_id, quantity_on_hand, location_id')
        .limit(5);
      
      results.tables.inventory_items = {
        exists: !inventoryError,
        error: inventoryError?.message,
        count: inventory?.length || 0,
        sample: inventory?.slice(0, 3) || []
      };
    } catch (error) {
      results.tables.inventory_items = { exists: false, error: 'Table access failed' };
    }

    // Check stock_movements table
    try {
      const { data: movements, error: movementsError } = await supabase
        .from('stock_movements')
        .select('id, product_id, movement_type, quantity')
        .limit(5);
      
      results.tables.stock_movements = {
        exists: !movementsError,
        error: movementsError?.message,
        count: movements?.length || 0,
        sample: movements?.slice(0, 3) || []
      };
    } catch (error) {
      results.tables.stock_movements = { exists: false, error: 'Table access failed' };
    }

    // Check categories table
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .limit(5);
      
      results.tables.categories = {
        exists: !categoriesError,
        error: categoriesError?.message,
        count: categories?.length || 0,
        sample: categories?.slice(0, 3) || []
      };
    } catch (error) {
      results.tables.categories = { exists: false, error: 'Table access failed' };
    }

    // Summary
    const existingTables = Object.keys(results.tables).filter(
      table => results.tables[table].exists
    );
    
    results.summary = {
      total_tables_checked: Object.keys(results.tables).length,
      existing_tables: existingTables.length,
      missing_tables: Object.keys(results.tables).length - existingTables.length,
      ready_for_inventory: results.tables.products?.exists && results.tables.inventory_items?.exists,
      ready_for_movements: results.tables.products?.exists && results.tables.stock_movements?.exists
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in debug tables check:', error);
    return NextResponse.json(
      { error: 'Failed to check tables', details: error },
      { status: 500 }
    );
  }
}
