'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarDays,
  Package,
  BarChart3
} from 'lucide-react';
import { InventoryTurnoverChart } from '@/components/charts/InventoryTurnoverChart';
import { InventoryAlertsList } from './components/InventoryAlertsList';

export default function InventoryAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data - will be replaced with real API calls
  const mockAnalytics = {
    inventoryMetrics: {
      turnoverRate: 4.2,
      averageAge: 28,
      deadStock: 12,
      stockValue: 234560,
    },
    lowStockItems: [
      { id: '1', name: 'Wireless Headphones', currentStock: 5, reorderPoint: 10, daysToStockout: 3 },
      { id: '2', name: 'Smart Watch Pro', currentStock: 8, reorderPoint: 15, daysToStockout: 5 },
      { id: '3', name: 'Gaming Mouse', currentStock: 12, reorderPoint: 20, daysToStockout: 8 },
    ],
    overStockItems: [
      { id: '4', name: 'USB-C Hub', currentStock: 120, optimalStock: 50, excessValue: 3500 },
      { id: '5', name: 'Bluetooth Speaker', currentStock: 85, optimalStock: 40, excessValue: 4500 },
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Analytics</h2>
          <p className="text-muted-foreground">
            Inventory performance metrics and stock level analysis
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

      {/* Inventory Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Inventory Performance
          </CardTitle>
          <CardDescription>
            Key inventory performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryTurnoverChart data={mockAnalytics.inventoryMetrics} />
        </CardContent>
      </Card>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Alerts</CardTitle>
          <CardDescription>
            Low stock and overstock items requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryAlertsList lowStockItems={mockAnalytics.lowStockItems} overStockItems={mockAnalytics.overStockItems} />
        </CardContent>
      </Card>

      {/* Detailed Insights */}
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
  );
}