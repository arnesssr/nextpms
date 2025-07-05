'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  CalendarDays,
  PieChart,
  BarChart3
} from 'lucide-react';
import { useRevenueAnalytics } from './hooks/useRevenueAnalytics';
import { RevenueChart } from './components/RevenueChart';
import { RevenueSourcesChart } from './components/RevenueSourcesChart';

export default function RevenueAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  
  const { revenueData, isLoading, error } = useRevenueAnalytics(timeRange);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading revenue analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading revenue analytics: {error}</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Revenue Analytics</h3>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <CalendarDays className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.overview.totalRevenue)}
            </div>
            <div className={`flex items-center text-xs ${getGrowthColor(revenueData.overview.revenueGrowth)}`}>
              <span className="ml-1">
                {formatPercent(revenueData.overview.revenueGrowth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.overview.averageOrderValue)}
            </div>
            <div className={`flex items-center text-xs ${getGrowthColor(revenueData.overview.aovGrowth)}`}>
              <span className="ml-1">
                {formatPercent(revenueData.overview.aovGrowth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueData.overview.profitMargin.toFixed(1)}%
            </div>
            <div className={`flex items-center text-xs ${getGrowthColor(revenueData.overview.profitMarginGrowth)}`}>
              <span className="ml-1">
                {formatPercent(revenueData.overview.profitMarginGrowth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Per Customer</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenueData.overview.revenuePerCustomer)}
            </div>
            <div className={`flex items-center text-xs ${getGrowthColor(revenueData.overview.revenuePerCustomerGrowth)}`}>
              <span className="ml-1">
                {formatPercent(revenueData.overview.revenuePerCustomerGrowth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>
            Daily revenue compared to targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueData.revenueByPeriod} />
        </CardContent>
      </Card>

      {/* Revenue Sources and Channels */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
            <CardDescription>
              Breakdown of revenue by source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueSourcesChart data={revenueData.revenueSources} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Channel</CardTitle>
            <CardDescription>
              Breakdown of revenue by sales channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueSourcesChart data={revenueData.revenueByChannel} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}