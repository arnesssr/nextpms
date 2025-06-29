'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  XCircle, 
  TrendingDown,
  Package,
  ArrowRight,
  Zap
} from 'lucide-react';
import { InventoryItem, Product } from '@/types';

interface EnhancedInventoryItem extends InventoryItem {
  product?: Product;
}

interface InventoryAlertsProps {
  inventory: EnhancedInventoryItem[];
}

export function InventoryAlerts({ inventory }: InventoryAlertsProps) {
  // Categorize items by alert level
  const outOfStockItems = inventory.filter(item => item.quantity === 0);
  const criticalLowStock = inventory.filter(item => 
    item.quantity > 0 && item.quantity <= item.lowStockThreshold * 0.5
  );
  const lowStockItems = inventory.filter(item => 
    item.quantity > item.lowStockThreshold * 0.5 && 
    item.quantity <= item.lowStockThreshold
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const AlertItem = ({ 
    item, 
    alertType,
    icon: Icon,
    color
  }: { 
    item: EnhancedInventoryItem;
    alertType: string;
    icon: any;
    color: string;
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <Avatar className="h-10 w-10">
          <AvatarImage src={item.product?.images[0]} alt={item.product?.name} />
          <AvatarFallback>
            {item.product?.name?.substring(0, 2).toUpperCase() || 'PR'}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
          <div className="text-sm text-muted-foreground">
            SKU: {item.product?.sku || 'N/A'} • {item.location}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="font-medium">
            {item.quantity === 0 ? 'Out of Stock' : `${item.quantity} left`}
          </div>
          <div className="text-sm text-muted-foreground">
            Min: {item.lowStockThreshold}
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {formatPrice((item.product?.price || 0) * item.quantity)}
        </Badge>
        <Button variant="ghost" size="sm">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (outOfStockItems.length === 0 && criticalLowStock.length === 0 && lowStockItems.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-green-700 mb-2">All Stock Levels Good!</h3>
        <p className="text-muted-foreground">
          No inventory alerts at this time. All products are above their minimum stock thresholds.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Out of Stock Items */}
      {outOfStockItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-red-700 flex items-center">
              <XCircle className="mr-2 h-5 w-5" />
              Out of Stock ({outOfStockItems.length})
            </h4>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
              Restock All
            </Button>
          </div>
          <div className="space-y-2">
            {outOfStockItems.slice(0, 3).map(item => (
              <AlertItem
                key={item.id}
                item={item}
                alertType="out-of-stock"
                icon={XCircle}
                color="bg-red-500"
              />
            ))}
            {outOfStockItems.length > 3 && (
              <Button variant="ghost" className="w-full text-red-600">
                View {outOfStockItems.length - 3} more out of stock items
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Critical Low Stock */}
      {criticalLowStock.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-orange-700 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Critical Low Stock ({criticalLowStock.length})
            </h4>
            <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
              Priority Restock
            </Button>
          </div>
          <div className="space-y-2">
            {criticalLowStock.slice(0, 3).map(item => (
              <AlertItem
                key={item.id}
                item={item}
                alertType="critical-low"
                icon={AlertTriangle}
                color="bg-orange-500"
              />
            ))}
            {criticalLowStock.length > 3 && (
              <Button variant="ghost" className="w-full text-orange-600">
                View {criticalLowStock.length - 3} more critical items
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-yellow-700 flex items-center">
              <TrendingDown className="mr-2 h-5 w-5" />
              Low Stock ({lowStockItems.length})
            </h4>
            <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50">
              Plan Restock
            </Button>
          </div>
          <div className="space-y-2">
            {lowStockItems.slice(0, 3).map(item => (
              <AlertItem
                key={item.id}
                item={item}
                alertType="low-stock"
                icon={TrendingDown}
                color="bg-yellow-500"
              />
            ))}
            {lowStockItems.length > 3 && (
              <Button variant="ghost" className="w-full text-yellow-600">
                View {lowStockItems.length - 3} more low stock items
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-muted-foreground">Quick Actions</h4>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Zap className="mr-2 h-4 w-4" />
              Auto-Reorder
            </Button>
            <Button variant="outline" size="sm">
              <Package className="mr-2 h-4 w-4" />
              Generate Purchase Orders
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
