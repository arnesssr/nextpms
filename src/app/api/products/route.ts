import { NextRequest, NextResponse } from 'next/server';
import { ProductInsert, ProductFilters } from '@/types/products';
import { productService } from '@/services/products/productService';

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filters from search params
    const filters: ProductFilters = {
      search: searchParams.get('search') || undefined,
      category_id: searchParams.get('category_id') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined,
      is_featured: searchParams.get('is_featured') ? searchParams.get('is_featured') === 'true' : undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
      low_stock: searchParams.get('in_stock') ? searchParams.get('in_stock') === 'false' : undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      per_page: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    // Use productService instead of direct Supabase calls
    const result = await productService.getProducts(filters);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.category_id || !body.base_price || !body.selling_price) {
      return NextResponse.json(
        { success: false, error: 'Name, category_id, base_price, and selling_price are required' },
        { status: 400 }
      );
    }

    // Use productService to create the product
    const result = await productService.createProduct(body);
    
    return NextResponse.json(
      { ...result, message: 'Product created successfully' },
      { status: result.success ? 201 : 500 }
    );
    
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
