import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    const movement_type = searchParams.get('movement_type');
    const location_id = searchParams.get('location_id');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log('Fetching movements with params:', { product_id, movement_type, location_id, days, limit });

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
    const body = await request.json();
    
    // Create stock movement record directly
    const movementData = {
      product_id: body.product_id,
      movement_type: body.movement_type,
      quantity: body.quantity,
      reason: body.reason,
      location_to_id: body.location_to_id || 'main_warehouse',
      location_to_name: body.location_to_name || 'Main Warehouse',
      location_from_id: body.location_from_id || null,
      location_from_name: body.location_from_name || null,
      unit_cost: body.unit_cost || 0,
      reference_type: body.reference_type || null,
      reference_id: body.reference_id || null,
      reference_number: body.reference_number || null,
      notes: body.notes || null,
      created_by: body.created_by || 'system',
      status: body.auto_process ? 'completed' : 'pending'
    };

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
      console.error('Error creating movement:', error);
      return NextResponse.json(
        { error: 'Failed to create stock movement' },
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
