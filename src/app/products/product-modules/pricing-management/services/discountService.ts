import { Discount, DiscountCreateRequest } from '../types';

export const discountService = {
  // Get all active discounts
  async getActiveDiscounts(): Promise<Discount[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockDiscounts: Discount[] = [
        {
          id: '1',
          name: 'Summer Sale',
          description: '20% off electronics for summer promotion',
          discount_type: 'percentage',
          value: 20,
          applicable_categories: ['electronics'],
          start_date: '2024-06-01T00:00:00Z',
          end_date: '2024-08-31T23:59:59Z',
          is_active: true,
          usage_limit: 1000,
          used_count: 157,
          created_at: '2024-05-15T00:00:00Z',
          updated_at: '2024-05-15T00:00:00Z'
        },
        {
          id: '2', 
          name: 'Buy 2 Get 1 Free',
          description: 'Buy 2 phone cases, get 1 free',
          discount_type: 'buy_x_get_y',
          value: 1,
          min_quantity: 2,
          applicable_products: ['pc-001', 'pc-002', 'pc-003'],
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z',
          is_active: true,
          used_count: 45,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Bulk Order Discount',
          description: '$50 off orders over $500',
          discount_type: 'fixed_amount',
          value: 50,
          min_order_value: 500,
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z',
          is_active: true,
          used_count: 23,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockDiscounts.filter(discount => discount.is_active);
    } catch (error) {
      console.error('Error fetching active discounts:', error);
      throw new Error('Failed to fetch active discounts');
    }
  },

  // Get all discounts (active and inactive)
  async getAllDiscounts(): Promise<Discount[]> {
    try {
      // Mock implementation - replace with actual API call
      const activeDiscounts = await this.getActiveDiscounts();
      
      // Add some inactive discounts
      const inactiveDiscounts: Discount[] = [
        {
          id: '4',
          name: 'Black Friday 2023',
          description: 'Expired Black Friday promotion',
          discount_type: 'percentage',
          value: 50,
          start_date: '2023-11-24T00:00:00Z',
          end_date: '2023-11-26T23:59:59Z',
          is_active: false,
          used_count: 2841,
          created_at: '2023-11-01T00:00:00Z',
          updated_at: '2023-11-01T00:00:00Z'
        }
      ];

      return [...activeDiscounts, ...inactiveDiscounts];
    } catch (error) {
      console.error('Error fetching all discounts:', error);
      throw new Error('Failed to fetch discounts');
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

      // Mock implementation - replace with actual API call
      const newDiscount: Discount = {
        ...request,
        id: Date.now().toString(),
        is_active: true,
        used_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      return newDiscount;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw new Error('Failed to create discount');
    }
  },

  // Update existing discount
  async updateDiscount(id: string, updates: Partial<Discount>): Promise<Discount> {
    try {
      // Mock implementation - replace with actual API call
      const existingDiscount = await this.getDiscountById(id);
      if (!existingDiscount) {
        throw new Error('Discount not found');
      }

      const updatedDiscount: Discount = {
        ...existingDiscount,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return updatedDiscount;
    } catch (error) {
      console.error('Error updating discount:', error);
      throw new Error('Failed to update discount');
    }
  },

  // Delete discount
  async deleteDiscount(id: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      // In real implementation, you might want to soft delete or check usage
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error deleting discount:', error);
      throw new Error('Failed to delete discount');
    }
  },

  // Get discount by ID
  async getDiscountById(id: string): Promise<Discount | null> {
    try {
      const allDiscounts = await this.getAllDiscounts();
      return allDiscounts.find(discount => discount.id === id) || null;
    } catch (error) {
      console.error('Error fetching discount by ID:', error);
      throw new Error('Failed to fetch discount');
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
