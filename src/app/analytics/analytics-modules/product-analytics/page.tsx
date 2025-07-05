'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays,
  PieChart,
  BarChart3
} from 'lucide-react';
import { ProductPerformanceChart } from '@/components/charts/ProductPerformanceChart';
import { CategoryDistributionChart } from '@/components/charts/CategoryDistributionChart';

export default function ProductAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data - will be replaced with real API calls
  const mockAnalytics = {
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
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Analytics</h2>
          <p className="text-muted-foreground">
            Performance metrics for products and categories
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

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Top Performing Products
            </CardTitle>
            <CardDescription>
              Products ranked by revenue generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductPerformanceChart data={mockAnalytics.topProducts} />
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

      {/* Product Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance Details</CardTitle>
          <CardDescription>
            Detailed metrics for top performing products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium">Product</th>
                  <th className="py-3 text-right font-medium">Revenue</th>
                  <th className="py-3 text-right font-medium">Orders</th>
                  <th className="py-3 text-right font-medium">Growth</th>
                  <th className="py-3 text-right font-medium">Profit Margin</th>
                </tr>
              </thead>
              <tbody>
                {mockAnalytics.topProducts.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="py-3 text-left">{product.name}</td>
                    <td className="py-3 text-right">${product.revenue.toLocaleString()}</td>
                    <td className="py-3 text-right">{product.orders}</td>
                    <td className={`py-3 text-right ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.growth > 0 ? '+' : ''}{product.growth}%
                    </td>
                    <td className="py-3 text-right">{Math.floor(Math.random() * 20) + 20}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}