import { CustomerAnalyticsData } from '../types';

// Mock data for customer analytics
const mockCustomerAnalytics: CustomerAnalyticsData = {
  overview: {
    totalCustomers: 5842,
    customerGrowth: 8.3,
    newCustomers: 342,
    newCustomerGrowth: 12.5,
    retentionRate: 78.4,
    retentionGrowth: 2.1,
    avgLifetimeValue: 487.50,
    lifetimeValueGrowth: 5.2
  },
  segmentation: {
    demographics: [
      { name: '18-24', value: 15, count: 876 },
      { name: '25-34', value: 32, count: 1869 },
      { name: '35-44', value: 28, count: 1636 },
      { name: '45-54', value: 18, count: 1052 },
      { name: '55+', value: 7, count: 409 }
    ],
    spending: [
      { name: 'Low Spenders', value: 25, count: 1460 },
      { name: 'Medium Spenders', value: 45, count: 2629 },
      { name: 'High Spenders', value: 20, count: 1168 },
      { name: 'VIP', value: 10, count: 584 }
    ],
    frequency: [
      { name: 'One-time', value: 30, count: 1753 },
      { name: 'Occasional', value: 40, count: 2337 },
      { name: 'Regular', value: 20, count: 1168 },
      { name: 'Frequent', value: 10, count: 584 }
    ],
    location: [
      { name: 'North America', value: 45, count: 2629 },
      { name: 'Europe', value: 30, count: 1753 },
      { name: 'Asia', value: 15, count: 876 },
      { name: 'Other', value: 10, count: 584 }
    ]
  },
  retention: [
    { month: 'Jan', rate: 76.2, newCustomers: 120, churnedCustomers: 85 },
    { month: 'Feb', rate: 75.8, newCustomers: 105, churnedCustomers: 92 },
    { month: 'Mar', rate: 77.1, newCustomers: 118, churnedCustomers: 78 },
    { month: 'Apr', rate: 76.5, newCustomers: 132, churnedCustomers: 90 },
    { month: 'May', rate: 77.8, newCustomers: 145, churnedCustomers: 82 },
    { month: 'Jun', rate: 78.4, newCustomers: 152, churnedCustomers: 75 }
  ]
};

export const getCustomerAnalytics = async (timeRange: string): Promise<CustomerAnalyticsData> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCustomerAnalytics);
    }, 500);
  });
};