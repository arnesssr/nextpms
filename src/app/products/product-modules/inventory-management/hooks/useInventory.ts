import { useState, useEffect } from 'react';
import { InventoryItem, StockAdjustmentRequest, LowStockReport } from '../types';
import { inventoryService } from '../services/inventoryService';

interface UseInventoryState {
  inventory: InventoryItem[];
  productInventory: InventoryItem | null;
  lowStockReport: LowStockReport | null;
  stats: {
    total_products: number;
    total_quantity: number;
    low_stock_items: number;
    out_of_stock_items: number;
    reserved_quantity: number;
    available_quantity: number;
  } | null;
  loading: boolean;
  error: string | null;
}

interface UseInventoryActions {
  fetchAllInventory: () => Promise<void>;
  fetchProductInventory: (productId: string) => Promise<void>;
  adjustStock: (request: StockAdjustmentRequest) => Promise<void>;
  reserveStock: (productId: string, quantity: number) => Promise<void>;
  releaseStock: (productId: string, quantity: number) => Promise<void>;
  updateLowStockThreshold: (productId: string, threshold: number) => Promise<void>;
  refreshLowStockReport: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearInventory: () => void;
}

export const useInventory = (): UseInventoryState & UseInventoryActions => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [productInventory, setProductInventory] = useState<InventoryItem | null>(null);
  const [lowStockReport, setLowStockReport] = useState<LowStockReport | null>(null);
  const [stats, setStats] = useState<{
    total_products: number;
    total_quantity: number;
    low_stock_items: number;
    out_of_stock_items: number;
    reserved_quantity: number;
    available_quantity: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const allInventory = await inventoryService.getAllInventory();
      setInventory(allInventory);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory';
      setError(errorMessage);
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductInventory = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const item = await inventoryService.getProductInventory(productId);
      setProductInventory(item);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product inventory';
      setError(errorMessage);
      console.error('Error fetching product inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (request: StockAdjustmentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedInventory = await inventoryService.adjustStock(request);

      // Update local state
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.product_id === request.product_id ? updatedInventory : item
        )
      );

      // Update product inventory if it's the same product
      if (productInventory && productInventory.product_id === request.product_id) {
        setProductInventory(updatedInventory);
      }

      // Refresh related data
      await Promise.all([
        refreshLowStockReport(),
        refreshStats()
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to adjust stock';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reserveStock = async (productId: string, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      const updatedInventory = await inventoryService.reserveStock(productId, quantity);

      // Update local state
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.product_id === productId ? updatedInventory : item
        )
      );

      // Update product inventory if it's the same product
      if (productInventory && productInventory.product_id === productId) {
        setProductInventory(updatedInventory);
      }

      await refreshStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reserve stock';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const releaseStock = async (productId: string, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      const updatedInventory = await inventoryService.releaseStock(productId, quantity);

      // Update local state
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.product_id === productId ? updatedInventory : item
        )
      );

      // Update product inventory if it's the same product
      if (productInventory && productInventory.product_id === productId) {
        setProductInventory(updatedInventory);
      }

      await refreshStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to release stock';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLowStockThreshold = async (productId: string, threshold: number) => {
    setLoading(true);
    setError(null);
    try {
      const updatedInventory = await inventoryService.updateLowStockThreshold(productId, threshold);

      // Update local state
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.product_id === productId ? updatedInventory : item
        )
      );

      // Update product inventory if it's the same product
      if (productInventory && productInventory.product_id === productId) {
        setProductInventory(updatedInventory);
      }

      await refreshLowStockReport();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update low stock threshold';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshLowStockReport = async () => {
    try {
      const report = await inventoryService.getLowStockAlerts();
      setLowStockReport(report);
    } catch (err) {
      console.error('Error refreshing low stock report:', err);
    }
  };

  const refreshStats = async () => {
    try {
      const inventoryStats = await inventoryService.getInventoryStats();
      setStats(inventoryStats);
    } catch (err) {
      console.error('Error refreshing inventory stats:', err);
    }
  };

  const clearInventory = () => {
    setInventory([]);
    setProductInventory(null);
    setLowStockReport(null);
    setStats(null);
    setError(null);
  };

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchAllInventory(),
        refreshLowStockReport(),
        refreshStats()
      ]);
    };

    loadInitialData();
  }, []);

  return {
    inventory,
    productInventory,
    lowStockReport,
    stats,
    loading,
    error,
    fetchAllInventory,
    fetchProductInventory,
    adjustStock,
    reserveStock,
    releaseStock,
    updateLowStockThreshold,
    refreshLowStockReport,
    refreshStats,
    clearInventory,
  };
};
