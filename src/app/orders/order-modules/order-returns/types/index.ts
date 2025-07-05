export interface ReturnRequest {
  id: string;
  orderId: string;
  customerId?: string;
  items: ReturnItem[];
  reason: string;
  description?: string;
  status: ReturnStatus;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  originalPrice: number;
  refundAmount: number;
}

export type ReturnStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'shipped_back'
  | 'received'
  | 'refunded'
  | 'cancelled';

export interface ReturnReason {
  value: string;
  label: string;
}

export interface OrderReturnsProps {
  onReturnCreated?: (returnId: string) => void;
  showCreateButton?: boolean;
}

export interface ReturnCardProps {
  returnRequest: ReturnRequest;
  onStatusUpdate: (returnId: string, status: ReturnStatus, notes?: string) => void;
  onProcessRefund: (returnId: string, amount: number, method: string) => void;
  isProcessing: boolean;
}

export interface CreateReturnProps {
  orderId?: string;
  onReturnCreated: (returnId: string) => void;
  onCancel: () => void;
}

export interface ReturnFiltersProps {
  currentStatus?: ReturnStatus;
  onStatusChange: (status?: ReturnStatus) => void;
}

export interface RefundProcessorProps {
  returnRequest: ReturnRequest;
  onRefundProcessed: (refundId: string) => void;
}

export interface ReturnMetrics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  refunded: number;
  totalRefundAmount: number;
  avgProcessingTime: number;
}
