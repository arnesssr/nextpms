# Database Migrations - Organized Structure

This directory contains all database migrations for the PMS system, organized by functionality to prevent confusion and maintain proper modularity.

## Folder Structure

```
migrations/
├── core/           # Core business entities (categories, products)
├── inventory/      # Stock management, warehouses, movements
├── media/          # File storage and media management
├── pricing/        # Pricing history and calculations
├── system/         # System utilities and constraints
└── historical/     # Deprecated/superseded migrations
```

## Migration Execution Order

For new database setup, follow this order:

### 1. Core Foundation
- `core/001_create_categories.sql`
- `core/002_add_status_to_categories.sql`
- `core/002_create_products.sql`

### 2. Media Support
- `media/007_create_media_table.sql`

### 3. Inventory Management
- `inventory/014_create_warehouses.sql`
- `inventory/008_create_inventory_items.sql`
- `inventory/010_create_stock_locations.sql`
- `inventory/009_create_stock_movements.sql`

### 4. Pricing System
- `pricing/003_create_price_history.sql`
- `pricing/004_create_saved_calculations.sql`
- `pricing/005_fix_saved_calculations_policies.sql`

### 5. System Utilities (as needed)
- `system/003_add_foreign_keys_fixed.sql`

## Guidelines

### Adding New Migrations
1. Place migrations in the appropriate folder based on functionality
2. Use descriptive names that indicate the purpose
3. Update the relevant folder's README.md
4. Consider dependencies between modules

### Naming Convention
- Use prefixes to indicate execution order within a module
- Format: `XXX_descriptive_name.sql`
- Keep names concise but descriptive

### Dependencies
- **Core** tables must exist before inventory and pricing
- **Warehouses** should be created before inventory items
- **Media** can be independent but often references products
- **System** utilities should be applied after core structure

## Security Notes
- All tables have Row Level Security (RLS) enabled
- System utilities may temporarily disable security features for testing
- Never run testing utilities in production environments

## Maintenance
- Regularly review and clean up superseded migrations
- Move deprecated files to `historical/` folder
- Keep README files updated with new migrations
- Document any breaking changes or data transformations

---

*Last updated: July 2025*
*This structure follows the project rule of proper folder organization to avoid chaos between module-level and global-level files.*
