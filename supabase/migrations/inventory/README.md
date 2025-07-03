# Inventory Management Migrations

This folder contains migrations for inventory tracking, stock management, and warehouse operations.

## Files in this folder:
- `008_create_inventory_items.sql` - Main inventory tracking table
- `009_create_stock_movements.sql` - Stock movement history and auditing
- `010_create_stock_locations.sql` - Physical stock locations within warehouses
- `012_create_updated_inventory_items.sql` - Enhanced inventory items table
- `013_create_stock_movements_simple.sql` - Simplified stock movements
- `014_create_warehouses.sql` - Warehouse management with statistics

## Dependencies:
- Requires core/products table to exist
- Warehouses should be created before inventory items for FK constraints
- Stock movements depend on inventory items

## Execution Order:
1. Warehouses table and management functions
2. Inventory items table with warehouse relationships
3. Stock locations for physical positioning
4. Stock movements for transaction history
