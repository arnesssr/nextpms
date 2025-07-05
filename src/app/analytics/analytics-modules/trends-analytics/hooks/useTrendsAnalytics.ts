import { useState, useEffect } from 'react';
import { TrendsAnalyticsData } from '../types';
import { getTrendsAnalytics } from '../services/trendsAnalyticsService';

export const useTrendsAnalytics = () => {
  const [trendsData, setTrendsData] = useState<TrendsAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getTrendsAnalytics();
        setTrendsData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch trends analytics data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    trendsData: trendsData as TrendsAnalyticsData,
    isLoading,
    error
  };
};