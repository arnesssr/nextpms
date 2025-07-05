export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface MarketTrend {
  name: string;
  data: TrendDataPoint[];
  growth: number;
}

export interface SeasonalPattern {
  name: string;
  value: number;
  previousValue: number;
  change: number;
}

export interface TrendForecast {
  date: string;
  actual?: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
}

export interface TrendsAnalyticsData {
  marketTrends: MarketTrend[];
  seasonalPatterns: SeasonalPattern[];
  forecasts: TrendForecast[];
}