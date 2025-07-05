export interface SalesMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  avgOrderValue: number;
  avgOrderGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface SalesInsight {
  label: string;
  value: string | number;
  isPositive?: boolean;
}

export interface SalesAnalyticsData {
  overview: SalesMetrics;
  revenueData: RevenueDataPoint[];
  salesInsights: SalesInsight[];
}