import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required and cannot be empty' },
        { status: 400 }
      );
    }

    const updatedItems = [];

    // Process each update
    for (const update of updates) {
      const { id, quantity, ...otherFields } = update;

      if (!id) {
        console.warn('Skipping update without ID:', update);
        continue;
      }

      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .update({
            quantity_on_hand: quantity,
            ...otherFields,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error(`Error updating inventory item ${id}:`, error);
          continue;
        }

        if (data) {
          updatedItems.push(data);
        }
      } catch (itemError) {
        console.error(`Failed to update item ${id}:`, itemError);
        continue;
      }
    }

    return NextResponse.json(updatedItems);
  } catch (error) {
    console.error('Unexpected error in bulk update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
