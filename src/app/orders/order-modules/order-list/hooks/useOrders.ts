import { useState, useEffect, useCallback } from 'react';
import { Order, OrderFilters, OrderStats, PaginatedResponse } from '@/types';

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
  const [stats, setStats] = useState<OrderStats | null>(null);

  const fetchOrders = useCallback(async (
    currentFilters: OrderFilters = filters,
    page: number = pagination.page,
    limit: number = pagination.limit
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
      
      setOrders(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/orders/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch order stats');
      }

      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching order stats:', err);
    }
  }, []);

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
        await fetchOrders();
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update order');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchOrders]);

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
        await fetchOrders();
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete order');
      }
    } catch (err) {
      throw err;
    }
  }, [fetchOrders]);

  const applyFilters = useCallback((newFilters: OrderFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders(newFilters, 1);
  }, [fetchOrders]);

  const changePage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchOrders(filters, page);
  }, [fetchOrders, filters]);

  const changeLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
    fetchOrders(filters, 1, limit);
  }, [fetchOrders, filters]);

  const refreshOrders = useCallback(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  // Initial load
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  return {
    orders,
    loading,
    error,
    pagination,
    filters,
    stats,
    fetchOrders,
    updateOrder,
    deleteOrder,
    applyFilters,
    changePage,
    changeLimit,
    refreshOrders
  };
};