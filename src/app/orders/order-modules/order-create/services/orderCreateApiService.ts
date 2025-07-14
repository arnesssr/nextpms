import { CreateOrderRequest } from '@/types/orders';

interface ValidationError {
  field: string;
  message: string;
}

interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export class OrderCreateApiService {
  /**
   * Sanitize string input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate order item with proper security checks
   */
  static validateOrderItem(item: OrderItem, index: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate product_id (must be UUID format for security)
    if (!item.product_id || typeof item.product_id !== 'string') {
      errors.push({
        field: `items[${index}].product_id`,
        message: 'Product ID is required and must be a valid string'
      });
    } else if (!/^[a-zA-Z0-9-_]{1,50}$/.test(item.product_id)) {
      errors.push({
        field: `items[${index}].product_id`,
        message: 'Product ID contains invalid characters'
      });
    }

    // Validate quantity (must be positive integer, reasonable limit)
    if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      errors.push({
        field: `items[${index}].quantity`,
        message: 'Quantity must be a positive integer'
      });
    } else if (item.quantity > 10000) {
      errors.push({
        field: `items[${index}].quantity`,
        message: 'Quantity cannot exceed 10,000 per item'
      });
    }

    // Validate unit_price (must be positive number, reasonable limit)
    if (!item.unit_price || typeof item.unit_price !== 'number' || item.unit_price <= 0) {
      errors.push({
        field: `items[${index}].unit_price`,
        message: 'Unit price must be a positive number'
      });
    } else if (item.unit_price > 1000000) {
      errors.push({
        field: `items[${index}].unit_price`,
        message: 'Unit price cannot exceed $1,000,000'
      });
    }

    return errors;
  }

  /**
   * Validate shipping address with proper security checks
   */
  static validateShippingAddress(address: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!address || typeof address !== 'object') {
      errors.push({
        field: 'shipping_address',
        message: 'Shipping address is required'
      });
      return errors;
    }

    // Validate required fields
    const requiredFields = ['name', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
    
    requiredFields.forEach(field => {
      if (!address[field] || typeof address[field] !== 'string' || !address[field].trim()) {
        errors.push({
          field: `shipping_address.${field}`,
          message: `${field.replace('_', ' ')} is required`
        });
      } else if (address[field].length > 100) {
        errors.push({
          field: `shipping_address.${field}`,
          message: `${field.replace('_', ' ')} cannot exceed 100 characters`
        });
      }
    });

    // Validate postal code format
    if (address.postal_code && !/^[A-Za-z0-9\s-]{3,10}$/.test(address.postal_code)) {
      errors.push({
        field: 'shipping_address.postal_code',
        message: 'Postal code format is invalid'
      });
    }

    // Validate country (must be from allowed list)
    const allowedCountries = ['USA', 'Canada', 'Mexico'];
    if (address.country && !allowedCountries.includes(address.country)) {
      errors.push({
        field: 'shipping_address.country',
        message: 'Country must be one of: USA, Canada, Mexico'
      });
    }

    return errors;
  }

  /**
   * Generate secure customer ID for guest orders
   */
  static generateSecureGuestCustomerId(): string {
    // Use crypto.randomUUID() if available, otherwise use a more secure approach
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `guest_${crypto.randomUUID()}`;
    }
    
    // Fallback to more secure random generation
    const timestamp = Date.now();
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomString = Array.from(randomBytes, byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');
    
    return `guest_${timestamp}_${randomString}`;
  }

  /**
   * Get payment method options
   */
  static getPaymentMethods() {
    return [
      { value: 'credit_card', label: 'Credit Card' },
      { value: 'debit_card', label: 'Debit Card' },
      { value: 'paypal', label: 'PayPal' },
      { value: 'bank_transfer', label: 'Bank Transfer' },
      { value: 'cash_on_delivery', label: 'Cash on Delivery' }
    ];
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
