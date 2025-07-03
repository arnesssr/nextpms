import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
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
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching inventory item:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inventory item' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      return NextResponse.json(
        { error: 'Failed to update inventory item' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('PATCH request for inventory item:', params.id, body);
    
    // Handle specific reorder point updates
    const updateData: any = {};
    
    if (body.min_stock_level !== undefined) {
      updateData.min_stock_level = body.min_stock_level;
    }
    
    if (body.reorder_quantity !== undefined) {
      updateData.reorder_quantity = body.reorder_quantity;
    }
    
    // Allow other partial updates
    if (body.quantity_on_hand !== undefined) {
      updateData.quantity_on_hand = body.quantity_on_hand;
    }
    
    if (body.quantity_reserved !== undefined) {
      updateData.quantity_reserved = body.quantity_reserved;
    }
    
    if (body.unit_cost !== undefined) {
      updateData.unit_cost = body.unit_cost;
    }
    
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    
    // Update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        products (
          name,
          sku,
          barcode,
          selling_price,
          cost_price
        )
      `)
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      return NextResponse.json(
        { error: 'Failed to update inventory item', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    console.log('Successfully updated inventory item:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting inventory item:', error);
      return NextResponse.json(
        { error: 'Failed to delete inventory item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
