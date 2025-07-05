export interface ProductPerformance {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  growth: number;
  profitMargin?: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  revenue: number;
}

export interface ProductAnalyticsData {
  topProducts: ProductPerformance[];
  categoryData: CategoryDistribution[];
}