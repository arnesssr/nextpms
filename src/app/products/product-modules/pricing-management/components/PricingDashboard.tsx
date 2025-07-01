'use client';

import React, { useState, useEffect } from 'react';
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
import { priceHistoryService } from '../services/priceHistoryService';
import { ProfitMarginIndicator } from './ProfitMarginIndicator';
import { BulkPriceUpdate } from './BulkPriceUpdate';
import { PricingCalculator } from './PricingCalculator';
import { productService } from '@/services/products';

interface PricingDashboardProps {
  productId?: string;
  showProductSelection?: boolean;
}

export const PricingDashboard: React.FC<PricingDashboardProps> = ({
  productId,
  showProductSelection = true
}) => {
  const { analytics, loading, error } = usePricing();
  const { recentChanges, stats, refreshAllData } = usePriceHistory();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  // Fetch real product data and debug price history
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await productService.getProducts({ 
          per_page: 10, 
          page: 1,
          sort_by: 'created_at',
          sort_order: 'desc'
        });
        
        // Filter products that have both base_price and selling_price
        const productsWithPricing = response.data.filter(product => 
          product.base_price && product.selling_price
        );
        
        setProducts(productsWithPricing.slice(0, 5)); // Show top 5 products
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductsError('Failed to load products');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setBulkUpdateOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Bulk Price Update
        </Button>
        <Button variant="outline" onClick={() => setCalculatorOpen(true)}>
          <Calculator className="mr-2 h-4 w-4" />
          Pricing Calculator
        </Button>
        <Button variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Price Analysis
        </Button>
        <Button 
          variant="outline" 
          onClick={async () => {
            try {
              console.log('🔄 Testing recent changes fetch...');
              const changes = await priceHistoryService.getRecentPriceChanges(10);
              console.log('📊 Recent changes found:', changes.length);
              if (changes.length > 0) {
                alert(`✅ Found ${changes.length} recent changes. Refreshing UI...`);
                await refreshAllData();
              } else {
                alert('❌ No recent changes found in database');
              }
            } catch (error) {
              console.error('❌ Error:', error);
              alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }}
          className="text-xs"
        >
          🔄 Test Refresh
        </Button>
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
            {productsLoading ? (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">Loading products...</div>
              </div>
            ) : productsError ? (
              <div className="text-center py-4">
                <div className="text-sm text-red-600">{productsError}</div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">No products with pricing data found</div>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.sku || 'No SKU'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">${product.selling_price?.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        Cost: ${product.base_price?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <ProfitMarginIndicator
                    costPrice={product.base_price}
                    sellingPrice={product.selling_price}
                    size="sm"
                  />
                </div>
              ))
            )}
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
                {recentChanges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      <div className="text-muted-foreground">
                        {loading ? 'Loading recent changes...' : 'No recent price changes found'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentChanges.slice(0, 5).map((change) => (
                    <TableRow key={change.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChangeIcon(change.change_type)}
                          <div>
                            <div className="font-medium">
                              {/* Use product_name from price history if available, otherwise fallback */}
                              {change.product_name || products.find(p => p.id === change.product_id)?.name || `Product ${change.product_id.slice(-8)}`}
                            </div>
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
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Price Update Modal */}
      <BulkPriceUpdate
        isOpen={bulkUpdateOpen}
        onClose={() => setBulkUpdateOpen(false)}
        onSuccess={async () => {
          // Refresh price history data and reload products
          try {
            await refreshAllData();
            // Reload products to show updated prices
            const response = await productService.getProducts({ 
              per_page: 10, 
              page: 1,
              sort_by: 'created_at',
              sort_order: 'desc'
            });
            
            const productsWithPricing = response.data.filter(product => 
              product.base_price && product.selling_price
            );
            
            setProducts(productsWithPricing.slice(0, 5));
          } catch (error) {
            console.error('Error refreshing data after bulk update:', error);
            // Fallback to simple page reload if refresh fails
            window.location.reload();
          }
        }}
      />

      {/* Pricing Calculator Modal */}
      <PricingCalculator
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
    </div>
  );
};
