'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface InventoryTurnoverChartProps {
  data: {
    turnoverRate: number;
    averageAge: number;
    deadStock: number;
    stockValue: number;
  };
}

export function InventoryTurnoverChart({ data }: InventoryTurnoverChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTurnoverStatus = (rate: number) => {
    if (rate >= 4) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (rate >= 2) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (rate >= 1) return { status: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getAgeStatus = (days: number) => {
    if (days <= 30) return { status: 'Fresh', color: 'text-green-600' };
    if (days <= 60) return { status: 'Aging', color: 'text-yellow-600' };
    return { status: 'Stale', color: 'text-red-600' };
  };

  const turnoverStatus = getTurnoverStatus(data.turnoverRate);
  const ageStatus = getAgeStatus(data.averageAge);

  // Calculate progress values (out of 100)
  const turnoverProgress = Math.min((data.turnoverRate / 6) * 100, 100); // Max 6 is excellent
  const ageProgress = Math.max(100 - (data.averageAge / 90) * 100, 0); // Less age is better
  const deadStockProgress = Math.max(100 - (data.deadStock / 50) * 100, 0); // Less dead stock is better

  const metrics = [
    {
      label: 'Inventory Turnover',
      value: `${data.turnoverRate}x/year`,
      progress: turnoverProgress,
      status: turnoverStatus.status,
      statusColor: turnoverStatus.color,
      icon: RotateCcw,
      description: 'Higher is better',
      target: '4x+',
      progressColor: turnoverProgress > 60 ? 'bg-green-500' : turnoverProgress > 30 ? 'bg-yellow-500' : 'bg-red-500'
    },
    {
      label: 'Average Stock Age',
      value: `${data.averageAge} days`,
      progress: ageProgress,
      status: ageStatus.status,
      statusColor: ageStatus.color,
      icon: Clock,
      description: 'Lower is better',
      target: '< 30 days',
      progressColor: ageProgress > 60 ? 'bg-green-500' : ageProgress > 30 ? 'bg-yellow-500' : 'bg-red-500'
    },
    {
      label: 'Dead Stock Items',
      value: data.deadStock.toString(),
      progress: deadStockProgress,
      status: data.deadStock === 0 ? 'None' : data.deadStock < 10 ? 'Low' : 'High',
      statusColor: data.deadStock === 0 ? 'text-green-600' : data.deadStock < 10 ? 'text-yellow-600' : 'text-red-600',
      icon: AlertTriangle,
      description: 'Lower is better',
      target: '0 items',
      progressColor: deadStockProgress > 60 ? 'bg-green-500' : deadStockProgress > 30 ? 'bg-yellow-500' : 'bg-red-500'
    },
    {
      label: 'Total Stock Value',
      value: formatCurrency(data.stockValue),
      progress: 75, // This would be calculated based on targets in a real app
      status: 'Healthy',
      statusColor: 'text-blue-600',
      icon: DollarSign,
      description: 'Current valuation',
      target: 'On target',
      progressColor: 'bg-blue-500'
    }
  ];

  return (
    <div className="space-y-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${turnoverStatus.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.statusColor}`} />
                </div>
                <div>
                  <div className="font-medium text-sm">{metric.label}</div>
                  <div className="text-xs text-muted-foreground">{metric.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{metric.value}</div>
                <Badge variant="outline" className={`text-xs ${metric.statusColor}`}>
                  {metric.status}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>Target: {metric.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${metric.progressColor}`}
                  style={{ width: `${metric.progress}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Summary Insights */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="font-medium text-sm mb-3">Key Insights</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          {data.turnoverRate >= 4 && (
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-3 w-3 mr-2" />
              Excellent inventory turnover rate
            </div>
          )}
          {data.turnoverRate < 2 && (
            <div className="flex items-center text-red-600">
              <TrendingDown className="h-3 w-3 mr-2" />
              Low turnover - consider demand forecasting
            </div>
          )}
          {data.averageAge > 60 && (
            <div className="flex items-center text-amber-600">
              <Clock className="h-3 w-3 mr-2" />
              Stock aging - review slow-moving items
            </div>
          )}
          {data.deadStock > 10 && (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-3 w-3 mr-2" />
              High dead stock - consider liquidation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
