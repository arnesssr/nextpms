import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Check if inventory_items table has any data
    try {
      const { data: inventoryCount, error: countError } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact' });

      results.tests.inventory_count = {
        success: !countError,
        error: countError?.message,
        count: inventoryCount?.length || 0,
        sample: inventoryCount?.slice(0, 3) || []
      };
    } catch (error) {
      results.tests.inventory_count = { success: false, error: 'Table access failed' };
    }

    // Test 2: Try to insert a simple test record
    try {
      const testRecord = {
        product_id: '062a1c1b-634a-4e8f-8bc8-866217e51934', // Using one of your product IDs
        location_id: 'test_location',
        quantity_on_hand: 100,
        status: 'active'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('inventory_items')
        .insert(testRecord)
        .select()
        .single();

      if (!insertError && insertData) {
        // Clean up test record
        await supabase
          .from('inventory_items')
          .delete()
          .eq('id', insertData.id);
      }

      results.tests.insert_test = {
        success: !insertError,
        error: insertError?.message,
        inserted: !!insertData
      };
    } catch (error) {
      results.tests.insert_test = { success: false, error: 'Insert test failed' };
    }

    // Test 3: Check products table
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku, stock_quantity, is_active')
        .eq('is_active', true)
        .limit(5);

      results.tests.products_check = {
        success: !productsError,
        error: productsError?.message,
        count: products?.length || 0,
        sample: products || []
      };
    } catch (error) {
      results.tests.products_check = { success: false, error: 'Products check failed' };
    }

    // Test 4: Try the exact SQL that should populate inventory
    try {
      const { data: sqlResult, error: sqlError } = await supabase
        .from('products')
        .select('id, name, sku, stock_quantity, min_stock_level, cost_price, is_active')
        .eq('is_active', true);

      if (!sqlError && sqlResult) {
        // Try to insert one record manually
        const firstProduct = sqlResult[0];
        if (firstProduct) {
          const manualRecord = {
            product_id: firstProduct.id,
            location_id: 'main_warehouse',
            location_name: 'Main Warehouse',
            quantity_on_hand: firstProduct.stock_quantity || 0,
            min_stock_level: firstProduct.min_stock_level || 0,
            unit_cost: firstProduct.cost_price || 0,
            status: 'active'
          };

          const { data: manualInsert, error: manualError } = await supabase
            .from('inventory_items')
            .upsert(manualRecord, { 
              onConflict: 'product_id,location_id',
              ignoreDuplicates: false 
            })
            .select()
            .single();

          results.tests.manual_insert = {
            success: !manualError,
            error: manualError?.message,
            record: manualInsert,
            attempted_data: manualRecord
          };
        }
      }

      results.tests.sql_preparation = {
        success: !sqlError,
        error: sqlError?.message,
        products_found: sqlResult?.length || 0,
        first_product: sqlResult?.[0] || null
      };
    } catch (error) {
      results.tests.sql_preparation = { success: false, error: 'SQL preparation failed' };
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in SQL test:', error);
    return NextResponse.json(
      { error: 'Failed to run SQL tests', details: error },
      { status: 500 }
    );
  }
}
