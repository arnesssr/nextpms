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

// GET /api/suppliers/[id] - Fetch a specific supplier
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return createErrorResponse('Supplier ID is required', 400);
    }

    const response = await supplierService.getSupplier(id);
    return createSuccessResponse(response.data);
    
  } catch (error: any) {
    console.error('Error in GET /api/suppliers/[id]:', error);
    
    if (error.message === 'Supplier not found') {
      return createErrorResponse('Supplier not found', 404);
    }
    
    return createErrorResponse('Failed to fetch supplier', 500, error.message);
  }
}

// PUT /api/suppliers/[id] - Update a specific supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return createErrorResponse('Supplier ID is required', 400);
    }

    const response = await supplierService.updateSupplier(id, body);
    return createSuccessResponse(response.data);
    
  } catch (error: any) {
    console.error('Error in PUT /api/suppliers/[id]:', error);
    
    if (error.message === 'Supplier not found') {
      return createErrorResponse('Supplier not found', 404);
    }
    
    if (error.message.includes('already exists')) {
      return createErrorResponse('Supplier code already exists', 409);
    }
    
    return createErrorResponse('Failed to update supplier', 500, error.message);
  }
}

// DELETE /api/suppliers/[id] - Delete a specific supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return createErrorResponse('Supplier ID is required', 400);
    }

    // First get supplier name for response message
    let supplierName = 'Unknown';
    try {
      const supplierResponse = await supplierService.getSupplier(id);
      supplierName = supplierResponse.data.name || 'Unknown';
    } catch (error) {
      // If supplier doesn't exist, return 404
      return createErrorResponse('Supplier not found', 404);
    }

    // Delete the supplier
    const response = await supplierService.deleteSupplier(id);
    
    return createSuccessResponse(
      { 
        message: `Supplier "${supplierName}" has been successfully deleted`,
        deletedId: id
      },
      200
    );
    
  } catch (error: any) {
    console.error('Error in DELETE /api/suppliers/[id]:', error);
    
    if (error.message === 'Supplier not found') {
      return createErrorResponse('Supplier not found', 404);
    }
    
    // Handle dependency constraints
    if (error.message.includes('foreign key') || error.message.includes('constraint')) {
      return createErrorResponse(
        'Cannot delete supplier. There are related records that depend on this supplier.',
        409,
        'Please remove or update related records before deleting this supplier.'
      );
    }
    
    return createErrorResponse('Failed to delete supplier', 500, error.message);
  }
}
