export interface InventoryMetrics {
  turnoverRate: number;
  averageAge: number;
  deadStock: number;
  stockValue: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  daysToStockout: number;
}

export interface OverStockItem {
  id: string;
  name: string;
  currentStock: number;
  optimalStock: number;
  excessValue: number;
}

export interface InventoryAnalyticsData {
  inventoryMetrics: InventoryMetrics;
  lowStockItems: LowStockItem[];
  overStockItems: OverStockItem[];
}