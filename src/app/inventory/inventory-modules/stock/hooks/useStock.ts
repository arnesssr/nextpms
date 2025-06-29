'use client';

import { useState, useEffect } from 'react';
import { 
  Stock, 
  StockFilter, 
  CreateStockRequest, 
  UpdateStockRequest, 
  StockSummary 
} from '../types/stock.types';
import { StockService } from '../services/stockService';

export const useStock = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all stocks with optional filters
  const fetchStocks = async (filters?: StockFilter) => {
    setLoading(true);
    setError(null);
    
    try {
      const stockData = await StockService.getStocks(filters);
      setStocks(stockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stocks');
    } finally {
      setLoading(false);
    }
  };

  // Create new stock
  const createStock = async (stockData: CreateStockRequest): Promise<Stock | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newStock = await StockService.createStock(stockData);
      setStocks(prev => [...prev, newStock]);
      return newStock;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stock');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update existing stock
  const updateStock = async (stockData: UpdateStockRequest): Promise<Stock | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedStock = await StockService.updateStock(stockData);
      setStocks(prev => 
        prev.map(stock => 
          stock.id === stockData.id ? updatedStock : stock
        )
      );
      return updatedStock;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete stock
  const deleteStock = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await StockService.deleteStock(id);
      setStocks(prev => prev.filter(stock => stock.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete stock');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get single stock by ID
  const getStockById = async (id: string): Promise<Stock | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const stock = await StockService.getStockById(id);
      return stock;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Bulk update stock quantities
  const bulkUpdateQuantities = async (updates: { id: string; quantity: number }[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedStocks = await StockService.bulkUpdateQuantities(updates);
      setStocks(prev => 
        prev.map(stock => {
          const update = updatedStocks.find(updated => updated.id === stock.id);
          return update || stock;
        })
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update stocks');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    stocks,
    loading,
    error,
    fetchStocks,
    createStock,
    updateStock,
    deleteStock,
    getStockById,
    bulkUpdateQuantities,
    clearError: () => setError(null)
  };
};

export const useStockSummary = () => {
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const summaryData = await StockService.getStockSummary();
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
    clearError: () => setError(null)
  };
};

export const useLowStock = () => {
  const [lowStockItems, setLowStockItems] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLowStockItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const items = await StockService.getLowStockItems();
      setLowStockItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch low stock items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  return {
    lowStockItems,
    loading,
    error,
    refetch: fetchLowStockItems,
    clearError: () => setError(null)
  };
};
