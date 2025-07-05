import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { LowStockItem, OverStockItem } from '../types';

interface InventoryAlertsListProps {
  lowStockItems: LowStockItem[];
  overStockItems: OverStockItem[];
}

export function InventoryAlertsList({ lowStockItems, overStockItems }: InventoryAlertsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Low Stock Items</h3>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <Alert key={item.id} variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600 ml-2">{item.name}</AlertTitle>
                <AlertDescription className="ml-6 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Current Stock: {item.currentStock}</span>
                    <Badge variant="outline" className="text-red-600">
                      {item.daysToStockout} days to stockout
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Overstock Alerts */}
      {overStockItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 mt-4">Overstock Items</h3>
          <div className="space-y-2">
            {overStockItems.map((item) => (
              <Alert key={item.id} variant="default" className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-600 ml-2">{item.name}</AlertTitle>
                <AlertDescription className="ml-6 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Current: {item.currentStock} / Optimal: {item.optimalStock}</span>
                    <Badge variant="outline" className="text-amber-600">
                      Excess value: {formatCurrency(item.excessValue)}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {lowStockItems.length === 0 && overStockItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No inventory alerts at this time
        </div>
      )}
    </div>
  );
}