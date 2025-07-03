import { useState, useCallback, useMemo } from 'react';
import { SupplierFilters, SupplierStatus, BusinessType, SupplierType, PerformanceStatus } from '../types/suppliersTypes';

export interface UseSupplierFiltersReturn {
  filters: SupplierFilters;
  searchTerm: string;
  selectedStatus: SupplierStatus | undefined;
  selectedBusinessType: BusinessType | undefined;
  selectedSupplierType: SupplierType | undefined;
  selectedPerformanceStatus: PerformanceStatus | undefined;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setSearchTerm: (term: string) => void;
  setStatus: (status: SupplierStatus | undefined) => void;
  setBusinessType: (type: BusinessType | undefined) => void;
  setSupplierType: (type: SupplierType | undefined) => void;
  setPerformanceStatus: (status: PerformanceStatus | undefined) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  
  // Computed values
  hasActiveFilters: boolean;
  filterCount: number;
}

const defaultFilters: SupplierFilters = {
  page: 1,
  limit: 10,
  search: '',
  status: undefined,
  business_type: undefined,
  supplier_type: undefined,
  performance_status: undefined,
  sort_by: 'name',
  sort_order: 'asc'
};

export const useSupplierFilters = (initialFilters?: Partial<SupplierFilters>): UseSupplierFiltersReturn => {
  const [filters, setFilters] = useState<SupplierFilters>({
    ...defaultFilters,
    ...initialFilters
  });

  const setSearchTerm = useCallback((term: string) => {
    setFilters(prev => ({
      ...prev,
      search: term,
      page: 1 // Reset to first page when searching
    }));
  }, []);

  const setStatus = useCallback((status: SupplierStatus | undefined) => {
    setFilters(prev => ({
      ...prev,
      status,
      page: 1
    }));
  }, []);

  const setBusinessType = useCallback((type: BusinessType | undefined) => {
    setFilters(prev => ({
      ...prev,
      business_type: type,
      page: 1
    }));
  }, []);

  const setSupplierType = useCallback((type: SupplierType | undefined) => {
    setFilters(prev => ({
      ...prev,
      supplier_type: type,
      page: 1
    }));
  }, []);

  const setPerformanceStatus = useCallback((status: PerformanceStatus | undefined) => {
    setFilters(prev => ({
      ...prev,
      performance_status: status,
      page: 1
    }));
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sort_by: sortBy,
      page: 1
    }));
  }, []);

  const setSortOrder = useCallback((order: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sort_order: order,
      page: 1
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setFilters(prev => ({
      ...prev,
      limit,
      page: 1
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      search: '',
      status: undefined,
      business_type: undefined,
      supplier_type: undefined,
      performance_status: undefined,
      page: 1
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.status ||
      filters.business_type ||
      filters.supplier_type ||
      filters.performance_status
    );
  }, [filters]);

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.business_type) count++;
    if (filters.supplier_type) count++;
    if (filters.performance_status) count++;
    return count;
  }, [filters]);

  return {
    filters,
    searchTerm: filters.search,
    selectedStatus: filters.status,
    selectedBusinessType: filters.business_type,
    selectedSupplierType: filters.supplier_type,
    selectedPerformanceStatus: filters.performance_status,
    sortBy: filters.sort_by,
    sortOrder: filters.sort_order,
    setSearchTerm,
    setStatus,
    setBusinessType,
    setSupplierType,
    setPerformanceStatus,
    setSortBy,
    setSortOrder,
    setPage,
    setLimit,
    clearFilters,
    resetFilters,
    hasActiveFilters,
    filterCount
  };
};
