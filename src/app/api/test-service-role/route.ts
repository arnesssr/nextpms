import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    console.log('🔑 Testing service role client...');
    
    // Check environment variables
    console.log('Environment variables:');
    console.log('  NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('  SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const supabase = createServerSupabaseClient();
    console.log('✅ Service role client created');
    
    // Test 1: Simple table query (should work regardless of RLS)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
      
    console.log('Products test:', { data: products, error: productsError });
    
    // Test 2: Try to read stock_movements (this will show RLS behavior)
    const { data: movements, error: movementsError } = await supabase
      .from('stock_movements')
      .select('id, movement_type')
      .limit(1);
      
    console.log('Movements read test:', { data: movements, error: movementsError });
    
    // Test 3: Try to insert into stock_movements (this is where RLS kicks in)
    const testMovement = {
      movement_type: 'in',
      quantity: 1,
      reason: 'test',
      product_id: products?.[0]?.id || '00000000-0000-0000-0000-000000000000',
      location_to_id: 'main_warehouse',
      location_to_name: 'Test Warehouse',
      created_by: 'test-api',
      status: 'pending'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('stock_movements')
      .insert(testMovement)
      .select()
      .single();
      
    console.log('Insert test:', { data: insertResult, error: insertError });
    
    // Clean up test data if successful
    if (insertResult?.id) {
      await supabase
        .from('stock_movements')
        .delete()
        .eq('id', insertResult.id);
      console.log('Test movement cleaned up');
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        environment: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        products: {
          success: !productsError,
          data: products,
          error: productsError?.message
        },
        movementsRead: {
          success: !movementsError,
          data: movements,
          error: movementsError?.message
        },
        movementsInsert: {
          success: !insertError,
          data: insertResult,
          error: insertError?.message,
          errorCode: insertError?.code
        }
      }
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
