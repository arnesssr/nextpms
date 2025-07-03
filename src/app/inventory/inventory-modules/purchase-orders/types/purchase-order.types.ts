export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  status: PurchaseOrderStatus;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  SENT = 'sent',
  CONFIRMED = 'confirmed',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  expectedDeliveryDate?: Date;
  items: CreatePurchaseOrderItem[];
  notes?: string;
}

export interface CreatePurchaseOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdatePurchaseOrderRequest {
  id: string;
  supplierId?: string;
  expectedDeliveryDate?: Date;
  items?: CreatePurchaseOrderItem[];
  notes?: string;
  status?: PurchaseOrderStatus;
}

export interface PurchaseOrderFilter {
  search?: string;
  status?: PurchaseOrderStatus;
  supplierId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PurchaseOrderSummary {
  totalOrders: number;
  totalValue: number;
  pendingOrders: number;
  overdueOrders: number;
  completedThisMonth: number;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  paymentTerms?: string;
  status: 'active' | 'inactive';
}
