import { useState, useEffect } from 'react';
import { PriceHistory } from '../types';
import { priceHistoryService } from '../services/priceHistoryService';

interface UsePriceHistoryState {
  history: PriceHistory[];
  recentChanges: PriceHistory[];
  trends: Array<{date: string, price: number}>;
  stats: {
    total_changes: number;
    avg_price_increase: number;
    avg_price_decrease: number;
    most_common_reason: string;
    products_with_changes: number;
  } | null;
  loading: boolean;
  error: string | null;
}

interface UsePriceHistoryActions {
  fetchProductHistory: (productId: string) => Promise<void>;
  fetchRecentChanges: (limit?: number) => Promise<void>;
  fetchPriceTrends: (productId: string, days?: number) => Promise<void>;
  fetchPriceChangeStats: (days?: number) => Promise<void>;
  createHistoryEntry: (entry: Omit<PriceHistory, 'id' | 'changed_at'>) => Promise<void>;
  clearHistory: () => void;
}

export const usePriceHistory = (): UsePriceHistoryState & UsePriceHistoryActions => {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [recentChanges, setRecentChanges] = useState<PriceHistory[]>([]);
  const [trends, setTrends] = useState<Array<{date: string, price: number}>>([]);
  const [stats, setStats] = useState<{
    total_changes: number;
    avg_price_increase: number;
    avg_price_decrease: number;
    most_common_reason: string;
    products_with_changes: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductHistory = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const productHistory = await priceHistoryService.getProductPriceHistory(productId);
      setHistory(productHistory);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch price history';
      setError(errorMessage);
      console.error('Error fetching price history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentChanges = async (limit: number = 20) => {
    setLoading(true);
    setError(null);
    try {
      const changes = await priceHistoryService.getRecentPriceChanges(limit);
      setRecentChanges(changes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent price changes';
      setError(errorMessage);
      console.error('Error fetching recent price changes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceTrends = async (productId: string, days: number = 30) => {
    setLoading(true);
    setError(null);
    try {
      const trendData = await priceHistoryService.getPriceTrends(productId, days);
      setTrends(trendData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch price trends';
      setError(errorMessage);
      console.error('Error fetching price trends:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceChangeStats = async (days: number = 30) => {
    setLoading(true);
    setError(null);
    try {
      const statistics = await priceHistoryService.getPriceChangeStats(days);
      setStats(statistics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch price change statistics';
      setError(errorMessage);
      console.error('Error fetching price change stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const createHistoryEntry = async (entry: Omit<PriceHistory, 'id' | 'changed_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newEntry = await priceHistoryService.createPriceHistoryEntry(entry);
      
      // Add the new entry to the history if it's for the same product
      setHistory(prevHistory => {
        const firstEntry = prevHistory[0];
        if (firstEntry && firstEntry.product_id === newEntry.product_id) {
          return [newEntry, ...prevHistory];
        }
        return prevHistory;
      });

      // Add to recent changes
      setRecentChanges(prevChanges => [newEntry, ...prevChanges.slice(0, 19)]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create price history entry';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setRecentChanges([]);
    setTrends([]);
    setStats(null);
    setError(null);
  };

  // Load initial data on mount
  useEffect(() => {
    fetchRecentChanges();
    fetchPriceChangeStats();
  }, []);

  return {
    history,
    recentChanges,
    trends,
    stats,
    loading,
    error,
    fetchProductHistory,
    fetchRecentChanges,
    fetchPriceTrends,
    fetchPriceChangeStats,
    createHistoryEntry,
    clearHistory,
  };
};
