import { useState, useEffect, useCallback } from 'react';
import { Supplier, SupplierFilters, SupplierFormData, SupplierStats } from '../types/suppliers.types';
import { suppliersService } from '../services/suppliersService';

interface UseSuppliers {
  suppliers: Supplier[];
  stats: SupplierStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchSuppliers: (filters?: SupplierFilters, page?: number) => Promise<void>;
  createSupplier: (data: SupplierFormData) => Promise<Supplier>;
  updateSupplier: (id: string, data: Partial<SupplierFormData>) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplierById: (id: string) => Promise<Supplier | null>;
}

export function useSuppliers(initialFilters: SupplierFilters = {}): UseSuppliers {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchSuppliers = useCallback(async (filters: SupplierFilters = initialFilters, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await suppliersService.getSuppliers(filters, page, pagination.limit);
      
      setSuppliers(response.suppliers);
      setStats(response.stats);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, [initialFilters, pagination.limit]);

  const createSupplier = useCallback(async (data: SupplierFormData): Promise<Supplier> => {
    try {
      setLoading(true);
      setError(null);
      
      const newSupplier = await suppliersService.createSupplier(data);
      
      // Refresh the suppliers list
      await fetchSuppliers();
      
      return newSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchSuppliers]);

  const updateSupplier = useCallback(async (id: string, data: Partial<SupplierFormData>): Promise<Supplier> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedSupplier = await suppliersService.updateSupplier(id, data);
      
      // Update the supplier in the current list
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === id ? updatedSupplier : supplier
      ));
      
      return updatedSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSupplier = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await suppliersService.deleteSupplier(id);
      
      // Remove the supplier from the current list
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
      
      // Update stats
      if (stats) {
        setStats(prev => prev ? { ...prev, total: prev.total - 1 } : null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [stats]);

  const getSupplierById = useCallback(async (id: string): Promise<Supplier | null> => {
    try {
      setError(null);
      return await suppliersService.getSupplierById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supplier');
      return null;
    }
  }, []);

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    stats,
    loading,
    error,
    pagination,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById
  };
}
