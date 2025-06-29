// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  selling_price: number;
  cost_price?: number;
  category_id: string;
  category?: Category;
  images: string[];
  status: 'draft' | 'published' | 'archived';
  stock_quantity: number;
  sku?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  base_price: number;
  selling_price: number;
  cost_price?: number;
  category_id: string;
  images: string[];
  sku?: string;
  stock_quantity: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  location?: string;
  lastUpdated: string;
}

export interface StockAdjustment {
  productId: string;
  quantity: number;
  type: 'increment' | 'decrement';
  reason?: string;
}

// Order Types
export interface Order {
  id: string;
  customerId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customerId: string;
  shippingAddress: string;
}

// WebSocket Event Types
export interface InventoryUpdateEvent {
  productId: string;
  stock: number;
  timestamp: string;
}

export interface OrderStatusEvent {
  orderId: string;
  status: string;
  timestamp: string;
}

export interface SystemAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Analytics Types
export interface SalesAnalytics {
  revenue: number;
  orders: number;
  period: string;
  growth?: number;
}

export interface InventoryMetrics {
  totalProducts: number;
  lowStockItems: number;
  totalValue: number;
  turnoverRate: number;
}
