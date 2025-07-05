import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InventoryMetrics } from '../types';

interface InventoryInsightsCardProps {
  metrics: InventoryMetrics;
}

export const InventoryInsightsCard = ({ metrics }: InventoryInsightsCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Inventory Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Inventory Turnover</span>
          <Badge variant="outline">{metrics.turnoverRate}x/year</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Avg Stock Age</span>
          <Badge variant="outline">{metrics.averageAge} days</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Dead Stock Items</span>
          <Badge variant="outline" className="text-amber-600">{metrics.deadStock}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Stock Value</span>
          <Badge variant="outline">{formatCurrency(metrics.stockValue)}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};