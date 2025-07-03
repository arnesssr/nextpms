import { 
  Supplier,
  CreateSupplierRequest, 
  UpdateSupplierRequest, 
  SupplierFilters,
  SupplierSummary,
  SuppliersResponse, 
  SupplierResponse,
  BulkSupplierAction,
  SupplierMetrics
} from '../types/supplier.types';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class SuppliersService {
  private apiUrl = `${API_BASE_URL}/suppliers`;

  async fetchSuppliers(filters?: SupplierFilters): Promise<SuppliersResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.apiUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('Fetching suppliers from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      console.log('Raw suppliers data:', rawData);
      
      // Map API response to proper format
      const suppliers: Supplier[] = (rawData.data || rawData || []).map((item: any) => ({
        ...item,
        // Ensure computed fields are set
        address: [item.address_line_1, item.address_line_2, item.city, item.state]
          .filter(Boolean)
          .join(', '),
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      // Return formatted response
      return {
        data: suppliers,
        pagination: rawData.pagination || {
          page: 1,
          limit: suppliers.length,
          total: suppliers.length,
          pages: 1
        }
      };
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Return mock data for testing UI functionality
      const mockSuppliers = [
        {
          id: 'mock-1',
          name: 'Acme Corporation',
          code: 'ACME001',
          email: 'contact@acme.com',
          phone: '+1-555-0123',
          status: 'active',
          business_type: 'corporation',
          supplier_type: 'manufacturer',
          category: 'Electronics',
          address: '123 Business St, Business City, BC',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rating: 4.5,
          credit_limit: 50000,
          currency: 'USD'
        },
        {
          id: 'mock-2',
          name: 'Global Supplies Inc',
          code: 'GSI002',
          email: 'orders@globalsupplies.com',
          phone: '+1-555-0456',
          status: 'active',
          business_type: 'corporation',
          supplier_type: 'distributor',
          category: 'Manufacturing',
          address: '456 Supply Ave, Supply Town, ST',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rating: 4.2,
          credit_limit: 75000,
          currency: 'USD'
        },
        {
          id: 'mock-3',
          name: 'Tech Parts Ltd',
          code: 'TPL003',
          email: 'sales@techparts.com',
          phone: '+1-555-0789',
          status: 'pending',
          business_type: 'llc',
          supplier_type: 'manufacturer',
          category: 'Technology',
          address: '789 Tech Blvd, Innovation City, IC',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rating: 3.8,
          credit_limit: 25000,
          currency: 'USD'
        }
      ];
      
      return {
        data: mockSuppliers,
        pagination: {
          page: 1,
          limit: mockSuppliers.length,
          total: mockSuppliers.length,
          pages: 1
        }
      };
    }
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch supplier: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      const supplier = rawData.data || rawData;
      
      return {
        ...supplier,
        address: [supplier.address_line_1, supplier.address_line_2, supplier.city, supplier.state]
          .filter(Boolean)
          .join(', '),
        createdAt: supplier.created_at,
        updatedAt: supplier.updated_at
      };
    } catch (error) {
      console.error('Error fetching supplier by ID:', error);
      return null;
    }
  }

  async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create supplier: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      const supplier = rawData.data || rawData;
      
      return {
        ...supplier,
        address: [supplier.address_line_1, supplier.address_line_2, supplier.city, supplier.state]
          .filter(Boolean)
          .join(', '),
        createdAt: supplier.created_at,
        updatedAt: supplier.updated_at
      };
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  async updateSupplier(id: string, data: UpdateSupplierRequest): Promise<Supplier> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update supplier: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      const supplier = rawData.data || rawData;
      
      return {
        ...supplier,
        address: [supplier.address_line_1, supplier.address_line_2, supplier.city, supplier.state]
          .filter(Boolean)
          .join(', '),
        createdAt: supplier.created_at,
        updatedAt: supplier.updated_at
      };
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete supplier: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }

  async fetchSupplierSummary(filters?: SupplierFilters): Promise<SupplierSummary> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.apiUrl}/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch supplier summary: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      return rawData.data || rawData;
    } catch (error) {
      console.error('Error fetching supplier summary:', error);
      // Return mock summary for testing UI functionality
      return {
        total_suppliers: 3,
        active_suppliers: 2,
        inactive_suppliers: 0,
        suspended_suppliers: 0,
        pending_suppliers: 1,
        total_orders: 0,
        total_order_value: 0,
        average_rating: 4.2,
        suppliers_by_type: [
          { type: 'manufacturer', count: 2, percentage: 67 },
          { type: 'distributor', count: 1, percentage: 33 }
        ],
        suppliers_by_performance: [
          { status: 'excellent', count: 1, percentage: 33 },
          { status: 'good', count: 2, percentage: 67 },
          { status: 'fair', count: 0, percentage: 0 },
          { status: 'poor', count: 0, percentage: 0 },
          { status: 'not_rated', count: 0, percentage: 0 }
        ],
        top_suppliers: [],
        recent_suppliers: []
      };
    }
  }

  async fetchSupplierMetrics(supplierId: string): Promise<SupplierMetrics | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${supplierId}/metrics`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch supplier metrics: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching supplier metrics:', error);
      return null;
    }
  }

  async bulkUpdateSuppliers(action: BulkSupplierAction): Promise<Supplier[]> {
    try {
      const response = await fetch(`${this.apiUrl}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to perform bulk action: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw error;
    }
  }

  async exportSuppliers(filters?: SupplierFilters, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      queryParams.append('format', format);
      
      const url = `${this.apiUrl}/export?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to export suppliers: ${response.statusText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('Error exporting suppliers:', error);
      throw error;
    }
  }
}

export const suppliersService = new SuppliersService();
