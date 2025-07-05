import { useState, useEffect, useCallback } from 'react';
import { ReturnRequest, ReturnStatus, ReturnItem } from '../types';

export const useOrderReturns = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingReturns, setProcessingReturns] = useState<Set<string>>(new Set());

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders/returns');
      
      if (!response.ok) {
        throw new Error('Failed to fetch returns');
      }

      const result = await response.json();
      
      if (result.success) {
        setReturns(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch returns');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReturn = useCallback(async (
    orderId: string,
    items: ReturnItem[],
    reason: string,
    description?: string
  ) => {
    try {
      setLoading(true);

      const response = await fetch('/api/orders/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          items,
          reason,
          description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create return request');
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchReturns(); // Refresh list
        return { success: true, returnId: result.data.id };
      } else {
        throw new Error(result.message || 'Failed to create return');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchReturns]);

  const updateReturnStatus = useCallback(async (
    returnId: string,
    status: ReturnStatus,
    notes?: string
  ) => {
    try {
      setProcessingReturns(prev => new Set(prev).add(returnId));

      const response = await fetch(`/api/orders/returns/${returnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update return status');
      }

      const result = await response.json();
      
      if (result.success) {
        setReturns(prev => prev.map(returnRequest => 
          returnRequest.id === returnId 
            ? { ...returnRequest, status, notes }
            : returnRequest
        ));
        return { success: true };
      } else {
        throw new Error(result.message || 'Failed to update return');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { success: false, message: errorMessage };
    } finally {
      setProcessingReturns(prev => {
        const newSet = new Set(prev);
        newSet.delete(returnId);
        return newSet;
      });
    }
  }, []);

  const processRefund = useCallback(async (
    returnId: string,
    refundAmount: number,
    refundMethod: string
  ) => {
    try {
      const response = await fetch(`/api/orders/returns/${returnId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: refundAmount,
          method: refundMethod
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update return status to refunded
        await updateReturnStatus(returnId, 'refunded');
        return { success: true, refundId: result.data.refundId };
      } else {
        throw new Error(result.message || 'Failed to process refund');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { success: false, message: errorMessage };
    }
  }, [updateReturnStatus]);

  // Initial load
  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return {
    returns,
    loading,
    error,
    processingReturns,
    fetchReturns,
    createReturn,
    updateReturnStatus,
    processRefund
  };
};
