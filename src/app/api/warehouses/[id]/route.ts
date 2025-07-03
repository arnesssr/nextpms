import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/warehouses/[id] - Get single warehouse by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('warehouses_with_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Warehouse not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching warehouse:', error);
      return NextResponse.json(
        { error: 'Failed to fetch warehouse', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Unexpected error in warehouse GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/warehouses/[id] - Update warehouse
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if warehouse exists
    const { data: existingWarehouse, error: fetchError } = await supabase
      .from('warehouses')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingWarehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      );
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      updated_by: 'api_user', // TODO: Get from auth context
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.description !== undefined) updateData.description = body.description;
    
    // Address fields
    if (body.address?.line1 !== undefined || body.address_line1 !== undefined) {
      updateData.address_line1 = body.address?.line1 || body.address_line1;
    }
    if (body.address?.line2 !== undefined || body.address_line2 !== undefined) {
      updateData.address_line2 = body.address?.line2 || body.address_line2;
    }
    if (body.address?.city !== undefined || body.city !== undefined) {
      updateData.city = body.address?.city || body.city;
    }
    if (body.address?.state !== undefined || body.state !== undefined) {
      updateData.state = body.address?.state || body.state;
    }
    if (body.address?.postalCode !== undefined || body.postal_code !== undefined) {
      updateData.postal_code = body.address?.postalCode || body.postal_code;
    }
    if (body.address?.country !== undefined || body.country !== undefined) {
      updateData.country = body.address?.country || body.country;
    }

    // Contact fields
    if (body.contactInfo?.phone !== undefined || body.phone !== undefined) {
      updateData.phone = body.contactInfo?.phone || body.phone;
    }
    if (body.contactInfo?.email !== undefined || body.email !== undefined) {
      updateData.email = body.contactInfo?.email || body.email;
    }
    if (body.contactInfo?.manager !== undefined || body.manager_name !== undefined) {
      updateData.manager_name = body.contactInfo?.manager || body.manager_name;
    }

    // Operational fields
    if (body.isActive !== undefined || body.is_active !== undefined) {
      updateData.is_active = body.isActive ?? body.is_active;
    }
    if (body.isDefault !== undefined || body.is_default !== undefined) {
      updateData.is_default = body.isDefault ?? body.is_default;
    }
    if (body.timezone !== undefined) updateData.timezone = body.timezone;

    // Capacity fields
    if (body.capacity?.maxItems !== undefined || body.max_capacity !== undefined) {
      updateData.max_capacity = body.capacity?.maxItems || body.max_capacity;
    }
    if (body.capacity?.maxVolume !== undefined || body.max_volume_m3 !== undefined) {
      updateData.max_volume_m3 = body.capacity?.maxVolume || body.max_volume_m3;
    }
    if (body.capacity?.maxWeight !== undefined || body.max_weight_kg !== undefined) {
      updateData.max_weight_kg = body.capacity?.maxWeight || body.max_weight_kg;
    }

    // Support flags
    if (body.supports?.receiving !== undefined || body.supports_receiving !== undefined) {
      updateData.supports_receiving = body.supports?.receiving ?? body.supports_receiving;
    }
    if (body.supports?.shipping !== undefined || body.supports_shipping !== undefined) {
      updateData.supports_shipping = body.supports?.shipping ?? body.supports_shipping;
    }
    if (body.supports?.returns !== undefined || body.supports_returns !== undefined) {
      updateData.supports_returns = body.supports?.returns ?? body.supports_returns;
    }
    if (body.supports?.transfers !== undefined || body.supports_transfers !== undefined) {
      updateData.supports_transfers = body.supports?.transfers ?? body.supports_transfers;
    }

    // Environmental fields
    if (body.isTemperatureControlled !== undefined || body.is_temperature_controlled !== undefined) {
      updateData.is_temperature_controlled = body.isTemperatureControlled ?? body.is_temperature_controlled;
    }
    if (body.isHazmatApproved !== undefined || body.is_hazmat_approved !== undefined) {
      updateData.is_hazmat_approved = body.isHazmatApproved ?? body.is_hazmat_approved;
    }
    if (body.temperature?.min !== undefined || body.min_temperature_c !== undefined) {
      updateData.min_temperature_c = body.temperature?.min || body.min_temperature_c;
    }
    if (body.temperature?.max !== undefined || body.max_temperature_c !== undefined) {
      updateData.max_temperature_c = body.temperature?.max || body.max_temperature_c;
    }
    if (body.temperature?.unit !== undefined || body.temperature_unit !== undefined) {
      updateData.temperature_unit = body.temperature?.unit || body.temperature_unit;
    }

    // Metadata fields
    if (body.operatingHours !== undefined || body.operating_hours !== undefined) {
      updateData.operating_hours = body.operatingHours || body.operating_hours;
    }
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.customFields !== undefined || body.custom_fields !== undefined) {
      updateData.custom_fields = body.customFields || body.custom_fields;
    }

    const { data, error } = await supabase
      .from('warehouses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating warehouse:', error);
      
      // Handle specific constraint violations
      if (error.code === '23505') {
        if (error.message.includes('warehouses_code_key')) {
          return NextResponse.json(
            { error: 'Warehouse code already exists' },
            { status: 409 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Failed to update warehouse', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Warehouse updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error in warehouse PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/warehouses/[id] - Delete warehouse
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if warehouse has any inventory
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('location_id', id)
      .eq('status', 'active')
      .limit(1);

    if (inventoryError) {
      console.error('Error checking inventory:', inventoryError);
      return NextResponse.json(
        { error: 'Failed to check warehouse inventory' },
        { status: 500 }
      );
    }

    if (inventoryItems && inventoryItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete warehouse with existing inventory items' },
        { status: 409 }
      );
    }

    // Check if this is the default warehouse
    const { data: warehouse, error: warehouseError } = await supabase
      .from('warehouses')
      .select('is_default')
      .eq('id', id)
      .single();

    if (warehouseError) {
      if (warehouseError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Warehouse not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch warehouse' },
        { status: 500 }
      );
    }

    if (warehouse.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete the default warehouse' },
        { status: 409 }
      );
    }

    // Delete the warehouse
    const { error: deleteError } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting warehouse:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete warehouse', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Warehouse deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in warehouse DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
