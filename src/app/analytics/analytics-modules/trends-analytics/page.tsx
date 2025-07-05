'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3
} from 'lucide-react';
import { useTrendsAnalytics } from './hooks/useTrendsAnalytics';
import { MarketTrendsChart } from './components/MarketTrendsChart';
import { SeasonalPatternsChart } from './components/SeasonalPatternsChart';
import { ForecastChart } from './components/ForecastChart';

export default function TrendsAnalyticsPage() {
  const { trendsData, isLoading, error } = useTrendsAnalytics();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading trends analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading trends analytics: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Market Trends & Forecasting</h3>
      </div>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Market Trends
              </CardTitle>
              <CardDescription>
                Key market indicators and trends
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {trendsData.marketTrends.map((trend) => (
                <Badge key={trend.name} variant="outline" className={trend.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {trend.name}: {trend.growth > 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MarketTrendsChart data={trendsData.marketTrends} />
        </CardContent>
      </Card>

      {/* Seasonal Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Seasonal Patterns
          </CardTitle>
          <CardDescription>
            Quarterly sales distribution and seasonal trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeasonalPatternsChart data={trendsData.seasonalPatterns} />
        </CardContent>
      </Card>

      {/* Forecasting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Sales Forecast
          </CardTitle>
          <CardDescription>
            6-month historical data and 6-month forecast with confidence intervals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForecastChart data={trendsData.forecasts} />
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>
            Actionable insights based on market trends and forecasts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Seasonal Preparation</h4>
            <p className="text-blue-700 text-sm">
              Q4 historically represents your highest sales period (32% of annual sales). 
              Begin inventory planning now to ensure adequate stock levels for the upcoming peak season.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-green-50 border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Growth Opportunity</h4>
            <p className="text-green-700 text-sm">
              Industry growth is trending upward at 8.2%, outpacing your current market share growth of 5.1%. 
              Consider increasing marketing efforts to capture more of the expanding market.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">Risk Mitigation</h4>
            <p className="text-amber-700 text-sm">
              Q2 sales have decreased by 8.3% compared to the previous year. 
              Analyze the factors contributing to this decline and develop strategies to improve performance during this period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}