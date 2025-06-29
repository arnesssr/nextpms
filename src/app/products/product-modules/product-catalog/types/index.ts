// Product-related types
export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  category_id: string;
  category?: string; // Added for display purposes
  supplier_id?: string;
  base_price: number;
  selling_price: number;
  cost_price?: number;
  stock_quantity: number;
  current_stock: number; // Added for compatibility
  min_stock_level: number;
  minimum_stock: number; // Added for compatibility
  max_stock_level?: number;
  unit_of_measure: string;
  weight?: number;
  dimensions?: ProductDimensions;
  images?: string[];
  status: ProductStatus;
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  // Additional legacy properties for compatibility
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit: 'cm' | 'in' | 'm';
}

export type ProductStatus = 'active' | 'inactive' | 'discontinued' | 'out_of_stock' | 'pending';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductSupplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

// Form types
export interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  category_id: string;
  supplier_id?: string;
  base_price: number;
  selling_price: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level?: number;
  unit_of_measure: string;
  weight?: number;
  dimensions?: ProductDimensions;
  status: ProductStatus;
  tags?: string[];
}

// API response types
export interface ProductsResponse {
  data: Product[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  supplier_id?: string;
  status?: ProductStatus;
  min_price?: number;
  max_price?: number;
  low_stock?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'selling_price' | 'stock_quantity' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// UI component props
export interface ProductListProps {
  filters?: ProductFilters;
  onProductSelect?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
  onProductDelete?: (productId: string) => void;
}

export interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: Product) => void;
}
