import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
    
    // Search products by name, SKU, or description
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true) // Only return active products
      .gte('stock_quantity', 0) // Only products in stock
      .limit(10)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error searching products:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: error.message,
          data: []
        },
        { status: 500 }
      );
    }
    
    // Transform data to match expected format
    const transformedData = (data || []).map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.selling_price || product.base_price,
      stock: product.stock_quantity,
      description: product.description,
      image: product.images?.[0] || null
    }));
    
    return NextResponse.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error in GET /api/products/search:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        data: []
      },
      { status: 500 }
    );
  }
}
