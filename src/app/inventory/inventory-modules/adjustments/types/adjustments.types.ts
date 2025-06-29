export interface Adjustment {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: AdjustmentType;
  reason: AdjustmentReason;
  quantityBefore: number;
  quantityAfter: number;
  quantityChange: number; // Calculated: quantityAfter - quantityBefore
  unitOfMeasure: string;
  location: string;
  warehouseId?: string;
  reference?: string;
  notes?: string;
  userId: string;
  userName: string;
  approvedBy?: string;
  approvedAt?: Date;
  status: AdjustmentStatus;
  createdAt: Date;
  updatedAt: Date;
  batchNumber?: string;
  costImpact?: number;
  evidence?: AdjustmentEvidence[];
}

export enum AdjustmentType {
  INCREASE = 'increase',     // Adding stock
  DECREASE = 'decrease',     // Removing stock
  RECOUNT = 'recount'        // Correcting count discrepancies
}

export enum AdjustmentReason {
  // Increase reasons
  STOCK_FOUND = 'stock_found',
  RETURN_FROM_CUSTOMER = 'return_from_customer',
  SUPPLIER_CREDIT = 'supplier_credit',
  PRODUCTION_YIELD = 'production_yield',
  COUNTING_ERROR = 'counting_error',
  
  // Decrease reasons
  DAMAGE = 'damage',
  THEFT = 'theft',
  EXPIRY = 'expiry',
  QUALITY_ISSUE = 'quality_issue',
  SHRINKAGE = 'shrinkage',
  SAMPLE_USED = 'sample_used',
  DISPOSAL = 'disposal',
  
  // Recount reasons
  CYCLE_COUNT = 'cycle_count',
  PHYSICAL_INVENTORY = 'physical_inventory',
  SYSTEM_ERROR = 'system_error',
  RECONCILIATION = 'reconciliation'
}

export enum AdjustmentStatus {
  PENDING = 'pending',       // Awaiting approval
  APPROVED = 'approved',     // Approved and applied
  REJECTED = 'rejected',     // Rejected, not applied
  DRAFT = 'draft'           // Still being created
}

export interface AdjustmentEvidence {
  id: string;
  type: EvidenceType;
  fileName: string;
  fileUrl: string;
  description?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export enum EvidenceType {
  PHOTO = 'photo',
  DOCUMENT = 'document',
  VIDEO = 'video',
  RECEIPT = 'receipt',
  REPORT = 'report'
}

export interface AdjustmentFilter {
  search?: string;
  productId?: string;
  type?: AdjustmentType;
  reason?: AdjustmentReason;
  status?: AdjustmentStatus;
  location?: string;
  warehouseId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minQuantityChange?: number;
  maxQuantityChange?: number;
  requiresApproval?: boolean;
}

export interface CreateAdjustmentRequest {
  productId: string;
  type: AdjustmentType;
  reason: AdjustmentReason;
  quantityBefore: number;
  quantityAfter: number;
  location: string;
  warehouseId?: string;
  reference?: string;
  notes?: string;
  batchNumber?: string;
  evidence?: File[];
}

export interface UpdateAdjustmentRequest {
  id: string;
  reason?: AdjustmentReason;
  quantityAfter?: number;
  reference?: string;
  notes?: string;
  status?: AdjustmentStatus;
}

export interface AdjustmentSummary {
  totalAdjustments: number;
  pendingAdjustments: number;
  approvedAdjustments: number;
  rejectedAdjustments: number;
  totalIncreases: number;
  totalDecreases: number;
  totalCostImpact: number;
  adjustmentsToday: number;
  adjustmentsThisWeek: number;
  adjustmentsThisMonth: number;
}

export interface AdjustmentsByProduct {
  productId: string;
  productName: string;
  productSku: string;
  totalAdjustments: number;
  totalIncrease: number;
  totalDecrease: number;
  netAdjustment: number;
  lastAdjustment: Date;
  avgAdjustmentSize: number;
}

export interface AdjustmentsByReason {
  reason: AdjustmentReason;
  count: number;
  totalQuantity: number;
  percentage: number;
}

// For bulk operations
export interface BulkAdjustmentRequest {
  adjustments: CreateAdjustmentRequest[];
  batchReference?: string;
  notes?: string;
}

export interface AdjustmentApprovalRequest {
  adjustmentIds: string[];
  approved: boolean;
  approvalNotes?: string;
}
