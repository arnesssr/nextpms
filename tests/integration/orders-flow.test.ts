/**
 * Integration test for complete order management flow
 * Tests the entire journey from order creation to fulfillment, returns, and tracking
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Test data
const testOrder = {
  customerId: 'test-customer-123',
  customerName: 'John Doe',
  customerEmail: 'john.doe@example.com',
  items: [
    {
      productId: 'prod-001',
      name: 'Premium Widget',
      quantity: 2,
      price: 49.99,
      sku: 'WDG-001'
    },
    {
      productId: 'prod-002',
      name: 'Standard Gadget',
      quantity: 1,
      price: 29.99,
      sku: 'GDG-002'
    }
  ],
  shippingAddress: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'TC',
    zipCode: '12345',
    country: 'Test Country'
  },
  paymentMethod: 'credit_card',
  notes: 'Integration test order'
};

let createdOrderId: string;
let fulfillmentId: string;
let returnId: string;
let trackingNumber: string;

describe('Orders Flow Integration Tests', () => {
  beforeAll(async () => {
    // Ensure the API is accessible
    try {
      await axios.get(`${API_BASE_URL}/health`);
    } catch (error) {
      console.log('Note: Health check endpoint not available, proceeding with tests');
    }
  });

  describe('Order Creation Flow', () => {
    it('should create a new order successfully', async () => {
      const response = await axios.post(`${API_BASE_URL}/orders`, testOrder);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.status).toBe('pending');
      expect(response.data.customerId).toBe(testOrder.customerId);
      expect(response.data.items).toHaveLength(2);
      expect(response.data.totalAmount).toBe(129.97); // (49.99 * 2) + 29.99
      
      createdOrderId = response.data.id;
    });

    it('should retrieve the created order', async () => {
      const response = await axios.get(`${API_BASE_URL}/orders/${createdOrderId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(createdOrderId);
      expect(response.data.customerName).toBe(testOrder.customerName);
    });

    it('should list orders with the created order', async () => {
      const response = await axios.get(`${API_BASE_URL}/orders`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      const foundOrder = response.data.find((order: any) => order.id === createdOrderId);
      expect(foundOrder).toBeDefined();
    });
  });

  describe('Order Fulfillment Flow', () => {
    it('should create fulfillment for the order', async () => {
      const fulfillmentData = {
        orderId: createdOrderId,
        items: [
          {
            orderItemId: 'item-1',
            quantity: 2
          }
        ],
        trackingNumber: 'TRACK-' + Date.now(),
        carrier: 'Test Carrier',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await axios.post(`${API_BASE_URL}/orders/fulfillment`, fulfillmentData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.orderId).toBe(createdOrderId);
      expect(response.data.status).toBe('pending');
      
      fulfillmentId = response.data.id;
      trackingNumber = response.data.trackingNumber;
    });

    it('should update fulfillment status to shipped', async () => {
      const response = await axios.patch(`${API_BASE_URL}/orders/fulfillment/${fulfillmentId}`, {
        status: 'shipped'
      });
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('shipped');
    });

    it('should get fulfillment by order', async () => {
      const response = await axios.get(`${API_BASE_URL}/orders/${createdOrderId}/fulfillments`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toHaveLength(1);
      expect(response.data[0].id).toBe(fulfillmentId);
    });
  });

  describe('Order Tracking Flow', () => {
    it('should track order by tracking number', async () => {
      const response = await axios.get(`${API_BASE_URL}/orders/tracking/${trackingNumber}`);
      
      expect(response.status).toBe(200);
      expect(response.data.trackingNumber).toBe(trackingNumber);
      expect(response.data.orderId).toBe(createdOrderId);
      expect(response.data.status).toBe('shipped');
    });

    it('should update tracking information', async () => {
      const trackingUpdate = {
        status: 'in_transit',
        location: 'Distribution Center',
        timestamp: new Date().toISOString(),
        notes: 'Package in transit'
      };

      const response = await axios.post(
        `${API_BASE_URL}/orders/tracking/${trackingNumber}/update`,
        trackingUpdate
      );
      
      expect(response.status).toBe(200);
      expect(response.data.updates).toBeDefined();
      expect(response.data.updates).toHaveLength(1);
      expect(response.data.updates[0].status).toBe('in_transit');
    });

    it('should get all tracking updates', async () => {
      const response = await axios.get(`${API_BASE_URL}/orders/tracking/${trackingNumber}/history`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });
  });

  describe('Order Returns Flow', () => {
    it('should create a return request', async () => {
      const returnData = {
        orderId: createdOrderId,
        items: [
          {
            orderItemId: 'item-1',
            quantity: 1,
            reason: 'defective',
            notes: 'Product not working as expected'
          }
        ],
        customerNotes: 'Would like a replacement'
      };

      const response = await axios.post(`${API_BASE_URL}/orders/returns`, returnData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.orderId).toBe(createdOrderId);
      expect(response.data.status).toBe('pending');
      
      returnId = response.data.id;
    });

    it('should approve the return request', async () => {
      const response = await axios.patch(`${API_BASE_URL}/orders/returns/${returnId}`, {
        status: 'approved',
        approvalNotes: 'Return approved for replacement'
      });
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('approved');
    });

    it('should get returns by order', async () => {
      const response = await axios.get(`${API_BASE_URL}/orders/${createdOrderId}/returns`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toHaveLength(1);
      expect(response.data[0].id).toBe(returnId);
    });

    it('should process the return', async () => {
      const response = await axios.post(`${API_BASE_URL}/orders/returns/${returnId}/process`, {
        action: 'replace',
        notes: 'Replacement item shipped'
      });
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('processed');
    });
  });

  describe('Order Status Updates', () => {
    it('should update order status through different stages', async () => {
      const statuses = ['processing', 'shipped', 'delivered'];
      
      for (const status of statuses) {
        const response = await axios.patch(`${API_BASE_URL}/orders/${createdOrderId}`, {
          status
        });
        
        expect(response.status).toBe(200);
        expect(response.data.status).toBe(status);
      }
    });
  });

  describe('Order Analytics', () => {
    it('should get order statistics', async () => {
      const response = await axios.get(`${API_BASE_URL}/orders/analytics/stats`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalOrders');
      expect(response.data).toHaveProperty('totalRevenue');
      expect(response.data).toHaveProperty('averageOrderValue');
    });

    it('should get orders by date range', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        params: {
          startDate,
          endDate
        }
      });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid order ID', async () => {
      try {
        await axios.get(`${API_BASE_URL}/orders/invalid-order-id`);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('error');
      }
    });

    it('should validate required fields on order creation', async () => {
      try {
        await axios.post(`${API_BASE_URL}/orders`, {
          // Missing required fields
          items: []
        });
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('error');
      }
    });

    it('should prevent duplicate fulfillment', async () => {
      try {
        const fulfillmentData = {
          orderId: createdOrderId,
          items: [
            {
              orderItemId: 'item-1',
              quantity: 2
            }
          ],
          trackingNumber: 'DUPLICATE-TRACK',
          carrier: 'Test Carrier'
        };

        await axios.post(`${API_BASE_URL}/orders/fulfillment`, fulfillmentData);
        await axios.post(`${API_BASE_URL}/orders/fulfillment`, fulfillmentData);
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data).toHaveProperty('error');
      }
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    if (createdOrderId) {
      try {
        await axios.delete(`${API_BASE_URL}/orders/${createdOrderId}`);
      } catch (error) {
        console.log('Note: Could not delete test order, manual cleanup may be required');
      }
    }
  });
});

// Performance tests
describe('Performance Tests', () => {
  it('should handle concurrent order creation', async () => {
    const concurrentRequests = 10;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      const orderData = {
        ...testOrder,
        customerId: `perf-test-${i}`,
        customerEmail: `perf${i}@test.com`
      };
      promises.push(axios.post(`${API_BASE_URL}/orders`, orderData));
    }

    const startTime = Date.now();
    const results = await Promise.allSettled(promises);
    const endTime = Date.now();
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const avgTime = (endTime - startTime) / concurrentRequests;

    expect(successCount).toBeGreaterThan(concurrentRequests * 0.9); // 90% success rate
    expect(avgTime).toBeLessThan(1000); // Less than 1 second per request

    // Cleanup
    for (const result of results) {
      if (result.status === 'fulfilled') {
        try {
          await axios.delete(`${API_BASE_URL}/orders/${result.value.data.id}`);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  });
});
