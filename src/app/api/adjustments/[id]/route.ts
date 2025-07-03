import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('stock_adjustments')
      .select(`
        *,
        products (
          name,
          sku,
          barcode
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Adjustment not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching adjustment:', error);
      return NextResponse.json(
        { error: 'Failed to fetch adjustment' },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Calculate quantity change if quantities are provided
    let quantityChange;
    if (body.quantity_after !== undefined && body.quantity_before !== undefined) {
      quantityChange = body.quantity_after - body.quantity_before;
    }

    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString()
    };

    if (quantityChange !== undefined) {
      updateData.quantity_change = quantityChange;
    }

    const { data, error } = await supabase
      .from('stock_adjustments')
      .update(updateData)
      .eq('id', id)
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
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Adjustment not found' },
          { status: 404 }
        );
      }
      console.error('Error updating adjustment:', error);
      return NextResponse.json(
        { error: 'Failed to update adjustment' },
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
    const { id } = params;

    // First check if the adjustment exists and its status
    const { data: adjustment, error: fetchError } = await supabase
      .from('stock_adjustments')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Adjustment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch adjustment' },
        { status: 500 }
      );
    }

    // Only allow deletion of draft or rejected adjustments
    if (adjustment.status === 'approved') {
      return NextResponse.json(
        { error: 'Cannot delete approved adjustments' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('stock_adjustments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting adjustment:', error);
      return NextResponse.json(
        { error: 'Failed to delete adjustment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Adjustment deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
