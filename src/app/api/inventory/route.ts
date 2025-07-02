import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location_id = searchParams.get('location_id');
    const product_id = searchParams.get('product_id');
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('Fetching inventory with params:', { location_id, product_id, status, limit, offset });

    // First check if inventory_items table exists by trying a simple query
    const { data: testData, error: testError } = await supabase
      .from('inventory_items')
      .select('*')
      .limit(5);

    console.log('Test query result:', { testData, testError });

    if (testError) {
      console.error('Error testing inventory_items table:', testError);
      // Table might not exist, let's return empty data for now
      return NextResponse.json({
        data: [],
        total: 0,
        limit,
        offset,
        error: testError.message,
        message: 'Inventory table error'
      });
    }

    // If we have data from the test query, let's see what columns exist
    if (testData && testData.length > 0) {
      console.log('Found inventory items! Sample data:', testData[0]);
      console.log('Available columns:', Object.keys(testData[0]));
    } else {
      console.log('No inventory items found in database');
    }

    let query = supabase
      .from('inventory_items')
      .select(`
        *,
        products (
          name,
          sku,
          barcode,
          selling_price,
          cost_price,
          categories (
            name
          )
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (location_id) {
      query = query.eq('location_id', location_id);
    }

    if (product_id) {
      query = query.eq('product_id', product_id);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching inventory:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inventory items' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      limit,
      offset
    });
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
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory item:', error);
      return NextResponse.json(
        { error: 'Failed to create inventory item' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
