'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, CheckCircle, TrendingDown, Package, DollarSign, Zap } from 'lucide-react';
import { AutoReorderRecommendation, ReorderUrgency, AutoReorderSummary } from '../types/auto-reorder.types';
import { AutoReorderService } from '../services/autoReorderService';

interface AutoReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePurchaseOrders?: (recommendations: AutoReorderRecommendation[]) => void;
}

export default function AutoReorderModal({
  isOpen,
  onClose,
  onCreatePurchaseOrders
}: AutoReorderModalProps) {
  const [recommendations, setRecommendations] = useState<AutoReorderRecommendation[]>([]);
  const [summary, setSummary] = useState<AutoReorderSummary | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRecommendations();
      fetchSummary();
    }
  }, [isOpen]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AutoReorderService.getRecommendations();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await AutoReorderService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const getUrgencyColor = (urgency: ReorderUrgency) => {
    switch (urgency) {
      case ReorderUrgency.CRITICAL:
        return 'text-red-700 bg-red-50 border-red-200';
      case ReorderUrgency.HIGH:
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case ReorderUrgency.MEDIUM:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case ReorderUrgency.LOW:
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: ReorderUrgency) => {
    switch (urgency) {
      case ReorderUrgency.CRITICAL:
        return <AlertTriangle className="h-4 w-4" />;
      case ReorderUrgency.HIGH:
        return <TrendingDown className="h-4 w-4" />;
      case ReorderUrgency.MEDIUM:
        return <Clock className="h-4 w-4" />;
      case ReorderUrgency.LOW:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === recommendations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(recommendations.map(r => r.id));
    }
  };

  const handleCreatePurchaseOrders = () => {
    const selectedRecommendations = recommendations.filter(r => selectedItems.includes(r.id));
    onCreatePurchaseOrders?.(selectedRecommendations);
    onClose();
  };

  const totalCost = recommendations
    .filter(r => selectedItems.includes(r.id))
    .reduce((sum, r) => sum + r.totalCost, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border border-gray-200 w-11/12 max-w-6xl shadow-2xl rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Zap className="h-7 w-7 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Auto Reorder</h2>
              <p className="text-sm text-gray-500">Automated stock replenishment recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.pendingRecommendations}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Critical Items</p>
                  <p className="text-2xl font-bold text-red-600">{summary.criticalItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Potential Order Value</p>
                  <p className="text-2xl font-bold text-green-600">${summary.totalPotentialOrderValue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-3">Loading recommendations...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Stock Levels Optimal</h3>
              <p className="text-gray-500">No reorder recommendations at this time.</p>
            </div>
          ) : (
            <>
              {/* Selection Controls */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === recommendations.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({recommendations.length} items)
                    </span>
                  </label>
                  {selectedItems.length > 0 && (
                    <span className="text-sm text-blue-600">
                      {selectedItems.length} selected • Total: ${totalCost.toLocaleString()}
                    </span>
                  )}
                </div>
                {selectedItems.length > 0 && (
                  <button
                    onClick={handleCreatePurchaseOrders}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Create Purchase Orders
                  </button>
                )}
              </div>

              {/* Recommendations List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className={`border rounded-lg p-4 ${
                      selectedItems.includes(recommendation.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(recommendation.id)}
                        onChange={() => handleSelectItem(recommendation.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{recommendation.productName}</h4>
                            <p className="text-sm text-gray-500">SKU: {recommendation.productSku}</p>
                          </div>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(recommendation.urgencyLevel)}`}>
                            {getUrgencyIcon(recommendation.urgencyLevel)}
                            <span className="ml-2">{recommendation.urgencyLevel.toUpperCase()}</span>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Current Stock:</span>
                            <p className="font-medium">{recommendation.currentStock}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Minimum Threshold:</span>
                            <p className="font-medium">{recommendation.minimumThreshold}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Suggested Order:</span>
                            <p className="font-medium text-blue-600">{recommendation.suggestedOrderQuantity}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Cost:</span>
                            <p className="font-medium text-green-600">${recommendation.totalCost.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Days until stockout: {recommendation.daysUntilStockout}</span>
                          <span>Daily usage: {recommendation.averageDailyUsage}</span>
                          <span>Lead time: {recommendation.leadTimeDays} days</span>
                          {recommendation.supplierName && (
                            <span>Supplier: {recommendation.supplierName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
