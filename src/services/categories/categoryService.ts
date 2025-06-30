import { 
  Category, 
  CategoryFormData, 
  CategoryFilters, 
  CategoriesResponse, 
  CategoryStats,
  CategoryTree,
  BulkCategoryOperation,
  CategoryImportData
} from '../types';
import { supabase } from '@/lib/supabaseClient';

export class CategoryService {

  // Get all categories with filtering and pagination
  async getCategories(filters?: CategoryFilters): Promise<CategoriesResponse> {
    try {
      let query = supabase.from('categories').select('*', { count: 'exact' });
      
      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters?.parent_id !== undefined) {
        if (filters.parent_id === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', filters.parent_id);
        }
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      // Apply sorting
      if (filters?.sort_by) {
        const order = filters.sort_order === 'desc' ? { ascending: false } : { ascending: true };
        query = query.order(filters.sort_by, order);
      } else {
        query = query.order('name', { ascending: true });
      }
      
      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      const total = count || 0;
      const total_pages = Math.ceil(total / limit);
      
      return {
        data: data || [],
        total,
        page,
        limit,
        total_pages
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  // Get category tree structure
  async getCategoryTree(): Promise<CategoryTree[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Build tree structure
      const categories = data || [];
      const categoryMap = new Map<string, CategoryTree>();
      const rootCategories: CategoryTree[] = [];
      
      // First pass: create all nodes
      categories.forEach(category => {
        categoryMap.set(category.id, {
          ...category,
          children: []
        });
      });
      
      // Second pass: build parent-child relationships
      categories.forEach(category => {
        const categoryNode = categoryMap.get(category.id)!;
        
        if (category.parent_id && categoryMap.has(category.parent_id)) {
          const parent = categoryMap.get(category.parent_id)!;
          parent.children.push(categoryNode);
        } else {
          rootCategories.push(categoryNode);
        }
      });
      
      return rootCategories;
    } catch (error) {
      console.error('Error fetching category tree:', error);
      throw new Error('Failed to fetch category tree');
    }
  }

  // Get single category by ID
  async getCategory(id: string): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error('Category not found');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category');
    }
  }

  // Create new category
  async createCategory(data: CategoryFormData): Promise<Category> {
    try {
      // Generate slug if not provided
      const slug = data.slug || this.generateSlug(data.name);
      
      // Sanitize parent_id - convert empty string to null
      const sanitizedData = { ...data };
      if (sanitizedData.parent_id === '' || sanitizedData.parent_id === undefined) {
        sanitizedData.parent_id = null;
      }
      
      const categoryData = {
        ...sanitizedData,
        slug,
        status: sanitizedData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!newCategory) {
        throw new Error('Failed to create category');
      }
      
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  // Update existing category
  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      // Generate slug if name is being updated and slug is not provided
      if (data.name && !data.slug) {
        updateData.slug = this.generateSlug(data.name);
      }
      
      const { data: updatedCategory, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!updatedCategory) {
        throw new Error('Category not found');
      }
      
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  // Get category statistics
  async getCategoryStats(): Promise<CategoryStats> {
    try {
      // Get total categories count
      const { count: totalCategories, error: totalError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        throw new Error(totalError.message);
      }

      // Get active categories count
      const { count: activeCategories, error: activeError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) {
        throw new Error(activeError.message);
      }

      // Get root categories count (no parent)
      const { count: rootCategories, error: rootError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .is('parent_id', null);

      if (rootError) {
        throw new Error(rootError.message);
      }

      return {
        total: totalCategories || 0,
        active: activeCategories || 0,
        inactive: (totalCategories || 0) - (activeCategories || 0),
        root_categories: rootCategories || 0
      };
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw new Error('Failed to fetch category statistics');
    }
  }

  // Bulk operations
  async bulkOperation(operation: BulkCategoryOperation): Promise<void> {
    try {
      const { type, category_ids, data } = operation;
      
      if (type === 'delete') {
        const { error } = await supabase
          .from('categories')
          .delete()
          .in('id', category_ids);
        
        if (error) {
          throw new Error(error.message);
        }
      } else if (type === 'update') {
        const { error } = await supabase
          .from('categories')
          .update({ ...data, updated_at: new Date().toISOString() })
          .in('id', category_ids);
        
        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      throw new Error('Failed to perform bulk operation');
    }
  }

  // Move category to new parent
  async moveCategory(categoryId: string, newParentId?: string, newPosition?: number): Promise<void> {
    try {
      const updateData: any = {
        parent_id: newParentId || null,
        updated_at: new Date().toISOString()
      };
      
      // Note: position handling would require additional logic for ordering
      if (newPosition !== undefined) {
        updateData.sort_order = newPosition;
      }
      
      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', categoryId);
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error moving category:', error);
      throw new Error('Failed to move category');
    }
  }

  // Duplicate category
  async duplicateCategory(id: string): Promise<Category> {
    try {
      // First get the original category
      const { data: originalCategory, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      if (!originalCategory) {
        throw new Error('Category not found');
      }
      
      // Create duplicate with modified name and slug
      const duplicateData = {
        ...originalCategory,
        id: undefined, // Let Supabase generate new ID
        name: `${originalCategory.name} (Copy)`,
        slug: `${originalCategory.slug}-copy`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: newCategory, error: createError } = await supabase
        .from('categories')
        .insert([duplicateData])
        .select()
        .single();
      
      if (createError) {
        throw new Error(createError.message);
      }
      
      if (!newCategory) {
        throw new Error('Failed to duplicate category');
      }
      
      return newCategory;
    } catch (error) {
      console.error('Error duplicating category:', error);
      throw new Error('Failed to duplicate category');
    }
  }

  // Import categories
  async importCategories(data: CategoryImportData[]): Promise<Category[]> {
    try {
      const categoriesToInsert = data.map(category => ({
        ...category,
        slug: category.slug || this.generateSlug(category.name),
        status: category.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { data: newCategories, error } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return newCategories || [];
    } catch (error) {
      console.error('Error importing categories:', error);
      throw new Error('Failed to import categories');
    }
  }

  // Utility methods
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  validateCategoryName(name: string): { isValid: boolean; message?: string } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, message: 'Category name is required' };
    }
    
    if (name.length < 2) {
      return { isValid: false, message: 'Category name must be at least 2 characters long' };
    }
    
    if (name.length > 100) {
      return { isValid: false, message: 'Category name must be less than 100 characters' };
    }
    
    return { isValid: true };
  }

  buildCategoryPath(category: Category, allCategories: Category[]): string {
    const path: string[] = [category.name];
    let currentCategory = category;
    
    while (currentCategory.parent_id) {
      const parent = allCategories.find(cat => cat.id === currentCategory.parent_id);
      if (parent) {
        path.unshift(parent.name);
        currentCategory = parent;
      } else {
        break;
      }
    }
    
    return path.join(' > ');
  }
}

export const categoryService = new CategoryService();
