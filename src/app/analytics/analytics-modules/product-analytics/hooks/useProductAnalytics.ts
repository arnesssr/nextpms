import { useState, useEffect } from 'react';
import { ProductAnalyticsData } from '../types';
import { getProductAnalyticsData } from '../services/productAnalyticsService';

export const useProductAnalytics = (timeRange: string) => {
  const [data, setData] = useState<ProductAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getProductAnalyticsData(timeRange);
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