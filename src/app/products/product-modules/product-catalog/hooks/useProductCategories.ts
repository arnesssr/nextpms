import { useState, useEffect } from 'react';
import { ProductCategory } from '../types';

interface UseProductCategoriesState {
  categories: ProductCategory[];
  loading: boolean;
  error: string | null;
}

interface UseProductCategoriesActions {
  refreshCategories: () => Promise<void>;
  addCategory: (category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<ProductCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => ProductCategory | undefined;
  getCategoryTree: () => ProductCategory[];
}

export const useProductCategories = (): UseProductCategoriesState & UseProductCategoriesActions => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  const mockCategories: ProductCategory[] = [
    {
      id: '1',
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Smartphones',
      description: 'Mobile phones and accessories',
      parent_id: '1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Laptops',
      description: 'Portable computers',
      parent_id: '1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Clothing',
      description: 'Apparel and fashion items',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      name: 'Home & Garden',
      description: 'Home improvement and garden supplies',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const refreshCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCategories(mockCategories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCategory: ProductCategory = {
        ...category,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setCategories(prev => [...prev, newCategory]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, updates: Partial<ProductCategory>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCategories(prev =>
        prev.map(category =>
          category.id === id
            ? { ...category, ...updates, updated_at: new Date().toISOString() }
            : category
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Check if category has children
      const hasChildren = categories.some(cat => cat.parent_id === id);
      if (hasChildren) {
        throw new Error('Cannot delete category with subcategories');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (id: string): ProductCategory | undefined => {
    return categories.find(category => category.id === id);
  };

  const getCategoryTree = (): ProductCategory[] => {
    // Build hierarchical tree structure
    const categoryMap = new Map<string, ProductCategory & { children: ProductCategory[] }>();
    const rootCategories: (ProductCategory & { children: ProductCategory[] })[] = [];

    // Initialize all categories in the map
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build the tree
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refreshCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryTree,
  };
};
