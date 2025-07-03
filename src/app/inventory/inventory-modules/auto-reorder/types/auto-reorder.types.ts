export interface AutoReorderRule {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  supplierId: string;
  supplierName: string;
  minimumThreshold: number;
  reorderQuantity: number;
  leadTimeDays: number;
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutoReorderRecommendation {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  minimumThreshold: number;
  suggestedOrderQuantity: number;
  supplierId?: string;
  supplierName?: string;
  unitCost: number;
  totalCost: number;
  urgencyLevel: ReorderUrgency;
  daysUntilStockout: number;
  averageDailyUsage: number;
  leadTimeDays: number;
}

export enum ReorderUrgency {
  CRITICAL = 'critical',    // Stock is at or below 0
  HIGH = 'high',           // Stock is below minimum threshold
  MEDIUM = 'medium',       // Stock is approaching minimum threshold
  LOW = 'low'              // Stock is adequate but trending down
}

export interface AutoReorderSettings {
  id: string;
  isGloballyEnabled: boolean;
  defaultLeadTimeDays: number;
  urgencyThresholds: {
    critical: number;    // Days until stockout for critical
    high: number;        // Days until stockout for high
    medium: number;      // Days until stockout for medium
  };
  emailNotifications: boolean;
  autoCreatePurchaseOrders: boolean;
  requireApproval: boolean;
  maxOrderValue: number;
  updatedAt: Date;
}

export interface CreateAutoReorderRuleRequest {
  productId: string;
  supplierId: string;
  minimumThreshold: number;
  reorderQuantity: number;
  leadTimeDays: number;
  isActive?: boolean;
}

export interface UpdateAutoReorderRuleRequest {
  id: string;
  supplierId?: string;
  minimumThreshold?: number;
  reorderQuantity?: number;
  leadTimeDays?: number;
  isActive?: boolean;
}

export interface AutoReorderFilter {
  productId?: string;
  supplierId?: string;
  urgencyLevel?: ReorderUrgency;
  isActive?: boolean;
}

export interface AutoReorderSummary {
  totalRules: number;
  activeRules: number;
  pendingRecommendations: number;
  criticalItems: number;
  totalPotentialOrderValue: number;
  averageLeadTime: number;
}

export interface ReorderExecution {
  id: string;
  recommendationId: string;
  purchaseOrderId?: string;
  status: ReorderExecutionStatus;
  executedAt: Date;
  executedBy: string;
  notes?: string;
}

export enum ReorderExecutionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PURCHASE_ORDER_CREATED = 'po_created',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}
