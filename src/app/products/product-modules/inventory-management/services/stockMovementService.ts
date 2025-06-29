import { StockMovement } from '../types';

export const stockMovementService = {
  // Get stock movements for a specific product
  async getProductStockMovements(productId: string): Promise<StockMovement[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockMovements: StockMovement[] = [
        {
          id: '1',
          product_id: productId,
          quantity: 20,
          movement_type: 'addition',
          reason: 'Restock from supplier',
          moved_by: 'warehouse_manager',
          moved_at: '2024-01-10T09:30:00Z',
          previous_quantity: 130
        },
        {
          id: '2',
          product_id: productId,
          quantity: 5,
          movement_type: 'removal',
          reason: 'Adjustment for damaged items',
          moved_by: 'audit_team',
          moved_at: '2024-01-08T14:00:00Z',
          previous_quantity: 135
        },
        {
          id: '3',
          product_id: productId,
          quantity: 10,
          movement_type: 'addition',
          reason: 'Correction from previous count',
          moved_by: 'audit_team',
          moved_at: '2024-01-07T17:30:00Z',
          previous_quantity: 125
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockMovements;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw new Error('Failed to fetch stock movements');
    }
  },

  // Get recent stock movements across all products
  async getRecentStockMovements(limit: number = 25): Promise<StockMovement[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockRecentMovements: StockMovement[] = [
        {
          id: '1',
          product_id: '1',
          quantity: 20,
          movement_type: 'addition',
          reason: 'Restock from supplier',
          moved_by: 'warehouse_manager',
          moved_at: '2024-01-10T09:30:00Z',
          previous_quantity: 130
        },
        {
          id: '2',
          product_id: '2',
          quantity: 5,
          movement_type: 'removal',
          reason: 'Adjustment for damaged items',
          moved_by: 'audit_team',
          moved_at: '2024-01-08T14:00:00Z',
          previous_quantity: 35
        },
        {
          id: '3',
          product_id: '3',
          quantity: 10,
          movement_type: 'addition',
          reason: 'Correction from previous count',
          moved_by: 'audit_team',
          moved_at: '2024-01-07T17:30:00Z',
          previous_quantity: 65
        },
        {
          id: '4',
          product_id: '4',
          quantity: 15,
          movement_type: 'removal',
          reason: 'Sample promotion',
          moved_by: 'sales_team',
          moved_at: '2024-01-06T12:45:00Z',
          previous_quantity: 70
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      return mockRecentMovements.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent stock movements:', error);
      throw new Error('Failed to fetch recent stock movements');
    }
  },

  // Create a new stock movement entry
  async createStockMovementEntry(entry: Omit<StockMovement, 'id' | 'moved_at' | 'previous_quantity'>): Promise<StockMovement> {
    try {
      // Mock implementation - replace with actual API call
      const newEntry: StockMovement = {
        ...entry,
        id: Date.now().toString(),
        moved_at: new Date().toISOString(),
        previous_quantity: 100 // Mock previous quantity
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return newEntry;
    } catch (error) {
      console.error('Error creating stock movement entry:', error);
      throw new Error('Failed to create stock movement entry');
    }
  },

  // Calculate total stock movements for a given product
  async calculateTotalMovements(productId: string, sinceDate: string): Promise<{
    total_additions: number;
    total_removals: number;
    movements_count: number;
  }> {
    try {
      // Mock implementation - replace with actual API call
      const allMovements = await this.getProductStockMovements(productId);

      const filteredMovements = allMovements.filter(movement => 
        new Date(movement.moved_at) >= new Date(sinceDate)
      );

      const result = filteredMovements.reduce((acc, movement) => {
        if (movement.movement_type === 'addition') {
          acc.total_additions += movement.quantity;
        } else {
          acc.total_removals += movement.quantity;
        }
        acc.movements_count++;
        return acc;
      }, {
        total_additions: 0,
        total_removals: 0,
        movements_count: 0
      });

      return result;
    } catch (error) {
      console.error('Error calculating total movements:', error);
      throw new Error('Failed to calculate total movements');
    }
  }
};
