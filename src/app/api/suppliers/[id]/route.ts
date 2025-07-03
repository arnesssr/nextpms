import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseAnonymousClient, createServerSupabaseClient } from '@/lib/supabaseServer';

// Define the API response format
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

// Helper function to create error responses
function createErrorResponse(message: string, status: number = 400, details?: string): NextResponse<ApiResponse> {
  return NextResponse.json(
    { error: message, details },
    { status }
  );
}

// Helper function to create success responses
function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { data },
    { status }
  );
}

// GET /api/suppliers/[id] - Fetch a specific supplier
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseAnonymousClient();
    const { id } = params;

    if (!id) {
      return createErrorResponse('Supplier ID is required', 400);
    }

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select(`
        id,
        name,
        code,
        email,
        phone,
        website,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        country,
        tax_id,
        business_registration,
        business_type,
        primary_contact_name,
        primary_contact_email,
        primary_contact_phone,
        payment_terms,
        credit_limit,
        currency,
        rating,
        lead_time_days,
        minimum_order_amount,
        status,
        supplier_type,
        category,
        notes,
        internal_notes,
        created_by,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Supplier not found', 404);
      }
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch supplier', 500, error.message);
    }

    return createSuccessResponse(supplier);
  } catch (error) {
    console.error('Unexpected error in GET /api/suppliers/[id]:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/suppliers/[id] - Update a specific supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient(); // Use service role for write operations
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return createErrorResponse('Supplier ID is required', 400);
    }

    // Check if supplier exists
    const { data: existingSupplier, error: fetchError } = await supabase
      .from('suppliers')
      .select('id, code')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse('Supplier not found', 404);
      }
      console.error('Database error:', fetchError);
      return createErrorResponse('Failed to fetch supplier', 500, fetchError.message);
    }

    // If updating code, check if new code already exists for another supplier
    if (body.code && body.code !== existingSupplier.code) {
      const { data: codeCheck } = await supabase
        .from('suppliers')
        .select('id')
        .eq('code', body.code)
        .neq('id', id)
        .single();

      if (codeCheck) {
        return createErrorResponse('Supplier code already exists', 409);
      }
    }

    // Prepare update data (only include fields that are provided)
    const updateData: any = {};
    
    // List of updatable fields
    const updatableFields = [
      'name', 'code', 'email', 'phone', 'website',
      'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country',
      'tax_id', 'business_registration', 'business_type',
      'primary_contact_name', 'primary_contact_email', 'primary_contact_phone',
      'payment_terms', 'credit_limit', 'currency', 'rating',
      'lead_time_days', 'minimum_order_amount', 'status', 'supplier_type',
      'category', 'notes', 'internal_notes'
    ];

    // Only update fields that are provided in the request body
    for (const field of updatableFields) {
      if (body.hasOwnProperty(field)) {
        updateData[field] = body[field];
      }
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: updatedSupplier, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        name,
        code,
        email,
        phone,
        website,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        country,
        tax_id,
        business_registration,
        business_type,
        primary_contact_name,
        primary_contact_email,
        primary_contact_phone,
        payment_terms,
        credit_limit,
        currency,
        rating,
        lead_time_days,
        minimum_order_amount,
        status,
        supplier_type,
        category,
        notes,
        internal_notes,
        created_by,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // Handle specific constraint violations
      if (error.code === '23505') {
        return createErrorResponse('Supplier code already exists', 409);
      }
      
      return createErrorResponse('Failed to update supplier', 500, error.message);
    }

    return createSuccessResponse(updatedSupplier);
  } catch (error) {
    console.error('Unexpected error in PUT /api/suppliers/[id]:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/suppliers/[id] - Delete a specific supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient(); // Use service role for write operations
    const { id } = params;

    if (!id) {
      return createErrorResponse('Supplier ID is required', 400);
    }

    // Check if supplier exists
    const { data: existingSupplier, error: fetchError } = await supabase
      .from('suppliers')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse('Supplier not found', 404);
      }
      console.error('Database error:', fetchError);
      return createErrorResponse('Failed to fetch supplier', 500, fetchError.message);
    }

    // TODO: Check for dependencies before deletion
    // This might include checking for:
    // - Active purchase orders
    // - Product associations
    // - Payment records
    // For now, we'll proceed with deletion

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      
      // Handle foreign key constraint violations
      if (error.code === '23503') {
        return createErrorResponse(
          'Cannot delete supplier. There are related records that depend on this supplier.',
          409,
          'Please remove or update related records before deleting this supplier.'
        );
      }
      
      return createErrorResponse('Failed to delete supplier', 500, error.message);
    }

    return createSuccessResponse(
      { 
        message: `Supplier "${existingSupplier.name}" has been successfully deleted`,
        deletedId: id
      },
      200
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/suppliers/[id]:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
