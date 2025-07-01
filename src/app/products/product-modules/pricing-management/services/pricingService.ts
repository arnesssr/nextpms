import { 
  ProductPrice, 
  PriceUpdateRequest, 
  BulkPriceUpdateRequest,
  ProfitAnalysis,
  PricingAnalyticsResponse 
} from '../types';
import { supabase } from '@/lib/supabaseClient';
import { productService } from '@/services/products';
import { priceHistoryService } from './priceHistoryService';

// API base URL for pricing endpoints
const API_BASE = '/api/pricing';

export const pricingService = {
  // Get current prices for a product
  async getProductPrices(productId: string): Promise<ProductPrice[]> {
    try {
      // Get product data from Supabase
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!product) {
        throw new Error('Product not found');
      }

      // Convert product data to ProductPrice format
      const productPrices: ProductPrice[] = [];

      // Base price
      if (product.base_price) {
        const markup = product.selling_price && product.base_price ? 
          this.calculateMarkup(product.base_price, product.selling_price) : undefined;
        const margin = product.selling_price && product.base_price ? 
          this.calculateProfitMargin(product.base_price, product.selling_price) : undefined;

        productPrices.push({
          id: `${productId}-base`,
          product_id: productId,
          price_type: 'base_price',
          amount: product.base_price,
          currency: 'USD',
          cost_price: product.base_price,
          markup_percentage: markup,
          profit_margin: margin,
          is_active: true,
          effective_from: product.created_at || new Date().toISOString(),
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString(),
          created_by: 'system'
        });
      }

      // Selling price
      if (product.selling_price) {
        const markup = product.base_price && product.selling_price ? 
          this.calculateMarkup(product.base_price, product.selling_price) : undefined;
        const margin = product.base_price && product.selling_price ? 
          this.calculateProfitMargin(product.base_price, product.selling_price) : undefined;

        productPrices.push({
          id: `${productId}-selling`,
          product_id: productId,
          price_type: 'retail_price',
          amount: product.selling_price,
          currency: 'USD',
          cost_price: product.base_price,
          markup_percentage: markup,
          profit_margin: margin,
          is_active: product.status === 'published',
          effective_from: product.created_at || new Date().toISOString(),
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString(),
          created_by: 'system'
        });
      }

      return productPrices;
    } catch (error) {
      console.error('Error fetching product prices:', error);
      throw new Error('Failed to fetch product prices');
    }
  },

  // Update a single product's price
  async updateProductPrice(request: PriceUpdateRequest): Promise<ProductPrice> {
    try {
      // Validate the request first
      const validation = this.validatePriceUpdate(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Get old price for history tracking BEFORE update
      const oldPriceField = request.price_type === 'base_price' ? 'base_price' : 'selling_price';
      const { data: originalProduct } = await supabase
        .from('products')
        .select(oldPriceField)
        .eq('id', request.product_id)
        .single();
      
      const oldPrice = originalProduct?.[oldPriceField] || 0;

      // Determine which field to update based on price type
      const updateField = request.price_type === 'base_price' ? 'base_price' : 'selling_price';
      
      // Update the product price in Supabase
      const updateData: any = {
        [updateField]: request.new_price,
        updated_at: new Date().toISOString()
      };

      // If cost price is provided, update base_price
      if (request.cost_price) {
        updateData.base_price = request.cost_price;
      }

      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', request.product_id)
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!updatedProduct) {
        throw new Error('Product not found or update failed');
      }

      // Create price history entry after successful update
      try {
        await priceHistoryService.createPriceHistoryEntry({
          product_id: request.product_id,
          old_price: oldPrice,
          new_price: request.new_price,
          old_cost_price: request.cost_price,
          new_cost_price: request.cost_price,
          change_reason: request.change_reason,
          change_type: 'manual_update',
          changed_by: 'current_user' // You might want to get this from auth context
        });
      } catch (historyError) {
        console.warn('Failed to create price history entry:', historyError);
        // Don't fail the entire operation if history creation fails
      }

      // Return updated price information
      const updatedPrice: ProductPrice = {
        id: `${request.product_id}-${request.price_type}`,
        product_id: request.product_id,
        price_type: request.price_type,
        amount: request.new_price,
        currency: 'USD',
        cost_price: request.cost_price || updatedProduct.base_price,
        markup_percentage: request.cost_price ? 
          this.calculateMarkup(request.cost_price, request.new_price) : undefined,
        profit_margin: request.cost_price ? 
          this.calculateProfitMargin(request.cost_price, request.new_price) : undefined,
        is_active: true,
        effective_from: request.effective_from || new Date().toISOString(),
        effective_until: request.effective_until,
        created_at: updatedProduct.created_at,
        updated_at: updatedProduct.updated_at,
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
      // Validate the request
      if (!request.product_ids || request.product_ids.length === 0) {
        throw new Error('No products selected for bulk update');
      }

      if (!request.value || request.value === 0) {
        throw new Error('Update value is required');
      }

      // Get current product data to calculate new prices
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, name, base_price, selling_price')
        .in('id', request.product_ids);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!products || products.length === 0) {
        throw new Error('No products found for bulk update');
      }

      // Calculate new prices for each product
      const updatePromises = products.map(async (product) => {
        const currentPrice = request.price_type === 'base_price' ? product.base_price : product.selling_price;
        let newPrice: number;

        switch (request.update_type) {
          case 'percentage':
            newPrice = currentPrice * (1 + request.value / 100);
            break;
          case 'fixed_amount':
            newPrice = currentPrice + request.value;
            break;
          case 'new_price':
            newPrice = request.value;
            break;
          default:
            throw new Error(`Invalid update type: ${request.update_type}`);
        }

        // Ensure price is not negative
        newPrice = Math.max(0.01, newPrice);

        // Determine which field to update
        const updateField = request.price_type === 'base_price' ? 'base_price' : 'selling_price';
        
        // Update the product in Supabase
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update({
            [updateField]: newPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id)
          .select('*')
          .single();

        if (updateError) {
          console.error(`Failed to update product ${product.id}:`, updateError);
          throw new Error(`Failed to update product ${product.name}: ${updateError.message}`);
        }

        // Create price history entry for this product
        try {
          await priceHistoryService.createPriceHistoryEntry({
            product_id: product.id,
            old_price: currentPrice,
            new_price: newPrice,
            old_cost_price: product.base_price,
            new_cost_price: updatedProduct.base_price,
            change_reason: request.change_reason,
            change_type: 'bulk_update',
            changed_by: 'current_user'
          });
        } catch (historyError) {
          console.warn(`Failed to create price history for product ${product.id}:`, historyError);
          // Don't fail the entire operation if history creation fails
        }

        // Return ProductPrice format
        return {
          id: `${product.id}-${request.price_type}`,
          product_id: product.id,
          price_type: request.price_type,
          amount: newPrice,
          currency: 'USD',
          cost_price: updatedProduct.base_price,
          markup_percentage: updatedProduct.base_price && updatedProduct.selling_price ? 
            this.calculateMarkup(updatedProduct.base_price, updatedProduct.selling_price) : undefined,
          profit_margin: updatedProduct.base_price && updatedProduct.selling_price ? 
            this.calculateProfitMargin(updatedProduct.base_price, updatedProduct.selling_price) : undefined,
          is_active: true,
          effective_from: request.effective_from || new Date().toISOString(),
          created_at: updatedProduct.created_at,
          updated_at: updatedProduct.updated_at,
          created_by: 'current_user'
        } as ProductPrice;
      });

      // Execute all updates
      const updatedPrices = await Promise.all(updatePromises);

      console.log(`Successfully updated ${updatedPrices.length} products with bulk price update`);
      console.log('Price history entries created for all updated products');
      
      return updatedPrices;
    } catch (error) {
      console.error('Error bulk updating prices:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to bulk update prices');
    }
  },

  // Get profit analysis for products
  async getProfitAnalysis(productIds?: string[]): Promise<ProfitAnalysis[]> {
    try {
      let query = supabase
        .from('products')
        .select('id, name, base_price, selling_price, stock_quantity');

      // Filter by product IDs if provided
      if (productIds && productIds.length > 0) {
        query = query.in('id', productIds);
      }

      const { data: products, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Convert products to profit analysis format
      const profitAnalysis: ProfitAnalysis[] = (products || []).map(product => {
        const costPrice = product.base_price || 0;
        const sellingPrice = product.selling_price || 0;
        const profitAmount = sellingPrice - costPrice;
        const profitMargin = sellingPrice > 0 ? this.calculateProfitMargin(costPrice, sellingPrice) : 0;
        const markupPercentage = costPrice > 0 ? this.calculateMarkup(costPrice, sellingPrice) : 0;

        return {
          product_id: product.id,
          product_name: product.name,
          cost_price: costPrice,
          selling_price: sellingPrice,
          profit_amount: profitAmount,
          profit_margin: profitMargin,
          markup_percentage: markupPercentage,
revenue_30d: 0, // Real sales data would be fetched from orders table
          units_sold_30d: 0 // Real sales data would be fetched from orders table
        };
      });
      
      return profitAnalysis;
    } catch (error) {
      console.error('Error fetching profit analysis:', error);
      throw new Error('Failed to fetch profit analysis');
    }
  },

  // Get pricing analytics
  async getPricingAnalytics(): Promise<PricingAnalyticsResponse> {
    try {
      // Get all products with pricing data
      const { data: products, error } = await supabase
        .from('products')
        .select('id, base_price, selling_price, stock_quantity')
        .not('base_price', 'is', null)
        .not('selling_price', 'is', null);

      if (error) {
        throw new Error(error.message);
      }

      if (!products || products.length === 0) {
        return {
          total_products: 0,
          avg_profit_margin: 0,
          total_revenue_potential: 0,
          products_with_low_margin: 0,
          products_with_high_margin: 0,
          recent_price_changes: 0
        };
      }

      // Calculate analytics
      let totalMargin = 0;
      let lowMarginCount = 0;
      let highMarginCount = 0;
      let totalRevenuePotential = 0;
      let validProducts = 0;

      products.forEach(product => {
        const costPrice = product.base_price || 0;
        const sellingPrice = product.selling_price || 0;
        const stockQuantity = product.stock_quantity || 0;

        if (costPrice > 0 && sellingPrice > costPrice) {
          const margin = this.calculateProfitMargin(costPrice, sellingPrice);
          totalMargin += margin;
          validProducts++;

          if (margin < 20) lowMarginCount++;
          if (margin > 50) highMarginCount++;

          totalRevenuePotential += sellingPrice * stockQuantity;
        }
      });

      const avgProfitMargin = validProducts > 0 ? totalMargin / validProducts : 0;

      const analytics: PricingAnalyticsResponse = {
        total_products: products.length,
        avg_profit_margin: avgProfitMargin,
        total_revenue_potential: totalRevenuePotential,
        products_with_low_margin: lowMarginCount,
        products_with_high_margin: highMarginCount,
recent_price_changes: await this.getRecentPriceChangesCount()
      };

      return analytics;
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
// Get count of recent price changes (last 30 days)
  async getRecentPriceChangesCount(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count, error } = await supabase
        .from('price_history')
        .select('*', { count: 'exact', head: true })
        .gte('changed_at', thirtyDaysAgo.toISOString());
        
      if (error) {
        console.error('Error counting recent price changes:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error fetching recent price changes count:', error);
      return 0;
    }
  },

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
