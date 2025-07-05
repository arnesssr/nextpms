import { useState, useEffect, useCallback } from 'react';
import { TrackedOrder, TrackingStatus } from '../types';

export const useOrderTracking = () => {
  const [trackedOrders, setTrackedOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackedOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders/tracking');

      if (!response.ok) {
        throw new Error('Failed to fetch tracked orders');
      }

      const result = await response.json();

      if (result.success) {
        setTrackedOrders(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTrackedOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleOrderTracking = useCallback((orderId: string) => {
    setTrackedOrders((prev) => {
      const order = prev.find((o) => o.id === orderId);
      if (order) {
        return prev.filter((o) => o.id !== orderId);
      } else {
        return [...prev, { id: orderId, customerId: '', status: 'pending', dateOrdered: new Date().toISOString(), trackingUpdates: [] }];
      }
    });
  }, []);

  useEffect(() => {
    fetchTrackedOrders();
  }, [fetchTrackedOrders]);

  return {
    trackedOrders,
    loading,
    error,
    fetchTrackedOrders,
    toggleOrderTracking,
  };
};
