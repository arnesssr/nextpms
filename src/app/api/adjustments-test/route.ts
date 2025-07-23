import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// If service role key is not available, we'll use anon key but won't be able to bypass RLS
const isServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Test adjustment creation request:', body);
    
    // Create adjustment record with service role (bypasses RLS)
    const adjustmentData = {
      product_id: body.product_id,
      adjustment_type: body.adjustment_type,
      reason: body.reason,
      quantity_before: parseInt(body.quantity_before),
      quantity_after: parseInt(body.quantity_after),
      quantity_change: body.quantity_after - body.quantity_before,
      location: body.location || 'Main Warehouse',
      reference: body.reference || null,
      notes: body.notes || null,
      created_by: body.created_by || 'system',
      status: body.status || 'pending',
      cost_impact: body.cost_impact || 0
    };
    
    console.log(`Creating adjustment with ${isServiceRole ? 'service role' : 'anon key (RLS will apply)'}:`, adjustmentData);
    
    if (!isServiceRole) {
      console.warn('Service role key not found. Using anon key - RLS policies will apply.');
    }

    const { data, error } = await supabaseAdmin
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
      console.error('Service role error creating adjustment:', error);
      return NextResponse.json(
        { 
          error: 'Failed to create adjustment with service role', 
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }
    
    console.log('Adjustment created successfully with service role:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
