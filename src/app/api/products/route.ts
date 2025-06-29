import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseAnonymousClient } from '@/lib/supabaseServer';
import { ProductInsert, ProductFilters } from '@/types/products';

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = createServerSupabaseAnonymousClient();
    
    // Extract filters from search params
    const filters: ProductFilters = {
      search: searchParams.get('search') || undefined,
      category_id: searchParams.get('category_id') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined,
      is_featured: searchParams.get('is_featured') ? searchParams.get('is_featured') === 'true' : undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
      in_stock: searchParams.get('in_stock') ? searchParams.get('in_stock') === 'true' : undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    // Use the get_products_with_categories function for efficient querying
    const { data, error } = await supabase.rpc('get_products_with_categories', {
      p_limit: filters.limit,
      p_offset: ((filters.page || 1) - 1) * (filters.limit || 20),
      p_category_id: filters.category_id || null,
      p_status: filters.status || null,
      p_search: filters.search || null,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Apply same filters for count
    if (filters.category_id) {
      countQuery = countQuery.eq('category_id', filters.category_id);
    }
    if (filters.status) {
      countQuery = countQuery.eq('status', filters.status);
    }
    if (filters.search) {
      countQuery = countQuery.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }
    if (filters.is_active !== undefined) {
      countQuery = countQuery.eq('is_active', filters.is_active);
    }
    if (filters.is_featured !== undefined) {
      countQuery = countQuery.eq('is_featured', filters.is_featured);
    }
    if (filters.min_price !== undefined) {
      countQuery = countQuery.gte('selling_price', filters.min_price);
    }
    if (filters.max_price !== undefined) {
      countQuery = countQuery.lte('selling_price', filters.max_price);
    }
    if (filters.in_stock) {
      countQuery = countQuery.gt('stock_quantity', 0);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page: filters.page || 1,
      limit: filters.limit || 20,
      total_pages: Math.ceil((count || 0) / (filters.limit || 20))
    });
    
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
    const supabase = createServerSupabaseAnonymousClient();
    
    // Validate required fields
    if (!body.name || !body.category_id || !body.base_price || !body.selling_price) {
      return NextResponse.json(
        { success: false, error: 'Name, category_id, base_price, and selling_price are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = body.slug || generateSlug(body.name);
    
    // Check if slug already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();
      
    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Check if category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', body.category_id)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { success: false, error: 'Invalid category_id. Category does not exist.' },
        { status: 400 }
      );
    }

    // Prepare product data
    const productData: ProductInsert = {
      name: body.name,
      description: body.description || null,
      slug,
      category_id: body.category_id,
      sku: body.sku || null,
      barcode: body.barcode || null,
      brand: body.brand || null,
      model: body.model || null,
      weight: body.weight || null,
      dimensions_length: body.dimensions_length || null,
      dimensions_width: body.dimensions_width || null,
      dimensions_height: body.dimensions_height || null,
      base_price: parseFloat(body.base_price),
      selling_price: parseFloat(body.selling_price),
      cost_price: body.cost_price ? parseFloat(body.cost_price) : null,
      discount_percentage: body.discount_percentage || 0,
      tax_rate: body.tax_rate || 0,
      stock_quantity: body.stock_quantity || 0,
      min_stock_level: body.min_stock_level || 0,
      max_stock_level: body.max_stock_level || null,
      track_inventory: body.track_inventory !== undefined ? body.track_inventory : true,
      status: body.status || 'draft',
      is_active: body.is_active !== undefined ? body.is_active : true,
      is_featured: body.is_featured !== undefined ? body.is_featured : false,
      is_digital: body.is_digital !== undefined ? body.is_digital : false,
      featured_image_url: body.featured_image_url || null,
      gallery_images: body.gallery_images || null,
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      meta_keywords: body.meta_keywords || null,
      attributes: body.attributes || {},
      variants: body.variants || [],
      requires_shipping: body.requires_shipping !== undefined ? body.requires_shipping : true,
      shipping_weight: body.shipping_weight || null,
      shipping_dimensions: body.shipping_dimensions || null,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: 'Product created successfully' },
      { status: 201 }
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
