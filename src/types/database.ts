// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
    };
    Views: {
      category_stats: {
        Row: CategoryStatsRow;
      };
    };
    Functions: {
      get_category_tree: {
        Args: Record<PropertyKey, never>;
        Returns: CategoryTreeRow[];
      };
      build_category_path: {
        Args: { p_category_id: string };
        Returns: string;
      };
      calculate_category_level: {
        Args: { p_parent_id: string | null };
        Returns: number;
      };
      update_category_product_count: {
        Args: { p_category_id: string };
        Returns: void;
      };
    };
  };
}

// Category table types
export interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  parent_id: string | null;
  level: number;
  path: string;
  image_url: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  meta_keywords: string[] | null;
  product_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryInsert {
  id?: string;
  name: string;
  description?: string | null;
  slug: string;
  parent_id?: string | null;
  level?: number;
  path?: string;
  image_url?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number;
  is_active?: boolean;
  is_featured?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  meta_keywords?: string[] | null;
  product_count?: number;
  created_by?: string | null;
}

export interface CategoryUpdate {
  name?: string;
  description?: string | null;
  slug?: string;
  parent_id?: string | null;
  level?: number;
  path?: string;
  image_url?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number;
  is_active?: boolean;
  is_featured?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  meta_keywords?: string[] | null;
  product_count?: number;
  created_by?: string | null;
}

// Category tree types
export interface CategoryTreeRow {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  parent_id: string | null;
  level: number;
  path: string;
  image_url: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  product_count: number;
  children_count: number;
}

// Category stats types
export interface CategoryStatsRow {
  total_categories: number;
  active_categories: number;
  featured_categories: number;
  categories_with_products: number;
  average_products_per_category: number;
  max_depth: number;
  recent_categories: number;
}

// API request/response types
export interface CategoryFiltersDB {
  search?: string;
  parent_id?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  level?: number;
  sort_by?: 'name' | 'created_at' | 'product_count' | 'sort_order';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CategoryPaginationDB {
  data: CategoryRow[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Utility types for working with the database
export type CategoryWithChildren = CategoryRow & {
  children?: CategoryWithChildren[];
};

export type CategoryCreateInput = Omit<CategoryInsert, 'id' | 'created_at' | 'updated_at' | 'level' | 'path'>;
export type CategoryUpdateInput = Omit<CategoryUpdate, 'created_at' | 'updated_at' | 'level' | 'path'>;

// Error types
export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: DatabaseError;
  success: boolean;
  message?: string;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
