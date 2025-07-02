'use client';

import { Stock } from '../types/stock.types';
import StockLevelIndicator from './StockLevelIndicator';

interface StockCardProps {
  stock: Stock;
  onEdit?: (stock: Stock) => void;
  onDelete?: (stockId: string) => void;
  onView?: (stock: Stock) => void;
  compact?: boolean;
}

export default function StockCard({ 
  stock, 
  onEdit, 
  onDelete, 
  onView, 
  compact = false 
}: StockCardProps) {
  
  const handleEdit = () => {
    onEdit?.(stock);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this stock item?')) {
      onDelete?.(stock.id);
    }
  };

  const handleView = () => {
    onView?.(stock);
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {stock.productName}
            </h3>
            <p className="text-xs text-gray-500">{stock.productSku}</p>
          </div>
          
          <div className="ml-4 flex items-center space-x-2">
            <StockLevelIndicator stock={stock} size="sm" showText={false} />
            <span className="text-sm font-medium text-gray-900">
              {stock.currentQuantity}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {stock.productName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">SKU: {stock.productSku}</p>
            
            {stock.supplier && (
              <p className="text-xs text-gray-400 mt-1">
                Supplier: {stock.supplier}
              </p>
            )}
          </div>
          
          <div className="ml-4 flex space-x-2">
            {onView && (
              <button
                onClick={handleView}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="View details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-blue-400 hover:text-blue-600 transition-colors"
                title="Edit stock"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Delete stock"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Level Indicator */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Stock Level</h4>
            <StockLevelIndicator stock={stock} />
          </div>

          {/* Stock Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Details</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium text-gray-900">{stock.location}</p>
              </div>
              
              {stock.warehouseId && (
                <div>
                  <span className="text-gray-500">Warehouse:</span>
                  <p className="font-medium text-gray-900">{stock.warehouseId}</p>
                </div>
              )}
              
              <div>
                <span className="text-gray-500">Unit Cost:</span>
                <p className="font-medium text-gray-900">${(stock.costPerUnit ?? 0).toFixed(2)}</p>
              </div>
              
              <div>
                <span className="text-gray-500">Total Value:</span>
                <p className="font-medium text-green-600">${(stock.totalValue ?? 0).toLocaleString()}</p>
              </div>
            </div>

            {stock.batchNumber && (
              <div>
                <span className="text-gray-500 text-sm">Batch:</span>
                <p className="font-medium text-gray-900">{stock.batchNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Last updated: {new Date(stock.lastUpdated).toLocaleDateString()}
          </span>
          
          {stock.expiryDate && (
            <span className={
              new Date(stock.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ? 'text-orange-600 font-medium'
                : 'text-gray-500'
            }>
              Expires: {new Date(stock.expiryDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
