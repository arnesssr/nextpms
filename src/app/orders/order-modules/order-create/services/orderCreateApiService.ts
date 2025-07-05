import { CreateOrderRequest, OrderItem, ValidationError } from '../types';

export class OrderCreateApiService {
  /**
   * Validate order item
   */
  static validateOrderItem(item: OrderItem): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!item.productId) {
      errors.push({
        field: 'productId',
        message: 'Product is required'
      });
    }

    if (!item.quantity || item.quantity <= 0) {
      errors.push({
        field: 'quantity',
        message: 'Quantity must be greater than 0'
      });
    }

    if (!item.unitPrice || item.unitPrice <= 0) {
      errors.push({
        field: 'unitPrice',
        message: 'Unit price must be greater than 0'
      });
    }

    return errors;
  }

  /**
   * Validate complete order
   */
  static validateOrder(order: CreateOrderRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!order.customerId) {
      errors.push({
        field: 'customerId',
        message: 'Customer is required'
      });
    }

    if (!order.items || order.items.length === 0) {
      errors.push({
        field: 'items',
        message: 'At least one item is required'
      });
    }

    if (!order.shippingAddress?.trim()) {
      errors.push({
        field: 'shippingAddress',
        message: 'Shipping address is required'
      });
    }

    if (!order.paymentMethod) {
      errors.push({
        field: 'paymentMethod',
        message: 'Payment method is required'
      });
    }

    // Validate each item
    order.items?.forEach((item, index) => {
      const itemErrors = this.validateOrderItem(item);
      itemErrors.forEach(error => {
        errors.push({
          field: `items[${index}].${error.field}`,
          message: `Item ${index + 1}: ${error.message}`
        });
      });
    });

    return errors;
  }

  /**
   * Calculate order totals
   */
  static calculateOrderTotals(items: OrderItem[]) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.08; // 8% tax rate - this should be configurable
    const tax = subtotal * taxRate;
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total
    };
  }

  /**
   * Format order for API submission
   */
  static formatOrderForSubmission(orderData: CreateOrderRequest, items: OrderItem[]) {
    const totals = this.calculateOrderTotals(items);

    return {
      customerId: orderData.customerId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes || '',
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      total: totals.total,
      status: 'pending'
    };
  }

  /**
   * Generate order summary for display
   */
  static generateOrderSummary(orderData: CreateOrderRequest, items: OrderItem[]): string {
    const totals = this.calculateOrderTotals(items);
    
    const itemsText = items.map((item, index) => 
      `${index + 1}. ${item.productName} - Qty: ${item.quantity} × $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}`
    ).join('\n');

    return `
Order Summary:
${itemsText}

Subtotal: $${totals.subtotal.toFixed(2)}
Tax: $${totals.tax.toFixed(2)}
Shipping: $${totals.shipping.toFixed(2)}
Total: $${totals.total.toFixed(2)}

Payment Method: ${orderData.paymentMethod}
Shipping Address: ${orderData.shippingAddress}
${orderData.notes ? `Notes: ${orderData.notes}` : ''}
    `.trim();
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

  /**
   * Check product availability
   */
  static async checkProductAvailability(productId: string, quantity: number): Promise<{
    available: boolean;
    stock: number;
    message?: string;
  }> {
    try {
      const response = await fetch(`/api/products/${productId}/availability?quantity=${quantity}`);
      
      if (!response.ok) {
        throw new Error('Failed to check product availability');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error checking product availability:', error);
      return {
        available: false,
        stock: 0,
        message: 'Could not verify product availability'
      };
    }
  }

  /**
   * Generate order templates for common scenarios
   */
  static getOrderTemplates() {
    return [
      {
        name: 'Standard Order',
        description: 'Regular customer order with standard shipping',
        paymentMethod: 'credit_card'
      },
      {
        name: 'Bulk Order',
        description: 'Large quantity order with special handling',
        paymentMethod: 'bank_transfer'
      },
      {
        name: 'Express Order',
        description: 'Rush order with expedited shipping',
        paymentMethod: 'credit_card'
      }
    ];
  }
}
