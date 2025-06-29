import { useState, useCallback, useEffect } from 'react';
import { 
  Category, 
  CategoryFormData, 
  CategoryFilters, 
  CategoryStats,
  UseCategoriesReturn 
} from '../types';
import { categoryService } from '@/services/categories';

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CategoryStats | null>(null);

  const fetchCategories = useCallback(async (filters?: CategoryFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategories(filters);
      setCategories(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: CategoryFormData): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await categoryService.createCategory(data);
      setCategories(prev => [...prev, newCategory]);
      
      // Refresh stats after creation
      const updatedStats = await categoryService.getCategoryStats();
      setStats(updatedStats);
      
      return newCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<CategoryFormData>): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      const updatedCategory = await categoryService.updateCategory(id, data);
      setCategories(prev => 
        prev.map(category => 
          category.id === id ? updatedCategory : category
        )
      );
      return updatedCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(category => category.id !== id));
      
      // Refresh stats after deletion
      const updatedStats = await categoryService.getCategoryStats();
      setStats(updatedStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateCategories = useCallback(async (
    updates: Array<{ id: string; data: Partial<CategoryFormData> }>
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Process each update
      for (const update of updates) {
        await categoryService.updateCategory(update.id, update.data);
      }
      
      // Refresh all categories after bulk update
      await fetchCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update categories';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  const duplicateCategory = useCallback(async (id: string): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      const duplicatedCategory = await categoryService.duplicateCategory(id);
      setCategories(prev => [...prev, duplicatedCategory]);
      return duplicatedCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const categoryStats = await categoryService.getCategoryStats();
      setStats(categoryStats);
    } catch (err) {
      console.error('Error fetching category stats:', err);
    }
  }, []);

  // Auto-fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    stats,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
    bulkUpdateCategories,
    duplicateCategory,
    fetchStats
  };
};
