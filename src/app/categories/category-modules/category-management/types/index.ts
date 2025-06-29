// Category Management Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parent_id?: string;
  parent?: Category;
  children?: Category[];
  level: number; // 0 for root, 1 for first level, etc.
  path: string; // Full path like "Electronics > Phones > Smartphones"
  image_url?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string[];
  product_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string[];
}

export interface CategoryTree {
  id: string;
  name: string;
  children: CategoryTree[];
  level: number;
  product_count: number;
  is_active: boolean;
  parent_id?: string;
}

export interface CategoryFilters {
  search?: string;
  parent_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  level?: number;
  has_products?: boolean;
  sort_by?: 'name' | 'created_at' | 'product_count' | 'sort_order';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CategoryStats {
  total_categories: number;
  active_categories: number;
  featured_categories: number;
  categories_with_products: number;
  average_products_per_category: number;
  max_depth: number;
  recent_categories: number;
}

// API Response Types
export interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CategoryResponse {
  data: Category;
  message?: string;
  success: boolean;
}

// Component Props
export interface CategoryListProps {
  onCreateCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onViewCategory?: (category: Category) => void;
  filters?: CategoryFilters;
  showActions?: boolean;
}

export interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
  onView?: (category: Category) => void;
  showActions?: boolean;
  viewMode?: 'card' | 'list' | 'grid';
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export interface CategoryTreeProps {
  categories: CategoryTree[];
  onSelectCategory?: (category: CategoryTree) => void;
  onEditCategory?: (category: CategoryTree) => void;
  onDeleteCategory?: (categoryId: string) => void;
  selectedId?: string;
  expandedIds?: string[];
  onToggleExpanded?: (categoryId: string) => void;
  allowDragDrop?: boolean;
  onReorder?: (draggedId: string, droppedOnId: string, position: 'before' | 'after' | 'inside') => void;
}

// Hook Return Types
export interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  stats: CategoryStats | null;
  createCategory: (data: CategoryFormData) => Promise<Category>;
  updateCategory: (id: string, data: Partial<CategoryFormData>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  fetchCategories: (filters?: CategoryFilters) => Promise<void>;
  bulkUpdateCategories: (updates: Array<{ id: string; data: Partial<CategoryFormData> }>) => Promise<void>;
  duplicateCategory: (id: string) => Promise<Category>;
  fetchStats: () => Promise<void>;
}

export interface UseCategoryTreeReturn {
  tree: CategoryTree[];
  loading: boolean;
  error: string | null;
  expandedIds: string[];
  toggleExpanded: (categoryId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  moveCategory: (categoryId: string, newParentId?: string, newPosition?: number) => Promise<void>;
  refreshTree: () => Promise<void>;
}

// Utility Types
export type CategoryDepth = 0 | 1 | 2 | 3 | 4 | 5; // Maximum nesting levels
export type CategoryViewMode = 'grid' | 'list' | 'tree';
export type CategorySortField = 'name' | 'created_at' | 'product_count' | 'sort_order';
export type CategorySortOrder = 'asc' | 'desc';

// Validation Types
export interface CategoryValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern?: RegExp;
  };
  description: {
    maxLength: number;
  };
  slug: {
    required: boolean;
    pattern: RegExp;
    unique: boolean;
  };
  depth: {
    maxLevel: number;
  };
}

// Bulk Operations
export interface BulkCategoryOperation {
  categoryIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'move' | 'feature' | 'unfeature';
  targetParentId?: string; // For move operation
}

export interface CategoryImportData {
  name: string;
  description?: string;
  parent_path?: string; // Path like "Electronics > Phones"
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

export interface CategoryExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeProducts: boolean;
  includeHierarchy: boolean;
  filters?: CategoryFilters;
}

// SEO and Meta
export interface CategorySEO {
  title: string;
  description: string;
  keywords: string[];
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  structured_data?: Record<string, any>;
}

// Template and Preset Types
export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  categories: Omit<CategoryFormData, 'parent_id'>[];
  created_at: string;
}

export interface CategoryPreset {
  name: string;
  icon: string;
  color: string;
  suggested_subcategories: string[];
}
