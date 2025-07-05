export interface CustomerSegment {
  name: string;
  value: number;
  count: number;
}

export interface CustomerRetentionData {
  month: string;
  rate: number;
  newCustomers: number;
  churnedCustomers: number;
}

export interface CustomerOverview {
  totalCustomers: number;
  customerGrowth: number;
  newCustomers: number;
  newCustomerGrowth: number;
  retentionRate: number;
  retentionGrowth: number;
  avgLifetimeValue: number;
  lifetimeValueGrowth: number;
}

export interface CustomerAnalyticsData {
  overview: CustomerOverview;
  segmentation: {
    demographics: CustomerSegment[];
    spending: CustomerSegment[];
    frequency: CustomerSegment[];
    location: CustomerSegment[];
  };
  retention: CustomerRetentionData[];
}