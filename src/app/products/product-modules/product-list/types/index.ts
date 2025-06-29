// types/index.ts - Product List Module Types
import { Product, ProductFilters as BaseProductFilters } from '../../product-catalog/types';

// View modes for product list
export type ViewMode = 'grid' | 'list';

// Sort options
export type SortField = 'name' | 'selling_price' | 'base_price' | 'stock' | 'created_at';
export type SortOrder = 'asc' | 'desc';

// Enhanced filters specific to product list
export interface ProductListFilters extends BaseProductFilters {
  viewMode?: ViewMode;
  sortField?: SortField;
  sortOrder?: SortOrder;
}

// Pagination state
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  limit: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Search state
export interface SearchState {
  query: string;
  isSearching: boolean;
  results: Product[];
}

// Filter state
export interface FilterState {
  activeFilters: Record<string, any>;
  isFiltering: boolean;
}

// Product list UI state
export interface ProductListState {
  products: Product[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
  pagination: PaginationState;
  search: SearchState;
  filters: FilterState;
}

// Component props interfaces
export interface ProductListProps {
  filters?: ProductListFilters;
  onProductSelect?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
  onProductDelete?: (productId: string) => void;
  onProductView?: (product: Product) => void;
  onCreateProduct?: () => void;
  initialViewMode?: ViewMode;
  enableBulkActions?: boolean;
}

export interface ProductCardProps {
  product: Product;
  viewMode?: ViewMode;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: Product) => void;
  onSelect?: (product: Product) => void;
  isSelected?: boolean;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
  isLoading?: boolean;
}

export interface FilterPanelProps {
  onFilter: (filters: Record<string, any>) => void;
  availableCategories?: string[];
  availableStatuses?: string[];
  activeFilters?: Record<string, any>;
  onClearFilters?: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  showItemsPerPage?: boolean;
  onItemsPerPageChange?: (limit: number) => void;
}

export interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  disabled?: boolean;
}

export interface SortOptionsProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
  availableFields?: Array<{ value: SortField; label: string }>;
}

export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
}

export interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
}

export interface ErrorBoundaryProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
  showDetails?: boolean;
}

// Bulk actions
export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  action: (selectedIds: string[]) => void;
  confirmMessage?: string;
  requireConfirmation?: boolean;
}

export interface BulkActionsProps {
  selectedIds: string[];
  actions: BulkAction[];
  onClearSelection: () => void;
}

// Hook return types
export interface UseProductListReturn {
  state: ProductListState;
  actions: {
    setViewMode: (mode: ViewMode) => void;
    setSorting: (field: SortField, order: SortOrder) => void;
    setFilters: (filters: Record<string, any>) => void;
    search: (query: string) => void;
    clearSearch: () => void;
    clearFilters: () => void;
    refresh: () => void;
  };
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  limit: number;
  totalItems: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  getOffset: () => number;
}

// Service interfaces
export interface ProductListService {
  getProducts: (filters?: ProductListFilters) => Promise<{ data: Product[]; total: number }>;
  searchProducts: (query: string, filters?: ProductListFilters) => Promise<{ data: Product[]; total: number }>;
  filterProducts: (filters: Record<string, any>) => Promise<{ data: Product[]; total: number }>;
  bulkUpdateProducts: (updates: Array<{ id: string; data: Partial<Product> }>) => Promise<Product[]>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  exportProducts: (filters?: ProductListFilters) => Promise<Blob>;
}

// Utility types
export type ProductFormattingOptions = {
  currency?: string;
  dateFormat?: string;
  includeImages?: boolean;
  truncateDescription?: number;
};

export type ProductSortFunction = (products: Product[], sortField: SortField, sortOrder: SortOrder) => Product[];
export type ProductFilterFunction = (products: Product[], filters: Record<string, any>) => Product[];
