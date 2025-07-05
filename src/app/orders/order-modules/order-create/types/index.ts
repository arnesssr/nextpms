export interface CreateOrderRequest {
  customerId: string;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface OrderCreateProps {
  onOrderCreated?: (orderId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateOrderRequest>;
}

export interface CustomerSearchProps {
  onSelect: (customer: Customer) => void;
  selectedCustomer?: Customer;
}

export interface ProductSearchProps {
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export interface OrderItemsProps {
  items: OrderItem[];
  onUpdateItem: (index: number, updates: Partial<OrderItem>) => void;
  onRemoveItem: (index: number) => void;
}

export interface OrderSummaryProps {
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
}
