import { 
  ProductPrice, 
  PriceUpdateRequest, 
  BulkPriceUpdateRequest,
  ProfitAnalysis,
  PricingAnalyticsResponse 
} from '../types';

// Mock API base URL - replace with actual API
const API_BASE = '/api/pricing';

export const pricingService = {
  // Get current prices for a product
  async getProductPrices(productId: string): Promise<ProductPrice[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockPrices: ProductPrice[] = [
        {
          id: '1',
          product_id: productId,
          price_type: 'base_price',
          amount: 99.99,
          currency: 'USD',
          cost_price: 60.00,
          markup_percentage: 66.65,
          profit_margin: 39.99,
          is_active: true,
          effective_from: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: 'system'
        },
        {
          id: '2',
          product_id: productId,
          price_type: 'wholesale_price',
          amount: 79.99,
          currency: 'USD',
          cost_price: 60.00,
          markup_percentage: 33.32,
          profit_margin: 24.99,
          is_active: true,
          effective_from: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          created_by: 'system'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockPrices;
    } catch (error) {
      console.error('Error fetching product prices:', error);
      throw new Error('Failed to fetch product prices');
    }
  },

  // Update a single product's price
  async updateProductPrice(request: PriceUpdateRequest): Promise<ProductPrice> {
    try {
      // Mock implementation - replace with actual API call
      const response = await fetch(`${API_BASE}/products/${request.product_id}/prices`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to update product price');
      }

      // Return mock updated price
      const updatedPrice: ProductPrice = {
        id: Date.now().toString(),
        product_id: request.product_id,
        price_type: request.price_type,
        amount: request.new_price,
        currency: 'USD',
        cost_price: request.cost_price,
        markup_percentage: request.cost_price ? 
          ((request.new_price - request.cost_price) / request.cost_price) * 100 : undefined,
        profit_margin: request.cost_price ? 
          ((request.new_price - request.cost_price) / request.new_price) * 100 : undefined,
        is_active: true,
        effective_from: request.effective_from || new Date().toISOString(),
        effective_until: request.effective_until,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current_user'
      };

      return updatedPrice;
    } catch (error) {
      console.error('Error updating product price:', error);
      throw new Error('Failed to update product price');
    }
  },

  // Bulk update multiple product prices
  async bulkUpdatePrices(request: BulkPriceUpdateRequest): Promise<ProductPrice[]> {
    try {
      // Mock implementation - replace with actual API call
      const response = await fetch(`${API_BASE}/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to bulk update prices');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return mock updated prices
      const updatedPrices: ProductPrice[] = request.product_ids.map((productId, index) => ({
        id: (Date.now() + index).toString(),
        product_id: productId,
        price_type: request.price_type,
        amount: request.update_type === 'percentage' ? 100 * (1 + request.value / 100) : 
                request.update_type === 'fixed_amount' ? 100 + request.value : request.value,
        currency: 'USD',
        is_active: true,
        effective_from: request.effective_from || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current_user'
      }));

      return updatedPrices;
    } catch (error) {
      console.error('Error bulk updating prices:', error);
      throw new Error('Failed to bulk update prices');
    }
  },

  // Get profit analysis for products
  async getProfitAnalysis(productIds?: string[]): Promise<ProfitAnalysis[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockAnalysis: ProfitAnalysis[] = [
        {
          product_id: '1',
          product_name: 'Wireless Headphones',
          cost_price: 60.00,
          selling_price: 99.99,
          profit_amount: 39.99,
          profit_margin: 39.99,
          markup_percentage: 66.65,
          revenue_30d: 2999.70,
          units_sold_30d: 30
        },
        {
          product_id: '2',
          product_name: 'Bluetooth Speaker',
          cost_price: 25.00,
          selling_price: 49.99,
          profit_amount: 24.99,
          profit_margin: 49.98,
          markup_percentage: 99.96,
          revenue_30d: 999.80,
          units_sold_30d: 20
        },
        {
          product_id: '3',
          product_name: 'Phone Case',
          cost_price: 5.00,
          selling_price: 19.99,
          profit_amount: 14.99,
          profit_margin: 74.99,
          markup_percentage: 299.80,
          revenue_30d: 599.70,
          units_sold_30d: 30
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter by product IDs if provided
      if (productIds && productIds.length > 0) {
        return mockAnalysis.filter(analysis => productIds.includes(analysis.product_id));
      }
      
      return mockAnalysis;
    } catch (error) {
      console.error('Error fetching profit analysis:', error);
      throw new Error('Failed to fetch profit analysis');
    }
  },

  // Get pricing analytics
  async getPricingAnalytics(): Promise<PricingAnalyticsResponse> {
    try {
      // Mock implementation - replace with actual API call
      const mockAnalytics: PricingAnalyticsResponse = {
        total_products: 1250,
        avg_profit_margin: 35.8,
        total_revenue_potential: 125000.00,
        products_with_low_margin: 85, // <20% margin
        products_with_high_margin: 340, // >50% margin
        recent_price_changes: 23
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockAnalytics;
    } catch (error) {
      console.error('Error fetching pricing analytics:', error);
      throw new Error('Failed to fetch pricing analytics');
    }
  },

  // Calculate optimal price based on cost and target margin
  calculateOptimalPrice(costPrice: number, targetMargin: number): number {
    return costPrice / (1 - targetMargin / 100);
  },

  // Calculate profit margin percentage
  calculateProfitMargin(costPrice: number, sellingPrice: number): number {
    return ((sellingPrice - costPrice) / sellingPrice) * 100;
  },

  // Calculate markup percentage
  calculateMarkup(costPrice: number, sellingPrice: number): number {
    return ((sellingPrice - costPrice) / costPrice) * 100;
  },

  // Validate price update
  validatePriceUpdate(request: PriceUpdateRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (request.new_price <= 0) {
      errors.push('Price must be greater than 0');
    }

    if (request.cost_price && request.cost_price < 0) {
      errors.push('Cost price cannot be negative');
    }

    if (request.cost_price && request.new_price <= request.cost_price) {
      errors.push('Selling price should be higher than cost price');
    }

    if (!request.change_reason || request.change_reason.trim().length < 5) {
      errors.push('Change reason must be at least 5 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
