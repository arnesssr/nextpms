'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { ProfitMarginIndicatorProps } from '../types';

export const ProfitMarginIndicator: React.FC<ProfitMarginIndicatorProps> = ({
  costPrice,
  sellingPrice,
  targetMargin = 30,
  showPercentage = true,
  size = 'md'
}) => {
  // Calculate metrics
  const profitAmount = sellingPrice - costPrice;
  const profitMargin = sellingPrice > 0 ? (profitAmount / sellingPrice) * 100 : 0;
  const markup = costPrice > 0 ? (profitAmount / costPrice) * 100 : 0;
  
  // Determine status
  const getMarginStatus = () => {
    if (profitMargin < 0) return 'loss';
    if (profitMargin < targetMargin * 0.5) return 'low';
    if (profitMargin < targetMargin) return 'below_target';
    if (profitMargin >= targetMargin) return 'good';
    return 'excellent';
  };

  const status = getMarginStatus();

  // Get styling based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'loss':
        return {
          color: 'destructive',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          icon: TrendingDown,
          label: 'Loss'
        };
      case 'low':
        return {
          color: 'destructive',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          icon: AlertTriangle,
          label: 'Low Margin'
        };
      case 'below_target':
        return {
          color: 'secondary',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          icon: AlertTriangle,
          label: 'Below Target'
        };
      case 'good':
        return {
          color: 'default',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: TrendingUp,
          label: 'Good'
        };
      default:
        return {
          color: 'default',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: TrendingUp,
          label: 'Excellent'
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
      icon: 'w-3 h-3'
    },
    md: {
      badge: 'text-sm px-3 py-1',
      progress: 'h-2',
      text: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      badge: 'text-base px-4 py-2',
      progress: 'h-3',
      text: 'text-base',
      icon: 'w-5 h-5'
    }
  };

  const currentSizeConfig = sizeConfig[size];

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 space-y-2`}>
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
        {showPercentage && (
          <span className={`font-semibold ${currentSizeConfig.text} ${config.textColor}`}>
            {profitMargin.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Progress bar showing margin vs target */}
      {size !== 'sm' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Margin Progress</span>
            <span>{Math.min(profitMargin, targetMargin * 1.5).toFixed(1)}% / {targetMargin}%</span>
          </div>
          <Progress 
            value={Math.min((profitMargin / targetMargin) * 100, 150)} 
            className={currentSizeConfig.progress}
          />
        </div>
      )}

      {/* Detailed metrics */}
      {size === 'lg' && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Profit</div>
            <div className={`font-semibold ${config.textColor}`}>
              ${profitAmount.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Markup</div>
            <div className={`font-semibold ${config.textColor}`}>
              {markup.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Target</div>
            <div className="font-semibold text-muted-foreground">
              {targetMargin}%
            </div>
          </div>
        </div>
      )}

      {/* Warning for negative margins */}
      {profitMargin < 0 && (
        <div className="text-xs text-red-600 bg-red-100 rounded p-2 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          <span>Selling price is below cost price</span>
        </div>
      )}
    </div>
  );
};
