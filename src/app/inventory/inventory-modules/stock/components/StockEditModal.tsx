'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Stock, UpdateStockRequest } from '../types/stock.types';
import { StockService } from '../services/stockService';

interface StockEditModalProps {
  isOpen: boolean;
  stock: Stock | null;
  onClose: () => void;
  onSave: () => void;
}

export default function StockEditModal({
  isOpen,
  stock,
  onClose,
  onSave
}: StockEditModalProps) {
  const [editStock, setEditStock] = useState<Stock | null>(stock);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when stock prop changes
  useEffect(() => {
    if (stock) {
      setEditStock({ ...stock });
    }
  }, [stock]);

  if (!isOpen || !editStock) return null;

  const handleInputChange = (field: keyof Stock, value: any) => {
    setEditStock({ ...editStock, [field]: value });
  };

  const handleSave = async () => {
    if (!editStock) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const updateData: UpdateStockRequest = {
        id: editStock.id,
        currentQuantity: editStock.currentQuantity,
        minimumQuantity: editStock.minimumQuantity,
        maximumQuantity: editStock.maximumQuantity,
        costPerUnit: editStock.costPerUnit,
        location: editStock.location,
        warehouseId: editStock.warehouseId
      };
      
      await StockService.updateStock(updateData);
      onSave();
      onClose();
    } catch (error) {
      setError('Failed to update stock. Please try again.');
      console.error('Error updating stock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border border-gray-200 w-11/12 max-w-3xl shadow-2xl rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Edit Stock</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={editStock.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              value={editStock.productSku}
              onChange={(e) => handleInputChange('productSku', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Current Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Quantity
            </label>
            <input
              type="number"
              value={editStock.currentQuantity}
              onChange={(e) => handleInputChange('currentQuantity', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Minimum Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Quantity
            </label>
            <input
              type="number"
              value={editStock.minimumQuantity}
              onChange={(e) => handleInputChange('minimumQuantity', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Maximum Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Quantity
            </label>
            <input
              type="number"
              value={editStock.maximumQuantity}
              onChange={(e) => handleInputChange('maximumQuantity', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Cost per Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost per Unit
            </label>
            <input
              type="number"
              value={editStock.costPerUnit}
              onChange={(e) => handleInputChange('costPerUnit', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Save button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

