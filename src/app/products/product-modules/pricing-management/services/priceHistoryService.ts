import { PriceHistory } from '../types';

export const priceHistoryService = {
  // Get price history for a specific product
  async getProductPriceHistory(productId: string): Promise<PriceHistory[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockHistory: PriceHistory[] = [
        {
          id: '1',
          product_id: productId,
          old_price: 89.99,
          new_price: 99.99,
          old_cost_price: 55.00,
          new_cost_price: 60.00,
          change_reason: 'Supplier cost increase',
          change_type: 'cost_change',
          changed_by: 'admin',
          changed_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          product_id: productId,
          old_price: 79.99,
          new_price: 89.99,
          change_reason: 'Market positioning adjustment',
          change_type: 'manual_update',
          changed_by: 'pricing_manager',
          changed_at: '2024-01-01T09:00:00Z'
        },
        {
          id: '3',
          product_id: productId,
          old_price: 84.99,
          new_price: 79.99,
          change_reason: 'Holiday promotion',
          change_type: 'promotion',
          changed_by: 'marketing',
          changed_at: '2023-12-15T08:00:00Z'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockHistory.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw new Error('Failed to fetch price history');
    }
  },

  // Get recent price changes across all products
  async getRecentPriceChanges(limit: number = 20): Promise<PriceHistory[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockRecentChanges: PriceHistory[] = [
        {
          id: '1',
          product_id: '1',
          old_price: 89.99,
          new_price: 99.99,
          change_reason: 'Supplier cost increase',
          change_type: 'cost_change',
          changed_by: 'admin',
          changed_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          product_id: '2',
          old_price: 49.99,
          new_price: 54.99,
          change_reason: 'Competitor analysis adjustment',
          change_type: 'manual_update',
          changed_by: 'pricing_manager',
          changed_at: '2024-01-14T15:45:00Z'
        },
        {
          id: '3',
          product_id: '3',
          old_price: 19.99,
          new_price: 17.99,
          change_reason: 'Flash sale promotion',
          change_type: 'promotion',
          changed_by: 'marketing',
          changed_at: '2024-01-14T12:00:00Z'
        },
        {
          id: '4',
          product_id: '4',
          old_price: 129.99,
          new_price: 139.99,
          change_reason: 'Premium positioning',
          change_type: 'manual_update',
          changed_by: 'product_manager',
          changed_at: '2024-01-13T11:20:00Z'
        },
        {
          id: '5',
          product_id: '5',
          old_price: 75.00,
          new_price: 85.00,
          change_reason: 'Material cost increase',
          change_type: 'cost_change',
          changed_by: 'system',
          changed_at: '2024-01-12T09:15:00Z'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockRecentChanges
        .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent price changes:', error);
      throw new Error('Failed to fetch recent price changes');
    }
  },

  // Get price trends for a product (for charts)
  async getPriceTrends(productId: string, days: number = 30): Promise<Array<{date: string, price: number}>> {
    try {
      // Mock implementation - replace with actual API call
      const trends: Array<{date: string, price: number}> = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Generate mock trend data
      let currentPrice = 89.99;
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Add some random variation
        const variation = (Math.random() - 0.5) * 2; // -1 to 1
        currentPrice += variation;
        
        trends.push({
          date: date.toISOString().split('T')[0],
          price: Math.round(currentPrice * 100) / 100
        });
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return trends;
    } catch (error) {
      console.error('Error fetching price trends:', error);
      throw new Error('Failed to fetch price trends');
    }
  },

  // Create price history entry
  async createPriceHistoryEntry(entry: Omit<PriceHistory, 'id' | 'changed_at'>): Promise<PriceHistory> {
    try {
      // Mock implementation - replace with actual API call
      const newEntry: PriceHistory = {
        ...entry,
        id: Date.now().toString(),
        changed_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return newEntry;
    } catch (error) {
      console.error('Error creating price history entry:', error);
      throw new Error('Failed to create price history entry');
    }
  },

  // Get price change statistics
  async getPriceChangeStats(days: number = 30): Promise<{
    total_changes: number;
    avg_price_increase: number;
    avg_price_decrease: number;
    most_common_reason: string;
    products_with_changes: number;
  }> {
    try {
      // Mock implementation - replace with actual API call
      const stats = {
        total_changes: 47,
        avg_price_increase: 8.5,
        avg_price_decrease: -12.3,
        most_common_reason: 'Supplier cost changes',
        products_with_changes: 23
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return stats;
    } catch (error) {
      console.error('Error fetching price change stats:', error);
      throw new Error('Failed to fetch price change statistics');
    }
  }
};
