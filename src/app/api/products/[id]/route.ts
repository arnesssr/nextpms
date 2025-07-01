import { NextRequest, NextResponse } from 'next/server';
import { ProductUpdate } from '@/types/products';
import { productService } from '@/services/products/productService';

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // Use productService to get the product
    const result = await productService.getProduct(resolvedParams.id);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 404
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();

    // Use productService to update the product
    const result = await productService.updateProduct(resolvedParams.id, body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 404
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // Use productService to delete the product
    const result = await productService.deleteProduct(resolvedParams.id);

    return NextResponse.json(result, {
      status: result.success ? 200 : 404
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Utility function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
