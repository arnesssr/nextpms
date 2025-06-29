'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  Edit,
  History,
  Calculator,
  Target,
  BarChart3
} from 'lucide-react';
import { usePricing } from '../hooks/usePricing';
import { usePriceHistory } from '../hooks/usePriceHistory';
import { ProfitMarginIndicator } from './ProfitMarginIndicator';

interface PricingDashboardProps {
  productId?: string;
  showProductSelection?: boolean;
}

export const PricingDashboard: React.FC<PricingDashboardProps> = ({
  productId,
  showProductSelection = true
}) => {
  const { analytics, loading, error } = usePricing();
  const { recentChanges, stats } = usePriceHistory();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock product data for demo
  const mockProducts = [
    {
      id: '1',
      name: 'Wireless Headphones',
      sku: 'WH-001',
      cost_price: 60.00,
      selling_price: 99.99,
      category: 'Electronics'
    },
    {
      id: '2',
      name: 'Bluetooth Speaker',
      sku: 'BS-002',
      cost_price: 25.00,
      selling_price: 49.99,
      category: 'Electronics'
    },
    {
      id: '3',
      name: 'Phone Case',
      sku: 'PC-003',
      cost_price: 5.00,
      selling_price: 19.99,
      category: 'Accessories'
    }
  ];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'cost_change':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'promotion':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case 'manual_update':
        return <Edit className="w-4 h-4 text-purple-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatPriceChange = (oldPrice: number, newPrice: number) => {
    const change = newPrice - oldPrice;
    const percentage = ((change / oldPrice) * 100).toFixed(1);
    const isIncrease = change > 0;
    
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">
          ${oldPrice.toFixed(2)} → ${newPrice.toFixed(2)}
        </span>
        <Badge variant={isIncrease ? 'default' : 'secondary'} className="text-xs">
          {isIncrease ? '+' : ''}{percentage}%
        </Badge>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading pricing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 mb-4">Error loading pricing data: {error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Margin</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics?.avg_profit_margin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.total_revenue_potential.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total catalog value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Margin Products</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analytics?.products_with_low_margin}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Changes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_changes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Pricing Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Margins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Product Margins
            </CardTitle>
            <CardDescription>
              Profit margins for key products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockProducts.map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">${product.selling_price}</div>
                    <div className="text-xs text-muted-foreground">
                      Cost: ${product.cost_price}
                    </div>
                  </div>
                </div>
                <ProfitMarginIndicator
                  costPrice={product.cost_price}
                  sellingPrice={product.selling_price}
                  size="sm"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Price Changes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Price Changes
            </CardTitle>
            <CardDescription>
              Latest pricing updates across your catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentChanges.slice(0, 5).map((change) => (
                  <TableRow key={change.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getChangeIcon(change.change_type)}
                        <div>
                          <div className="font-medium">Product #{change.product_id}</div>
                          <div className="text-xs text-muted-foreground">
                            by {change.changed_by}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatPriceChange(change.old_price, change.new_price)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{change.change_reason}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(change.changed_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Bulk Price Update
        </Button>
        <Button variant="outline">
          <Calculator className="mr-2 h-4 w-4" />
          Pricing Calculator
        </Button>
        <Button variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Price Analysis
        </Button>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          Full History
        </Button>
      </div>
    </div>
  );
};
