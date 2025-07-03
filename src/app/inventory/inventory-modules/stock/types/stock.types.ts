export interface Stock {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  currentQuantity: number;
  minimumQuantity: number;
  maximumQuantity: number | null;
  unitOfMeasure: string;
  location: string;
  warehouseId?: string;
  costPerUnit: number;
  totalValue: number;
  lastUpdated: Date;
  status: StockStatus;
  supplier?: string;
  expiryDate?: Date;
  batchNumber?: string;
  lastRestocked?: Date | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Extended properties for products integration
  products?: {
    name: string;
    sku: string;
    cost_price?: number;
    selling_price?: number;
    categories?: {
      name: string;
    };
  };
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCKED = 'overstocked',
  DISCONTINUED = 'discontinued'
}

export enum StockLevel {
  CRITICAL = 'critical',    // Below minimum
  LOW = 'low',             // At or near minimum
  NORMAL = 'normal',       // Between min and max
  HIGH = 'high',           // At or above maximum
}

export interface StockFilter {
  search?: string;
  status?: StockStatus;
  location?: string;
  warehouseId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  expiringBefore?: Date;
  // Add location_id for API compatibility
  location_id?: string;
}

export interface CreateStockRequest {
  productId: string;
  currentQuantity: number;
  minimumQuantity: number;
  maximumQuantity: number;
  unitOfMeasure: string;
  location: string;
  warehouseId?: string;
  costPerUnit: number;
  supplier?: string;
  expiryDate?: Date;
  batchNumber?: string;
}

export interface UpdateStockRequest {
  id: string;
  currentQuantity?: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
  location?: string;
  warehouseId?: string;
  costPerUnit?: number;
  supplier?: string;
  expiryDate?: Date;
  batchNumber?: string;
}

export interface StockSummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overStockedItems: number;
}
