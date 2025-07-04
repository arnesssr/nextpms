export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  businessType: 'manufacturer' | 'distributor' | 'retailer' | 'service_provider';
  supplierType: 'primary' | 'secondary' | 'backup';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
  paymentTerms: string;
  taxId: string;
  website?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierFilters {
  search?: string;
  status?: string;
  businessType?: string;
  supplierType?: string;
  performanceRating?: string;
}

export interface SupplierFormData {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  businessType: 'manufacturer' | 'distributor' | 'retailer' | 'service_provider';
  supplierType: 'primary' | 'secondary' | 'backup';
  paymentTerms: string;
  taxId: string;
  website?: string;
  notes?: string;
}

export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
}

export interface SuppliersResponse {
  suppliers: Supplier[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: SupplierStats;
}

// Additional types needed by global service
export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

export interface CreateSupplierRequest {
  name: string;
  company_name?: string;
  email: string;
  phone: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  contact_name?: string;
  contact_title?: string;
  contact_email?: string;
  contact_phone?: string;
  business_type?: string;
  supplier_type?: string;
  payment_terms?: string;
  tax_id?: string;
  website?: string;
  notes?: string;
  status?: SupplierStatus;
  credit_limit?: number;
  rating?: number;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export interface SupplierResponse {
  data: Supplier;
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
  suppliers_by_type: Array<{ type: string; count: number }>;
  suppliers_by_performance: Array<{ rating: string; count: number }>;
  top_suppliers: Array<{ id: string; name: string; order_value: number }>;
  recent_suppliers: Supplier[];
}
