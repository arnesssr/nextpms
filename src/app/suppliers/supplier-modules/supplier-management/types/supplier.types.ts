export interface Supplier {
  id: string;
  name: string;
  code?: string;
  email: string;
  phone: string;
  website?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  business_registration?: string;
  business_type?: BusinessType;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  payment_terms?: string;
  credit_limit?: number;
  currency?: string;
  rating?: number;
  lead_time_days?: number;
  minimum_order_amount?: number;
  status: SupplierStatus;
  supplier_type?: SupplierType;
  category?: string;
  notes?: string;
  internal_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_order_date?: string;
  total_orders?: number;
  total_order_value?: number;
  performance_status?: PerformanceStatus;
  days_since_last_order?: number;
  
  // Computed fields for UI
  address?: string; // Full address string for display
  createdAt: string; // Alias for created_at
  updatedAt: string; // Alias for updated_at
}

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum SupplierType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  WHOLESALER = 'wholesaler',
  RETAILER = 'retailer',
  SERVICE_PROVIDER = 'service_provider',
  CONTRACTOR = 'contractor'
}

export enum BusinessType {
  CORPORATION = 'corporation',
  LLC = 'llc',
  PARTNERSHIP = 'partnership',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  NON_PROFIT = 'non_profit',
  GOVERNMENT = 'government'
}

export enum PerformanceStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  NOT_RATED = 'not_rated'
}

export interface SupplierFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: SupplierStatus;
  business_type?: BusinessType;
  supplier_type?: SupplierType;
  performance_status?: PerformanceStatus;
  category?: string;
  sort_by?: 'name' | 'created_at' | 'rating' | 'status' | 'last_order_date';
  sort_order?: 'asc' | 'desc';
  rating_min?: number;
  rating_max?: number;
  credit_limit_min?: number;
  credit_limit_max?: number;
  date_range_start?: string;
  date_range_end?: string;
}

export interface CreateSupplierRequest {
  name: string;
  code?: string;
  email: string;
  phone: string;
  website?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  business_registration?: string;
  business_type?: BusinessType;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  payment_terms?: string;
  credit_limit?: number;
  currency?: string;
  rating?: number;
  lead_time_days?: number;
  minimum_order_amount?: number;
  status: SupplierStatus;
  supplier_type?: SupplierType;
  category?: string;
  notes?: string;
  internal_notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  website?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  business_registration?: string;
  business_type?: BusinessType;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  payment_terms?: string;
  credit_limit?: number;
  currency?: string;
  rating?: number;
  lead_time_days?: number;
  minimum_order_amount?: number;
  status?: SupplierStatus;
  supplier_type?: SupplierType;
  category?: string;
  notes?: string;
  internal_notes?: string;
}

export interface SupplierSummary {
  total_suppliers: number;
  active_suppliers: number;
  inactive_suppliers: number;
  suspended_suppliers: number;
  pending_suppliers: number;
  total_orders: number;
  total_order_value: number;
  average_rating: number;
  suppliers_by_type: SupplierTypeCount[];
  suppliers_by_performance: PerformanceCount[];
  top_suppliers: Supplier[];
  recent_suppliers: Supplier[];
}

export interface SupplierTypeCount {
  type: SupplierType;
  count: number;
  percentage: number;
}

export interface PerformanceCount {
  status: PerformanceStatus;
  count: number;
  percentage: number;
}

export interface SupplierMetrics {
  id: string;
  name: string;
  total_orders: number;
  total_order_value: number;
  average_order_value: number;
  on_time_delivery_rate: number;
  quality_rating: number;
  days_since_last_order: number;
  performance_trend: 'improving' | 'stable' | 'declining';
}

export interface SupplierContact {
  id: string;
  supplier_id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  is_primary: boolean;
  department?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierDocument {
  id: string;
  supplier_id: string;
  name: string;
  type: DocumentType;
  file_path: string;
  file_size: number;
  mime_type: string;
  description?: string;
  expiry_date?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export enum DocumentType {
  CONTRACT = 'contract',
  CERTIFICATE = 'certificate',
  LICENSE = 'license',
  INSURANCE = 'insurance',
  TAX_DOCUMENT = 'tax_document',
  QUALITY_CERT = 'quality_cert',
  OTHER = 'other'
}

// For bulk operations
export interface BulkSupplierAction {
  supplier_ids: string[];
  action: 'activate' | 'deactivate' | 'suspend' | 'delete';
  reason?: string;
}

// API Response interfaces
export interface SuppliersResponse {
  data: Supplier[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SupplierResponse {
  data: Supplier;
}

// Form validation schemas
export interface SupplierFormData extends CreateSupplierRequest {
  // Additional UI-only fields can be added here
}

// Export alias for backwards compatibility
export type { Supplier as SupplierTypes };
