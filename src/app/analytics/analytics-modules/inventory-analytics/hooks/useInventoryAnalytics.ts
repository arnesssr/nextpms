import { useState, useEffect } from 'react';
import { InventoryAnalyticsData } from '../types';
import { getInventoryAnalyticsData } from '../services/inventoryAnalyticsService';

export const useInventoryAnalytics = (timeRange: string) => {
  const [data, setData] = useState<InventoryAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getInventoryAnalyticsData(timeRange);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return { data, isLoading, error };
};