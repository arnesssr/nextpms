-- Migration: Fix stock_movements RLS policies
-- Created: 2025-01-05
-- Description: Disable RLS for stock_movements to allow API operations

-- Disable RLS for stock_movements table temporarily
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 'stock_movements RLS disabled' as migration_status;
