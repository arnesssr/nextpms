import { PriceHistory } from '../types';
import { supabase } from '@/lib/supabaseClient';

interface CreatePriceHistoryEntryParams {
  product_id: string;
  old_price: number;
  new_price: number;
  old_cost_price?: number;
  new_cost_price?: number;
  change_reason: string;
  change_type: string;
  changed_by: string;
}

export const priceHistoryService = {
  // Debug method to check table schema and data
  async debugPriceHistory(): Promise<{ tableExists: boolean; sampleData: any[]; errorDetails?: string }> {
    try {
      console.log('🔍 Debugging price_history table...');
      
      // Try to fetch a small sample to check table structure
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .limit(5);
        
      if (error) {
        console.error('❌ Error accessing price_history table:', error);
        return {
          tableExists: false,
          sampleData: [],
          errorDetails: error.message
        };
      }
      
      console.log('✅ Price history table accessible');
      console.log('📊 Sample data:', data);
      
      return {
        tableExists: true,
        sampleData: data || [],
        errorDetails: undefined
      };
    } catch (error) {
      console.error('💥 Exception in debugPriceHistory:', error);
      return {
        tableExists: false,
        sampleData: [],
        errorDetails: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  // Get price history for a specific product
  async getProductPriceHistory(productId: string): Promise<PriceHistory[]> {
    try {
      // Try with 'created_at' first (newer schema)
      let { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      // If error mentions 'created_at', try with 'changed_at' (legacy schema)
      if (error && error.message.includes('created_at')) {
        const legacyResult = await supabase
          .from('price_history')
          .select('*')
          .eq('product_id', productId)
          .order('changed_at', { ascending: false });
        
        data = legacyResult.data;
        error = legacyResult.error;
      }

      if (error) {
        console.error('Supabase error fetching price history:', error);
        return [];
      }

      // Normalize the timestamp field
      const normalizedData = (data || []).map(entry => ({
        ...entry,
        changed_at: entry.created_at || entry.changed_at || new Date().toISOString()
      }));

      return normalizedData;
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    }
  },

  // Get recent price changes across all products
  async getRecentPriceChanges(limit: number = 20): Promise<PriceHistory[]> {
    try {
      // First try with 'created_at' (newer schema)
      let { data, error } = await supabase
        .from('price_history')
        .select(`
          *,
          products!inner(
            id,
            name,
            sku
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // If error and it mentions 'created_at', try with 'changed_at' (legacy schema)
      if (error && error.message.includes('created_at')) {
        const legacyResult = await supabase
          .from('price_history')
          .select(`
            *,
            products!inner(
              id,
              name,
              sku
            )
          `)
          .order('changed_at', { ascending: false })
          .limit(limit);
        
        data = legacyResult.data;
        error = legacyResult.error;
      }

      if (error) {
        console.error('Supabase error fetching recent price changes:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }

      if (!data || data.length === 0) {
        console.log('No price history data found');
        return [];
      }

      // Transform the data to include product information
      const transformedData = (data || []).map(entry => {
        // Handle both created_at and changed_at field names
        const timestamp = entry.created_at || entry.changed_at || new Date().toISOString();
        
        return {
          ...entry,
          changed_at: timestamp, // Normalize to changed_at for consistency with type
          product_name: entry.products?.name || 'Unknown Product',
          product_sku: entry.products?.sku || 'No SKU'
        };
      });

      console.log(`Fetched ${transformedData.length} recent price changes`);
      return transformedData;
    } catch (error) {
      console.error('Error fetching recent price changes:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  // Get price trends for a product (for charts)
  async getPriceTrends(productId: string, days: number = 30): Promise<Array<{date: string, price: number}>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('price_history')
        .select('new_price, changed_at')
        .eq('product_id', productId)
        .gte('changed_at', startDate.toISOString())
        .order('changed_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching price trends:', error);
        // Fallback to current product price
        const { data: product } = await supabase
          .from('products')
          .select('selling_price')
          .eq('id', productId)
          .single();
          
        const currentPrice = product?.selling_price || 0;
        return [{
          date: new Date().toISOString().split('T')[0],
          price: currentPrice
        }];
      }
      
      if (!data || data.length === 0) {
        // If no history, get current price
        const { data: product } = await supabase
          .from('products')
          .select('selling_price')
          .eq('id', productId)
          .single();
          
        const currentPrice = product?.selling_price || 0;
        return [{
          date: new Date().toISOString().split('T')[0],
          price: currentPrice
        }];
      }
      
      return data.map(entry => ({
        date: entry.changed_at.split('T')[0],
        price: entry.new_price
      }));
    } catch (error) {
      console.error('Error fetching price trends:', error);
      throw new Error('Failed to fetch price trends');
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
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .gte('changed_at', startDate.toISOString());
        
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || data.length === 0) {
        return {
          total_changes: 0,
          avg_price_increase: 0,
          avg_price_decrease: 0,
          most_common_reason: 'No recent changes',
          products_with_changes: 0
        };
      }
      
      const increases = data.filter(entry => entry.new_price > entry.old_price);
      const decreases = data.filter(entry => entry.new_price < entry.old_price);
      const uniqueProducts = new Set(data.map(entry => entry.product_id)).size;
      
      const avgIncrease = increases.length > 0 ? 
        increases.reduce((sum, entry) => sum + (entry.new_price - entry.old_price), 0) / increases.length : 0;
      
      const avgDecrease = decreases.length > 0 ? 
        decreases.reduce((sum, entry) => sum + (entry.old_price - entry.new_price), 0) / decreases.length : 0;
      
      // Find most common reason
      const reasonCounts = data.reduce((acc, entry) => {
        acc[entry.change_reason] = (acc[entry.change_reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostCommonReason = Object.entries(reasonCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data';
      
      return {
        total_changes: data.length,
        avg_price_increase: avgIncrease,
        avg_price_decrease: avgDecrease,
        most_common_reason: mostCommonReason,
        products_with_changes: uniqueProducts
      };
    } catch (error) {
      console.error('Error fetching price change stats:', error);
      throw new Error('Failed to fetch price change statistics');
    }
  },

  // Test utility to manually create a sample price history entry
  async createTestPriceHistoryEntry(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🧪 Creating test price history entry...');
      
      // First, get a product to use for testing
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, name, selling_price, base_price')
        .not('selling_price', 'is', null)
        .limit(1);
        
      if (productError) {
        return {
          success: false,
          message: `Error fetching products: ${productError.message}`
        };
      }
      
      if (!products || products.length === 0) {
        return {
          success: false,
          message: 'No products found with pricing data'
        };
      }
      
      const testProduct = products[0];
      const oldPrice = testProduct.selling_price;
      const newPrice = oldPrice * 1.1; // 10% increase for testing
      
      // Try creating with the simpler schema (matching actual table)
      const testData = {
        product_id: testProduct.id,
        old_price: oldPrice,
        new_price: newPrice,
        change_type: 'manual_update',
        change_reason: 'Test price history entry',
        changed_by: 'debug_test',
        changed_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('price_history')
        .insert(testData)
        .select()
        .single();
      
      if (error) {
        return {
          success: false,
          message: `Error creating test entry: ${error.message}`,
          data: { testData, error }
        };
      }
      
      console.log('✅ Test price history entry created successfully:', data);
      
      return {
        success: true,
        message: `Test entry created for product: ${testProduct.name}`,
        data: data
      };
    } catch (error) {
      console.error('💥 Exception creating test price history entry:', error);
      return {
        success: false,
        message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },

  // Create price history entry
  async createPriceHistoryEntry(entry: Omit<PriceHistory, 'id' | 'changed_at'>): Promise<PriceHistory> {
    try {
      // Use the simple schema that matches the actual table
      const entryData = {
        product_id: entry.product_id,
        old_price: entry.old_price,
        new_price: entry.new_price,
        change_type: entry.change_type,
        change_reason: entry.change_reason,
        changed_by: entry.changed_by || 'system',
        changed_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('price_history')
        .insert(entryData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating price history entry:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error creating price history entry:', error);
      throw new Error('Failed to create price history entry');
    }
  }
};

export default priceHistoryService;
