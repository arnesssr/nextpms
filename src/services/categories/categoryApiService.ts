import { createServerSupabaseAnonymousClient } from '@/lib/supabaseServer';
import { Database, CategoryInsert, CategoryUpdate } from '@/types/database';

// Fetch all categories with optional filters
export async function fetchCategories(filters?: Record<string, any>) {
  const supabase = createServerSupabaseAnonymousClient();

  let query = supabase.from('categories').select('*');

  // Apply filters
  if (filters) {
    if (filters.name) {
      query.ilike('name', `%${filters.name}%`);
    }
    if (filters.parent_id) {
      query.eq('parent_id', filters.parent_id);
    }
    if (filters.is_active) {
      query.eq('is_active', filters.is_active);
    }
  }

  // Execute query
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data;
}

// Create a new category
export async function createCategory(category: CategoryInsert) {
  const supabase = createServerSupabaseAnonymousClient();

  const { data, error } = await supabase.from('categories').insert([category]).single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
}

// Update an existing category
export async function updateCategory(id: string, category: CategoryUpdate) {
  const supabase = createServerSupabaseAnonymousClient();

  const { data, error } = await supabase.from('categories').update(category).eq('id', id).single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return data;
}

// Delete a category
export async function deleteCategory(id: string) {
  const supabase = createServerSupabaseAnonymousClient();

  const { data, error } = await supabase.from('categories').delete().eq('id', id).single();

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }

  return data;
}
