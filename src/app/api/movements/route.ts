import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseAnonymousClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    const movement_type = searchParams.get('movement_type');
    const location_id = searchParams.get('location_id');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log('Fetching movements with params:', { product_id, movement_type, location_id, days, limit });

    const supabase = createServerSupabaseAnonymousClient();
    
    // First check if stock_movements table exists
    const { data: testData, error: testError } = await supabase
      .from('stock_movements')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Error testing stock_movements table:', testError);
      // Table might not exist, let's return empty data for now
      return NextResponse.json([]);
    }

    // Get recent stock movements from the stock_movements table
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        products (
          name,
          sku,
          barcode
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (product_id) {
      query = query.eq('product_id', product_id);
    }
    if (movement_type) {
      query = query.eq('movement_type', movement_type);
    }
    if (location_id) {
      query = query.or(`location_to_id.eq.${location_id},location_from_id.eq.${location_id}`);
    }
    
    // Filter by date range (last X days)
    if (days > 0) {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      query = query.gte('created_at', dateFrom.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching movements:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stock movements' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Environment check:');
    console.log('  NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('  SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const supabase = createServerSupabaseAnonymousClient();
    console.log('✅ Service role client created successfully');
    
    const body = await request.json();
    console.log('📦 Received movement creation request:', body);
    
    // Validate required fields
    if (!body.product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.movement_type) {
      return NextResponse.json(
        { error: 'Movement type is required' },
        { status: 400 }
      );
    }
    
    if (!body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }
    
    if (!body.reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    // Verify the product exists
    const { data: productExists, error: productError } = await supabase
      .from('products')
      .select('id, name, sku')
      .eq('id', body.product_id)
      .single();
    
    if (productError || !productExists) {
      console.error('Product not found:', body.product_id, productError);
      return NextResponse.json(
        { error: `Product with ID ${body.product_id} not found` },
        { status: 404 }
      );
    }
    
    console.log('Product found:', productExists);
    
    // Create stock movement record directly
    const movementData = {
      product_id: body.product_id,
      movement_type: body.movement_type,
      quantity: parseInt(body.quantity),
      reason: body.reason,
      location_to_id: body.location_to_id || 'main_warehouse',
      location_to_name: body.location_to_name || 'Main Warehouse',
      location_from_id: body.location_from_id || null,
      location_from_name: body.location_from_name || null,
      unit_cost: parseFloat(body.unit_cost) || 0,
      reference_type: body.reference_type || null,
      reference_id: body.reference_id || null,
      reference_number: body.reference_number || null,
      reason_description: body.notes || null,
      created_by: body.created_by || 'system',
      status: body.auto_process ? 'completed' : 'pending'
    };
    
    console.log('Attempting to create movement with data:', movementData);

    const { data, error } = await supabase
      .from('stock_movements')
      .insert(movementData)
      .select(`
        *,
        products (
          name,
          sku,
          barcode
        )
      `)
      .single();

    if (error) {
      console.error('Supabase error creating movement:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Provide more specific error messages
      if (error.code === '23503') {
        return NextResponse.json(
          { error: 'Invalid foreign key reference. Please check product ID and location.' },
          { status: 400 }
        );
      }
      
      if (error.code === '23502') {
        return NextResponse.json(
          { error: 'Missing required field. Please check all required fields are provided.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create stock movement', 
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }
    
    console.log('Movement created successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in movement creation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
