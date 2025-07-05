'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { format, subDays } from 'date-fns';

export default function SalesAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data - will be replaced with real API calls
  const mockAnalytics = {
    overview: {
      totalRevenue: 156780.50,
      revenueGrowth: 12.5,
      totalOrders: 1234,
      ordersGrowth: 8.2,
      avgOrderValue: 127.12,
      avgOrderGrowth: 4.1,
      conversionRate: 3.2,
      conversionGrowth: -0.5,
    },
    revenueData: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'MMM dd'),
      revenue: Math.floor(Math.random() * 8000) + 2000,
      orders: Math.floor(Math.random() * 50) + 10,
      customers: Math.floor(Math.random() * 30) + 5,
    })),
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-3 w-3" />;
    if (growth < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Analytics</h2>
          <p className="text-muted-foreground">
            Detailed sales performance metrics and trends
          </p>
        </div>
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
              {formatCurrency(mockAnalytics.overview.totalRevenue)}
            </div>
            <div className={`flex items-center text-xs ${getGrowthColor(mockAnalytics.overview.revenueGrowth)}`}>
              {getGrowthIcon(mockAnalytics.overview.revenueGrowth)}
              <span className="ml-1">
                {formatPercent(mockAnalytics.overview.revenueGrowth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalytics.overview.totalOrders.toLocaleString()}
            </div>
            <div className={`flex items-center text-xs ${getGrowthColor(mockAnalytics.overview.ordersGrowth)}`}>
              {getGrowthIcon(mockAnalytics.overview.ordersGrowth)}
              <span className="ml-1">
                {formatPercent(mockAnalytics.overview.ordersGrowth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockAnalytics.overview.avgOrderValue)}
            </div>
            <div className={`flex items-center text-xs ${getGrowthColor(mockAnalytics.overview.avgOrderGrowth)}`}>
              {getGrowthIcon(mockAnalytics.overview.avgOrderGrowth)}
              <span className="ml-1">
                {formatPercent(mockAnalytics.overview.avgOrderGrowth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalytics.overview.conversionRate}%
            </div>
            <div className={`flex items-center text-xs ${getGrowthColor(mockAnalytics.overview.conversionGrowth)}`}>
              {getGrowthIcon(mockAnalytics.overview.conversionGrowth)}
              <span className="ml-1">
                {formatPercent(mockAnalytics.overview.conversionGrowth)} from last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Revenue Trend
          </CardTitle>
          <CardDescription>
            Daily revenue and order volume over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={mockAnalytics.revenueData} />
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Peak Sales Day</span>
            <Badge variant="outline">Wednesday</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Peak Sales Hour</span>
            <Badge variant="outline">2-3 PM</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Items per Order</span>
            <Badge variant="outline">2.3</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Return Rate</span>
            <Badge variant="outline" className="text-green-600">1.2%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}