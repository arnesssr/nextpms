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

  const fetchSuppliers = useCallback(async (filters: SupplierFilters = initialFilters, page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await suppliersService.getSuppliers(filters, page, limit);
      
      // Handle the response properly
      setSuppliers(response.suppliers || []);
      setStats(response.stats || { total: 0, active: 0, inactive: 0, pending: 0, suspended: 0 });
      setPagination(response.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suppliers');
      // Set empty state on error
      setSuppliers([]);
      setStats({ total: 0, active: 0, inactive: 0, pending: 0, suspended: 0 });
      setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  const createSupplier = useCallback(async (data: SupplierFormData): Promise<Supplier> => {
    try {
      setLoading(true);
      setError(null);
      
      const newSupplier = await suppliersService.createSupplier(data);
      
      // Optimized: Add supplier to local state instead of full refresh
      setSuppliers(prev => [newSupplier, ...prev]);
      
      // Update stats locally
      setStats(prev => prev ? {
        ...prev,
        total: prev.total + 1,
        active: newSupplier.status === 'active' ? prev.active + 1 : prev.active,
        pending: newSupplier.status === 'pending' ? prev.pending + 1 : prev.pending,
        inactive: newSupplier.status === 'inactive' ? prev.inactive + 1 : prev.inactive,
        suspended: newSupplier.status === 'suspended' ? prev.suspended + 1 : prev.suspended
      } : { total: 1, active: 1, inactive: 0, pending: 0, suspended: 0 });
      
      return newSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

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
