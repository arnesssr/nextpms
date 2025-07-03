import { 
  Supplier, 
  CreateSupplierRequest, 
  UpdateSupplierRequest, 
  SupplierFilters, 
  SuppliersResponse, 
  SupplierResponse, 
  SupplierSummary,
  SupplierStatus 
} from '@/types/supplier.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const supplierService = {
  // Get all suppliers with pagination and filters
  getSuppliers: async (filters?: SupplierFilters): Promise<SuppliersResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${API_BASE_URL}/suppliers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Ensure response format matches expected structure
      if (data.data) {
        return {
          data: data.data.map((supplier: any) => ({
            ...supplier,
            address: [supplier.address_line_1, supplier.address_line_2, supplier.city, supplier.state]
              .filter(Boolean)
              .join(', '),
            createdAt: supplier.created_at,
            updatedAt: supplier.updated_at
          })),
          pagination: data.pagination || {
            page: 1,
            limit: data.data.length,
            total: data.data.length,
            pages: 1
          }
        };
      }
      
      // Handle direct array response
      return {
        data: data.map((supplier: any) => ({
          ...supplier,
          address: [supplier.address_line_1, supplier.address_line_2, supplier.city, supplier.state]
            .filter(Boolean)
            .join(', '),
          createdAt: supplier.created_at,
          updatedAt: supplier.updated_at
        })),
        pagination: {
          page: 1,
          limit: data.length,
          total: data.length,
          pages: 1
        }
      };
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch suppliers');
    }
  },

  // Get single supplier by ID
  getSupplier: async (id: string): Promise<SupplierResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Supplier not found');
        }
        throw new Error(`Failed to fetch supplier: ${response.statusText}`);
      }
      
      const data = await response.json();
      const supplier = data.data || data;
      
      return {
        data: {
          ...supplier,
          address: [supplier.address_line_1, supplier.address_line_2, supplier.city, supplier.state]
            .filter(Boolean)
            .join(', '),
          createdAt: supplier.created_at,
          updatedAt: supplier.updated_at
        }
      };
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch supplier');
    }
  },

  // Create new supplier
  createSupplier: async (data: CreateSupplierRequest): Promise<SupplierResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create supplier: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const supplier = responseData.data || responseData;
      
      return {
        data: {
          ...supplier,
          address: [supplier.address_line_1, supplier.address_line_2, supplier.city, supplier.state]
            .filter(Boolean)
            .join(', '),
          createdAt: supplier.created_at,
          updatedAt: supplier.updated_at
        }
      };
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create supplier');
    }
  },

  // Update existing supplier
  updateSupplier: async (id: string, data: UpdateSupplierRequest): Promise<SupplierResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update supplier: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const supplier = responseData.data || responseData;
      
      return {
        data: {
          ...supplier,
          address: [supplier.address_line_1, supplier.address_line_2, supplier.city, supplier.state]
            .filter(Boolean)
            .join(', '),
          createdAt: supplier.created_at,
          updatedAt: supplier.updated_at
        }
      };
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update supplier');
    }
  },

  // Delete supplier
  deleteSupplier: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete supplier: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        message: data.data?.message || 'Supplier deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete supplier');
    }
  },

  // Get supplier statistics
  getSupplierStats: async (): Promise<{ success: boolean; data: SupplierSummary }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/summary`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch supplier stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching supplier stats:', error);
      // Return default stats to prevent UI crashes
      return {
        success: false,
        data: {
          total_suppliers: 0,
          active_suppliers: 0,
          inactive_suppliers: 0,
          suspended_suppliers: 0,
          pending_suppliers: 0,
          total_orders: 0,
          total_order_value: 0,
          average_rating: 0,
          suppliers_by_type: [],
          suppliers_by_performance: [],
          top_suppliers: [],
          recent_suppliers: []
        }
      };
    }
  },

  // Search suppliers
  searchSuppliers: async (query: string): Promise<SuppliersResponse> => {
    return supplierService.getSuppliers({ search: query });
  },

  // Filter suppliers by status
  getSuppliersByStatus: async (status: SupplierStatus): Promise<SuppliersResponse> => {
    return supplierService.getSuppliers({ status });
  },

  // Activate supplier
  activateSupplier: async (id: string): Promise<SupplierResponse> => {
    return supplierService.updateSupplier(id, { status: SupplierStatus.ACTIVE });
  },

  // Deactivate supplier
  deactivateSupplier: async (id: string): Promise<SupplierResponse> => {
    return supplierService.updateSupplier(id, { status: SupplierStatus.INACTIVE });
  },

  // Suspend supplier
  suspendSupplier: async (id: string): Promise<SupplierResponse> => {
    return supplierService.updateSupplier(id, { status: SupplierStatus.SUSPENDED });
  },

  // Utility methods
  validateSupplierData: (data: CreateSupplierRequest): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Supplier name is required');
    }

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    if (!data.phone?.trim()) {
      errors.push('Phone number is required');
    }

    if (data.credit_limit && data.credit_limit < 0) {
      errors.push('Credit limit cannot be negative');
    }

    if (data.rating && (data.rating < 0 || data.rating > 5)) {
      errors.push('Rating must be between 0 and 5');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  formatSupplierAddress: (supplier: Supplier): string => {
    const addressParts = [
      supplier.address_line_1,
      supplier.address_line_2,
      supplier.city,
      supplier.state,
      supplier.postal_code,
      supplier.country
    ].filter(Boolean);
    
    return addressParts.join(', ');
  },

  getSupplierDisplayName: (supplier: Supplier): string => {
    return supplier.name || supplier.code || `Supplier ${supplier.id}`;
  }
};

export default supplierService;
export { supplierService };
