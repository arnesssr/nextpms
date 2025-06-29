import { ProductFormData, ProductFilters, ProductsResponse, ProductResponse, ProductStatsResponse } from '@/types/products';

const productService = {
  // Get all products with pagination and filters
  getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const queryString = params.toString();
      const url = `/api/products${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch products');
      }

      return result;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<ProductResponse> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch product');
      }

      return result;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  },

  // Create new product
  createProduct: async (data: ProductFormData): Promise<ProductResponse> => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create product');
      }

      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  },

  // Update existing product
  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<ProductResponse> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update product');
      }

      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  },

  // Delete product
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete product');
      }

      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  },

  // Get product statistics
  getProductStats: async (): Promise<ProductStatsResponse> => {
    try {
      const response = await fetch('/api/products/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch product statistics');
      }

      return result;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw new Error('Failed to fetch product statistics');
    }
  },

  // Search products
  searchProducts: async (query: string): Promise<ProductsResponse> => {
    return productService.getProducts({ search: query });
  },

  // Filter products by category
  getProductsByCategory: async (categoryId: string): Promise<ProductsResponse> => {
    return productService.getProducts({ category_id: categoryId });
  },

  // Publish product
  publishProduct: async (id: string): Promise<ProductResponse> => {
    return productService.updateProduct(id, { status: 'published' });
  },

  // Archive product
  archiveProduct: async (id: string): Promise<ProductResponse> => {
    return productService.updateProduct(id, { status: 'archived' });
  },

  // Utility methods
  generateSlug: (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },

  validateProductData: (data: ProductFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Product name is required');
    }

    if (!data.category_id) {
      errors.push('Category is required');
    }

    if (!data.base_price || data.base_price <= 0) {
      errors.push('Base price must be greater than 0');
    }

    if (!data.selling_price || data.selling_price <= 0) {
      errors.push('Selling price must be greater than 0');
    }

    if (data.selling_price && data.base_price && data.selling_price < data.base_price) {
      errors.push('Selling price should not be less than base price');
    }

    if (data.stock_quantity < 0) {
      errors.push('Stock quantity cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default productService;
export { productService };
