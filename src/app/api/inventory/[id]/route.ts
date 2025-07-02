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
