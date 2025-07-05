import { useState, useEffect, useCallback } from 'react';
import {
  CreateSupplierOrderRequest,
  SupplierOrder,
  SupplierOrderFilters,
  SupplierOrderSummary,
  SupplierOrderStats,
  UpdateSupplierOrderRequest
} from '../types';
import {
  getSupplierOrders,
  getSupplierOrder,
  createSupplierOrder,
  updateSupplierOrder,
  deleteSupplierOrder
} from '../services/supplierOrdersService';

export const useSupplierOrders = (initialFilters?: SupplierOrderFilters) => {
  const [orders, setOrders] = useState<SupplierOrderSummary[]>([]);
  const [stats, setStats] = useState<SupplierOrderStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<SupplierOrderFilters | undefined>(initialFilters);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (newFilters?: SupplierOrderFilters) => {
    setLoading(true);
    try {
      const filtersToUse = newFilters || filters;
      const response = await getSupplierOrders(filtersToUse);
      setOrders(response.orders);
      setStats(response.stats);
      setPagination(response.pagination);
      if (newFilters) {
        setFilters(newFilters);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch supplier orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (orderData: CreateSupplierOrderRequest): Promise<SupplierOrder | null> => {
    try {
      const newOrder = await createSupplierOrder(orderData);
      fetchOrders(); // Refresh the list
      return newOrder;
    } catch (err) {
      setError('Failed to create supplier order');
      console.error(err);
      return null;
    }
  };

  const updateOrder = async (orderId: string, orderData: UpdateSupplierOrderRequest): Promise<SupplierOrder | null> => {
    try {
      const updatedOrder = await updateSupplierOrder(orderId, orderData);
      fetchOrders(); // Refresh the list
      return updatedOrder;
    } catch (err) {
      setError('Failed to update supplier order');
      console.error(err);
      return null;
    }
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    try {
      const success = await deleteSupplierOrder(orderId);
      if (success) {
        fetchOrders(); // Refresh the list
      }
      return success;
    } catch (err) {
      setError('Failed to delete supplier order');
      console.error(err);
      return false;
    }
  };

  return {
    orders,
    stats,
    pagination,
    loading,
    error,
    filters,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder
  };
};

export const useSupplierOrder = (orderId: string | null) => {
  const [order, setOrder] = useState<SupplierOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setOrder(null);
        return;
      }

      setLoading(true);
      try {
        const data = await getSupplierOrder(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch supplier order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const updateOrderDetails = async (orderData: UpdateSupplierOrderRequest): Promise<SupplierOrder | null> => {
    if (!orderId) return null;

    try {
      const updatedOrder = await updateSupplierOrder(orderId, orderData);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
      return updatedOrder;
    } catch (err) {
      setError('Failed to update supplier order');
      console.error(err);
      return null;
    }
  };

  return { order, loading, error, updateOrderDetails };
};