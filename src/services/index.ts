// Main Services Index - Single source of truth for all services

// Categories
export * from './categories';

// Products
export * from './products';

// Inventory
export * from './inventory';

// Re-exports for easy access
export { CategoryService, categoryService } from './categories';
export { ProductService } from './products';
export { InventoryService } from './inventory';
