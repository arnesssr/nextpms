import React, { useState, useEffect } from 'react';
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
  refreshAllData: () => Promise<void>;
}

export const usePriceHistory = (): UsePriceHistoryState & UsePriceHistoryActions => {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [recentChanges, setRecentChanges] = useState<PriceHistory[]>([]);
  
  // Debug: Track recentChanges state changes
  React.useEffect(() => {
    console.log('🔍 Hook recentChanges state changed:', recentChanges.length, recentChanges);
  }, [recentChanges]);
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
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  
  // Ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = React.useRef(true);
  
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
    console.log('📝 Starting fetchRecentChanges, isMountedRef.current:', isMountedRef.current);
    
    setLoading(true);
    setError(null);
    try {
      const changes = await priceHistoryService.getRecentPriceChanges(limit);
      console.log('📊 Hook received changes:', changes.length, changes);
      console.log('🔄 Setting recentChanges state with', changes.length, 'items');
      setRecentChanges(changes);
      console.log('✅ RecentChanges state updated');
      console.log('🔍 isMountedRef.current:', isMountedRef.current);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent price changes';
      if (isMountedRef.current) {
        setError(errorMessage);
      }
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
      if (isMountedRef.current) {
        setStats(statistics);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch price change statistics';
      if (isMountedRef.current) {
        setError(errorMessage);
      }
      console.error('Error fetching price change stats:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
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
  
  // Refresh all data (useful after bulk updates)
  const refreshAllData = async () => {
    if (!isMountedRef.current) return;
    
    try {
      await Promise.all([
        fetchRecentChanges(),
        fetchPriceChangeStats()
      ]);
    } catch (err) {
      console.error('❌ Error refreshing price history data:', err);
    }
  };

  // Load initial data on mount (only once)
  useEffect(() => {
    if (!hasInitiallyLoaded && isMountedRef.current) {
      const loadInitialData = async () => {
        try {
          await Promise.all([
            fetchRecentChanges(),
            fetchPriceChangeStats()
          ]);
          if (isMountedRef.current) {
            setHasInitiallyLoaded(true);
          }
        } catch (error) {
          console.error('Error loading initial price history data:', error);
        }
      };
      loadInitialData();
    }
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
    refreshAllData
  };
};
