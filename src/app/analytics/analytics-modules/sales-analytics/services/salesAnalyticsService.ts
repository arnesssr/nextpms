import { SalesAnalyticsData } from '../types';
import { format, subDays } from 'date-fns';

// This is a mock service that would be replaced with actual API calls
export const getSalesAnalyticsData = async (timeRange: string): Promise<SalesAnalyticsData> => {
  // In a real implementation, this would make an API call
  // For now, we'll return mock data
  
  const days = timeRangeToDays(timeRange);
  
  return {
    overview: {
      totalRevenue: 156780.50,
      revenueGrowth: 12.5,
      totalOrders: 1234,
      ordersGrowth: 8.2,
      avgOrderValue: 127.12,
      avgOrderGrowth: 4.1,
      conversionRate: 3.2,
      conversionGrowth: -0.5,
    },
    revenueData: Array.from({ length: days }, (_, i) => ({
      date: format(subDays(new Date(), days - 1 - i), 'MMM dd'),
      revenue: Math.floor(Math.random() * 8000) + 2000,
      orders: Math.floor(Math.random() * 50) + 10,
      customers: Math.floor(Math.random() * 30) + 5,
    })),
    salesInsights: [
      { label: 'Peak Sales Day', value: 'Wednesday' },
      { label: 'Peak Sales Hour', value: '2-3 PM' },
      { label: 'Avg Items per Order', value: 2.3 },
      { label: 'Return Rate', value: '1.2%', isPositive: true },
    ]
  };
};

// Helper function to convert time range to number of days
const timeRangeToDays = (timeRange: string): number => {
  switch (timeRange) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '1y':
      return 365;
    default:
      return 30;
  }
};