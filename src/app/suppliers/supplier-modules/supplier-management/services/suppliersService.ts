import { Supplier, SupplierFormData, SupplierFilters, SuppliersResponse } from '../types/suppliers.types';
// 🟩 LOW-LEVEL MODULE SERVICE
// Purpose: Client-side HTTP calls to API routes
// Used by: React components
// Level: Client-side data management

// Mapping functions to ensure form values match database constraints
const mapBusinessType = (formType: string): string => {
  // Form uses: 'manufacturer' | 'distributor' | 'retailer' | 'service_provider'
  // DB allows: 'corporation', 'llc', 'partnership', 'sole_proprietorship', 'other'
  
  switch (formType) {
    case 'manufacturer':
    case 'distributor':
    case 'retailer':
      return 'corporation'; // Most business suppliers are corporations
    case 'service_provider':
      return 'llc'; // Service providers often LLCs
    default:
      return 'corporation';
  }
};

const mapSupplierType = (formType: string): string => {
  // Form uses: 'primary' | 'secondary' | 'backup'
  // DB allows: 'manufacturer', 'distributor', 'wholesaler', 'service_provider', 'other'
  
  switch (formType) {
    case 'primary':
      return 'manufacturer';
    case 'secondary':
      return 'distributor';
    case 'backup':
      return 'wholesaler';
    default:
      return 'manufacturer';
  }
};

// Transform global service types to module types
function transformSupplierFromGlobal(globalSupplier: any): Supplier {
  return {
    id: globalSupplier.id,
    name: globalSupplier.primary_contact_name || globalSupplier.name,
    companyName: globalSupplier.name, // Main name is company name in DB
    email: globalSupplier.email,
    phone: globalSupplier.phone,
    address: {
      street: globalSupplier.address_line_1 || '',
      city: globalSupplier.city || '',
      state: globalSupplier.state || '',
      zipCode: globalSupplier.postal_code || '',
      country: globalSupplier.country || ''
    },
    contactPerson: {
      name: globalSupplier.primary_contact_name || '',
      title: '', // Not in DB schema yet
      email: globalSupplier.primary_contact_email || globalSupplier.email,
      phone: globalSupplier.primary_contact_phone || globalSupplier.phone
    },
    businessType: globalSupplier.business_type || 'manufacturer',
    supplierType: globalSupplier.supplier_type || 'primary',
    status: globalSupplier.status || 'active',
    performanceRating: globalSupplier.rating ? (
      globalSupplier.rating >= 4 ? 'excellent' :
      globalSupplier.rating >= 3 ? 'good' :
      globalSupplier.rating >= 2 ? 'average' : 'poor'
    ) : 'average',
    paymentTerms: globalSupplier.payment_terms || '',
    taxId: globalSupplier.tax_id || '',
    website: globalSupplier.website || '',
    notes: globalSupplier.notes || '',
    createdAt: new Date(globalSupplier.created_at || globalSupplier.createdAt),
    updatedAt: new Date(globalSupplier.updated_at || globalSupplier.updatedAt)
  };
}

const transformSupplierToGlobal = (moduleSupplier: SupplierFormData) => {
  return {
    name: moduleSupplier.companyName, // Use company name as the main name
    email: moduleSupplier.email,
    phone: moduleSupplier.phone,
    website: moduleSupplier.website || null,
    
    // Address information
    address_line_1: moduleSupplier.address.street || null,
    address_line_2: null, // Not in form yet
    city: moduleSupplier.address.city || null,
    state: moduleSupplier.address.state || null,
    postal_code: moduleSupplier.address.zipCode || null,
    country: moduleSupplier.address.country || null,
    
    // Business information
    tax_id: moduleSupplier.taxId || null,
    business_registration: null, // Not in form yet
    business_type: mapBusinessType(moduleSupplier.businessType),
    
    // Contact information
    primary_contact_name: moduleSupplier.contactPerson.name || moduleSupplier.name,
    primary_contact_email: moduleSupplier.contactPerson.email || moduleSupplier.email,
    primary_contact_phone: moduleSupplier.contactPerson.phone || moduleSupplier.phone,
    
    // Payment and terms
    payment_terms: moduleSupplier.paymentTerms || null,
    credit_limit: null, // Not in form yet
    currency: 'USD', // Default
    
    // Performance metrics
    rating: null, // Will be set later
    lead_time_days: null, // Not in form yet
    minimum_order_amount: null, // Not in form yet
    
    // Status and categorization
    status: 'active', // Default for new suppliers
    supplier_type: mapSupplierType(moduleSupplier.supplierType),
    category: null, // Not in form yet
    
    // Notes
    notes: moduleSupplier.notes || null,
    internal_notes: null // Not in form yet
  };
};

class SuppliersService {
  private static instance: SuppliersService;

  static getInstance(): SuppliersService {
    if (!SuppliersService.instance) {
      SuppliersService.instance = new SuppliersService();
    }
    return SuppliersService.instance;
  }

  async getSuppliers(filters: SupplierFilters = {}, page: number = 1, limit: number = 10): Promise<SuppliersResponse> {
    try {
      // Convert module filters to global service filters
      const globalFilters: any = {};
      if (filters.search) globalFilters.search = filters.search;
      if (filters.status) globalFilters.status = filters.status;
      if (filters.businessType) globalFilters.business_type = filters.businessType;
      if (filters.supplierType) globalFilters.supplier_type = filters.supplierType;
      if (filters.performanceRating) globalFilters.performance_rating = filters.performanceRating;
      
      // Add pagination to filters
      globalFilters.page = page;
      globalFilters.limit = limit;

      // Make HTTP call to API route instead of direct service call
      const queryParams = new URLSearchParams();
      Object.entries(globalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const apiResponse = await fetch(`/api/suppliers?${queryParams.toString()}`);
      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      
      const apiData = await apiResponse.json();
      if (!apiData.data) {
        throw new Error('Invalid API response format');
      }
      
      // Transform API response to module format
      const suppliers = apiData.data.map(transformSupplierFromGlobal);
      
      // Get stats from API route with fallback
      let stats = { total: 0, active: 0, inactive: 0, pending: 0, suspended: 0 };
      
      try {
        const statsResponse = await fetch('/api/suppliers/summary');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.data) {
            const globalStats = statsData.data;
            stats = {
              total: globalStats.total_suppliers || 0,
              active: globalStats.active_suppliers || 0,
              inactive: globalStats.inactive_suppliers || 0,
              pending: globalStats.pending_suppliers || 0,
              suspended: globalStats.suspended_suppliers || 0
            };
          }
        }
      } catch (statsError) {
        // Use supplier count from current response
        stats.total = suppliers.length;
        stats.active = suppliers.filter(s => s.status === 'active').length;
        stats.inactive = suppliers.filter(s => s.status === 'inactive').length;
        stats.pending = suppliers.filter(s => s.status === 'pending').length;
        stats.suspended = suppliers.filter(s => s.status === 'suspended').length;
      }

      const result = {
        suppliers,
        pagination: apiData.pagination || {
          page,
          limit,
          total: suppliers.length,
          totalPages: Math.ceil(suppliers.length / limit)
        },
        stats
      };
      
      return result;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch suppliers');
    }
  }
  

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const apiResponse = await fetch(`/api/suppliers/${id}`);
      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      
      const apiData = await apiResponse.json();
      if (!apiData.data) {
        throw new Error('Invalid API response format');
      }
      
      return transformSupplierFromGlobal(apiData.data);
    } catch (error) {
      console.error('Error fetching supplier by ID:', error);
      return null;
    }
  }

  async createSupplier(supplierData: SupplierFormData): Promise<Supplier> {
    try {
      const globalData = transformSupplierToGlobal(supplierData);
      
      const apiResponse = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(globalData),
      });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      
      const apiData = await apiResponse.json();
      if (!apiData.data) {
        throw new Error('Invalid API response format');
      }
      
      return transformSupplierFromGlobal(apiData.data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create supplier');
    }
  }

  async updateSupplier(id: string, supplierData: Partial<SupplierFormData>): Promise<Supplier> {
    try {
      const globalData = transformSupplierToGlobal(supplierData as SupplierFormData);
      
      const apiResponse = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(globalData),
      });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      
      const apiData = await apiResponse.json();
      if (!apiData.data) {
        throw new Error('Invalid API response format');
      }
      
      return transformSupplierFromGlobal(apiData.data);
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update supplier');
    }
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      const apiResponse = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete supplier');
    }
  }
}

export const suppliersService = SuppliersService.getInstance();
