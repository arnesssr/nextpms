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

// GET /api/suppliers/summary - Get supplier statistics and summary data
export async function GET(request: NextRequest) {
  try {
    const response = await supplierService.getSupplierStats();
    
    if (!response.success) {
      return createErrorResponse('Failed to fetch supplier summary', 500);
    }
    
    return createSuccessResponse(response.data);
    
  } catch (error: any) {
    console.error('Error in GET /api/suppliers/summary:', error);
    return createErrorResponse('Internal server error', 500, error.message);
  }
}
