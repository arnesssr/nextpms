'use client';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProductPerformanceChartProps {
  data: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
}

export function ProductPerformanceChart({ data }: ProductPerformanceChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600 bg-green-50 border-green-200';
    if (growth < 0) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-3 w-3" />;
    if (growth < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  const maxRevenue = Math.max(...data.map(item => item.revenue));

  return (
    <div className="space-y-4">
      {data.map((product, index) => (
        <div key={product.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
          {/* Rank */}
          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>

          {/* Product Info */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://via.placeholder.com/40x40?text=${product.name.charAt(0)}`} />
            <AvatarFallback>
              {product.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {product.name}
            </div>
            <div className="text-sm text-gray-500">
              {product.orders} orders
            </div>
          </div>

          {/* Revenue Bar */}
          <div className="flex-1 max-w-32">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(product.revenue / maxRevenue) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Revenue Amount */}
          <div className="text-right">
            <div className="font-medium text-gray-900">
              {formatCurrency(product.revenue)}
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${getGrowthColor(product.growth)}`}
            >
              {getGrowthIcon(product.growth)}
              <span className="ml-1">
                {product.growth > 0 ? '+' : ''}{product.growth.toFixed(1)}%
              </span>
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
