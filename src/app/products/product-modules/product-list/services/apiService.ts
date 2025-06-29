// apiService.ts
import { Product, ProductFilters, ProductsResponse } from '../../product-catalog/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ProductApiService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken'); // Adjust based on your auth implementation
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const queryString = params.toString();
    const url = `/products${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchWithAuth(url);
  }

  async getProduct(id: string): Promise<Product> {
    return this.fetchWithAuth(`/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    return this.fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return this.fetchWithAuth(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.fetchWithAuth(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async searchProducts(query: string, filters?: ProductFilters): Promise<ProductsResponse> {
    const searchFilters = { ...filters, search: query };
    return this.getProducts(searchFilters);
  }

  async filterProducts(filters: Record<string, any>): Promise<ProductsResponse> {
    return this.getProducts(filters as ProductFilters);
  }

  async bulkUpdateProducts(updates: Array<{ id: string; data: Partial<Product> }>): Promise<Product[]> {
    return this.fetchWithAuth('/products/bulk', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async bulkDeleteProducts(ids: string[]): Promise<void> {
    await this.fetchWithAuth('/products/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }
}

export const productApiService = new ProductApiService();
