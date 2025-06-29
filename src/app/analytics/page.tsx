'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { ProductPerformanceChart } from '@/components/charts/ProductPerformanceChart';
import { InventoryTurnoverChart } from '@/components/charts/InventoryTurnoverChart';
import { CategoryDistributionChart } from '@/components/charts/CategoryDistributionChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

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
    topProducts: [
      { id: '1', name: 'Wireless Headphones', revenue: 45680, orders: 152, growth: 15.2 },
      { id: '2', name: 'Smart Watch Pro', revenue: 38920, orders: 97, growth: 8.7 },
      { id: '3', name: 'Gaming Mouse', revenue: 22450, orders: 281, growth: -2.1 },
      { id: '4', name: 'Bluetooth Speaker', revenue: 18760, orders: 125, growth: 22.5 },
      { id: '5', name: 'USB-C Hub', revenue: 12340, orders: 206, growth: 5.8 },
    ],
    categoryData: [
      { name: 'Electronics', value: 45, revenue: 67890 },
      { name: 'Wearables', value: 25, revenue: 38920 },
      { name: 'Accessories', value: 20, revenue: 31450 },
      { name: 'Gaming', value: 10, revenue: 18520 },
    ],
    inventoryMetrics: {
      turnoverRate: 4.2,
      averageAge: 28,
      deadStock: 12,
      stockValue: 234560,
    }
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
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">
              Insights and performance metrics for your business
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
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
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

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Revenue Chart */}
          <Card className="col-span-2">
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

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="mr-2 h-5 w-5" />
                Category Distribution
              </CardTitle>
              <CardDescription>
                Revenue by product category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryDistributionChart data={mockAnalytics.categoryData} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>
                Products ranked by revenue generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductPerformanceChart data={mockAnalytics.topProducts} />
            </CardContent>
          </Card>

          {/* Inventory Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Analytics</CardTitle>
              <CardDescription>
                Key inventory performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTurnoverChart data={mockAnalytics.inventoryMetrics} />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Insights */}
        <div className="grid gap-6 md:grid-cols-3">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Customers</span>
                <Badge variant="outline">234 this month</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Repeat Customers</span>
                <Badge variant="outline">68%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Customer Lifetime Value</span>
                <Badge variant="outline">{formatCurrency(485.20)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Session Duration</span>
                <Badge variant="outline">4m 32s</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Inventory Turnover</span>
                <Badge variant="outline">{mockAnalytics.inventoryMetrics.turnoverRate}x/year</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Stock Age</span>
                <Badge variant="outline">{mockAnalytics.inventoryMetrics.averageAge} days</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dead Stock Items</span>
                <Badge variant="outline" className="text-amber-600">{mockAnalytics.inventoryMetrics.deadStock}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stock Value</span>
                <Badge variant="outline">{formatCurrency(mockAnalytics.inventoryMetrics.stockValue)}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
