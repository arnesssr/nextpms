export interface RevenueDataPoint {
  date: string;
  revenue: number;
  target: number;
}

export interface RevenueSource {
  name: string;
  value: number;
  growth: number;
}

export interface RevenueOverview {
  totalRevenue: number;
  revenueGrowth: number;
  averageOrderValue: number;
  aovGrowth: number;
  profitMargin: number;
  profitMarginGrowth: number;
  revenuePerCustomer: number;
  revenuePerCustomerGrowth: number;
}

export interface RevenueAnalyticsData {
  overview: RevenueOverview;
  revenueByPeriod: RevenueDataPoint[];
  revenueSources: RevenueSource[];
  revenueByChannel: RevenueSource[];
}