import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesMetrics } from '../types';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Target,
  Activity
} from 'lucide-react';

interface SalesMetricsCardsProps {
  metrics: SalesMetrics;
}

export const SalesMetricsCards = ({ metrics }: SalesMetricsCardsProps) => {
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <div className={`flex items-center text-xs ${getGrowthColor(metrics.revenueGrowth)}`}>
            {getGrowthIcon(metrics.revenueGrowth)}
            <span className="ml-1">
              {formatPercent(metrics.revenueGrowth)} from last period
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
            {metrics.totalOrders.toLocaleString()}
          </div>
          <div className={`flex items-center text-xs ${getGrowthColor(metrics.ordersGrowth)}`}>
            {getGrowthIcon(metrics.ordersGrowth)}
            <span className="ml-1">
              {formatPercent(metrics.ordersGrowth)} from last period
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
            {formatCurrency(metrics.avgOrderValue)}
          </div>
          <div className={`flex items-center text-xs ${getGrowthColor(metrics.avgOrderGrowth)}`}>
            {getGrowthIcon(metrics.avgOrderGrowth)}
            <span className="ml-1">
              {formatPercent(metrics.avgOrderGrowth)} from last period
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
            {metrics.conversionRate}%
          </div>
          <div className={`flex items-center text-xs ${getGrowthColor(metrics.conversionGrowth)}`}>
            {getGrowthIcon(metrics.conversionGrowth)}
            <span className="ml-1">
              {formatPercent(metrics.conversionGrowth)} from last period
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};