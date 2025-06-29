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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class CategoryService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get all categories with filtering and pagination
  async getCategories(filters?: CategoryFilters): Promise<CategoriesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const queryString = params.toString();
      const url = `/api/categories${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch categories');
      }

      return {
        data: result.data || [],
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 20,
        total_pages: result.total_pages || 0
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  // Get category tree structure
  async getCategoryTree(): Promise<CategoryTree[]> {
    try {
      const response = await fetch('/api/categories/tree', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch category tree');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching category tree:', error);
      throw new Error('Failed to fetch category tree');
    }
  }

  // Get single category by ID
  async getCategory(id: string): Promise<Category> {
    try {
      const response = await this.fetchWithAuth(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category');
    }
  }

  // Create new category
  async createCategory(data: CategoryFormData): Promise<Category> {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create category');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  // Update existing category
  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update category');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  // Get category statistics
  async getCategoryStats(): Promise<CategoryStats> {
    try {
      const response = await fetch('/api/categories/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch category statistics');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw new Error('Failed to fetch category statistics');
    }
  }

  // Bulk operations
  async bulkOperation(operation: BulkCategoryOperation): Promise<void> {
    try {
      await this.fetchWithAuth('/categories/bulk', {
        method: 'POST',
        body: JSON.stringify(operation),
      });
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      throw new Error('Failed to perform bulk operation');
    }
  }

  // Move category to new parent
  async moveCategory(categoryId: string, newParentId?: string, newPosition?: number): Promise<void> {
    try {
      await this.fetchWithAuth(`/categories/${categoryId}/move`, {
        method: 'POST',
        body: JSON.stringify({ parent_id: newParentId, position: newPosition }),
      });
    } catch (error) {
      console.error('Error moving category:', error);
      throw new Error('Failed to move category');
    }
  }

  // Duplicate category
  async duplicateCategory(id: string): Promise<Category> {
    try {
      const response = await this.fetchWithAuth(`/categories/${id}/duplicate`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      console.error('Error duplicating category:', error);
      throw new Error('Failed to duplicate category');
    }
  }

  // Import categories
  async importCategories(data: CategoryImportData[]): Promise<Category[]> {
    try {
      const response = await this.fetchWithAuth('/categories/import', {
        method: 'POST',
        body: JSON.stringify({ categories: data }),
      });
      return response.data;
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
