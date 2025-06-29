// Product Database Types for Supabase

export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  category_id: string;
  sku: string | null;
  barcode: string | null;
  brand: string | null;
  model: string | null;
  weight: number | null;
  dimensions_length: number | null;
  dimensions_width: number | null;
  dimensions_height: number | null;
  base_price: number;
  selling_price: number;
  cost_price: number | null;
  discount_percentage: number;
  tax_rate: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number | null;
  track_inventory: boolean;
  status: 'draft' | 'published' | 'archived';
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  featured_image_url: string | null;
  gallery_images: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  meta_keywords: string[] | null;
  attributes: Record<string, any>;
  variants: any[];
  requires_shipping: boolean;
  shipping_weight: number | null;
  shipping_dimensions: Record<string, any> | null;
  average_rating: number;
  review_count: number;
  total_sales: number;
  revenue_generated: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  name: string;
  description?: string | null;
  slug: string;
  category_id: string;
  sku?: string | null;
  barcode?: string | null;
  brand?: string | null;
  model?: string | null;
  weight?: number | null;
  dimensions_length?: number | null;
  dimensions_width?: number | null;
  dimensions_height?: number | null;
  base_price: number;
  selling_price: number;
  cost_price?: number | null;
  discount_percentage?: number;
  tax_rate?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  max_stock_level?: number | null;
  track_inventory?: boolean;
  status?: 'draft' | 'published' | 'archived';
  is_active?: boolean;
  is_featured?: boolean;
  is_digital?: boolean;
  featured_image_url?: string | null;
  gallery_images?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  meta_keywords?: string[] | null;
  attributes?: Record<string, any>;
  variants?: any[];
  requires_shipping?: boolean;
  shipping_weight?: number | null;
  shipping_dimensions?: Record<string, any> | null;
  created_by?: string | null;
}

export interface ProductUpdate {
  name?: string;
  description?: string | null;
  slug?: string;
  category_id?: string;
  sku?: string | null;
  barcode?: string | null;
  brand?: string | null;
  model?: string | null;
  weight?: number | null;
  dimensions_length?: number | null;
  dimensions_width?: number | null;
  dimensions_height?: number | null;
  base_price?: number;
  selling_price?: number;
  cost_price?: number | null;
  discount_percentage?: number;
  tax_rate?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  max_stock_level?: number | null;
  track_inventory?: boolean;
  status?: 'draft' | 'published' | 'archived';
  is_active?: boolean;
  is_featured?: boolean;
  is_digital?: boolean;
  featured_image_url?: string | null;
  gallery_images?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  meta_keywords?: string[] | null;
  attributes?: Record<string, any>;
  variants?: any[];
  requires_shipping?: boolean;
  shipping_weight?: number | null;
  shipping_dimensions?: Record<string, any> | null;
}

// Product with Category Information
export interface ProductWithCategory extends ProductRow {
  category_name: string;
  category_path: string;
}

// Product Stats
export interface ProductStatsRow {
  total_products: number;
  published_products: number;
  draft_products: number;
  active_products: number;
  featured_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  average_price: number;
  total_stock_value: number;
  total_revenue: number;
  recent_products: number;
}

// API Filters
export interface ProductFilters {
  search?: string;
  category_id?: string;
  status?: 'draft' | 'published' | 'archived';
  is_active?: boolean;
  is_featured?: boolean;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort_by?: 'name' | 'created_at' | 'selling_price' | 'stock_quantity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Form Data Types
export interface ProductFormData {
  name: string;
  description?: string;
  category_id: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  model?: string;
  base_price: number;
  selling_price: number;
  cost_price?: number;
  discount_percentage?: number;
  tax_rate?: number;
  stock_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  track_inventory: boolean;
  status: 'draft' | 'published' | 'archived';
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  featured_image_url?: string;
  gallery_images?: string[];
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string[];
  requires_shipping: boolean;
  weight?: number;
  dimensions_length?: number;
  dimensions_width?: number;
  dimensions_height?: number;
  shipping_weight?: number;
}

// API Response Types
export interface ProductResponse {
  data: ProductRow;
  success: boolean;
  message?: string;
}

export interface ProductsResponse {
  data: ProductWithCategory[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  success: boolean;
}

export interface ProductStatsResponse {
  data: ProductStatsRow;
  success: boolean;
}
