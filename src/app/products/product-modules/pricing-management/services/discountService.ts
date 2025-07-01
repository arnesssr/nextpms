import { Discount, DiscountCreateRequest } from '../types';
import { supabase } from '@/lib/supabaseClient';

// Note: This service requires a 'discounts' table in Supabase
// If the table doesn't exist, methods will return empty arrays or throw errors

export const discountService = {
  // Get all active discounts
  async getActiveDiscounts(): Promise<Discount[]> {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching active discounts:', error);
        // Return empty array if table doesn't exist
        if (error.code === '42P01') {
          console.warn('Discounts table does not exist');
          return [];
        }
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching active discounts:', error);
      return []; // Return empty array on error to prevent UI crashes
    }
  },

  // Get all discounts (active and inactive)
  async getAllDiscounts(): Promise<Discount[]> {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching all discounts:', error);
        // Return empty array if table doesn't exist
        if (error.code === '42P01') {
          console.warn('Discounts table does not exist');
          return [];
        }
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all discounts:', error);
      return []; // Return empty array on error to prevent UI crashes
    }
  },

  // Create new discount
  async createDiscount(request: DiscountCreateRequest): Promise<Discount> {
    try {
      // Validate request
      const validation = this.validateDiscountRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const discountData = {
        ...request,
        is_active: true,
        used_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('discounts')
        .insert(discountData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating discount:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw new Error('Failed to create discount');
    }
  },

  // Update existing discount
  async updateDiscount(id: string, updates: Partial<Discount>): Promise<Discount> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('discounts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating discount:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Discount not found');
      }

      return data;
    } catch (error) {
      console.error('Error updating discount:', error);
      throw new Error('Failed to update discount');
    }
  },

  // Delete discount
  async deleteDiscount(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting discount:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      throw new Error('Failed to delete discount');
    }
  },

  // Get discount by ID
  async getDiscountById(id: string): Promise<Discount | null> {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Supabase error fetching discount by ID:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error fetching discount by ID:', error);
      return null;
    }
  },

  // Calculate discount amount for a given order
  calculateDiscountAmount(
    discount: Discount,
    orderValue: number,
    quantity: number = 1,
    applicableItems: number = 1
  ): number {
    switch (discount.discount_type) {
      case 'percentage':
        return (orderValue * discount.value) / 100;

      case 'fixed_amount':
        if (discount.min_order_value && orderValue < discount.min_order_value) {
          return 0;
        }
        return discount.value;

      case 'buy_x_get_y':
        if (discount.min_quantity && quantity >= discount.min_quantity) {
          // Calculate how many free items customer gets
          const freeItems = Math.floor(quantity / discount.min_quantity) * discount.value;
          // Assume each item has same value for simplicity
          const itemValue = orderValue / quantity;
          return freeItems * itemValue;
        }
        return 0;

      case 'bulk_discount':
        if (discount.min_quantity && quantity >= discount.min_quantity) {
          return (orderValue * discount.value) / 100;
        }
        return 0;

      default:
        return 0;
    }
  },

  // Check if discount is applicable
  isDiscountApplicable(
    discount: Discount,
    productIds: string[] = [],
    categoryIds: string[] = [],
    orderValue: number = 0,
    quantity: number = 1
  ): { applicable: boolean; reason?: string } {
    // Check if discount is active
    if (!discount.is_active) {
      return { applicable: false, reason: 'Discount is not active' };
    }

    // Check date range
    const now = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = new Date(discount.end_date);
    
    if (now < startDate || now > endDate) {
      return { applicable: false, reason: 'Discount is not within valid date range' };
    }

    // Check usage limit
    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      return { applicable: false, reason: 'Discount usage limit reached' };
    }

    // Check minimum order value
    if (discount.min_order_value && orderValue < discount.min_order_value) {
      return { 
        applicable: false, 
        reason: `Minimum order value of $${discount.min_order_value} required` 
      };
    }

    // Check minimum quantity
    if (discount.min_quantity && quantity < discount.min_quantity) {
      return { 
        applicable: false, 
        reason: `Minimum quantity of ${discount.min_quantity} required` 
      };
    }

    // Check maximum quantity
    if (discount.max_quantity && quantity > discount.max_quantity) {
      return { 
        applicable: false, 
        reason: `Maximum quantity of ${discount.max_quantity} exceeded` 
      };
    }

    // Check applicable products
    if (discount.applicable_products && discount.applicable_products.length > 0) {
      const hasApplicableProduct = productIds.some(id => 
        discount.applicable_products!.includes(id)
      );
      if (!hasApplicableProduct) {
        return { applicable: false, reason: 'No applicable products in order' };
      }
    }

    // Check applicable categories
    if (discount.applicable_categories && discount.applicable_categories.length > 0) {
      const hasApplicableCategory = categoryIds.some(id => 
        discount.applicable_categories!.includes(id)
      );
      if (!hasApplicableCategory) {
        return { applicable: false, reason: 'No applicable categories in order' };
      }
    }

    return { applicable: true };
  },

  // Validate discount request
  validateDiscountRequest(request: DiscountCreateRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.name || request.name.trim().length < 3) {
      errors.push('Discount name must be at least 3 characters');
    }

    if (request.value <= 0) {
      errors.push('Discount value must be greater than 0');
    }

    if (request.discount_type === 'percentage' && request.value > 100) {
      errors.push('Percentage discount cannot exceed 100%');
    }

    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }

    if (request.min_quantity && request.max_quantity && request.min_quantity > request.max_quantity) {
      errors.push('Minimum quantity cannot be greater than maximum quantity');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
