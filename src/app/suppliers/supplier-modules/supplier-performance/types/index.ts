export interface PerformanceMetric {
  id: string;
  name: string;
  description: string;
  weight: number; // Weight in the overall performance calculation (0-100)
  target: number; // Target value for this metric
  unit: string; // e.g., '%', 'days', 'count'
  higherIsBetter: boolean; // Whether higher values are better
}

export interface SupplierPerformanceScore {
  supplierId: string;
  supplierName: string;
  metricId: string;
  metricName: string;
  score: number; // Actual score for this metric
  target: number; // Target value
  variance: number; // Difference between score and target
  normalizedScore: number; // Score normalized to a 0-100 scale
  weightedScore: number; // Score after applying the weight
  period: string; // Time period this score applies to (e.g., 'Q1 2025')
  date: Date; // Date of evaluation
}

export interface SupplierPerformanceSummary {
  supplierId: string;
  supplierName: string;
  overallScore: number; // Overall weighted score (0-100)
  rating: 'excellent' | 'good' | 'average' | 'poor'; // Rating based on overall score
  period: string; // Time period this summary applies to
  date: Date; // Date of evaluation
  metrics: SupplierPerformanceScore[]; // Individual metric scores
  previousScore?: number; // Previous period's overall score
  trend: number; // Change from previous period
}

export interface PerformanceHistory {
  supplierId: string;
  supplierName: string;
  history: {
    period: string;
    score: number;
    rating: 'excellent' | 'good' | 'average' | 'poor';
    date: Date;
  }[];
}

export interface PerformanceComparison {
  metricId: string;
  metricName: string;
  suppliers: {
    supplierId: string;
    supplierName: string;
    score: number;
    ranking: number;
  }[];
}

export interface PerformanceDashboardData {
  topPerformers: SupplierPerformanceSummary[];
  underperformers: SupplierPerformanceSummary[];
  metrics: PerformanceMetric[];
  averageScores: {
    metricId: string;
    metricName: string;
    averageScore: number;
  }[];
  overallTrend: {
    period: string;
    averageScore: number;
  }[];
}

export interface PerformanceFilters {
  supplierId?: string;
  metricId?: string;
  period?: string;
  rating?: 'excellent' | 'good' | 'average' | 'poor';
  minScore?: number;
  maxScore?: number;
  startDate?: Date;
  endDate?: Date;
}