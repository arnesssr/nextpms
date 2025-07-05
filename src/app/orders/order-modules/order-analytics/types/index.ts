export interface OrderAnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  previousPeriodRevenue: number;
  previousPeriodOrders: number;
  dailySales: {
    date: string;
    total: number;
  }[];
  dailyOrders: {
    date: string;
    count: number;
  }[];
  ordersByStatus: {
    [status: string]: number;
  };
  topProducts: {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  customerSegments: {
    newCustomers: number;
    returningCustomers: number;
  };
}

export interface AnalyticsFilters {
  status?: string;
  customerId?: string;
  productId?: string;
  category?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface OrderAnalyticsProps {
  className?: string;
  showExportButton?: boolean;
  onDateRangeChange?: (range: DateRange) => void;
}

export interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: {
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  loading?: boolean;
}

export interface ChartProps {
  data: any;
  loading?: boolean;
  height?: number;
  type?: 'line' | 'bar' | 'pie' | 'doughnut';
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: { label: string; value: DateRange }[];
}

export interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onReset: () => void;
}
