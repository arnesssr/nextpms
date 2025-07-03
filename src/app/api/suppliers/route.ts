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

// GET /api/suppliers - Fetch all suppliers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseAnonymousClient();

    const { searchParams } = new URL(request.url);
    
    // Build query - only select columns that exist in the database
    let query = supabase
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
      `);

    // Apply filters from query parameters
    const search = searchParams.get('search');
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const status = searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
    }

    const supplierType = searchParams.get('supplierType');
    if (supplierType) {
      query = query.eq('supplier_type', supplierType);
    }

    const businessType = searchParams.get('businessType');
    if (businessType) {
      query = query.eq('business_type', businessType);
    }

    const category = searchParams.get('category');
    if (category) {
      query = query.eq('category', category);
    }

    const performanceStatus = searchParams.get('performanceStatus');
    if (performanceStatus) {
      query = query.eq('performance_status', performanceStatus);
    }

    // Rating filters
    const ratingMin = searchParams.get('rating.min');
    if (ratingMin) {
      query = query.gte('rating', parseFloat(ratingMin));
    }

    const ratingMax = searchParams.get('rating.max');
    if (ratingMax) {
      query = query.lte('rating', parseFloat(ratingMax));
    }

    // Credit limit filters
    const creditLimitMin = searchParams.get('creditLimit.min');
    if (creditLimitMin) {
      query = query.gte('credit_limit', parseFloat(creditLimitMin));
    }

    const creditLimitMax = searchParams.get('creditLimit.max');
    if (creditLimitMax) {
      query = query.lte('credit_limit', parseFloat(creditLimitMax));
    }

    // Date range filters
    const dateRangeStart = searchParams.get('dateRange.start');
    if (dateRangeStart) {
      query = query.gte('created_at', dateRangeStart);
    }

    const dateRangeEnd = searchParams.get('dateRange.end');
    if (dateRangeEnd) {
      query = query.lte('created_at', dateRangeEnd);
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    if (sortBy === 'name') {
      query = query.order('name', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'createdAt') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'rating') {
      query = query.order('rating', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'status') {
      query = query.order('status', { ascending: sortOrder === 'asc' });
    } else {
      // Default to name if invalid sortBy
      query = query.order('name', { ascending: true });
    }

    const { data: suppliers, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch suppliers', 500, error.message);
    }

    return createSuccessResponse(suppliers || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/suppliers:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/suppliers - Create a new supplier
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(); // Use service role for write operations
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return createErrorResponse('Name and email are required', 400);
    }

    // Check if supplier code already exists
    const { data: existingSupplier } = await supabase
      .from('suppliers')
      .select('code')
      .eq('code', body.code)
      .single();

    if (existingSupplier) {
      return createErrorResponse('Supplier code already exists', 409);
    }

    // Prepare supplier data
    const supplierData = {
      name: body.name,
      code: body.code,
      email: body.email || null,
      phone: body.phone || null,
      website: body.website || null,
      address_line_1: body.address_line_1 || null,
      address_line_2: body.address_line_2 || null,
      city: body.city || null,
      state: body.state || null,
      postal_code: body.postal_code || null,
      country: body.country || null,
      tax_id: body.tax_id || null,
      business_registration: body.business_registration || null,
      business_type: body.business_type || 'corporation',
      primary_contact_name: body.primary_contact_name || null,
      primary_contact_email: body.primary_contact_email || null,
      primary_contact_phone: body.primary_contact_phone || null,
      payment_terms: body.payment_terms || null,
      credit_limit: body.credit_limit || null,
      currency: body.currency || 'USD',
      rating: body.rating || null,
      lead_time_days: body.lead_time_days || null,
      minimum_order_amount: body.minimum_order_amount || null,
      status: body.status || 'active',
      supplier_type: body.supplier_type || 'manufacturer',
      category: body.category || null,
      notes: body.notes || null,
      internal_notes: body.internal_notes || null,
      created_by: 'system' // Default to system user since we're not using auth
    };

    const { data: newSupplier, error } = await supabase
      .from('suppliers')
      .insert([supplierData])
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
      
      return createErrorResponse('Failed to create supplier', 500, error.message);
    }

    return createSuccessResponse(newSupplier, 201);
  } catch (error) {
    console.error('Unexpected error in POST /api/suppliers:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
