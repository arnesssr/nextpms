import { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderFilter, Supplier } from '../types/purchase-order.types';
import { PurchaseOrderService } from '../services/purchaseOrderService';

export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseOrders = async (filters?: PurchaseOrderFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PurchaseOrderService.getPurchaseOrders(filters);
      setPurchaseOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  return {
    purchaseOrders,
    loading,
    error,
    fetchPurchaseOrders
  };
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PurchaseOrderService.getSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error
  };
}
