// Export all types from supplier.types.ts
export * from './supplier.types';

// Re-export main types with alternative names for compatibility
export type {
  Supplier,
  SupplierFilters,
  SupplierSummary,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierStatus,
  SupplierType,
  BusinessType,
  PerformanceStatus,
  SuppliersResponse,
  SupplierResponse
} from './supplier.types';
