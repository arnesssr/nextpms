import { useState, useEffect } from 'react';
import { SalesAnalyticsData } from '../types';
import { getSalesAnalyticsData } from '../services/salesAnalyticsService';

export const useSalesAnalytics = (timeRange: string) => {
  const [data, setData] = useState<SalesAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getSalesAnalyticsData(timeRange);
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