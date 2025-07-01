import { useState, useEffect } from 'react';
import { Product } from '../types';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../services/productCatalogService';

interface UseProductCatalogState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface UseProductCatalogActions {
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => void;
  filterProducts: (filters: { status?: string; category?: string; supplier?: string }) => void;
}

export const useProductCatalog = (): UseProductCatalogState & UseProductCatalogActions => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      const formattedProducts = data?.map(product => {
        // Extract category name from nested category object or fallback
        // Handle both nested object and direct field cases
        const categoryName = product.categories?.name || product.category_name || 'Uncategorized';
        
        return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        sku: product.sku || `SKU-${product.id}`,
        barcode: product.barcode,
        category_id: product.category_id || '',
        category: categoryName, // Use category name from joined data
        category_name: categoryName,
        supplier_id: product.supplier_id,
        base_price: product.base_price || 0,
        selling_price: product.selling_price || 0,
        price: product.selling_price || product.base_price || 0, // For backward compatibility
        cost_price: product.cost_price,
        stock_quantity: product.stock_quantity || 0,
        current_stock: product.stock_quantity || 0,
        min_stock_level: product.min_stock_level || 10,
        minimum_stock: product.min_stock_level || 10,
        max_stock_level: product.max_stock_level,
        unit_of_measure: product.unit_of_measure || 'pcs',
        weight: product.weight,
        dimensions: product.dimensions,
        images: product.gallery_images || product.images || [],
        status: product.status || 'draft',
        tags: product.tags || [],
        created_at: product.created_at || product.createdAt,
        updated_at: product.updated_at || product.updatedAt,
        created_by: product.created_by || 'system'
      };
      }) || [];
      
      setAllProducts(formattedProducts);
      setProducts(formattedProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await createProduct({
        name: product.name,
        description: product.description,
        price: product.price,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      if (newProduct) {
        await refreshProducts();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editProduct = async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      await updateProduct(id, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        updatedAt: new Date().toISOString()
      });
      await refreshProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProduct(id);
      await refreshProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = (query: string) => {
    if (!query.trim()) {
      setProducts(allProducts);
      return;
    }

    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.sku.toLowerCase().includes(query.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
    );
    setProducts(filtered);
  };

  const filterProducts = (filters: { status?: string; category?: string; supplier?: string }) => {
    let filtered = allProducts;

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(product => product.status === filters.status);
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.supplier && filters.supplier !== 'all') {
      filtered = filtered.filter(product => product.supplier_id === filters.supplier);
    }

    setProducts(filtered);
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refreshProducts,
    addProduct,
    editProduct,
    removeProduct,
    searchProducts,
    filterProducts,
  };
};
