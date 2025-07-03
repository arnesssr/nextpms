# Core Database Migrations

This folder contains migrations for the core business entities that form the foundation of the PMS system.

## Files in this folder:
- `001_create_categories.sql` - Creates the categories table with hierarchy support
- `002_add_status_to_categories.sql` - Adds status fields to categories
- `002_create_products.sql` - Creates the products table with full feature set

## Dependencies:
- Categories must be created before products (foreign key dependency)
- These are fundamental tables that other modules depend on

## Execution Order:
1. Categories table and functions
2. Category status updates
3. Products table with category relationships
