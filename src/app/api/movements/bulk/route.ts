import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { movements } = body;

    if (!Array.isArray(movements) || movements.length === 0) {
      return NextResponse.json(
        { error: 'Movements array is required and cannot be empty' },
        { status: 400 }
      );
    }

    const createdMovements = [];

    // Process each movement
    for (const movement of movements) {
      const movementData = {
        product_id: movement.product_id,
        movement_type: movement.movement_type,
        quantity: movement.quantity,
        reason: movement.reason,
        location_to_id: movement.location_to_id || 'main_warehouse',
        location_to_name: movement.location_to_name || 'Main Warehouse',
        location_from_id: movement.location_from_id || null,
        location_from_name: movement.location_from_name || null,
        unit_cost: movement.unit_cost || 0,
        reference_type: movement.reference_type || null,
        reference_id: movement.reference_id || null,
        reference_number: movement.reference_number || null,
        notes: movement.notes || null,
        created_by: movement.created_by || 'system',
        status: movement.auto_process ? 'completed' : 'pending'
      };

      try {
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
          continue;
        }

        if (data) {
          createdMovements.push(data);
        }
      } catch (itemError) {
        console.error('Failed to create movement:', itemError);
        continue;
      }
    }

    return NextResponse.json(createdMovements, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in bulk movements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
