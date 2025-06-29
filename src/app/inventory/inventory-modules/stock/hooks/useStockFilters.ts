'use client';

import { useState, useMemo } from 'react';
import { Stock, StockFilter, StockStatus } from '../types/stock.types';

export const useStockFilters = (stocks: Stock[]) => {
  const [filters, setFilters] = useState<StockFilter>({});

  // Apply filters to the stock list
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      // Search filter (product name, SKU, or supplier)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          stock.productName.toLowerCase().includes(searchTerm) ||
          stock.productSku.toLowerCase().includes(searchTerm) ||
          (stock.supplier && stock.supplier.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && stock.status !== filters.status) {
        return false;
      }

      // Location filter
      if (filters.location && stock.location !== filters.location) {
        return false;
      }

      // Warehouse filter
      if (filters.warehouseId && stock.warehouseId !== filters.warehouseId) {
        return false;
      }

      // Low stock filter
      if (filters.lowStock && stock.currentQuantity > stock.minimumQuantity) {
        return false;
      }

      // Out of stock filter
      if (filters.outOfStock && stock.currentQuantity > 0) {
        return false;
      }

      // Expiry date filter
      if (filters.expiringBefore && stock.expiryDate) {
        if (new Date(stock.expiryDate) > filters.expiringBefore) {
          return false;
        }
      }

      return true;
    });
  }, [stocks, filters]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const locations = [...new Set(stocks.map(stock => stock.location))];
    const warehouses = [...new Set(stocks.map(stock => stock.warehouseId).filter(Boolean))];
    const suppliers = [...new Set(stocks.map(stock => stock.supplier).filter(Boolean))];

    return {
      locations,
      warehouses,
      suppliers,
      statuses: Object.values(StockStatus)
    };
  }, [stocks]);

  // Update individual filter
  const updateFilter = (key: keyof StockFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  // Clear specific filter
  const clearFilter = (key: keyof StockFilter) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  // Preset filters
  const applyPresetFilter = (preset: 'low_stock' | 'out_of_stock' | 'in_stock' | 'expiring_soon') => {
    switch (preset) {
      case 'low_stock':
        setFilters({ lowStock: true });
        break;
      case 'out_of_stock':
        setFilters({ outOfStock: true });
        break;
      case 'in_stock':
        setFilters({ status: StockStatus.IN_STOCK });
        break;
      case 'expiring_soon':
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setFilters({ expiringBefore: nextMonth });
        break;
      default:
        clearFilters();
    }
  };

  // Get filter summary
  const filterSummary = useMemo(() => {
    const activeFilters = Object.keys(filters).filter(key => 
      filters[key as keyof StockFilter] !== undefined && 
      filters[key as keyof StockFilter] !== null
    );

    return {
      activeCount: activeFilters.length,
      totalResults: filteredStocks.length,
      isActive: activeFilters.length > 0
    };
  }, [filters, filteredStocks]);

  return {
    filters,
    filteredStocks,
    filterOptions,
    filterSummary,
    updateFilter,
    clearFilters,
    clearFilter,
    applyPresetFilter
  };
};
