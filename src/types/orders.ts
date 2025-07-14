// Extended Order Types for Order Management Module

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    base_price: number;
    selling_price: number;
    images: string[];
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer?: Customer;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_method?: string;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  notes?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface ShippingAddress {
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface CreateOrderRequest {
  customer_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price?: number;
  }>;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  payment_method?: string;
  notes?: string;
  discount_amount?: number;
  shipping_amount?: number;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  tracking_number?: string;
  notes?: string;
  shipping_address?: ShippingAddress;
  billing_address?: ShippingAddress;
}

export interface OrderFilters {
  status?: OrderStatus[];
  payment_status?: PaymentStatus[];
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
  orders_today: number;
  revenue_today: number;
}


export interface ReturnRequest {
  id: string;
  order_id: string;
  order?: Order;
  items: Array<{
    order_item_id: string;
    quantity: number;
    reason: string;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  reason: string;
  refund_amount: number;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface FulfillmentItem {
  order_item_id: string;
  quantity_to_fulfill: number;
  warehouse_location?: string;
}

export interface FulfillmentRequest {
  order_id: string;
  items: FulfillmentItem[];
  tracking_number?: string;
  shipping_carrier?: string;
  notes?: string;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  status: OrderStatus;
  description: string;
  created_at: string;
  created_by?: string;
}