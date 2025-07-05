import { ProductAnalyticsData } from '../types';

// This is a mock service that would be replaced with actual API calls
export const getProductAnalyticsData = async (timeRange: string): Promise<ProductAnalyticsData> => {
  // In a real implementation, this would make an API call
  // For now, we'll return mock data
  
  return {
    topProducts: [
      { id: '1', name: 'Wireless Headphones', revenue: 45680, orders: 152, growth: 15.2, profitMargin: 32 },
      { id: '2', name: 'Smart Watch Pro', revenue: 38920, orders: 97, growth: 8.7, profitMargin: 28 },
      { id: '3', name: 'Gaming Mouse', revenue: 22450, orders: 281, growth: -2.1, profitMargin: 25 },
      { id: '4', name: 'Bluetooth Speaker', revenue: 18760, orders: 125, growth: 22.5, profitMargin: 30 },
      { id: '5', name: 'USB-C Hub', revenue: 12340, orders: 206, growth: 5.8, profitMargin: 35 },
    ],
    categoryData: [
      { name: 'Electronics', value: 45, revenue: 67890 },
      { name: 'Wearables', value: 25, revenue: 38920 },
      { name: 'Accessories', value: 20, revenue: 31450 },
      { name: 'Gaming', value: 10, revenue: 18520 },
    ]
  };
};