import { RevenueAnalyticsData } from '../types';
import { format, subDays } from 'date-fns';

// Mock data for revenue analytics
const generateRevenueData = (): RevenueAnalyticsData => {
  const revenueByPeriod = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM dd'),
    revenue: Math.floor(Math.random() * 8000) + 2000,
    target: Math.floor(Math.random() * 2000) + 8000,
  }));

  return {
    overview: {
      totalRevenue: 245680.50,
      revenueGrowth: 12.5,
      averageOrderValue: 127.12,
      aovGrowth: 4.1,
      profitMargin: 28.5,
      profitMarginGrowth: 1.2,
      revenuePerCustomer: 185.30,
      revenuePerCustomerGrowth: 5.8
    },
    revenueByPeriod,
    revenueSources: [
      { name: 'Product Sales', value: 68, growth: 8.2 },
      { name: 'Subscriptions', value: 22, growth: 15.4 },
      { name: 'Services', value: 8, growth: 3.1 },
      { name: 'Other', value: 2, growth: -1.5 }
    ],
    revenueByChannel: [
      { name: 'Online Store', value: 55, growth: 12.8 },
      { name: 'Marketplace', value: 25, growth: 8.5 },
      { name: 'Retail', value: 15, growth: -2.3 },
      { name: 'Wholesale', value: 5, growth: 4.1 }
    ]
  };
};

export const getRevenueAnalytics = async (timeRange: string): Promise<RevenueAnalyticsData> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateRevenueData());
    }, 500);
  });
};