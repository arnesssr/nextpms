import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    const type = searchParams.get('type');
    const reason = searchParams.get('reason');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const user_id = searchParams.get('user_id');
    const search = searchParams.get('search');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log('Fetching adjustments with params:', { 
      product_id, type, reason, status, location, user_id, search, days, limit 
    });

    // First check if adjustments table exists
    const { data: testData, error: testError } = await supabase
      .from('stock_adjustments')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Error testing stock_adjustments table:', testError);
      // Table might not exist, let's return empty data for now
      return NextResponse.json([]);
    }

    // Get adjustments from the stock_adjustments table
    let query = supabase
      .from('stock_adjustments')
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
    if (type) {
      query = query.eq('adjustment_type', type);
    }
    if (reason) {
      query = query.eq('reason', reason);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (location) {
      query = query.eq('location', location);
    }
    if (user_id) {
      query = query.eq('created_by', user_id);
    }
    if (search) {
      query = query.or(`products.name.ilike.%${search}%,products.sku.ilike.%${search}%,reference.ilike.%${search}%,notes.ilike.%${search}%`);
    }
    
    // Filter by date range (last X days)
    if (days > 0) {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      query = query.gte('created_at', dateFrom.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching adjustments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch adjustments' },
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
    console.log('Received adjustment creation request:', body);
    
    // Validate required fields
    if (!body.product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.adjustment_type) {
      return NextResponse.json(
        { error: 'Adjustment type is required' },
        { status: 400 }
      );
    }
    
    if (body.quantity_after === undefined || body.quantity_before === undefined) {
      return NextResponse.json(
        { error: 'Both quantity_before and quantity_after are required' },
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
    
    // Calculate quantity change
    const quantityChange = body.quantity_after - body.quantity_before;
    
    // Create adjustment record
    const adjustmentData = {
      product_id: body.product_id,
      adjustment_type: body.adjustment_type,
      reason: body.reason,
      quantity_before: parseInt(body.quantity_before),
      quantity_after: parseInt(body.quantity_after),
      quantity_change: quantityChange,
      location: body.location || 'Main Warehouse',
      reference: body.reference || null,
      notes: body.notes || null,
      created_by: body.created_by || 'system',
      status: body.status || 'pending',
      cost_impact: body.cost_impact || 0
    };
    
    console.log('Attempting to create adjustment with data:', adjustmentData);

    const { data, error } = await supabase
      .from('stock_adjustments')
      .insert(adjustmentData)
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
      console.error('Supabase error creating adjustment:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Provide more specific error messages
      if (error.code === '23503') {
        return NextResponse.json(
          { error: 'Invalid foreign key reference. Please check product ID.' },
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
          error: 'Failed to create adjustment', 
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }
    
    console.log('Adjustment created successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in adjustment creation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
