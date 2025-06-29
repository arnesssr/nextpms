// Export all product catalog hooks
export { useProductCatalog } from './useProductCatalog';
export { useProductCategories } from './useProductCategories';
export { useProductSuppliers } from './useProductSuppliers';

// Re-export types for convenience
export type {
  Product,
  ProductCategory,
  ProductSupplier,
  ProductStatus,
  ProductFormData,
  ProductFilters,
  ProductDimensions
} from '../types';
