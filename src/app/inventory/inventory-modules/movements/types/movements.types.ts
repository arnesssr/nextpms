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
  RETURN = 'return',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  MANUAL = 'manual',
  
  // Stock Out reasons
  SALE = 'sale',
  DAMAGE = 'damage'
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
