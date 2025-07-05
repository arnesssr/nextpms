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
import { createServerSupabaseClient } from '@/lib/supabaseServer';

// 🟦 HIGH-LEVEL GLOBAL SERVICE
// Purpose: Business logic layer with direct Supabase database access
// Used by: API routes in src/app/api/suppliers/*
// Level: Core business operations

const supplierService = {
  // Get all suppliers with pagination and filters
  getSuppliers: async (filters?: SupplierFilters): Promise<SuppliersResponse> => {
    try {
      const supabase = createServerSupabaseClient();
      let query = supabase.from('suppliers').select('*', { count: 'exact' });
      
      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.business_type) {
        query = query.eq('business_type', filters.business_type);
      }
      
      if (filters?.supplier_type) {
        query = query.eq('supplier_type', filters.supplier_type);
      }
      
      // Apply sorting
      if (filters?.sort_by) {
        const order = filters.sort_order === 'desc' ? { ascending: false } : { ascending: true };
        query = query.order(filters.sort_by, order);
      } else {
        query = query.order('name', { ascending: true });
      }
      
      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          pages: totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error('Failed to fetch suppliers');
    }
  },

  // Get single supplier by ID
  getSupplier: async (id: string): Promise<SupplierResponse> => {
    try {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Supplier not found');
        }
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error('Supplier not found');
      }
      
      return {
        data: {
          ...data,
          address: [data.address_line_1, data.address_line_2, data.city, data.state]
            .filter(Boolean)
            .join(', '),
          createdAt: data.created_at,
          updatedAt: data.updated_at
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
      const supabase = createServerSupabaseClient();
      const supplierData = {
        ...data,
        status: data.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: newSupplier, error } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!newSupplier) {
        throw new Error('Failed to create supplier');
      }
      
      return {
        data: {
          ...newSupplier,
          address: [newSupplier.address_line_1, newSupplier.address_line_2, newSupplier.city, newSupplier.state]
            .filter(Boolean)
            .join(', '),
          createdAt: newSupplier.created_at,
          updatedAt: newSupplier.updated_at
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
      const supabase = createServerSupabaseClient();
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      const { data: updatedSupplier, error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!updatedSupplier) {
        throw new Error('Supplier not found');
      }
      
      return {
        data: {
          ...updatedSupplier,
          address: [updatedSupplier.address_line_1, updatedSupplier.address_line_2, updatedSupplier.city, updatedSupplier.state]
            .filter(Boolean)
            .join(', '),
          createdAt: updatedSupplier.created_at,
          updatedAt: updatedSupplier.updated_at
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
      const supabase = createServerSupabaseClient();
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        success: true,
        message: 'Supplier deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete supplier');
    }
  },

  // Get supplier statistics
  getSupplierStats: async (): Promise<{ success: boolean; data: SupplierSummary }> => {
    try {
      const supabase = createServerSupabaseClient();
      // Get total count of suppliers by status
      const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('status, business_type, supplier_type, rating, created_at');
        
      if (error) {
        throw new Error(error.message);
      }
      
      const stats = suppliers.reduce((acc, supplier) => {
        acc.total_suppliers++;
        
        switch (supplier.status) {
          case 'active':
            acc.active_suppliers++;
            break;
          case 'inactive':
            acc.inactive_suppliers++;
            break;
          case 'suspended':
            acc.suspended_suppliers++;
            break;
          case 'pending':
            acc.pending_suppliers++;
            break;
        }
        
        return acc;
      }, {
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
      });
      
      return {
        success: true,
        data: stats
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
