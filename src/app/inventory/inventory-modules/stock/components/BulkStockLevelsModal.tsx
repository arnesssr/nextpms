'use client';

import { useState, useEffect } from 'react';
import { X, Settings, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface BulkStockLevelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface StockLevelsStatus {
  totalItems: number;
  itemsWithBothLevels: number;
  itemsWithoutMinLevel: number;
  itemsWithoutMaxLevel: number;
  setupRecommended: boolean;
}

export default function BulkStockLevelsModal({
  isOpen,
  onClose,
  onSuccess
}: BulkStockLevelsModalProps) {
  const [defaultMinLevel, setDefaultMinLevel] = useState(10);
  const [defaultMaxLevel, setDefaultMaxLevel] = useState(100);
  const [updateOnlyZero, setUpdateOnlyZero] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StockLevelsStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch current status when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/inventory/set-stock-levels');
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Failed to load current status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/inventory/set-stock-levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          defaultMinLevel,
          defaultMaxLevel,
          updateOnlyZero
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update stock levels');
      }

      const result = await response.json();
      setSuccess(result.message);
      
      // Refresh status
      await fetchStatus();
      
      // Notify parent of success
      onSuccess?.();
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'An error occurred while updating stock levels');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border border-gray-200 w-11/12 max-w-3xl shadow-2xl rounded-xl bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Bulk Stock Levels Setup
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Current Status */}
        {status && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Items:</span>
                <span className="ml-2 font-medium">{status.totalItems}</span>
              </div>
              <div>
                <span className="text-gray-500">Fully Configured:</span>
                <span className="ml-2 font-medium text-green-600">{status.itemsWithBothLevels}</span>
              </div>
              <div>
                <span className="text-gray-500">Missing Min Level:</span>
                <span className="ml-2 font-medium text-orange-600">{status.itemsWithoutMinLevel}</span>
              </div>
              <div>
                <span className="text-gray-500">Missing Max Level:</span>
                <span className="ml-2 font-medium text-orange-600">{status.itemsWithoutMaxLevel}</span>
              </div>
            </div>
            
            {status.setupRecommended && (
              <div className="mt-3 flex items-center space-x-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Setup recommended for {status.itemsWithoutMinLevel + status.itemsWithoutMaxLevel} items
                </span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configuration Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Minimum Level
              </label>
              <input
                type="number"
                value={defaultMinLevel}
                onChange={(e) => setDefaultMinLevel(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Base minimum quantity for all items
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Maximum Level
              </label>
              <input
                type="number"
                value={defaultMaxLevel}
                onChange={(e) => setDefaultMaxLevel(Number(e.target.value))}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Base maximum quantity for all items
              </p>
            </div>
          </div>

          {/* Update Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Update Strategy
            </label>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="updateOnlyZero"
                  name="updateStrategy"
                  checked={updateOnlyZero}
                  onChange={() => setUpdateOnlyZero(true)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <label htmlFor="updateOnlyZero" className="text-sm font-medium text-gray-700">
                    Conservative Update (Recommended)
                  </label>
                  <p className="text-xs text-gray-500">
                    Only update items with missing or zero min/max levels
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="updateAll"
                  name="updateStrategy"
                  checked={!updateOnlyZero}
                  onChange={() => setUpdateOnlyZero(false)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <label htmlFor="updateAll" className="text-sm font-medium text-gray-700">
                    Complete Override
                  </label>
                  <p className="text-xs text-gray-500">
                    Update all items with the new min/max levels
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Algorithm Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Smart Calculation</h4>
                <p className="text-sm text-blue-700">
                  The system calculates intelligent min/max levels based on current stock:
                </p>
                <ul className="text-xs text-blue-600 mt-1 space-y-1">
                  <li>• Minimum = Max(default minimum, 20% of current stock)</li>
                  <li>• Maximum = Max(default maximum, 200% of current stock)</li>
                  <li>• Ensures realistic thresholds based on actual inventory</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              <span>{isLoading ? 'Updating...' : 'Update Stock Levels'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
