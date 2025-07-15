import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatOrderStatus,
  formatShippingAddress,
  calculateOrderTotal,
  validateOrderData,
  getStatusColor,
  getStatusIcon,
  sortOrdersByDate,
  filterOrdersByStatus,
  groupOrdersByCustomer,
  generateOrderSummary,
  formatTrackingInfo,
  validateReturnEligibility,
  calculateRefundAmount,
  formatCustomerName,
  validateShippingAddress,
  validatePaymentMethod,
  sanitizeOrderData,
  exportOrdersToCSV
} from '../order-list/services/orderListService';

describe('Order List Service Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(99.9)).toBe('$99.90');
      expect(formatCurrency(-50)).toBe('-$50.00');
    });

    it('should handle null/undefined values', () => {
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toMatch(/Jan 15, 2024/);
    });

    it('should handle string dates', () => {
      expect(formatDate('2024-01-15')).toMatch(/Jan 15, 2024/);
    });

    it('should handle invalid dates', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDate(undefined)).toBe('N/A');
      expect(formatDate('invalid')).toBe('N/A');
    });
  });

  describe('formatOrderStatus', () => {
    it('should format order statuses correctly', () => {
      expect(formatOrderStatus('pending')).toBe('Pending');
      expect(formatOrderStatus('processing')).toBe('Processing');
      expect(formatOrderStatus('shipped')).toBe('Shipped');
      expect(formatOrderStatus('delivered')).toBe('Delivered');
      expect(formatOrderStatus('cancelled')).toBe('Cancelled');
    });

    it('should handle unknown statuses', () => {
      expect(formatOrderStatus('unknown')).toBe('Unknown');
      expect(formatOrderStatus('')).toBe('Unknown');
      expect(formatOrderStatus(null)).toBe('Unknown');
    });
  });

  describe('formatShippingAddress', () => {
    it('should format complete addresses', () => {
      const address = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'USA'
      };
      expect(formatShippingAddress(address)).toBe('123 Main St, Anytown, CA 12345, USA');
    });

    it('should handle partial addresses', () => {
      const address = {
        street: '123 Main St',
        city: 'Anytown'
      };
      expect(formatShippingAddress(address)).toBe('123 Main St, Anytown');
    });

    it('should handle null/undefined', () => {
      expect(formatShippingAddress(null)).toBe('N/A');
      expect(formatShippingAddress(undefined)).toBe('N/A');
    });
  });

  describe('calculateOrderTotal', () => {
    it('should calculate total correctly', () => {
      const items = [
        { price: 10.00, quantity: 2 },
        { price: 5.50, quantity: 3 }
      ];
      expect(calculateOrderTotal(items)).toBe(36.50);
    });

    it('should handle empty items', () => {
      expect(calculateOrderTotal([])).toBe(0);
      expect(calculateOrderTotal(null)).toBe(0);
    });

    it('should handle discounts and taxes', () => {
      const items = [{ price: 100, quantity: 1 }];
      expect(calculateOrderTotal(items, 10, 8)).toBe(98); // 100 - 10 + 8
    });
  });

  describe('validateOrderData', () => {
    it('should validate complete order data', () => {
      const order = {
        customer_id: 'cust-123',
        items: [{ product_id: 'prod-1', quantity: 1, price: 10 }],
        shipping_address: {
          street: '123 Main St',
          city: 'City',
          state: 'ST',
          zip: '12345'
        },
        payment_method: 'credit_card'
      };
      expect(validateOrderData(order).isValid).toBe(true);
      expect(validateOrderData(order).errors).toHaveLength(0);
    });

    it('should catch missing required fields', () => {
      const order = {
        items: []
      };
      const result = validateOrderData(order);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Customer ID is required');
      expect(result.errors).toContain('Order must have at least one item');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for statuses', () => {
      expect(getStatusColor('pending')).toBe('yellow');
      expect(getStatusColor('processing')).toBe('blue');
      expect(getStatusColor('shipped')).toBe('purple');
      expect(getStatusColor('delivered')).toBe('green');
      expect(getStatusColor('cancelled')).toBe('red');
      expect(getStatusColor('unknown')).toBe('gray');
    });
  });

  describe('sortOrdersByDate', () => {
    it('should sort orders by date descending by default', () => {
      const orders = [
        { id: 1, created_at: '2024-01-01' },
        { id: 2, created_at: '2024-01-03' },
        { id: 3, created_at: '2024-01-02' }
      ];
      const sorted = sortOrdersByDate(orders);
      expect(sorted[0].id).toBe(2);
      expect(sorted[1].id).toBe(3);
      expect(sorted[2].id).toBe(1);
    });

    it('should sort ascending when specified', () => {
      const orders = [
        { id: 1, created_at: '2024-01-03' },
        { id: 2, created_at: '2024-01-01' }
      ];
      const sorted = sortOrdersByDate(orders, 'asc');
      expect(sorted[0].id).toBe(2);
      expect(sorted[1].id).toBe(1);
    });
  });

  describe('filterOrdersByStatus', () => {
    it('should filter orders by status', () => {
      const orders = [
        { id: 1, status: 'pending' },
        { id: 2, status: 'shipped' },
        { id: 3, status: 'pending' }
      ];
      const filtered = filterOrdersByStatus(orders, 'pending');
      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe(1);
      expect(filtered[1].id).toBe(3);
    });

    it('should return all orders when no status specified', () => {
      const orders = [
        { id: 1, status: 'pending' },
        { id: 2, status: 'shipped' }
      ];
      expect(filterOrdersByStatus(orders, '')).toHaveLength(2);
      expect(filterOrdersByStatus(orders, null)).toHaveLength(2);
    });
  });

  describe('exportOrdersToCSV', () => {
    it('should generate CSV content', () => {
      const orders = [
        {
          id: 'ORD001',
          customer_id: 'CUST001',
          created_at: '2024-01-15',
          status: 'pending',
          total: 100.50
        }
      ];
      const csv = exportOrdersToCSV(orders);
      expect(csv).toContain('Order ID,Customer ID,Date,Status,Total');
      expect(csv).toContain('ORD001,CUST001,2024-01-15,pending,$100.50');
    });

    it('should escape special characters', () => {
      const orders = [
        {
          id: 'ORD001',
          customer_id: 'Customer, Inc.',
          created_at: '2024-01-15',
          status: 'pending',
          total: 100
        }
      ];
      const csv = exportOrdersToCSV(orders);
      expect(csv).toContain('"Customer, Inc."');
    });
  });
});

describe('Order Create Service Utilities', () => {
  describe('validateShippingAddress', () => {
    it('should validate complete addresses', () => {
      const address = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'USA'
      };
      expect(validateShippingAddress(address).isValid).toBe(true);
    });

    it('should reject incomplete addresses', () => {
      const address = {
        street: '123 Main St',
        city: 'Anytown'
      };
      const result = validateShippingAddress(address);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('State is required');
      expect(result.errors).toContain('ZIP code is required');
    });

    it('should validate ZIP code format', () => {
      const address = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '123',
        country: 'USA'
      };
      const result = validateShippingAddress(address);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid ZIP code format');
    });
  });

  describe('validatePaymentMethod', () => {
    it('should validate supported payment methods', () => {
      expect(validatePaymentMethod('credit_card')).toBe(true);
      expect(validatePaymentMethod('paypal')).toBe(true);
      expect(validatePaymentMethod('bank_transfer')).toBe(true);
    });

    it('should reject unsupported payment methods', () => {
      expect(validatePaymentMethod('bitcoin')).toBe(false);
      expect(validatePaymentMethod('')).toBe(false);
      expect(validatePaymentMethod(null)).toBe(false);
    });
  });

  describe('sanitizeOrderData', () => {
    it('should remove extra fields', () => {
      const order = {
        customer_id: 'CUST001',
        items: [],
        extra_field: 'should be removed',
        _internal: 'should be removed'
      };
      const sanitized = sanitizeOrderData(order);
      expect(sanitized).not.toHaveProperty('extra_field');
      expect(sanitized).not.toHaveProperty('_internal');
      expect(sanitized).toHaveProperty('customer_id');
    });

    it('should trim string values', () => {
      const order = {
        customer_id: '  CUST001  ',
        notes: '  Test note  '
      };
      const sanitized = sanitizeOrderData(order);
      expect(sanitized.customer_id).toBe('CUST001');
      expect(sanitized.notes).toBe('Test note');
    });
  });
});

describe('Order Fulfillment Service Utilities', () => {
  describe('generateOrderSummary', () => {
    it('should generate correct summary', () => {
      const order = {
        id: 'ORD001',
        items: [
          { product_id: 'P1', quantity: 2, price: 10 },
          { product_id: 'P2', quantity: 1, price: 20 }
        ],
        status: 'processing'
      };
      const summary = generateOrderSummary(order);
      expect(summary.totalItems).toBe(3);
      expect(summary.totalAmount).toBe(40);
      expect(summary.itemCount).toBe(2);
    });
  });
});

describe('Order Returns Service Utilities', () => {
  describe('validateReturnEligibility', () => {
    it('should approve returns within time limit', () => {
      const order = {
        delivered_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      };
      const result = validateReturnEligibility(order, 30);
      expect(result.eligible).toBe(true);
    });

    it('should reject returns after time limit', () => {
      const order = {
        delivered_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
      };
      const result = validateReturnEligibility(order, 30);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('return period');
    });

    it('should reject non-delivered orders', () => {
      const order = {
        status: 'processing'
      };
      const result = validateReturnEligibility(order);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('not delivered');
    });
  });

  describe('calculateRefundAmount', () => {
    it('should calculate full refund', () => {
      const items = [
        { price: 50, quantity: 2, return_quantity: 2 },
        { price: 30, quantity: 1, return_quantity: 1 }
      ];
      expect(calculateRefundAmount(items)).toBe(130);
    });

    it('should calculate partial refund', () => {
      const items = [
        { price: 50, quantity: 2, return_quantity: 1 },
        { price: 30, quantity: 1, return_quantity: 0 }
      ];
      expect(calculateRefundAmount(items)).toBe(50);
    });

    it('should apply restocking fee', () => {
      const items = [
        { price: 100, quantity: 1, return_quantity: 1 }
      ];
      expect(calculateRefundAmount(items, 0.15)).toBe(85); // 15% restocking fee
    });
  });
});

describe('Order Tracking Service Utilities', () => {
  describe('formatTrackingInfo', () => {
    it('should format tracking information', () => {
      const tracking = {
        carrier: 'UPS',
        tracking_number: 'TRACK123',
        status: 'in_transit',
        location: 'Distribution Center',
        estimated_delivery: '2024-01-25'
      };
      const formatted = formatTrackingInfo(tracking);
      expect(formatted).toContain('UPS');
      expect(formatted).toContain('TRACK123');
      expect(formatted).toContain('In Transit');
    });

    it('should handle missing tracking info', () => {
      expect(formatTrackingInfo(null)).toBe('No tracking information available');
      expect(formatTrackingInfo({})).toContain('No carrier');
    });
  });
});

describe('Utility Integration Tests', () => {
  it('should process order workflow correctly', () => {
    // Create order
    const orderData = {
      customer_id: 'CUST001',
      items: [
        { product_id: 'PROD001', quantity: 2, price: 50 },
        { product_id: 'PROD002', quantity: 1, price: 30 }
      ],
      shipping_address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'USA'
      },
      payment_method: 'credit_card'
    };

    // Validate order
    const validation = validateOrderData(orderData);
    expect(validation.isValid).toBe(true);

    // Calculate total
    const total = calculateOrderTotal(orderData.items);
    expect(total).toBe(130);

    // Format for display
    const formatted = {
      total: formatCurrency(total),
      address: formatShippingAddress(orderData.shipping_address),
      status: formatOrderStatus('pending')
    };
    expect(formatted.total).toBe('$130.00');
    expect(formatted.address).toContain('123 Main St');
    expect(formatted.status).toBe('Pending');
  });
});
