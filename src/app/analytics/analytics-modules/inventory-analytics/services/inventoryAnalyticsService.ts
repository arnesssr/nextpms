import { InventoryAnalyticsData } from '../types';

// This is a mock service that would be replaced with actual API calls
export const getInventoryAnalyticsData = async (timeRange: string): Promise<InventoryAnalyticsData> => {
  // In a real implementation, this would make an API call
  // For now, we'll return mock data
  
  return {
    inventoryMetrics: {
      turnoverRate: 4.2,
      averageAge: 28,
      deadStock: 12,
      stockValue: 234560,
    },
    lowStockItems: [
      { id: '1', name: 'Wireless Headphones', currentStock: 5, reorderPoint: 10, daysToStockout: 3 },
      { id: '2', name: 'Smart Watch Pro', currentStock: 8, reorderPoint: 15, daysToStockout: 5 },
      { id: '3', name: 'Gaming Mouse', currentStock: 12, reorderPoint: 20, daysToStockout: 8 },
    ],
    overStockItems: [
      { id: '4', name: 'USB-C Hub', currentStock: 120, optimalStock: 50, excessValue: 3500 },
      { id: '5', name: 'Bluetooth Speaker', currentStock: 85, optimalStock: 40, excessValue: 4500 },
    ]
  };
};