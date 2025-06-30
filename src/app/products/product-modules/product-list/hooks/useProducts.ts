import { useState, useEffect } from 'react';
import { Product } from '../../../types/product-types';
import { ProductService as productService } from '@/services/products';

interface UseProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface UseProductsActions {
  fetchProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  filterProducts: (filters: Record<string, any>) => Promise<void>;
}

export const useProducts = (): UseProductsState & UseProductsActions => {
  const [products, setProducts] = useState<Product[]>([]);
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

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await productService.createProduct(product);
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProduct = await productService.updateProduct(id, updates);
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
      const data = await productService.searchProducts(query);
      setProducts(data);
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
      const data = await productService.filterProducts(filters);
      setProducts(data);
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
