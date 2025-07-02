import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        *,
        products (
          name,
          sku,
          barcode
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching movement:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stock movement' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Movement not found' },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('stock_movements')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting movement:', error);
      return NextResponse.json(
        { error: 'Failed to delete stock movement' },
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
