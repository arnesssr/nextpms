import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseAnonymousClient } from '@/lib/supabaseServer';
import { ProductUpdate } from '@/types/products';

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = createServerSupabaseAnonymousClient();
    
    // Get product with category information
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner(
          id,
          name,
          path,
          slug
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Format the response to include category information
    const productWithCategory = {
      ...data,
      category_name: data.categories.name,
      category_path: data.categories.path,
      category_slug: data.categories.slug,
    };

    return NextResponse.json({
      success: true,
      data: productWithCategory
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
    const supabase = createServerSupabaseAnonymousClient();
    
    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, slug, category_id')
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Generate slug if name is being updated
    let slug = body.slug;
    if (body.name && !slug) {
      slug = generateSlug(body.name);
    }

    // Check if new slug conflicts with existing products (excluding current one)
    if (slug && slug !== existingProduct.slug) {
      const { data: conflictingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .neq('id', resolvedParams.id)
        .single();
        
      if (conflictingProduct) {
        return NextResponse.json(
          { success: false, error: 'Product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Check if category exists (if category is being changed)
    if (body.category_id && body.category_id !== existingProduct.category_id) {
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
    }

    // Prepare update data
    const updateData: ProductUpdate = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (slug !== undefined) updateData.slug = slug;
    if (body.category_id !== undefined) updateData.category_id = body.category_id;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.barcode !== undefined) updateData.barcode = body.barcode;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.dimensions_length !== undefined) updateData.dimensions_length = body.dimensions_length;
    if (body.dimensions_width !== undefined) updateData.dimensions_width = body.dimensions_width;
    if (body.dimensions_height !== undefined) updateData.dimensions_height = body.dimensions_height;
    if (body.base_price !== undefined) updateData.base_price = parseFloat(body.base_price);
    if (body.selling_price !== undefined) updateData.selling_price = parseFloat(body.selling_price);
    if (body.cost_price !== undefined) updateData.cost_price = body.cost_price ? parseFloat(body.cost_price) : null;
    if (body.discount_percentage !== undefined) updateData.discount_percentage = body.discount_percentage;
    if (body.tax_rate !== undefined) updateData.tax_rate = body.tax_rate;
    if (body.stock_quantity !== undefined) updateData.stock_quantity = body.stock_quantity;
    if (body.min_stock_level !== undefined) updateData.min_stock_level = body.min_stock_level;
    if (body.max_stock_level !== undefined) updateData.max_stock_level = body.max_stock_level;
    if (body.track_inventory !== undefined) updateData.track_inventory = body.track_inventory;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.is_digital !== undefined) updateData.is_digital = body.is_digital;
    if (body.featured_image_url !== undefined) updateData.featured_image_url = body.featured_image_url;
    if (body.gallery_images !== undefined) updateData.gallery_images = body.gallery_images;
    if (body.seo_title !== undefined) updateData.seo_title = body.seo_title;
    if (body.seo_description !== undefined) updateData.seo_description = body.seo_description;
    if (body.meta_keywords !== undefined) updateData.meta_keywords = body.meta_keywords;
    if (body.attributes !== undefined) updateData.attributes = body.attributes;
    if (body.variants !== undefined) updateData.variants = body.variants;
    if (body.requires_shipping !== undefined) updateData.requires_shipping = body.requires_shipping;
    if (body.shipping_weight !== undefined) updateData.shipping_weight = body.shipping_weight;
    if (body.shipping_dimensions !== undefined) updateData.shipping_dimensions = body.shipping_dimensions;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Product updated successfully'
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
    const supabase = createServerSupabaseAnonymousClient();
    
    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, name, status')
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Optional: Check if product can be deleted (e.g., not in orders)
    // For now, we'll allow deletion but you might want to add business rules

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
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
