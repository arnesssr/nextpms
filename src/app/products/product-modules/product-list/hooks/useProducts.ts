import { useState, useEffect } from 'react';
import { ProductWithCategory } from '@/types/products';
import { productService } from '@/services/products';

interface UseProductsState {
  products: ProductWithCategory[];
  loading: boolean;
  error: string | null;
}

interface UseProductsActions {
  fetchProducts: () => Promise<void>;
  createProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, updates: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  filterProducts: (filters: Record<string, any>) => Promise<void>;
}

export const useProducts = (): UseProductsState & UseProductsActions => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts();
      setProducts(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.createProduct(product);
      const newProduct = response.data;
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.updateProduct(id, updates);
      const updatedProduct = response.data;
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.searchProducts(query);
      setProducts(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = async (filters: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(filters);
      setProducts(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterProducts,
  };
};
