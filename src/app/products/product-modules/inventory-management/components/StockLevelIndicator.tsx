'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Package, CheckCircle, XCircle } from 'lucide-react';
import { StockLevelIndicatorProps } from '../types';

export const StockLevelIndicator: React.FC<StockLevelIndicatorProps> = ({
  currentQuantity,
  lowStockThreshold,
  size = 'md'
}) => {
  // Calculate stock status
  const getStockStatus = () => {
    if (currentQuantity === 0) return 'out_of_stock';
    if (currentQuantity <= lowStockThreshold) return 'low_stock';
    if (currentQuantity <= lowStockThreshold * 2) return 'medium_stock';
    return 'high_stock';
  };

  const status = getStockStatus();

  // Get styling based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'out_of_stock':
        return {
          color: 'destructive',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          progressColor: 'bg-red-500',
          icon: XCircle,
          label: 'Out of Stock',
          description: 'No items available'
        };
      case 'low_stock':
        return {
          color: 'destructive',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          progressColor: 'bg-orange-500',
          icon: AlertTriangle,
          label: 'Low Stock',
          description: 'Below threshold'
        };
      case 'medium_stock':
        return {
          color: 'secondary',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          progressColor: 'bg-yellow-500',
          icon: Package,
          label: 'Medium Stock',
          description: 'Moderate levels'
        };
      default:
        return {
          color: 'default',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          progressColor: 'bg-green-500',
          icon: CheckCircle,
          label: 'Good Stock',
          description: 'Healthy levels'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Size configurations
  const sizeConfig = {
    sm: {
      badge: 'text-xs px-2 py-1',
      progress: 'h-1',
      text: 'text-xs',
      icon: 'w-3 h-3',
      container: 'p-2'
    },
    md: {
      badge: 'text-sm px-3 py-1',
      progress: 'h-2',
      text: 'text-sm',
      icon: 'w-4 h-4',
      container: 'p-3'
    },
    lg: {
      badge: 'text-base px-4 py-2',
      progress: 'h-3',
      text: 'text-base',
      icon: 'w-5 h-5',
      container: 'p-4'
    }
  };

  const currentSizeConfig = sizeConfig[size];

  // Calculate progress percentage (0-100%)
  const progressValue = Math.min((currentQuantity / (lowStockThreshold * 3)) * 100, 100);

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg ${currentSizeConfig.container} space-y-2`}>
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`${currentSizeConfig.icon} ${config.textColor}`} />
          <Badge 
            variant={config.color as any} 
            className={currentSizeConfig.badge}
          >
            {config.label}
          </Badge>
        </div>
        <span className={`font-semibold ${currentSizeConfig.text} ${config.textColor}`}>
          {currentQuantity} units
        </span>
      </div>

      {/* Progress bar showing stock level vs threshold */}
      {size !== 'sm' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Stock Level</span>
            <span>Threshold: {lowStockThreshold}</span>
          </div>
          <Progress 
            value={progressValue} 
            className={currentSizeConfig.progress}
          />
          <div className="text-xs text-muted-foreground">
            {config.description}
          </div>
        </div>
      )}

      {/* Detailed metrics for large size */}
      {size === 'lg' && (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground">Current Stock</div>
            <div className={`text-lg font-bold ${config.textColor}`}>
              {currentQuantity}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground">Threshold</div>
            <div className="text-lg font-bold text-muted-foreground">
              {lowStockThreshold}
            </div>
          </div>
        </div>
      )}

      {/* Actions/recommendations */}
      {currentQuantity <= lowStockThreshold && size !== 'sm' && (
        <div className={`text-xs p-2 rounded ${status === 'out_of_stock' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-medium">
              {status === 'out_of_stock' ? 'Immediate restock required' : 'Consider reordering soon'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
