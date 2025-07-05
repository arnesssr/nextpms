import { useState, useEffect } from 'react';
import { RevenueAnalyticsData } from '../types';
import { getRevenueAnalytics } from '../services/revenueAnalyticsService';

export const useRevenueAnalytics = (timeRange: string) => {
  const [revenueData, setRevenueData] = useState<RevenueAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getRevenueAnalytics(timeRange);
        setRevenueData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch revenue analytics data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return {
    revenueData: revenueData as RevenueAnalyticsData,
    isLoading,
    error
  };
};