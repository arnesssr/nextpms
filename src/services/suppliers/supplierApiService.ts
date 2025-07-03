import { createServerSupabaseAnonymousClient } from '@/lib/supabaseServer';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '@/types/supplier.types';

const supplierApiService = {
  // Fetch all suppliers
  fetchSuppliers: async (filters?: Record<string, any>) => {
    const supabase = createServerSupabaseAnonymousClient();

    let query = supabase.from('suppliers').select('*');

    // Apply filters
    if (filters) {
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.business_type) {
        query = query.eq('business_type', filters.business_type);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    return data;
  },

  // Get supplier by ID
  getSupplierById: async (id: string) => {
    const supabase = createServerSupabaseAnonymousClient();

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching supplier by ID:', error);
      throw error;
    }

    return data;
  },

  // Create new supplier
  createSupplier: async (supplier: CreateSupplierRequest) => {
    const supabase = createServerSupabaseAnonymousClient();

    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .single();

    if (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }

    return data;
  },

  // Update supplier
  updateSupplier: async (id: string, supplier: UpdateSupplierRequest) => {
    const supabase = createServerSupabaseAnonymousClient();

    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }

    return data;
  },

  // Delete supplier
  deleteSupplier: async (id: string) => {
    const supabase = createServerSupabaseAnonymousClient();

    const { data, error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }

    return data;
  }
};

export default supplierApiService;
