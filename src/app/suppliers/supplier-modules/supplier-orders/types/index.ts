export interface SupplierOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  notes?: string;
}

export interface SupplierOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'partially_delivered';
  items: SupplierOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  paymentTerms: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentDueDate: Date;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  shippingMethod?: string;
  notes?: string;
  attachments?: string[]; // URLs to attached files
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierOrderSummary {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'partially_delivered';
  totalAmount: number;
  itemCount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
}

export interface SupplierOrderStats {
  total: number;
  draft: number;
  submitted: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  partiallyDelivered: number;
  totalValue: number;
  averageOrderValue: number;
  pendingPayment: number;
  pendingPaymentValue: number;
}

export interface SupplierOrderFilters {
  supplierId?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface CreateSupplierOrderRequest {
  supplierId: string;
  expectedDeliveryDate: Date;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    expectedDeliveryDate?: Date;
    notes?: string;
  }[];
  paymentTerms?: string;
  paymentDueDate?: Date;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingMethod?: string;
  notes?: string;
  attachments?: string[];
}

export interface UpdateSupplierOrderRequest {
  expectedDeliveryDate?: Date;
  status?: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'partially_delivered';
  items?: {
    id?: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    expectedDeliveryDate?: Date;
    notes?: string;
  }[];
  paymentTerms?: string;
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentDueDate?: Date;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  shippingMethod?: string;
  notes?: string;
  attachments?: string[];
}

export interface SupplierOrderResponse {
  data: SupplierOrder;
}

export interface SupplierOrdersResponse {
  orders: SupplierOrderSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: SupplierOrderStats;
}