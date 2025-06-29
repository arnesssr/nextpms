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
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { StockLevelIndicator } from './StockLevelIndicator';

interface InventoryDashboardProps {
  showFilters?: boolean;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  showFilters = true
}) => {
  const { 
    inventory, 
    lowStockReport, 
    stats, 
    loading, 
    error, 
    fetchAllInventory 
  } = useInventory();
  
  const [filterStatus, setFilterStatus] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  // Mock product data to display with inventory
  const mockProducts = [
    { id: '1', name: 'Wireless Headphones', sku: 'WH-001' },
    { id: '2', name: 'Bluetooth Speaker', sku: 'BS-002' },
    { id: '3', name: 'Phone Case', sku: 'PC-003' },
    { id: '4', name: 'USB Cable', sku: 'UC-004' }
  ];

  // Filter inventory based on status
  const filteredInventory = inventory.filter(item => {
    switch (filterStatus) {
      case 'low_stock':
        return item.quantity <= item.low_stock_threshold && item.quantity > 0;
      case 'out_of_stock':
        return item.quantity === 0;
      default:
        return true;
    }
  });

  const getMovementIcon = (type: 'addition' | 'removal') => {
    return type === 'addition' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getProductName = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product ? product.name : `Product ${productId}`;
  };

  const getSKU = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product ? product.sku : `SKU-${productId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading inventory data...</p>
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
            <p className="text-red-600 mb-4">Error loading inventory: {error}</p>
            <Button variant="outline" onClick={fetchAllInventory}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_products || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_quantity?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Units in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.low_stock_items || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.available_quantity?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for sale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Inventory Table */}
      <div className="grid grid-cols-1 gap-6">
        {/* Inventory Overview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Overview
                </CardTitle>
                <CardDescription>
                  Current stock levels and alerts for all products
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                {showFilters && (
                  <div className="flex gap-1">
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === 'low_stock' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('low_stock')}
                    >
                      Low Stock
                    </Button>
                    <Button
                      variant={filterStatus === 'out_of_stock' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('out_of_stock')}
                    >
                      Out of Stock
                    </Button>
                  </div>
                )}
                
                <Button variant="outline" size="sm" onClick={fetchAllInventory}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getProductName(item.product_id)}</div>
                        <div className="text-sm text-muted-foreground">{getSKU(item.product_id)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StockLevelIndicator
                        currentQuantity={item.quantity}
                        lowStockThreshold={item.low_stock_threshold}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{item.reserved_quantity}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-green-600">
                        {item.quantity - item.reserved_quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.location || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" title="Add Stock">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" title="Remove Stock">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" title="Settings">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredInventory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4" />
                <p>No inventory items found</p>
                <p className="text-sm">
                  {filterStatus !== 'all' ? 'Try changing the filter' : 'Start by adding some products'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Bulk Stock Adjustment
        </Button>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Inventory
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
        <Button variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Inventory Analytics
        </Button>
      </div>
    </div>
  );
};
