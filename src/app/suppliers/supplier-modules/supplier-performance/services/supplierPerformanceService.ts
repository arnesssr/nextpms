import {
  PerformanceDashboardData,
  PerformanceFilters,
  PerformanceHistory,
  PerformanceMetric,
  SupplierPerformanceSummary
} from '../types';

// Mock data for supplier performance metrics
const performanceMetrics: PerformanceMetric[] = [
  {
    id: 'delivery_time',
    name: 'Delivery Time',
    description: 'Average time from order to delivery',
    weight: 25,
    target: 5,
    unit: 'days',
    higherIsBetter: false
  },
  {
    id: 'quality',
    name: 'Quality Rating',
    description: 'Average quality rating of delivered products',
    weight: 30,
    target: 95,
    unit: '%',
    higherIsBetter: true
  },
  {
    id: 'order_accuracy',
    name: 'Order Accuracy',
    description: 'Percentage of orders delivered without errors',
    weight: 20,
    target: 98,
    unit: '%',
    higherIsBetter: true
  },
  {
    id: 'response_time',
    name: 'Response Time',
    description: 'Average time to respond to inquiries',
    weight: 10,
    target: 1,
    unit: 'days',
    higherIsBetter: false
  },
  {
    id: 'price_competitiveness',
    name: 'Price Competitiveness',
    description: 'Price compared to market average',
    weight: 15,
    target: 90,
    unit: '%',
    higherIsBetter: false
  }
];

// Mock data for supplier performance summaries
const supplierPerformanceSummaries: SupplierPerformanceSummary[] = [
  {
    supplierId: 'sup_001',
    supplierName: 'Acme Supplies',
    overallScore: 92,
    rating: 'excellent',
    period: 'Q2 2025',
    date: new Date('2025-06-30'),
    metrics: [
      {
        supplierId: 'sup_001',
        supplierName: 'Acme Supplies',
        metricId: 'delivery_time',
        metricName: 'Delivery Time',
        score: 4.2,
        target: 5,
        variance: 0.8,
        normalizedScore: 92,
        weightedScore: 23,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_001',
        supplierName: 'Acme Supplies',
        metricId: 'quality',
        metricName: 'Quality Rating',
        score: 96,
        target: 95,
        variance: 1,
        normalizedScore: 96,
        weightedScore: 28.8,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_001',
        supplierName: 'Acme Supplies',
        metricId: 'order_accuracy',
        metricName: 'Order Accuracy',
        score: 99,
        target: 98,
        variance: 1,
        normalizedScore: 99,
        weightedScore: 19.8,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_001',
        supplierName: 'Acme Supplies',
        metricId: 'response_time',
        metricName: 'Response Time',
        score: 0.8,
        target: 1,
        variance: 0.2,
        normalizedScore: 95,
        weightedScore: 9.5,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_001',
        supplierName: 'Acme Supplies',
        metricId: 'price_competitiveness',
        metricName: 'Price Competitiveness',
        score: 88,
        target: 90,
        variance: -2,
        normalizedScore: 88,
        weightedScore: 13.2,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      }
    ],
    previousScore: 89,
    trend: 3
  },
  {
    supplierId: 'sup_002',
    supplierName: 'Global Manufacturing',
    overallScore: 85,
    rating: 'good',
    period: 'Q2 2025',
    date: new Date('2025-06-30'),
    metrics: [
      {
        supplierId: 'sup_002',
        supplierName: 'Global Manufacturing',
        metricId: 'delivery_time',
        metricName: 'Delivery Time',
        score: 5.5,
        target: 5,
        variance: -0.5,
        normalizedScore: 85,
        weightedScore: 21.25,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_002',
        supplierName: 'Global Manufacturing',
        metricId: 'quality',
        metricName: 'Quality Rating',
        score: 92,
        target: 95,
        variance: -3,
        normalizedScore: 92,
        weightedScore: 27.6,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_002',
        supplierName: 'Global Manufacturing',
        metricId: 'order_accuracy',
        metricName: 'Order Accuracy',
        score: 95,
        target: 98,
        variance: -3,
        normalizedScore: 95,
        weightedScore: 19,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_002',
        supplierName: 'Global Manufacturing',
        metricId: 'response_time',
        metricName: 'Response Time',
        score: 1.2,
        target: 1,
        variance: -0.2,
        normalizedScore: 80,
        weightedScore: 8,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_002',
        supplierName: 'Global Manufacturing',
        metricId: 'price_competitiveness',
        metricName: 'Price Competitiveness',
        score: 82,
        target: 90,
        variance: -8,
        normalizedScore: 82,
        weightedScore: 12.3,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      }
    ],
    previousScore: 83,
    trend: 2
  },
  {
    supplierId: 'sup_003',
    supplierName: 'Tech Components Inc',
    overallScore: 78,
    rating: 'average',
    period: 'Q2 2025',
    date: new Date('2025-06-30'),
    metrics: [
      {
        supplierId: 'sup_003',
        supplierName: 'Tech Components Inc',
        metricId: 'delivery_time',
        metricName: 'Delivery Time',
        score: 6.8,
        target: 5,
        variance: -1.8,
        normalizedScore: 72,
        weightedScore: 18,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_003',
        supplierName: 'Tech Components Inc',
        metricId: 'quality',
        metricName: 'Quality Rating',
        score: 88,
        target: 95,
        variance: -7,
        normalizedScore: 88,
        weightedScore: 26.4,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_003',
        supplierName: 'Tech Components Inc',
        metricId: 'order_accuracy',
        metricName: 'Order Accuracy',
        score: 90,
        target: 98,
        variance: -8,
        normalizedScore: 90,
        weightedScore: 18,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_003',
        supplierName: 'Tech Components Inc',
        metricId: 'response_time',
        metricName: 'Response Time',
        score: 1.5,
        target: 1,
        variance: -0.5,
        normalizedScore: 70,
        weightedScore: 7,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_003',
        supplierName: 'Tech Components Inc',
        metricId: 'price_competitiveness',
        metricName: 'Price Competitiveness',
        score: 75,
        target: 90,
        variance: -15,
        normalizedScore: 75,
        weightedScore: 11.25,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      }
    ],
    previousScore: 75,
    trend: 3
  },
  {
    supplierId: 'sup_004',
    supplierName: 'Quality Parts Ltd',
    overallScore: 65,
    rating: 'poor',
    period: 'Q2 2025',
    date: new Date('2025-06-30'),
    metrics: [
      {
        supplierId: 'sup_004',
        supplierName: 'Quality Parts Ltd',
        metricId: 'delivery_time',
        metricName: 'Delivery Time',
        score: 8.5,
        target: 5,
        variance: -3.5,
        normalizedScore: 60,
        weightedScore: 15,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_004',
        supplierName: 'Quality Parts Ltd',
        metricId: 'quality',
        metricName: 'Quality Rating',
        score: 78,
        target: 95,
        variance: -17,
        normalizedScore: 78,
        weightedScore: 23.4,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_004',
        supplierName: 'Quality Parts Ltd',
        metricId: 'order_accuracy',
        metricName: 'Order Accuracy',
        score: 82,
        target: 98,
        variance: -16,
        normalizedScore: 82,
        weightedScore: 16.4,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_004',
        supplierName: 'Quality Parts Ltd',
        metricId: 'response_time',
        metricName: 'Response Time',
        score: 2.2,
        target: 1,
        variance: -1.2,
        normalizedScore: 55,
        weightedScore: 5.5,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      },
      {
        supplierId: 'sup_004',
        supplierName: 'Quality Parts Ltd',
        metricId: 'price_competitiveness',
        metricName: 'Price Competitiveness',
        score: 68,
        target: 90,
        variance: -22,
        normalizedScore: 68,
        weightedScore: 10.2,
        period: 'Q2 2025',
        date: new Date('2025-06-30')
      }
    ],
    previousScore: 68,
    trend: -3
  }
];

// Mock performance history data
const performanceHistory: PerformanceHistory[] = [
  {
    supplierId: 'sup_001',
    supplierName: 'Acme Supplies',
    history: [
      { period: 'Q1 2024', score: 82, rating: 'good', date: new Date('2024-03-31') },
      { period: 'Q2 2024', score: 84, rating: 'good', date: new Date('2024-06-30') },
      { period: 'Q3 2024', score: 86, rating: 'good', date: new Date('2024-09-30') },
      { period: 'Q4 2024', score: 87, rating: 'good', date: new Date('2024-12-31') },
      { period: 'Q1 2025', score: 89, rating: 'good', date: new Date('2025-03-31') },
      { period: 'Q2 2025', score: 92, rating: 'excellent', date: new Date('2025-06-30') }
    ]
  },
  {
    supplierId: 'sup_002',
    supplierName: 'Global Manufacturing',
    history: [
      { period: 'Q1 2024', score: 78, rating: 'average', date: new Date('2024-03-31') },
      { period: 'Q2 2024', score: 80, rating: 'good', date: new Date('2024-06-30') },
      { period: 'Q3 2024', score: 81, rating: 'good', date: new Date('2024-09-30') },
      { period: 'Q4 2024', score: 82, rating: 'good', date: new Date('2024-12-31') },
      { period: 'Q1 2025', score: 83, rating: 'good', date: new Date('2025-03-31') },
      { period: 'Q2 2025', score: 85, rating: 'good', date: new Date('2025-06-30') }
    ]
  },
  {
    supplierId: 'sup_003',
    supplierName: 'Tech Components Inc',
    history: [
      { period: 'Q1 2024', score: 70, rating: 'average', date: new Date('2024-03-31') },
      { period: 'Q2 2024', score: 72, rating: 'average', date: new Date('2024-06-30') },
      { period: 'Q3 2024', score: 73, rating: 'average', date: new Date('2024-09-30') },
      { period: 'Q4 2024', score: 74, rating: 'average', date: new Date('2024-12-31') },
      { period: 'Q1 2025', score: 75, rating: 'average', date: new Date('2025-03-31') },
      { period: 'Q2 2025', score: 78, rating: 'average', date: new Date('2025-06-30') }
    ]
  },
  {
    supplierId: 'sup_004',
    supplierName: 'Quality Parts Ltd',
    history: [
      { period: 'Q1 2024', score: 72, rating: 'average', date: new Date('2024-03-31') },
      { period: 'Q2 2024', score: 71, rating: 'average', date: new Date('2024-06-30') },
      { period: 'Q3 2024', score: 70, rating: 'average', date: new Date('2024-09-30') },
      { period: 'Q4 2024', score: 69, rating: 'average', date: new Date('2024-12-31') },
      { period: 'Q1 2025', score: 68, rating: 'average', date: new Date('2025-03-31') },
      { period: 'Q2 2025', score: 65, rating: 'poor', date: new Date('2025-06-30') }
    ]
  }
];

// Mock dashboard data
const dashboardData: PerformanceDashboardData = {
  topPerformers: supplierPerformanceSummaries.filter(s => s.rating === 'excellent' || s.rating === 'good').sort((a, b) => b.overallScore - a.overallScore).slice(0, 3),
  underperformers: supplierPerformanceSummaries.filter(s => s.rating === 'average' || s.rating === 'poor').sort((a, b) => a.overallScore - b.overallScore).slice(0, 3),
  metrics: performanceMetrics,
  averageScores: [
    { metricId: 'delivery_time', metricName: 'Delivery Time', averageScore: 80 },
    { metricId: 'quality', metricName: 'Quality Rating', averageScore: 88 },
    { metricId: 'order_accuracy', metricName: 'Order Accuracy', averageScore: 92 },
    { metricId: 'response_time', metricName: 'Response Time', averageScore: 75 },
    { metricId: 'price_competitiveness', metricName: 'Price Competitiveness', averageScore: 78 }
  ],
  overallTrend: [
    { period: 'Q1 2024', averageScore: 75.5 },
    { period: 'Q2 2024', averageScore: 76.8 },
    { period: 'Q3 2024', averageScore: 77.5 },
    { period: 'Q4 2024', averageScore: 78.0 },
    { period: 'Q1 2025', averageScore: 78.8 },
    { period: 'Q2 2025', averageScore: 80.0 }
  ]
};

// Service functions
export const getPerformanceMetrics = async (): Promise<PerformanceMetric[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(performanceMetrics);
    }, 500);
  });
};

export const getSupplierPerformance = async (supplierId: string): Promise<SupplierPerformanceSummary | null> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const performance = supplierPerformanceSummaries.find(p => p.supplierId === supplierId);
      resolve(performance || null);
    }, 500);
  });
};

export const getSupplierPerformanceHistory = async (supplierId: string): Promise<PerformanceHistory | null> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const history = performanceHistory.find(h => h.supplierId === supplierId);
      resolve(history || null);
    }, 500);
  });
};

export const getAllSuppliersPerformance = async (filters?: PerformanceFilters): Promise<SupplierPerformanceSummary[]> => {
  // Simulate API call with filtering
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...supplierPerformanceSummaries];
      
      if (filters) {
        if (filters.supplierId) {
          filtered = filtered.filter(p => p.supplierId === filters.supplierId);
        }
        if (filters.rating) {
          filtered = filtered.filter(p => p.rating === filters.rating);
        }
        if (filters.minScore !== undefined) {
          filtered = filtered.filter(p => p.overallScore >= filters.minScore!);
        }
        if (filters.maxScore !== undefined) {
          filtered = filtered.filter(p => p.overallScore <= filters.maxScore!);
        }
        if (filters.period) {
          filtered = filtered.filter(p => p.period === filters.period);
        }
      }
      
      resolve(filtered);
    }, 500);
  });
};

export const getPerformanceDashboard = async (): Promise<PerformanceDashboardData> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dashboardData);
    }, 500);
  });
};