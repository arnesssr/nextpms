export interface Movement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: MovementType;
  quantity: number;
  unitOfMeasure: string;
  reason: MovementReason;
  location: string;
  warehouseId?: string;
  reference?: string; // PO number, invoice, etc.
  notes?: string;
  userId: string;
  userName: string;
  timestamp: Date;
  beforeQuantity: number;
  afterQuantity: number;
  unitCost?: number;
  totalCost?: number;
  supplier?: string;
  customer?: string;
  batchNumber?: string;
  expiryDate?: Date;
}

export enum MovementType {
  IN = 'in',           // Stock coming in
  OUT = 'out',         // Stock going out
  TRANSFER = 'transfer', // Between locations
  ADJUSTMENT = 'adjustment' // Manual corrections
}

export enum MovementReason {
  // Stock In reasons
  PURCHASE = 'purchase',
  RETURN_FROM_CUSTOMER = 'return_from_customer',
  TRANSFER_IN = 'transfer_in',
  PRODUCTION = 'production',
  ADJUSTMENT_IN = 'adjustment_in',
  
  // Stock Out reasons
  SALE = 'sale',
  RETURN_TO_SUPPLIER = 'return_to_supplier',
  TRANSFER_OUT = 'transfer_out',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  LOST = 'lost',
  ADJUSTMENT_OUT = 'adjustment_out',
  SAMPLE = 'sample',
  INTERNAL_USE = 'internal_use'
}

export interface MovementFilter {
  search?: string;
  productId?: string;
  type?: MovementType;
  reason?: MovementReason;
  location?: string;
  warehouseId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface CreateMovementRequest {
  productId: string;
  type: MovementType;
  quantity: number;
  reason: MovementReason;
  location: string;
  warehouseId?: string;
  reference?: string;
  notes?: string;
  unitCost?: number;
  supplier?: string;
  customer?: string;
  batchNumber?: string;
  expiryDate?: Date;
}

export interface MovementSummary {
  totalMovements: number;
  totalStockIn: number;
  totalStockOut: number;
  totalValue: number;
  movementsToday: number;
  movementsThisWeek: number;
  movementsThisMonth: number;
}

export interface MovementsByProduct {
  productId: string;
  productName: string;
  productSku: string;
  totalIn: number;
  totalOut: number;
  netMovement: number;
  lastMovement: Date;
  movementCount: number;
}

// For bulk operations
export interface BulkMovementRequest {
  movements: CreateMovementRequest[];
  batchReference?: string;
  notes?: string;
}
