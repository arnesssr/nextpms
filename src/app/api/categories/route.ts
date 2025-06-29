import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseAnonymousClient } from '@/lib/supabaseServer';
import { Database, CategoryInsert, CategoryFiltersDB } from '@/types/database';

// GET /api/categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = createServerSupabaseAnonymousClient();
    
    // Extract filters from search params
    const filters: CategoryFiltersDB = {
      search: searchParams.get('search') || undefined,
      parent_id: searchParams.get('parent_id') || undefined,
      is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined,
      is_featured: searchParams.get('is_featured') ? searchParams.get('is_featured') === 'true' : undefined,
      level: searchParams.get('level') ? parseInt(searchParams.get('level')!) : undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'sort_order',
      sort_order: (searchParams.get('sort_order') as any) || 'asc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    let query = supabase.from('categories').select('*');

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters.parent_id !== undefined) {
      if (filters.parent_id === '' || filters.parent_id === 'root') {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', filters.parent_id);
      }
    }
    
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    
    if (filters.level !== undefined) {
      query = query.eq('level', filters.level);
    }

    // Apply sorting
    const ascending = filters.sort_order === 'asc';
    query = query.order(filters.sort_by || 'sort_order', { ascending });
    
    // Add secondary sort by name
    if (filters.sort_by !== 'name') {
      query = query.order('name', { ascending: true });
    }

    // Apply pagination
    const from = ((filters.page || 1) - 1) * (filters.limit || 20);
    const to = from + (filters.limit || 20) - 1;
    
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: data || [],
      total: totalCount || 0,
      page: filters.page || 1,
      limit: filters.limit || 20,
      total_pages: Math.ceil((totalCount || 0) / (filters.limit || 20))
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createServerSupabaseAnonymousClient();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = body.slug || generateSlug(body.name);
    
    // Check if slug already exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();
      
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Prepare category data
    const categoryData: CategoryInsert = {
      name: body.name,
      description: body.description || null,
      slug,
      parent_id: body.parent_id || null,
      image_url: body.image_url || null,
      icon: body.icon || null,
      color: body.color || null,
      sort_order: body.sort_order || 0,
      is_active: body.is_active !== undefined ? body.is_active : true,
      is_featured: body.is_featured !== undefined ? body.is_featured : false,
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      meta_keywords: body.meta_keywords || null,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
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
      { success: true, data, message: 'Category created successfully' },
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
