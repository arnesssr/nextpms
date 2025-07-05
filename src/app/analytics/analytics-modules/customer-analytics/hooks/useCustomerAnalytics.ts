import { useState, useEffect } from 'react';
import { CustomerAnalyticsData } from '../types';
import { getCustomerAnalytics } from '../services/customerAnalyticsService';

export const useCustomerAnalytics = (timeRange: string) => {
  const [customerData, setCustomerData] = useState<CustomerAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getCustomerAnalytics(timeRange);
        setCustomerData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch customer analytics data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return {
    customerData: customerData as CustomerAnalyticsData,
    isLoading,
    error
  };
};