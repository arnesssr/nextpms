import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseAnonymousClient } from '@/lib/supabaseServer';
import { CategoryUpdate } from '@/types/database';

// GET /api/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = createServerSupabaseAnonymousClient();
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const supabase = createServerSupabaseAnonymousClient();
    
    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('id, slug')
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Generate slug if name is being updated
    let slug = body.slug;
    if (body.name && !slug) {
      slug = generateSlug(body.name);
    }

    // Check if new slug conflicts with existing categories (excluding current one)
    if (slug && slug !== existingCategory.slug) {
      const { data: conflictingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', resolvedParams.id)
        .single();
        
      if (conflictingCategory) {
        return NextResponse.json(
          { success: false, error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: CategoryUpdate = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (slug !== undefined) updateData.slug = slug;
    if (body.parent_id !== undefined) updateData.parent_id = body.parent_id;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.seo_title !== undefined) updateData.seo_title = body.seo_title;
    if (body.seo_description !== undefined) updateData.seo_description = body.seo_description;
    if (body.meta_keywords !== undefined) updateData.meta_keywords = body.meta_keywords;

    const { data, error } = await supabase
      .from('categories')
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
      message: 'Category updated successfully'
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = createServerSupabaseAnonymousClient();
    
    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has children
    const { data: children, error: childrenError } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', resolvedParams.id);

    if (childrenError) {
      console.error('Database error:', childrenError);
      return NextResponse.json(
        { success: false, error: 'Error checking category children' },
        { status: 500 }
      );
    }

    if (children && children.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete category with subcategories. Please delete or move subcategories first.' 
        },
        { status: 400 }
      );
    }

    // TODO: Check if category has products when product table is created
    // For now, we'll skip this check

    const { error } = await supabase
      .from('categories')
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
      message: 'Category deleted successfully'
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
