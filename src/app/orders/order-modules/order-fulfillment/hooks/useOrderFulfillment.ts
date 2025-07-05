import { useState, useEffect, useCallback } from 'react';
import { Order, FulfillmentStatus, FulfillmentAction, ShipmentInfo } from '../types';

export const useOrderFulfillment = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const fetchPendingOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders?status=confirmed,processing&limit=50');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending orders');
      }

      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (
    orderId: string, 
    status: FulfillmentStatus,
    shipmentInfo?: ShipmentInfo
  ) => {
    try {
      setProcessingOrders(prev => new Set(prev).add(orderId));

      const response = await fetch(`/api/orders/${orderId}/fulfill`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          shipmentInfo
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update order in local state
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status, shipmentInfo }
            : order
        ));
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || 'Failed to update order');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { success: false, message: errorMessage };
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  }, []);

  const bulkUpdateOrders = useCallback(async (
    orderIds: string[],
    action: FulfillmentAction
  ) => {
    try {
      setLoading(true);

      const response = await fetch('/api/orders/bulk-fulfill', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds,
          action
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to bulk update orders');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh orders list
        await fetchPendingOrders();
        setSelectedOrders(new Set());
        return { success: true, processedCount: result.data.processedCount };
      } else {
        throw new Error(result.message || 'Failed to bulk update orders');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchPendingOrders]);

  const generateShippingLabel = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/shipping-label`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate shipping label');
      }

      const result = await response.json();
      
      if (result.success) {
        // Download the label
        const link = document.createElement('a');
        link.href = result.data.labelUrl;
        link.download = `shipping-label-${orderId}.pdf`;
        link.click();
        
        return { success: true };
      } else {
        throw new Error(result.message || 'Failed to generate label');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { success: false, message: errorMessage };
    }
  }, []);

  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }, []);

  const selectAllOrders = useCallback(() => {
    setSelectedOrders(new Set(orders.map(order => order.id)));
  }, [orders]);

  const clearSelection = useCallback(() => {
    setSelectedOrders(new Set());
  }, []);

  // Initial load
  useEffect(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  return {
    orders,
    loading,
    error,
    processingOrders,
    selectedOrders,
    fetchPendingOrders,
    updateOrderStatus,
    bulkUpdateOrders,
    generateShippingLabel,
    toggleOrderSelection,
    selectAllOrders,
    clearSelection
  };
};
