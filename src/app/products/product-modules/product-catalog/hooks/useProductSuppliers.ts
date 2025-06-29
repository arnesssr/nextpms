import { useState, useEffect } from 'react';
import { ProductSupplier } from '../types';

interface UseProductSuppliersState {
  suppliers: ProductSupplier[];
  loading: boolean;
  error: string | null;
}

interface UseProductSuppliersActions {
  refreshSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<ProductSupplier, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<ProductSupplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplierById: (id: string) => ProductSupplier | undefined;
  searchSuppliers: (query: string) => ProductSupplier[];
}

export const useProductSuppliers = (): UseProductSuppliersState & UseProductSuppliersActions => {
  const [allSuppliers, setAllSuppliers] = useState<ProductSupplier[]>([]);
  const [suppliers, setSuppliers] = useState<ProductSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  const mockSuppliers: ProductSupplier[] = [
    {
      id: '1',
      name: 'TechCorp Electronics',
      contact_person: 'John Smith',
      email: 'john@techcorp.com',
      phone: '+1-555-0123',
      address: '123 Tech Street, Silicon Valley, CA 94000',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Global Fashion Co.',
      contact_person: 'Sarah Johnson',
      email: 'sarah@globalfashion.com',
      phone: '+1-555-0456',
      address: '456 Fashion Ave, New York, NY 10001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'HomeGoods Direct',
      contact_person: 'Mike Wilson',
      email: 'mike@homegoods.com',
      phone: '+1-555-0789',
      address: '789 Home Blvd, Chicago, IL 60601',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Eco Garden Supplies',
      contact_person: 'Lisa Green',
      email: 'lisa@ecogarden.com',
      phone: '+1-555-0321',
      address: '321 Garden Lane, Portland, OR 97201',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      name: 'Premium Electronics Ltd.',
      contact_person: 'David Chen',
      email: 'david@premiumtech.com',
      phone: '+1-555-0654',
      address: '654 Premium Way, Austin, TX 73301',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const refreshSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAllSuppliers(mockSuppliers);
      setSuppliers(mockSuppliers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suppliers';
      setError(errorMessage);
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async (supplier: Omit<ProductSupplier, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSupplier: ProductSupplier = {
        ...supplier,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const updatedSuppliers = [...allSuppliers, newSupplier];
      setAllSuppliers(updatedSuppliers);
      setSuppliers(updatedSuppliers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create supplier';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (id: string, updates: Partial<ProductSupplier>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updateFunction = (suppliers: ProductSupplier[]) =>
        suppliers.map(supplier =>
          supplier.id === id
            ? { ...supplier, ...updates, updated_at: new Date().toISOString() }
            : supplier
        );

      setAllSuppliers(updateFunction);
      setSuppliers(updateFunction);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update supplier';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Check if supplier has associated products
      // if (hasAssociatedProducts) {
      //   throw new Error('Cannot delete supplier with associated products');
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filterFunction = (suppliers: ProductSupplier[]) =>
        suppliers.filter(supplier => supplier.id !== id);

      setAllSuppliers(filterFunction);
      setSuppliers(filterFunction);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete supplier';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSupplierById = (id: string): ProductSupplier | undefined => {
    return allSuppliers.find(supplier => supplier.id === id);
  };

  const searchSuppliers = (query: string): ProductSupplier[] => {
    if (!query.trim()) {
      return allSuppliers;
    }

    const lowercaseQuery = query.toLowerCase();
    return allSuppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(lowercaseQuery) ||
      (supplier.contact_person && supplier.contact_person.toLowerCase().includes(lowercaseQuery)) ||
      (supplier.email && supplier.email.toLowerCase().includes(lowercaseQuery)) ||
      (supplier.phone && supplier.phone.includes(query))
    );
  };

  useEffect(() => {
    refreshSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    refreshSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    searchSuppliers,
  };
};
