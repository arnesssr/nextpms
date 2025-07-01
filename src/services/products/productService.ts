import { ProductFormData, ProductFilters, ProductsResponse, ProductResponse, ProductStatsResponse } from '@/types/products';
import { supabase } from '@/lib/supabaseClient';

const productService = {
  // Get all products with pagination and filters
  getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(id, name, slug),
          media!product_id(
            id,
            file_name,
            file_path,
            bucket_name,
            alt_text,
            is_primary,
            created_at
          )
        `);
      
      // Apply filters
      if (filters) {
        if (filters.category_id) {
          query = query.eq('category_id', filters.category_id);
        }
        
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%, description.ilike.%${filters.search}%, sku.ilike.%${filters.search}%`);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.min_price) {
          query = query.gte('selling_price', filters.min_price);
        }
        
        if (filters.max_price) {
          query = query.lte('selling_price', filters.max_price);
        }
        
        if (filters.low_stock === true) {
          query = query.lte('stock_quantity', 10); // Consider stock <= 10 as low stock
        }
        
        // Pagination
        if (filters.page && filters.per_page) {
          const from = (filters.page - 1) * filters.per_page;
          const to = from + filters.per_page - 1;
          query = query.range(from, to);
        }
        
        // Sorting
        if (filters.sort_by) {
          const sortDirection = filters.sort_order === 'desc' ? false : true;
          query = query.order(filters.sort_by, { ascending: sortDirection });
        } else {
          // Default sort by created_at desc
          query = query.order('created_at', { ascending: false });
        }
      } else {
        // Default sort and pagination
        query = query.order('created_at', { ascending: false }).limit(50);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data || [],
        pagination: {
          total: count || 0,
          page: filters?.page || 1,
          per_page: filters?.per_page || 50,
          total_pages: Math.ceil((count || 0) / (filters?.per_page || 50))
        }
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<ProductResponse> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name, slug)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Product not found');
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch product');
    }
  },

  // Create new product
  createProduct: async (data: ProductFormData): Promise<ProductResponse> => {
    try {
      // Generate slug if not provided
      const slug = data.slug || productService.generateSlug(data.name);
      
      const productData = {
        ...data,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(productData)
        .select(`
          *,
          categories(id, name, slug)
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        data: newProduct
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create product');
    }
  },

  // Update existing product
  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<ProductResponse> => {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          categories(id, name, slug)
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      if (!updatedProduct) {
        throw new Error('Product not found or update failed');
      }

      return {
        success: true,
        data: updatedProduct
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update product');
    }
  },

  // Delete product
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      // First, delete all associated media
      const { ProductMediaService } = await import('./mediaService');
      await ProductMediaService.deleteProductMedia(id);
      
      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete product');
    }
  },

  // Get product statistics
  getProductStats: async (): Promise<ProductStatsResponse> => {
    try {
      // Get total products count
      const { count: totalProducts, error: totalError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        throw new Error(totalError.message);
      }

      // Get published products count
      const { count: publishedProducts, error: publishedError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      if (publishedError) {
        throw new Error(publishedError.message);
      }

      // Get draft products count
      const { count: draftProducts, error: draftError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

      if (draftError) {
        throw new Error(draftError.message);
      }

      // Get low stock products count (stock_quantity <= 10)
      const { count: lowStockProducts, error: lowStockError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lte('stock_quantity', 10);

      if (lowStockError) {
        throw new Error(lowStockError.message);
      }

      // Get out of stock products count
      const { count: outOfStockProducts, error: outOfStockError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('stock_quantity', 0);

      if (outOfStockError) {
        throw new Error(outOfStockError.message);
      }

      // Calculate total inventory value
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('products')
        .select('base_price, stock_quantity');

      if (inventoryError) {
        throw new Error(inventoryError.message);
      }

      const totalInventoryValue = inventoryData?.reduce((total, product) => {
        return total + (product.base_price * product.stock_quantity);
      }, 0) || 0;

      return {
        success: true,
        data: {
          total_products: totalProducts || 0,
          published_products: publishedProducts || 0,
          draft_products: draftProducts || 0,
          archived_products: (totalProducts || 0) - (publishedProducts || 0) - (draftProducts || 0),
          low_stock_products: lowStockProducts || 0,
          out_of_stock_products: outOfStockProducts || 0,
          total_inventory_value: totalInventoryValue
        }
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch product statistics');
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
