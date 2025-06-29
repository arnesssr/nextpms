import { ReorderRequest, ReorderApproval, ReorderProcessingResult } from '../types';

export const reorderService = {
  // Get reorder requests for a specific product
  async getProductReorderRequests(productId: string): Promise<ReorderRequest[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockReorders: ReorderRequest[] = [
        {
          product_id: productId,
          reorder_quantity: 50,
          requested_by: 'inventory_manager',
          requested_at: '2024-01-05T14:00:00Z',
          status: 'approved'
        },
        {
          product_id: productId,
          reorder_quantity: 20,
          requested_by: 'sales_department',
          requested_at: '2024-01-01T10:30:00Z',
          status: 'received'
        }
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockReorders;
    } catch (error) {
      console.error('Error fetching reorder requests:', error);
      throw new Error('Failed to fetch reorder requests');
    }
  },

  // Get all reorder requests
  async getAllReorderRequests(): Promise<ReorderRequest[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockReorders: ReorderRequest[] = [
        {
          product_id: '1',
          reorder_quantity: 50,
          requested_by: 'inventory_manager',
          requested_at: '2024-01-05T14:00:00Z',
          status: 'approved'
        },
        {
          product_id: '2',
          reorder_quantity: 20,
          requested_by: 'sales_department',
          requested_at: '2024-01-01T10:30:00Z',
          status: 'received'
        },
        {
          product_id: '3',
          reorder_quantity: 30,
          requested_by: 'retail_team',
          requested_at: '2024-01-10T09:15:00Z',
          status: 'pending'
        }
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockReorders;
    } catch (error) {
      console.error('Error fetching all reorder requests:', error);
      throw new Error('Failed to fetch reorder requests');
    }
  },

  // Create new reorder request
  async createReorderRequest(request: Omit<ReorderRequest, 'status' | 'requested_at'>): Promise<ReorderRequest> {
    try {
      // Mock implementation - replace with actual API call
      const newRequest: ReorderRequest = {
        ...request,
        status: 'pending',
        requested_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return newRequest;
    } catch (error) {
      console.error('Error creating reorder request:', error);
      throw new Error('Failed to create reorder request');
    }
  },

  // Approve a reorder request
  async approveReorder(requestId: string, approval: Omit<ReorderApproval, 'approved_at'>): Promise<ReorderApproval> {
    try {
      // Mock implementation - replace with actual API call
      const approved: ReorderApproval = {
        ...approval,
        request_id: requestId,
        approved_at: new Date().toISOString(),
        expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      return approved;
    } catch (error) {
      console.error('Error approving reorder request:', error);
      throw new Error('Failed to approve reorder request');
    }
  },

  // Process a reorder request (e.g., mark as received)
  async processReorder(requestId: string, result: ReorderProcessingResult): Promise<ReorderProcessingResult> {
    try {
      // Mock implementation - replace with actual API call
      const processedResult: ReorderProcessingResult = {
        ...result,
        request_id: requestId,
        processed_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 400));
      return processedResult;
    } catch (error) {
      console.error('Error processing reorder request:', error);
      throw new Error('Failed to process reorder request');
    }
  },

  // Validate reorder request
  validateReorderRequest(request: Omit<ReorderRequest, 'status' | 'requested_at'>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.product_id) {
      errors.push('Product ID is required');
    }

    if (request.reorder_quantity <= 0) {
      errors.push('Reorder quantity must be greater than 0');
    }

    if (!request.requested_by) {
      errors.push('Requested by is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

