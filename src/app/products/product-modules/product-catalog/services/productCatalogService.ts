// Product Catalog Service - Uses the main API endpoints for consistency

// Import ProductService for API calls
import { ProductService as productService } from '@/services/products';

// Product type matching the API response
export type Product = {
  id: string;
  name: string;
  description: string;
  sku: string;
  category_id: string;
  category_name?: string;
  category?: string; // For backward compatibility
  base_price: number;
  selling_price: number;
  price?: number; // For backward compatibility
  stock_quantity: number;
  current_stock?: number; // For backward compatibility
  status: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // For additional fields
};

// Create a new product
export const createProduct = async (product: Omit<Product, 'id'>) => {
  const response = await productService.createProduct({
    name: product.name,
    description: product.description || '',
    category_id: product.category_id,
    base_price: product.base_price || product.price || 0,
    selling_price: product.selling_price || product.price || 0,
    stock_quantity: product.stock_quantity || 0,
    status: product.status || 'draft',
    is_active: true,
    is_featured: false,
    is_digital: false,
    track_inventory: true,
    requires_shipping: true,
    min_stock_level: 0,
    discount_percentage: 0,
    tax_rate: 0,
  });
  return response.data;
};

// Fetch all products with category information
export const fetchProducts = async () => {
  const response = await productService.getProducts();
  return response.data || [];
};

// Update a product
export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id'>>) => {
  const updateData: any = {};
  
  if (product.name) updateData.name = product.name;
  if (product.description) updateData.description = product.description;
  if (product.category_id) updateData.category_id = product.category_id;
  if (product.base_price || product.price) updateData.base_price = product.base_price || product.price;
  if (product.selling_price || product.price) updateData.selling_price = product.selling_price || product.price;
  if (product.stock_quantity !== undefined) updateData.stock_quantity = product.stock_quantity;
  if (product.status) updateData.status = product.status;
  
  const response = await productService.updateProduct(id, updateData);
  return response.data;
};

// Delete a product
export const deleteProduct = async (id: string) => {
  const response = await productService.deleteProduct(id);
  return response;
};

