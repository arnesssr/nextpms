import { useState, useEffect, useCallback } from 'react';
import { Order, OrderFilters, PaginatedResponse } from '@/types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<OrderFilters>({});

  const fetchOrders = useCallback(async (
    currentFilters: OrderFilters = filters,
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.entries(currentFilters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              acc[key] = value.join(',');
            } else {
              acc[key] = value.toString();
            }
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`/api/orders?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result: PaginatedResponse<Order> = await response.json();
      
      if (result.success) {
        setOrders(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);


  const updateOrder = useCallback(async (orderId: string, updates: any) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh orders list
        await fetchOrders(filters, pagination.page, pagination.limit);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update order');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchOrders, filters, pagination.page, pagination.limit]);

  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh orders list
        await fetchOrders(filters, pagination.page, pagination.limit);
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete order');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchOrders, filters, pagination.page, pagination.limit]);

  const applyFilters = useCallback((newFilters: OrderFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders(newFilters, 1, pagination.limit);
  }, [fetchOrders, pagination.limit]);

  const changePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchOrders(filters, page, pagination.limit);
  }, [fetchOrders, filters, pagination.limit]);

  const changeLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
    fetchOrders(filters, 1, limit);
  }, [fetchOrders, filters]);

  const refreshOrders = useCallback(() => {
    fetchOrders(filters, pagination.page, pagination.limit);
  }, [fetchOrders, filters, pagination.page, pagination.limit]);

  // Initial load
  useEffect(() => {
    fetchOrders(filters, pagination.page, pagination.limit);
  }, []); // Empty dependency array for initial load only

  return {
    orders,
    loading,
    error,
    pagination,
    filters,
    fetchOrders,
    updateOrder,
    deleteOrder,
    applyFilters,
    changePage,
    changeLimit,
    refreshOrders
  };
};