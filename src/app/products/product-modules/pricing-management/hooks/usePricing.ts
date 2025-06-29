import { useState, useEffect } from 'react';
import { ProductPrice, PriceUpdateRequest, BulkPriceUpdateRequest, PricingAnalyticsResponse } from '../types';
import { pricingService } from '../services/pricingService';

interface UsePricingState {
  prices: ProductPrice[];
  analytics: PricingAnalyticsResponse | null;
  loading: boolean;
  error: string | null;
}

interface UsePricingActions {
  fetchProductPrices: (productId: string) => Promise<void>;
  updatePrice: (request: PriceUpdateRequest) => Promise<void>;
  bulkUpdatePrices: (request: BulkPriceUpdateRequest) => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  calculateOptimalPrice: (costPrice: number, targetMargin: number) => number;
  calculateProfitMargin: (costPrice: number, sellingPrice: number) => number;
  calculateMarkup: (costPrice: number, sellingPrice: number) => number;
  validatePriceUpdate: (request: PriceUpdateRequest) => { isValid: boolean; errors: string[] };
}

export const usePricing = (): UsePricingState & UsePricingActions => {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [analytics, setAnalytics] = useState<PricingAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductPrices = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const productPrices = await pricingService.getProductPrices(productId);
      setPrices(productPrices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product prices';
      setError(errorMessage);
      console.error('Error fetching product prices:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (request: PriceUpdateRequest) => {
    setLoading(true);
    setError(null);
    try {
      // Validate the request first
      const validation = pricingService.validatePriceUpdate(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const updatedPrice = await pricingService.updateProductPrice(request);
      
      // Update the prices state
      setPrices(prevPrices => {
        const existingIndex = prevPrices.findIndex(
          p => p.product_id === request.product_id && p.price_type === request.price_type
        );
        
        if (existingIndex >= 0) {
          // Update existing price
          const newPrices = [...prevPrices];
          newPrices[existingIndex] = updatedPrice;
          return newPrices;
        } else {
          // Add new price
          return [...prevPrices, updatedPrice];
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update price';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdatePrices = async (request: BulkPriceUpdateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPrices = await pricingService.bulkUpdatePrices(request);
      
      // Update prices for all affected products
      setPrices(prevPrices => {
        const newPrices = [...prevPrices];
        updatedPrices.forEach(updatedPrice => {
          const existingIndex = newPrices.findIndex(
            p => p.product_id === updatedPrice.product_id && p.price_type === updatedPrice.price_type
          );
          
          if (existingIndex >= 0) {
            newPrices[existingIndex] = updatedPrice;
          } else {
            newPrices.push(updatedPrice);
          }
        });
        return newPrices;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update prices';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const analyticsData = await pricingService.getPricingAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pricing analytics';
      setError(errorMessage);
      console.error('Error fetching pricing analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOptimalPrice = (costPrice: number, targetMargin: number): number => {
    return pricingService.calculateOptimalPrice(costPrice, targetMargin);
  };

  const calculateProfitMargin = (costPrice: number, sellingPrice: number): number => {
    return pricingService.calculateProfitMargin(costPrice, sellingPrice);
  };

  const calculateMarkup = (costPrice: number, sellingPrice: number): number => {
    return pricingService.calculateMarkup(costPrice, sellingPrice);
  };

  const validatePriceUpdate = (request: PriceUpdateRequest): { isValid: boolean; errors: string[] } => {
    return pricingService.validatePriceUpdate(request);
  };

  // Load initial analytics on mount
  useEffect(() => {
    refreshAnalytics();
  }, []);

  return {
    prices,
    analytics,
    loading,
    error,
    fetchProductPrices,
    updatePrice,
    bulkUpdatePrices,
    refreshAnalytics,
    calculateOptimalPrice,
    calculateProfitMargin,
    calculateMarkup,
    validatePriceUpdate,
  };
};
