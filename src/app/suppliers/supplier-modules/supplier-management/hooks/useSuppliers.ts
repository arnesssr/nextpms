import { useState, useEffect, useCallback } from 'react';
import { suppliersService } from '../services/suppliersService';
import { Supplier, SupplierFilters, SupplierSummary, CreateSupplierRequest, UpdateSupplierRequest } from '../types/suppliersTypes';

export interface UseSuppliersReturn {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  summary: SupplierSummary | null;
  filters: SupplierFilters;
  
  // Actions
  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: CreateSupplierRequest) => Promise<Supplier>;
  updateSupplier: (id: string, data: UpdateSupplierRequest) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
  setFilters: (filters: Partial<SupplierFilters>) => void;
  setPage: (page: number) => void;
  refreshSummary: () => Promise<void>;
  clearError: () => void;
}

export const useSuppliers = (initialFilters?: Partial<SupplierFilters>): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState<SupplierSummary | null>(null);
  const [filters, setFiltersState] = useState<SupplierFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    business_type: undefined,
    supplier_type: undefined,
    performance_status: undefined,
    sort_by: 'name',
    sort_order: 'asc',
    ...initialFilters
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await suppliersService.fetchSuppliers(filters);
      
      setSuppliers(response.data);
      setTotalCount(response.pagination.total);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suppliers';
      setError(errorMessage);
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createSupplier = useCallback(async (data: CreateSupplierRequest): Promise<Supplier> => {
    try {
      setError(null);
      
      const newSupplier = await suppliersService.createSupplier(data);
      
      // Add to current list if it matches filters
      setSuppliers(prev => [newSupplier, ...prev]);
      setTotalCount(prev => prev + 1);
      
      return newSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create supplier';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateSupplier = useCallback(async (id: string, data: UpdateSupplierRequest): Promise<Supplier> => {
    try {
      setError(null);
      
      const updatedSupplier = await suppliersService.updateSupplier(id, data);
      
      // Update in current list
      setSuppliers(prev => 
        prev.map(supplier => 
          supplier.id === id ? updatedSupplier : supplier
        )
      );
      
      return updatedSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update supplier';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteSupplier = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      await suppliersService.deleteSupplier(id);
      
      // Remove from current list
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete supplier';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const setFilters = useCallback((newFilters: Partial<SupplierFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset to first page when filters change
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFiltersState(prev => ({ ...prev, page }));
  }, []);

  const refreshSummary = useCallback(async () => {
    try {
      const summaryData = await suppliersService.fetchSupplierSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching supplier summary:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch suppliers when filters change
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Fetch summary on mount
  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  return {
    suppliers,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    summary,
    filters,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    setFilters,
    setPage,
    refreshSummary,
    clearError
  };
};
