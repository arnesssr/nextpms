import { 
  InventoryItem, 
  StockAdjustmentRequest,
  LowStockAlert,
  LowStockReport
} from '../types';

// Mock API base URL - replace with actual API
const API_BASE = '/api/inventory';

export const inventoryService = {
  // Get inventory for a specific product
  async getProductInventory(productId: string): Promise<InventoryItem | null> {
    try {
      // Mock implementation - replace with actual API call
      const mockInventory: InventoryItem = {
        id: '1',
        product_id: productId,
        quantity: 150,
        reserved_quantity: 25,
        low_stock_threshold: 50,
        location: 'Warehouse A',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockInventory;
    } catch (error) {
      console.error('Error fetching product inventory:', error);
      throw new Error('Failed to fetch product inventory');
    }
  },

  // Get inventory for all products
  async getAllInventory(): Promise<InventoryItem[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockInventoryItems: InventoryItem[] = [
        {
          id: '1',
          product_id: '1',
          quantity: 150,
          reserved_quantity: 25,
          low_stock_threshold: 50,
          location: 'Warehouse A',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          product_id: '2',
          quantity: 30,
          reserved_quantity: 10,
          low_stock_threshold: 40,
          location: 'Warehouse B',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-14T15:45:00Z'
        },
        {
          id: '3',
          product_id: '3',
          quantity: 75,
          reserved_quantity: 5,
          low_stock_threshold: 20,
          location: 'Warehouse A',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-16T09:20:00Z'
        },
        {
          id: '4',
          product_id: '4',
          quantity: 5,
          reserved_quantity: 0,
          low_stock_threshold: 15,
          location: 'Warehouse C',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-13T11:10:00Z'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockInventoryItems;
    } catch (error) {
      console.error('Error fetching all inventory:', error);
      throw new Error('Failed to fetch inventory');
    }
  },

  // Adjust stock for a product
  async adjustStock(request: StockAdjustmentRequest): Promise<InventoryItem> {
    try {
      // Validate request
      const validation = this.validateStockAdjustment(request);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Mock implementation - replace with actual API call
      const response = await fetch(`${API_BASE}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to adjust stock');
      }

      // Return mock updated inventory
      const currentInventory = await this.getProductInventory(request.product_id);
      if (!currentInventory) {
        throw new Error('Product inventory not found');
      }

      const adjustmentAmount = request.adjustment_type === 'addition' 
        ? request.adjustment_quantity 
        : -request.adjustment_quantity;

      const updatedInventory: InventoryItem = {
        ...currentInventory,
        quantity: Math.max(0, currentInventory.quantity + adjustmentAmount),
        updated_at: new Date().toISOString()
      };

      return updatedInventory;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw new Error('Failed to adjust stock');
    }
  },

  // Get low stock alerts
  async getLowStockAlerts(): Promise<LowStockReport> {
    try {
      // Mock implementation - replace with actual API call
      const allInventory = await this.getAllInventory();
      
      const lowStockItems = allInventory
        .filter(item => item.quantity <= item.low_stock_threshold)
        .map(item => ({
          product_id: item.product_id,
          current_quantity: item.quantity,
          low_stock_threshold: item.low_stock_threshold,
          generated_at: new Date().toISOString()
        }));

      const report: LowStockReport = {
        total_low_stock_items: lowStockItems.length,
        items: lowStockItems
      };

      return report;
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      throw new Error('Failed to fetch low stock alerts');
    }
  },

  // Update low stock threshold for a product
  async updateLowStockThreshold(productId: string, threshold: number): Promise<InventoryItem> {
    try {
      if (threshold < 0) {
        throw new Error('Threshold cannot be negative');
      }

      // Mock implementation - replace with actual API call
      const currentInventory = await this.getProductInventory(productId);
      if (!currentInventory) {
        throw new Error('Product inventory not found');
      }

      const updatedInventory: InventoryItem = {
        ...currentInventory,
        low_stock_threshold: threshold,
        updated_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return updatedInventory;
    } catch (error) {
      console.error('Error updating low stock threshold:', error);
      throw new Error('Failed to update low stock threshold');
    }
  },

  // Get inventory statistics
  async getInventoryStats(): Promise<{
    total_products: number;
    total_quantity: number;
    low_stock_items: number;
    out_of_stock_items: number;
    reserved_quantity: number;
    available_quantity: number;
  }> {
    try {
      const allInventory = await this.getAllInventory();
      
      const stats = {
        total_products: allInventory.length,
        total_quantity: allInventory.reduce((sum, item) => sum + item.quantity, 0),
        low_stock_items: allInventory.filter(item => item.quantity <= item.low_stock_threshold).length,
        out_of_stock_items: allInventory.filter(item => item.quantity === 0).length,
        reserved_quantity: allInventory.reduce((sum, item) => sum + item.reserved_quantity, 0),
        available_quantity: allInventory.reduce((sum, item) => sum + (item.quantity - item.reserved_quantity), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      throw new Error('Failed to fetch inventory statistics');
    }
  },

  // Reserve stock for orders
  async reserveStock(productId: string, quantity: number): Promise<InventoryItem> {
    try {
      const currentInventory = await this.getProductInventory(productId);
      if (!currentInventory) {
        throw new Error('Product inventory not found');
      }

      const availableQuantity = currentInventory.quantity - currentInventory.reserved_quantity;
      if (quantity > availableQuantity) {
        throw new Error('Insufficient stock available for reservation');
      }

      const updatedInventory: InventoryItem = {
        ...currentInventory,
        reserved_quantity: currentInventory.reserved_quantity + quantity,
        updated_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return updatedInventory;
    } catch (error) {
      console.error('Error reserving stock:', error);
      throw new Error('Failed to reserve stock');
    }
  },

  // Release reserved stock
  async releaseStock(productId: string, quantity: number): Promise<InventoryItem> {
    try {
      const currentInventory = await this.getProductInventory(productId);
      if (!currentInventory) {
        throw new Error('Product inventory not found');
      }

      if (quantity > currentInventory.reserved_quantity) {
        throw new Error('Cannot release more stock than is reserved');
      }

      const updatedInventory: InventoryItem = {
        ...currentInventory,
        reserved_quantity: Math.max(0, currentInventory.reserved_quantity - quantity),
        updated_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return updatedInventory;
    } catch (error) {
      console.error('Error releasing stock:', error);
      throw new Error('Failed to release stock');
    }
  },

  // Validate stock adjustment request
  validateStockAdjustment(request: StockAdjustmentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.product_id) {
      errors.push('Product ID is required');
    }

    if (request.adjustment_quantity <= 0) {
      errors.push('Adjustment quantity must be greater than 0');
    }

    if (!request.reason || request.reason.trim().length < 3) {
      errors.push('Reason must be at least 3 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Check if stock level is low
  isLowStock(currentQuantity: number, threshold: number): boolean {
    return currentQuantity <= threshold;
  },

  // Check if product is out of stock
  isOutOfStock(currentQuantity: number, reservedQuantity: number = 0): boolean {
    return (currentQuantity - reservedQuantity) <= 0;
  },

  // Calculate available stock
  calculateAvailableStock(currentQuantity: number, reservedQuantity: number = 0): number {
    return Math.max(0, currentQuantity - reservedQuantity);
  }
};
