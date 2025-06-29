// Inventory-related types
export interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  movement_type: 'addition' | 'removal';
  reason: string;
  moved_by: string;
  moved_at: string;
  previous_quantity: number;
}

export interface ReorderRequest {
  product_id: string;
  reorder_quantity: number;
  requested_by: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'received' | 'cancelled';
}

export interface ReorderApproval {
  request_id: string;
  approved_by: string;
  approved_at: string;
  expected_delivery_date: string;
}

export interface LowStockAlert {
  product_id: string;
  current_quantity: number;
  low_stock_threshold: number;
  generated_at: string;
}

// Enums
export type StockMovementType = 'addition' | 'removal';

// Form types
export interface StockAdjustmentRequest {
  product_id: string;
  adjustment_quantity: number;
  adjustment_type: StockMovementType;
  reason: string;
}

export interface ReorderProcessingResult {
  request_id: string;
  status: 'fulfilled' | 'partially_fulfilled' | 'unfulfilled';
  fulfillment_quantity: number;
  comment?: string;
  processed_by: string;
  processed_at: string;
}

// API response types
export interface InventoryResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface LowStockReport {
  total_low_stock_items: number;
  items: LowStockAlert[];
}

// Component props
export interface StockLevelIndicatorProps {
  currentQuantity: number;
  lowStockThreshold: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface InventoryAdjustmentsProps {
  productId: string;
  currentQuantity: number;
  onAdjustmentsComplete?: () => void;
}

export interface StockReorderModalProps {
  productId: string;
  canReorder?: boolean;
  lowStockThreshold: number;
  onReorderComplete?: () => void;
}
