'use client';

import { useState } from 'react';
import { X, Package, MapPin, DollarSign, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Stock, StockStatus } from '../types/stock.types';
import StockLevelIndicator from './StockLevelIndicator';

interface StockDetailModalProps {
  isOpen: boolean;
  stock: Stock | null;
  onClose: () => void;
  onEdit?: (stock: Stock) => void;
}

export default function StockDetailModal({
  isOpen,
  stock,
  onClose,
  onEdit
}: StockDetailModalProps) {
  if (!isOpen || !stock) return null;

  const getStatusIcon = (status: StockStatus) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'low_stock':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'out_of_stock':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'overstocked':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'low_stock':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'out_of_stock':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'overstocked':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border border-gray-200 w-11/12 max-w-4xl shadow-2xl rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Package className="h-7 w-7 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{stock.productName}</h2>
              <p className="text-sm text-gray-500">SKU: {stock.productSku}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {onEdit && (
              <button
                onClick={() => onEdit(stock)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Edit Stock
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Stock Status</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(stock.status)}`}>
                  {getStatusIcon(stock.status)}
                  <span className="ml-2">{stock.status.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
              <StockLevelIndicator stock={stock} />
            </div>

            {/* Product Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Product Name</span>
                    <p className="text-sm text-gray-900">{stock.productName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">SKU</span>
                    <p className="text-sm text-gray-900">{stock.productSku}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Unit of Measure</span>
                    <p className="text-sm text-gray-900">{stock.unitOfMeasure}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Cost per Unit</span>
                    <p className="text-sm text-gray-900">${stock.costPerUnit.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total Value</span>
                    <p className="text-sm font-bold text-green-600">${stock.totalValue.toLocaleString()}</p>
                  </div>
                  {stock.supplier && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Supplier</span>
                      <p className="text-sm text-gray-900">{stock.supplier}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Warehouse */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                Location & Storage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Location</span>
                  <p className="text-sm text-gray-900">{stock.location}</p>
                </div>
                {stock.warehouseId && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Warehouse ID</span>
                    <p className="text-sm text-gray-900">{stock.warehouseId}</p>
                  </div>
                )}
                {stock.batchNumber && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Batch Number</span>
                    <p className="text-sm text-gray-900">{stock.batchNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {(stock.expiryDate || stock.notes) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-3">
                  {stock.expiryDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Expiry Date</span>
                      <p className={`text-sm ${
                        new Date(stock.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? 'text-orange-600 font-medium'
                          : 'text-gray-900'
                      }`}>
                        {new Date(stock.expiryDate).toLocaleDateString()}
                        {new Date(stock.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                          <span className="ml-2 text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                            Expiring Soon
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {stock.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Notes</span>
                      <p className="text-sm text-gray-900">{stock.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Stock</span>
                  <span className="text-lg font-bold text-gray-900">
                    {stock.currentQuantity} {stock.unitOfMeasure}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Minimum Level</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stock.minimumQuantity} {stock.unitOfMeasure}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Maximum Level</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stock.maximumQuantity || 'Not set'} {stock.maximumQuantity ? stock.unitOfMeasure : ''}
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Value</span>
                  <span className="text-lg font-bold text-green-600">
                    ${stock.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <p className="text-sm text-gray-900">
                    {new Date(stock.lastUpdated).toLocaleString()}
                  </p>
                </div>
                {stock.lastRestocked && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Last Restocked</span>
                    <p className="text-sm text-gray-900">
                      {new Date(stock.lastRestocked).toLocaleString()}
                    </p>
                  </div>
                )}
                {stock.createdAt && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created</span>
                    <p className="text-sm text-gray-900">
                      {new Date(stock.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {stock.status === 'low_stock' && (
                  <button className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                    Reorder Stock
                  </button>
                )}
                {stock.status === 'out_of_stock' && (
                  <button className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                    Emergency Reorder
                  </button>
                )}
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Adjustment History
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Movement History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
