import { NextRequest, NextResponse } from 'next/server';
import { supplierService } from '@/services/suppliers/supplierService';

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
    const { searchParams } = new URL(request.url);
    
    // Build filters from query parameters
    const filters: any = {};
    
    const search = searchParams.get('search');
    if (search) filters.search = search;
    
    const status = searchParams.get('status');
    if (status) filters.status = status;
    
    const supplierType = searchParams.get('supplierType') || searchParams.get('supplier_type');
    if (supplierType) filters.supplier_type = supplierType;
    
    const businessType = searchParams.get('businessType') || searchParams.get('business_type');
    if (businessType) filters.business_type = businessType;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    filters.page = page;
    filters.limit = limit;
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || searchParams.get('sort_by');
    if (sortBy) {
      filters.sort_by = sortBy === 'createdAt' ? 'created_at' : sortBy;
    }
    
    const sortOrder = searchParams.get('sortOrder') || searchParams.get('sort_order');
    if (sortOrder) filters.sort_order = sortOrder;
    
    const response = await supplierService.getSuppliers(filters);
    return createSuccessResponse(response.data);
    
  } catch (error: any) {
    console.error('Error in GET /api/suppliers:', error);
    return createErrorResponse('Failed to fetch suppliers', 500, error.message);
  }
}

// POST /api/suppliers - Create a new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return createErrorResponse('Name and email are required', 400);
    }

    const response = await supplierService.createSupplier(body);
    return createSuccessResponse(response.data, 201);
    
  } catch (error: any) {
    console.error('Error in POST /api/suppliers:', error);
    
    if (error.message.includes('already exists')) {
      return createErrorResponse('Supplier code already exists', 409);
    }
    
    return createErrorResponse('Failed to create supplier', 500, error.message);
  }
}
