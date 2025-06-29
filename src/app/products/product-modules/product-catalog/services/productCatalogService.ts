import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Product type
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
};

// Create a new product
export const createProduct = async (product: Omit<Product, 'id'>) => {
  const { data, error } = await supabase
    .from<Product>('products')
    .insert(product);
  if (error) throw error;
  return data;
};

// Fetch all products
export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from<Product>('products')
    .select('*');
  if (error) throw error;
  return data;
};

// Update a product
export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id'>>) => {
  const { data, error } = await supabase
    .from<Product>('products')
    .update(product)
    .eq('id', id);
  if (error) throw error;
  return data;
};

// Delete a product
export const deleteProduct = async (id: string) => {
  const { data, error } = await supabase
    .from<Product>('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
};

