# Orders System Migrations

This folder contains SQL migration files for the orders management system.

## Files Description

### Core Migrations
- **`supabase_orders_migration.sql`** - Complete orders system migration with full feature set including customers, fulfillments, returns, and timeline tracking
- **`simplified_orders_migration.sql`** - Simplified orders system without customer table dependencies
- **`fixed_orders_migration.sql`** - Migration that handles existing objects and removes customer table dependencies

### Utility Scripts
- **`fix_order_number_generation.sql`** - Fixes duplicate order number issues by improving the generation logic
- **`sample_orders_data.sql`** - Sample data for testing the orders system
- **`get_sample_customer.sql`** - Simple query to get sample customer data

## Usage

Choose the appropriate migration file based on your needs:

1. **For new installations**: Use `simplified_orders_migration.sql` for a clean, lightweight orders system
2. **For existing systems**: Use `fixed_orders_migration.sql` to safely migrate existing data
3. **For full-featured system**: Use `supabase_orders_migration.sql` if you need advanced features like returns management

## Notes

- All migrations include proper indexes, triggers, and RLS policies
- The simplified version is recommended for most use cases
- Sample data files are for testing purposes only - do not use in production
