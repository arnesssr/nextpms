'use client';

import { Stock, StockLevel, StockStatus } from '../types/stock.types';

interface StockLevelIndicatorProps {
  stock: Stock;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StockLevelIndicator({ 
  stock, 
  showText = true, 
  size = 'md' 
}: StockLevelIndicatorProps) {
  
  // Determine stock level based on quantity thresholds
  const getStockLevel = (): StockLevel => {
    const { currentQuantity, minimumQuantity, maximumQuantity } = stock;
    
    if (currentQuantity <= 0) return StockLevel.CRITICAL;
    if (currentQuantity <= minimumQuantity) return StockLevel.LOW;
    if (currentQuantity >= maximumQuantity) return StockLevel.HIGH;
    return StockLevel.NORMAL;
  };

  // Get visual styles based on stock level
  const getStyles = (level: StockLevel) => {
    const baseStyles = {
      [StockLevel.CRITICAL]: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        dot: 'bg-red-500',
        progress: 'bg-red-500'
      },
      [StockLevel.LOW]: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        progress: 'bg-orange-500'
      },
      [StockLevel.NORMAL]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        dot: 'bg-green-500',
        progress: 'bg-green-500'
      },
      [StockLevel.HIGH]: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        progress: 'bg-blue-500'
      }
    };
    
    return baseStyles[level];
  };

  // Calculate percentage of stock relative to max capacity
  const getStockPercentage = (): number => {
    if (stock.maximumQuantity === 0) return 0;
    return Math.min((stock.currentQuantity / stock.maximumQuantity) * 100, 100);
  };

  // Get text label for stock level
  const getLevelText = (level: StockLevel): string => {
    const labels = {
      [StockLevel.CRITICAL]: 'Critical',
      [StockLevel.LOW]: 'Low Stock',
      [StockLevel.NORMAL]: 'In Stock',
      [StockLevel.HIGH]: 'Overstocked'
    };
    
    return labels[level];
  };

  const stockLevel = getStockLevel();
  const styles = getStyles(stockLevel);
  const percentage = getStockPercentage();
  const levelText = getLevelText(stockLevel);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="space-y-2">
      {/* Status Badge */}
      <div className={`inline-flex items-center rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses[size]}`}>
        <div className={`rounded-full mr-2 ${styles.dot} ${dotSizeClasses[size]}`}></div>
        {showText && <span className="font-medium">{levelText}</span>}
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Current: {stock.currentQuantity}</span>
          <span>Max: {stock.maximumQuantity}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${styles.progress}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Min: {stock.minimumQuantity}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      </div>

      {/* Quantity Details */}
      <div className="text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Available:</span>
          <span className="font-medium">{stock.currentQuantity} {stock.unitOfMeasure}</span>
        </div>
        
        {stock.status === StockStatus.LOW_STOCK && (
          <div className="flex justify-between text-orange-600">
            <span>Reorder needed:</span>
            <span className="font-medium">
              {Math.max(0, stock.minimumQuantity - stock.currentQuantity)} {stock.unitOfMeasure}
            </span>
          </div>
        )}
        
        {stock.status === StockStatus.OUT_OF_STOCK && (
          <div className="flex justify-between text-red-600">
            <span>Out of stock</span>
            <span className="font-medium">Reorder immediately</span>
          </div>
        )}
        
        {stock.expiryDate && (
          <div className="flex justify-between">
            <span>Expires:</span>
            <span className={`font-medium ${
              new Date(stock.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
                ? 'text-orange-600' 
                : 'text-gray-600'
            }`}>
              {new Date(stock.expiryDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
