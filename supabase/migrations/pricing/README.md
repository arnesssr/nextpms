# Pricing Management Migrations

This folder contains migrations for pricing history, calculations, and financial tracking.

## Files in this folder:
- `003_create_price_history.sql` - Product price change history tracking
- `004_create_saved_calculations.sql` - Saved pricing calculations and formulas
- `005_fix_saved_calculations_policies.sql` - RLS policy fixes for calculations
- `20241230_create_price_history_table.sql` - Alternative price history implementation

## Dependencies:
- Requires core/products table to exist
- Calculations may reference inventory for cost calculations

## Features:
- Historical price tracking for auditing
- Automated price change logging
- Saved calculation templates
- Financial reporting support
