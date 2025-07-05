import { TrendsAnalyticsData } from '../types';
import { format, addMonths } from 'date-fns';

// Mock data for trends analytics
const generateTrendsData = (): TrendsAnalyticsData => {
  const currentDate = new Date();
  
  // Generate market trends data
  const marketTrends = [
    {
      name: 'Industry Growth',
      data: Array.from({ length: 12 }, (_, i) => ({
        date: format(addMonths(currentDate, i - 11), 'MMM yyyy'),
        value: Math.floor(Math.random() * 10) + 95 + i
      })),
      growth: 8.2
    },
    {
      name: 'Consumer Confidence',
      data: Array.from({ length: 12 }, (_, i) => ({
        date: format(addMonths(currentDate, i - 11), 'MMM yyyy'),
        value: Math.floor(Math.random() * 8) + 70 + (i * 0.5)
      })),
      growth: 3.5
    },
    {
      name: 'Market Share',
      data: Array.from({ length: 12 }, (_, i) => ({
        date: format(addMonths(currentDate, i - 11), 'MMM yyyy'),
        value: Math.floor(Math.random() * 5) + 15 + (i * 0.2)
      })),
      growth: 5.1
    }
  ];

  // Generate seasonal patterns data
  const seasonalPatterns = [
    {
      name: 'Q1 Sales',
      value: 28,
      previousValue: 25,
      change: 12.0
    },
    {
      name: 'Q2 Sales',
      value: 22,
      previousValue: 24,
      change: -8.3
    },
    {
      name: 'Q3 Sales',
      value: 18,
      previousValue: 16,
      change: 12.5
    },
    {
      name: 'Q4 Sales',
      value: 32,
      previousValue: 35,
      change: -8.6
    }
  ];

  // Generate forecast data
  const forecasts = [
    ...Array.from({ length: 6 }, (_, i) => ({
      date: format(addMonths(currentDate, i - 5), 'MMM yyyy'),
      actual: Math.floor(Math.random() * 5000) + 20000,
      forecast: Math.floor(Math.random() * 5000) + 20000,
      lowerBound: Math.floor(Math.random() * 3000) + 18000,
      upperBound: Math.floor(Math.random() * 3000) + 25000
    })),
    ...Array.from({ length: 6 }, (_, i) => ({
      date: format(addMonths(currentDate, i + 1), 'MMM yyyy'),
      forecast: Math.floor(Math.random() * 5000) + 22000,
      lowerBound: Math.floor(Math.random() * 3000) + 19000,
      upperBound: Math.floor(Math.random() * 3000) + 27000
    }))
  ];

  return {
    marketTrends,
    seasonalPatterns,
    forecasts
  };
};

export const getTrendsAnalytics = async (): Promise<TrendsAnalyticsData> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateTrendsData());
    }, 500);
  });
};