import { useState, useEffect, useCallback } from 'react';
import { OrderAnalyticsData, AnalyticsFilters, DateRange } from '../types';

export const useOrderAnalytics = () => {
  const [analytics, setAnalytics] = useState<OrderAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const fetchAnalytics = useCallback(async (
    currentFilters: AnalyticsFilters = filters,
    currentDateRange: DateRange = dateRange
  ) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        from: currentDateRange.from.toISOString(),
        to: currentDateRange.to.toISOString(),
        ...Object.entries(currentFilters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`/api/orders/analytics?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [filters, dateRange]);

  const updateDateRange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
    fetchAnalytics(filters, newDateRange);
  }, [fetchAnalytics, filters]);

  const applyFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
    fetchAnalytics(newFilters, dateRange);
  }, [fetchAnalytics, dateRange]);

  const refreshAnalytics = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Initial load
  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    dateRange,
    filters,
    fetchAnalytics,
    updateDateRange,
    applyFilters,
    refreshAnalytics
  };
};
