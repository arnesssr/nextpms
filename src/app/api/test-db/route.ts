import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if products table exists and get some products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, sku')
      .limit(5);

    // Test 2: Check if stock_adjustments table exists and get data
    const { data: adjustmentsTest, error: adjustmentsError } = await supabase
      .from('stock_adjustments')
      .select('*')
      .limit(5);

    // Test 3: Check if inventory_items table exists
    const { data: inventoryTest, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('id, product_id')
      .limit(5);

    // Test 4: Try to find the specific product
    const productId = 'f1c25705-3b90-419e-bcc7-8030b6890184';
    const { data: specificProduct, error: specificError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
      
    // Test 5: Get inventory items with full product data
    const { data: inventoryWithProducts, error: inventoryWithProductsError } = await supabase
      .from('inventory_items')
      .select(`
        *,
        products (
          id,
          name,
          sku
        )
      `)
      .limit(2);

    return NextResponse.json({
      success: true,
      tests: {
        products: {
          exists: !productsError || !productsError.message?.includes('does not exist'),
          error: productsError?.message,
          sampleData: products,
          count: products?.length || 0
        },
        stock_adjustments: {
          exists: !adjustmentsError || !adjustmentsError.message?.includes('does not exist'),
          error: adjustmentsError?.message,
          data: adjustmentsTest,
          count: adjustmentsTest?.length || 0
        },
        inventory_items: {
          exists: !inventoryError || !inventoryError.message?.includes('does not exist'),
          error: inventoryError?.message,
          sampleData: inventoryTest
        },
        specificProduct: {
          id: productId,
          found: !!specificProduct,
          data: specificProduct,
          error: specificError?.message
        },
        inventoryWithProducts: {
          exists: !inventoryWithProductsError,
          error: inventoryWithProductsError?.message,
          sampleData: inventoryWithProducts
        }
      }
    });
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
