import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/warehouses - Get all warehouses with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const search = searchParams.get('search');

    let query = supabase
      .from('warehouses_with_stats')
      .select('*');

    // Apply filters
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (state) {
      query = query.ilike('state', `%${state}%`);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Order by default first, then by name
    query = query.order('is_default', { ascending: false });
    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching warehouses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch warehouses', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error in warehouses GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/warehouses - Create a new warehouse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.code) {
      return NextResponse.json(
        { error: 'Name and code are required fields' },
        { status: 400 }
      );
    }

    // Test if warehouses table exists by trying a simple select
    try {
      const { data: testData, error: testError } = await supabase
        .from('warehouses')
        .select('id')
        .limit(1);
      
      if (testError) {
        return NextResponse.json(
          { error: 'Warehouses table not accessible', details: testError.message },
          { status: 500 }
        );
      }
    } catch (testErr) {
      return NextResponse.json(
        { error: 'Database connection issue', details: String(testErr) },
        { status: 500 }
      );
    }

    // Generate a unique ID based on the code
    const warehouseId = `wh_${body.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    
    // Prepare comprehensive warehouse data
    const warehouseData = {
      id: warehouseId,
      name: body.name.trim(),
      code: body.code.trim().toUpperCase(),
      description: body.description?.trim() || null,
      // Address fields
      address_line1: body.address?.street?.trim() || null,
      address_line2: body.address?.line2?.trim() || null,
      city: body.address?.city?.trim() || null,
      state: body.address?.state?.trim() || null,
      postal_code: body.address?.zipCode?.trim() || null,
      country: body.address?.country?.trim() || 'US',
      // Contact fields
      phone: body.contactInfo?.phone?.trim() || null,
      email: body.contactInfo?.email?.trim() || null,
      manager_name: body.contactInfo?.manager?.trim() || null,
      // Status fields
      is_active: body.isActive ?? true,
      is_default: body.isDefault ?? false,
      timezone: 'UTC',
      // Capacity fields - handle conversion properly
      max_capacity: body.capacity?.maxItems ? parseInt(body.capacity.maxItems.toString()) : null,
      max_volume_m3: body.capacity?.maxVolume ? parseFloat(body.capacity.maxVolume.toString()) : null,
      max_weight_kg: body.capacity?.maxWeight ? parseFloat(body.capacity.maxWeight.toString()) : null,
      // Support flags
      supports_receiving: true,
      supports_shipping: true,
      supports_returns: true,
      supports_transfers: true,
      is_temperature_controlled: false,
      is_hazmat_approved: false,
      temperature_unit: 'C',
      created_by: 'api_user'
    };

    const { data, error } = await supabase
      .from('warehouses')
      .insert(warehouseData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create warehouse', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Warehouse created successfully'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
